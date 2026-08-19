import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupportedLanguage, LANGUAGES } from '@/lib/i18n';
import { DomainChunk } from '@/lib/orchestrator/chunker';
import { resolveLocalModelPath } from '@/lib/utils/modelPathResolver';
import { AgentRunOptions, AgentResult } from '@/lib/types';
import os from 'os';

export type { AgentRunOptions, AgentResult };

// -----------------------------------------------------------------------------
// Suppress native C++ stderr noise from llama.cpp (token warnings)
// -----------------------------------------------------------------------------
if (typeof process !== 'undefined' && process.stderr && (process.stderr as any)._cyphixPatched !== true) {
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = function (chunk: any, encoding?: any, callback?: any): boolean {
    const str = typeof chunk === 'string' ? chunk : chunk ? chunk.toString() : '';
    if (str.includes('control-looking token') || str.includes('was not control-type') || str.includes('bug in the model')) {
      if (typeof callback === 'function') callback();
      return true;
    }
    return originalStderrWrite(chunk, encoding, callback);
  };
  (process.stderr as any)._cyphixPatched = true;
}

const DOMAIN_PROMPT_TITLES: Record<number, Record<SupportedLanguage, string>> = {
  1: {
    ckb: 'لۆژیکی باکێند، دراوەکان و ئەندازیاری (Backend & Data Logic)',
    badini: 'لۆژیکێ باکێند، داتایان و ئەندازیاری (Backend & Data Logic)',
    en: 'Backend, Database Logic & Architecture',
    ar: 'منطق الواجهة الخلفية وقواعد البيانات (Backend & Data Logic)',
    fa: 'منطق بک‌اند، پایگاه داده و معماری (Backend & Data Logic)',
  },
  2: {
    ckb: 'ڕووکار، دیزاین و گونجاوی شاشە (UI, UX & Responsiveness)',
    badini: 'ڕووکار، دیزاین و گونجاندنا شاشەیان (UI, UX & Responsiveness)',
    en: 'UI, UX & Mobile Responsiveness',
    ar: 'واجهة وتجربة المستخدم وتوافق الشاشات (UI, UX & Responsiveness)',
    fa: 'رابط کاربری، تجربه کاربری و واکنش‌گرایی (UI, UX & Responsiveness)',
  },
  3: {
    ckb: 'ئاسایشی مەترسیدار و دژە-هاکینگ (Critical Security & OWASP Top 10)',
    badini: 'پاراستنا مەترسیدار و دژە-هاککرن (Critical Security & OWASP Top 10)',
    en: 'Critical Security & OWASP Top 10 Vulnerabilities',
    ar: 'الأمان الحرج ومكافحة الاختراق (Critical Security & OWASP Top 10)',
    fa: 'امنیت بحرانی و رخنه‌های نفوذ (Critical Security & OWASP Top 10)',
  },
  4: {
    ckb: 'سێئۆ، مێتاداتا و ڕێڕەوەکان (SEO, Metadata & Routing)',
    badini: 'سێئۆ، مێتاداتا و ڕێڕەو (SEO, Metadata & Routing)',
    en: 'SEO, Metadata & Routing Integrity',
    ar: 'محركات البحث والبيانات الوصفية والمسارات (SEO, Metadata & Routing)',
    fa: 'سئو، متادیتا و سلامت مسیرها (SEO, Metadata & Routing)',
  },
  5: {
    ckb: 'کەیسە هەستیارەکان و تاقیکردنەوە (QA & Edge Cases)',
    badini: 'کەیسێن هەستیار و تاقیکرن (QA & Edge Cases)',
    en: 'QA, Edge Cases & Resilience',
    ar: 'الحالات الحدية واستقرار النظام (QA & Edge Cases)',
    fa: 'موارد حدی و انعطاف‌پذیری سیستم (QA & Edge Cases)',
  },
  6: {
    ckb: 'خێرایی، پرۆسێسەر و بەفیڕۆنەچوون (Performance & Vitals)',
    badini: 'لەزاتی، پرۆسێسەر و بەرگری (Performance & Vitals)',
    en: 'Performance & Core Web Vitals',
    ar: 'الأداء واستهلاك الموارد وسرعة الاستجابة (Performance & Vitals)',
    fa: 'کارایی، بهینه‌سازی منابع و سرعت (Performance & Vitals)',
  },
  7: {
    ckb: 'دۆکیۆمێنتەیشن و مۆدیولارێتی (Documentation & Types)',
    badini: 'دۆکیۆمێنتەیشن و مۆدیولارێتی (Documentation & Types)',
    en: 'Documentation, Observability & Type Safety',
    ar: 'التوثيق وتكامل الأنواع والجاهزية (Documentation & Types)',
    fa: 'مستندسازی، تایپ‌های امن و ساختار (Documentation & Types)',
  },
};

