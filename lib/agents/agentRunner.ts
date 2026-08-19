import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupportedLanguage, LANGUAGES } from '@/lib/i18n';
import { DomainChunk } from '@/lib/orchestrator/chunker';
import { resolveLocalModelPath } from '@/lib/utils/modelPathResolver';
import { AgentRunOptions, AgentResult } from '@/lib/types';
import os from 'os';

export type { AgentRunOptions, AgentResult };

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
    ar: 'الحالات الاستثنائية وضمان الجودة (QA & Edge Cases)',
    fa: 'حالت‌های استثنا و تضمین کیفیت (QA & Edge Cases)',
  },
  6: {
    ckb: 'خێرایی، کارایی و بەفیڕۆنەدانی بیرگە (Performance & Core Web Vitals)',
    badini: 'خێرایی، کارایی و نەهێلانا بارگرانییا میمۆری (Performance & Web Vitals)',
    en: 'Performance, Bundle Size & Core Web Vitals',
    ar: 'الأداء والسرعة وتحسين الذاكرة (Performance & Web Vitals)',
    fa: 'کارایی، بهینه‌سازی سرعت و حافظه (Performance & Web Vitals)',
  },
  7: {
    ckb: 'دۆکیۆمێنتەیشن، لۆگکردن و خاوێنی کۆد (Documentation & Code Quality)',
    badini: 'دۆکیۆمێنتەیشن، لۆگکرن و پاقژییا کۆدی (Documentation & Code Quality)',
    en: 'Documentation, Observability & Type Safety',
    ar: 'التوثيق وتسجيل الأخطاء وجودة الشيفرة (Documentation & Code Quality)',
    fa: 'مستندسازی، لاگینگ و تمیزی کدها (Documentation & Code Quality)',
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
  // Use CPU execution directly to ensure stable execution without running out of GPU VRAM (Vulkan)
  cachedLlamaInstance = await getLlama({ gpu: false });
  cachedModelInstance = await cachedLlamaInstance.loadModel({ modelPath: resolvedPath, gpuLayers: 0 });
  cachedModelFilePath = resolvedPath;

  return { llama: cachedLlamaInstance, model: cachedModelInstance, modelPath: resolvedPath };
}