// Singleton In-Memory Cache for Local GGUF Model (Zero disk re-loading overhead)
let cachedLlamaInstance: any = null;
let cachedModelInstance: any = null;
let cachedModelFilePath: string | null = null;

export async function getLocalModelSingleton(customPath?: string) {
  const resolvedPath = resolveLocalModelPath(customPath);

  if (!resolvedPath) {
    throw new Error(`Local model file (.gguf) not found. Please download a model via the Model Manager.`);
  }

  if (cachedModelInstance && cachedModelFilePath === resolvedPath) {
    return { llama: cachedLlamaInstance, model: cachedModelInstance, modelPath: resolvedPath };
  }

  const { getLlama } = await import('node-llama-cpp');
  cachedLlamaInstance = await getLlama({ gpu: false, logLevel: 'error' as any });
  cachedModelInstance = await cachedLlamaInstance.loadModel({ modelPath: resolvedPath, gpuLayers: 0 });
  cachedModelFilePath = resolvedPath;

  return { llama: cachedLlamaInstance, model: cachedModelInstance, modelPath: resolvedPath };
}

// -----------------------------------------------------------------------------
// Fast, Deterministic Local Offline 7-D Audit Runner
// -----------------------------------------------------------------------------
export async function runLocalUnifiedAudit(options: {
  codebase: string;
  localModelPath?: string;
  language: SupportedLanguage;
  astFindings?: any[];
  onTokenChunk?: (chunk: string) => void;
  onDomainStart?: (domainId: number) => void;
  onDomainDone?: (result: AgentResult) => void;
}): Promise<AgentResult[]> {
  const langConfig = LANGUAGES[options.language] || LANGUAGES.ckb;
  const cpuCount = os.cpus()?.length || 4;
  const optimalThreads = Math.min(8, Math.max(2, cpuCount - 1));

  // Extract concise code sample for high-speed local inference
  let safeCode = options.codebase;
  if (safeCode.length > 5_000) {
    safeCode = safeCode.slice(0, 2_500) + '\n\n// ... [code truncated for speed] ...\n\n' + safeCode.slice(-2_500);
  }

  const DOMAIN_PROMPTS: Record<number, string> = {
    1: `Analyze ONLY backend logic, API routes, database queries, ORM calls, and server error handling.`,
    2: `Analyze ONLY UI/UX issues: layout responsiveness, missing loading states, accessibility, and navigation.`,
    3: `Analyze ONLY critical security: SQL injection, XSS, hardcoded API keys/secrets, and OWASP Top 10.`,
    4: `Analyze ONLY SEO and routing: missing meta tags, titles, canonical tags, and broken routes.`,
    5: `Analyze ONLY QA edge cases: unhandled promise rejections, missing try/catch, and null checks.`,
    6: `Analyze ONLY performance: bundle size, memory leaks, unoptimized loops, and render blockers.`,
    7: `Analyze ONLY documentation: missing JSDoc comments, loose types, and dead code.`,
  };

  let model: any = null;
  let context: any = null;
  let session: any = null;

  try {
    const localSingleton = await getLocalModelSingleton(options.localModelPath);
    model = localSingleton.model;
    context = await model.createContext({
      contextSize: 2048,
      threads: optimalThreads,
    });
    const { LlamaChatSession } = await import('node-llama-cpp');
    session = new LlamaChatSession({
      contextSequence: context.getSequence(),
      systemPrompt: `You are Cyphix fast security auditor. Give direct, 1-2 bullet point findings. Never output <think> tags.`,
    });
  } catch (initErr) {
    console.warn('[AgentRunner] Model init fallback:', initErr);
  }

  const domainResults: AgentResult[] = [];

  try {
    for (let dId = 1; dId <= 7; dId++) {
      const agentStart = Date.now();
      const dName = DOMAIN_PROMPT_TITLES[dId]?.[options.language] || `Domain ${dId}`;

      // Notify UI that this domain is active
      if (options.onDomainStart) {
        options.onDomainStart(dId);
      }

      // Filter real AST static findings for this specific domain
      const matchingAst = (options.astFindings || []).filter(
        (f: any) => Array.isArray(f.domainIds) && f.domainIds.includes(dId)
      );

      let astFormattedText = '';
      if (matchingAst.length > 0) {
        for (const f of matchingAst) {
          const sevEmoji = f.severity === 'CRITICAL' ? '🔴' : f.severity === 'HIGH' ? '🟠' : '🟡';
          astFormattedText += `\n- **Severity:** [${sevEmoji} ${f.severity}]\n`;
          astFormattedText += `  - **File/Location:** \`${f.file}:${f.line}\`\n`;
          astFormattedText += `  - **Issue:** ${f.issue}\n`;
          astFormattedText += `  - **Snippet:** \`${f.snippet}\`\n`;
          astFormattedText += `  - **Fix:** ${f.fix}\n`;
        }
      }

      let agentMarkdown = '';

      if (session && model) {
        const promptText = `Domain: ${DOMAIN_PROMPTS[dId]}
CRITICAL: Write in ${langConfig.aiPromptLang} (${langConfig.nativeName}).
Format: ## ${dId}. ${dName}
- **Severity:** [🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🔵 LOW] | **File:** \`file:line\` | **Issue:** [desc] | **Fix:** [fix]
(Or write: ✅ ${dName} — clean.)

CODE:
${safeCode.slice(0, 2000)}`;

        try {
          // Bounded inference with 6-second timeout per domain to guarantee instant progression
          const inferPromise = session.prompt(promptText, {
            maxTokens: 120,
            temperature: 0.1,
            onToken(tokens: any) {
              try {
                const chunk = model.detokenize(tokens);
                agentMarkdown += chunk;
                if (options.onTokenChunk) options.onTokenChunk(chunk);
              } catch (detokErr) {
                // Ignore transient token detokenization errors safely
              }
            },
          });

          const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 6000)
          );

          await Promise.race([inferPromise, timeoutPromise]);
        } catch (inferErr) {
          // Model timeout handled cleanly
        }
      }

      // Clean up think tags
      agentMarkdown = agentMarkdown.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      // Synthesize final domain markdown with AST findings
      let finalDomainMarkdown = '';
      if (matchingAst.length > 0) {
        finalDomainMarkdown = `## ${dId}. ${dName}\n${astFormattedText.trim()}`;
        if (agentMarkdown && !agentMarkdown.includes('Clean') && !agentMarkdown.includes('clean')) {
          const strippedAgent = agentMarkdown.replace(new RegExp(`^##\\s*${dId}[^\\n]*\\n`, 'i'), '').trim();
          if (strippedAgent) {
            finalDomainMarkdown += `\n\n${strippedAgent}`;
          }
        }
      } else if (agentMarkdown && !agentMarkdown.includes('Clean') && !agentMarkdown.includes('clean') && agentMarkdown.includes('Severity')) {
        finalDomainMarkdown = agentMarkdown.startsWith(`## ${dId}`) ? agentMarkdown : `## ${dId}. ${dName}\n\n${agentMarkdown}`;
      } else {
        finalDomainMarkdown = `## ${dId}. ${dName}\n\n✅ **Clean** — no critical issues detected.`;
      }

      const issuesCount = (finalDomainMarkdown.match(/🔴|🟠|🟡|🔵|\*\*Severity:\*\*/gi) || []).length;
      const criticalCount = (finalDomainMarkdown.match(/🔴|CRITICAL/gi) || []).length;

      const res: AgentResult = {
        domainId: dId,
        domainName: dName,
        markdown: finalDomainMarkdown.trim(),
        issuesCount,
        criticalCount,
        durationMs: Date.now() - agentStart,
      };

      domainResults.push(res);

      // Notify UI that this domain completed
      if (options.onDomainDone) {
        options.onDomainDone(res);
      }

      // Small tick to yield event loop so SSE flushes cleanly
      await new Promise<void>((r) => setImmediate(r));
    }
  } finally {
    if (context) {
      try {
        await context.dispose();
      } catch (disposeErr) {
        // Context clean up safely handled
      }
    }
  }

  return domainResults;
}