export async function runLocalUnifiedAudit(options: {
  codebase: string;
  localModelPath?: string;
  language: SupportedLanguage;
  onTokenChunk?: (chunk: string) => void;
  onDomainStart?: (domainId: number) => void;
  onDomainDone?: (result: AgentResult) => void;
}): Promise<AgentResult[]> {
  const langConfig = LANGUAGES[options.language] || LANGUAGES.ckb;
  const { model } = await getLocalModelSingleton(options.localModelPath);
  const cpuCount = os.cpus()?.length || 4;
  const optimalThreads = Math.min(8, Math.max(2, cpuCount - 1));

  // Smart codebase cap: first 3000 + last 3000 chars — balanced for auth + exports
  let safeCode = options.codebase;
  if (safeCode.length > 6_000) {
    safeCode =
      safeCode.slice(0, 3_000) +
      '\n\n// ... [truncated for CPU speed] ...\n\n' +
      safeCode.slice(-3_000);
  }

  // Domain-specific focused prompts (compact, targeted)
  const DOMAIN_PROMPTS: Record<number, string> = {
    1: `Analyze ONLY backend logic, API routes, database queries, ORM calls, input validation, response handling, and server-side errors in the code below.`,
    2: `Analyze ONLY UI/UX issues: layout, responsiveness, missing loading states, poor accessibility (ARIA), confusing navigation, missing error feedback.`,
    3: `Analyze ONLY security vulnerabilities: SQL injection, XSS, CSRF, hardcoded secrets/keys, missing auth checks, insecure headers, open redirects, OWASP Top 10.`,
    4: `Analyze ONLY SEO and routing: missing meta tags, bad title/description, broken routes, missing canonical, improper heading hierarchy, missing sitemap.`,
    5: `Analyze ONLY QA and edge cases: unhandled promise rejections, missing try/catch, type errors, null pointer risks, empty array edge cases, race conditions.`,
    6: `Analyze ONLY performance: large bundle sizes, unnecessary re-renders, missing memoization, unoptimized images, blocking scripts, missing lazy loading, memory leaks.`,
    7: `Analyze ONLY code quality: missing JSDoc/comments on complex functions, inconsistent naming, dead code, duplicate logic, poor file structure, missing types.`,
  };

  const domainResults: AgentResult[] = [];

  for (let dId = 1; dId <= 7; dId++) {
    const agentStart = Date.now();
    const dName = DOMAIN_PROMPT_TITLES[dId]?.[options.language] || `Domain ${dId}`;

    // Signal domain start BEFORE running (UI shows it as active immediately)
    if (options.onDomainStart) {
      options.onDomainStart(dId);
    }

    const domainPrompt = `You are Agent #${dId}. ${DOMAIN_PROMPTS[dId]}

LANGUAGE: Write ALL findings in ${langConfig.aiPromptLang} (${langConfig.nativeName}). Keep code/file names in English.

For each issue found:
- **Severity:** [🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🔵 LOW] | **File:** \`file:line\` | **Issue:** [in ${langConfig.nativeName}] | **Fix:** [in ${langConfig.nativeName}]

If nothing found: write ✅ ${dName} — clean.

SOURCE CODE:
${safeCode}`;

    // Fresh context per agent — prevents context overflow and cross-contamination
    const context = await model.createContext({
      contextSize: 2048,
      threads: optimalThreads,
    });

    const { LlamaChatSession } = await import('node-llama-cpp');
    const session = new LlamaChatSession({
      contextSequence: context.getSequence(),
    });

    let agentMarkdown = '';

    try {
      agentMarkdown = await session.prompt(domainPrompt, {
        maxTokens: 350,
        temperature: 0.1,
        onToken(tokens) {
          try {
            const chunk = model.detokenize(tokens as any);
            agentMarkdown += chunk;
            if (options.onTokenChunk) options.onTokenChunk(chunk);
          } catch (tokenErr) {
            console.warn('[AgentRunner] onToken detokenize error:', tokenErr);
          }
        },
      });
    } catch (err: any) {
      agentMarkdown = `## ${dId}. ${dName}\n\n⚠️ Agent error: ${err?.message || 'unknown'}`;
    }

    // Ensure proper markdown heading
    if (!agentMarkdown.startsWith(`## ${dId}`)) {
      agentMarkdown = `## ${dId}. ${dName}\n\n${agentMarkdown.trim()}`;
    }

    const issuesCount = (agentMarkdown.match(/🔴|🟠|🟡|🔵|\*\*Severity:\*\*/gi) || []).length;
    const criticalCount = (agentMarkdown.match(/🔴|CRITICAL/gi) || []).length;

    const res: AgentResult = {
      domainId: dId,
      domainName: dName,
      markdown: agentMarkdown.trim(),
      issuesCount,
      criticalCount,
      durationMs: Date.now() - agentStart,
    };

    domainResults.push(res);

    // Signal domain done — UI marks it complete and shows next as active
    if (options.onDomainDone) {
      options.onDomainDone(res);
    }

    // Dispose context to free RAM before next agent
    await context.dispose();
  }

  return domainResults;
}

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
- **File/Location:** \`[file:line]\`
- **Issue:** [Description in ${langConfig.nativeName}]
- **Fix:** [Actionable code snippet or solution in ${langConfig.nativeName}]

If no issues found, output:
✅ [No issues detected in this domain in ${langConfig.nativeName}]

SOURCE CODE:
${options.chunk.concatenatedPayload}`;

  let markdown = '';

  if (options.provider === 'gemini') {
    const activeApiKey = options.apiKey || process.env.GEMINI_API_KEY;
    if (!activeApiKey) throw new Error('Gemini API key is required');
    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({
      model: options.modelName || 'gemini-2.5-flash',
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    markdown = response.text();
  } else if (options.provider === 'claude') {
    const activeApiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!activeApiKey) throw new Error('Claude API key is required');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': activeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.modelName || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    markdown = data.content?.[0]?.text || '';
  } else if (options.provider === 'deepseek-cloud') {
    const activeApiKey = options.apiKey || process.env.DEEPSEEK_API_KEY;
    if (!activeApiKey) throw new Error('DeepSeek API key is required');
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeApiKey}`,
      },
      body: JSON.stringify({
        model: options.modelName || 'deepseek-reasoner',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
      }),
    });
    const data = await res.json();
    markdown = data.choices?.[0]?.message?.content || '';
  } else if (options.provider === 'local') {
    const { model } = await getLocalModelSingleton(options.localModelPath);
    const cpuCount = os.cpus()?.length || 4;
    const optimalThreads = Math.min(8, Math.max(2, cpuCount - 1));

    const context = await model.createContext({
      contextSize: 4096,
      threads: optimalThreads,
    });
    const { LlamaChatSession } = await import('node-llama-cpp');
    const session = new LlamaChatSession({
      contextSequence: context.getSequence(),
    });

    markdown = await session.prompt(prompt, {
      maxTokens: 1500,
      temperature: 0.2,
    });
  }

  const issuesCount = (markdown.match(/🔴|🟠|🟡|🔵|\*\*Severity:\*\*/gi) || []).length;
  const criticalCount = (markdown.match(/🔴|CRITICAL/gi) || []).length;

  return {
    domainId: options.domainId,
    domainName: domainHeader,
    markdown,
    issuesCount,
    criticalCount,
    durationMs: Date.now() - startTime,
  };
}