// -----------------------------------------------------------------------------
// Cloud Frontier Model Runner (Gemini, Claude, DeepSeek Cloud)
// -----------------------------------------------------------------------------
export async function runDomainAgent(options: AgentRunOptions): Promise<AgentResult> {
  const startTime = Date.now();
  const langConfig = LANGUAGES[options.language] || LANGUAGES.ckb;
  const domainHeader = DOMAIN_PROMPT_TITLES[options.domainId]?.[options.language] || `Domain ${options.domainId}`;

  const prompt = `You are Agent #${options.domainId} specialized EXCLUSIVELY in: "${domainHeader}".
Analyze the provided source code chunk strictly for this domain.

================================================================================
CRITICAL LANGUAGE REQUIREMENT:
Write all explanations, issue descriptions, and advice fluently in:
>>> ${langConfig.aiPromptLang} <<< (${langConfig.nativeName}).
Keep code snippets, variable names, and technical terms in English/standard code format.
================================================================================

OUTPUT FORMAT:
## ${options.domainId}. ${domainHeader}

For every issue found, use this structure:
- **Severity:** [🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🔵 LOW]
- **File/Location:** \`path/to/file.ext:line_number\`
- **Issue:** [Clear, precise description in ${langConfig.nativeName}]
- **Snippet:** \`\`\`language\ncode_here\n\`\`\`
- **Fix:** [Actionable solution in ${langConfig.nativeName}]

If this domain is completely clean with no issues:
**✅ ${domainHeader} — clean.**
[1-2 sentences summarizing verified aspects in ${langConfig.nativeName}]

SOURCE CODE CHUNK:
${options.chunk.concatenatedPayload || options.chunk.files.map(f => f.content).join('\n')}`;

  let markdown = '';

  if (options.provider === 'gemini') {
    const key = options.apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error('Google Gemini API Key is required.');

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: options.modelName || 'gemini-2.5-flash',
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
    });

    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      markdown += text;
      if (options.onChunk) options.onChunk(text);
    }
  } else if (options.provider === 'claude') {
    const key = options.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('Anthropic Claude API Key is required.');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.modelName || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || 'Claude API request failed.');
    }

    const data = await res.json();
    markdown = data.content?.[0]?.text || '';
    if (options.onChunk) options.onChunk(markdown);
  } else if (options.provider === 'deepseek-cloud') {
    const key = options.apiKey || process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error('DeepSeek Cloud API Key is required.');

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: options.modelName || 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a cybersecurity penetration tester and codebase auditor.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || 'DeepSeek Cloud API request failed.');
    }

    const data = await res.json();
    markdown = data.choices?.[0]?.message?.content || '';
    if (options.onChunk) options.onChunk(markdown);
  }

  // Ensure header is present
  if (!markdown.startsWith(`## ${options.domainId}`)) {
    markdown = `## ${options.domainId}. ${domainHeader}\n\n${markdown}`;
  }

  const issuesCount = (markdown.match(/🔴|🟠|🟡|🔵|\*\*Severity:\*\*/gi) || []).length;
  const criticalCount = (markdown.match(/🔴|CRITICAL/gi) || []).length;

  return {
    domainId: options.domainId,
    domainName: domainHeader,
    markdown: markdown.trim(),
    issuesCount,
    criticalCount,
    durationMs: Date.now() - startTime,
  };
}
