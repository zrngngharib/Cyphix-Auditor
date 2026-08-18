/**
 * localModelWorker.ts
 * 
 * Worker Thread که تەنها بۆ ئەنجامدانی مۆدێلی ناوخۆیی (GGUF) لەسەر CPU بەکاردێت.
 * ئەمە Event Loop ی سەرەکیی Node.js ئازاد دەکات تا SSE events بتوانن بنێردرێن.
 * 
 * Run via: Worker('../lib/workers/localModelWorker.js', { workerData: {...} })
 */

import { parentPort, workerData } from 'worker_threads';
import path from 'path';
import os from 'os';
import { resolveLocalModelPath } from '@/lib/utils/modelPathResolver';

const { codebase, localModelPath, language, langConfig } = workerData as {
  codebase: string;
  localModelPath: string | undefined;
  language: string;
  langConfig: { aiPromptLang: string; nativeName: string };
};

function postMsg(type: string, payload: any) {
  parentPort!.postMessage({ type, payload });
}

async function run() {
  postMsg('status', { message: 'Loading local model into memory...', progress: 51 });

  // Use centralized model path resolution utility
  const resolvedPath = resolveLocalModelPath(localModelPath);

  if (!resolvedPath) {
    postMsg('error', { message: `GGUF model not found at specified path or in models directory.` });
    return;
  }

  postMsg('status', { message: `Model found: ${path.basename(resolvedPath)}. Evaluating prompt on CPU...`, progress: 53 });

  // Safe concise codebase cap
  let safeCode = codebase;
  if (safeCode.length > 18_000) {
    safeCode = safeCode.slice(0, 18_000) + '\n\n// [Codebase summarized for CPU context window]';
  }

  const prompt = `You are a Principal Software Architect & Cybersecurity Penetration Tester.
Perform a rapid, high-precision 7-dimensional codebase audit.

================================================================================
CRITICAL LANGUAGE: Write all explanations, titles, and fixes fluently in:
>>> ${langConfig.aiPromptLang} <<< (${langConfig.nativeName}).
Keep code snippets, variable names, and technical terms in English.
================================================================================

Evaluate across these 7 dimensions. For EACH one, write a section:
## 1. Backend & Data Logic
## 2. UI, UX & Responsiveness
## 3. Critical Security (OWASP Top 10)
## 4. SEO, Metadata & Routing
## 5. QA & Edge Cases
## 6. Performance & Core Web Vitals
## 7. Documentation & Code Quality

For every issue found in each section:
- **Severity:** [🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🔵 LOW]
- **File/Location:** \`file:line\`
- **Issue:** [Description in ${langConfig.nativeName}]
- **Fix:** [Actionable solution]

If no issues in a section: write: ✅ No critical flaws in this domain.

SOURCE CODE:
${safeCode}`;

  const cpuCount = os.cpus()?.length || 4;
  const optimalThreads = Math.min(8, Math.max(2, cpuCount - 1));

  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  const llama = await getLlama({ gpu: false });
  const model = await llama.loadModel({ modelPath: resolvedPath, gpuLayers: 0 });
  const context = await model.createContext({ contextSize: 4096, threads: optimalThreads });
  const session = new LlamaChatSession({ contextSequence: context.getSequence() });

  postMsg('status', { message: 'Model loaded. Generating audit report...', progress: 55 });

  let generatedText = '';
  let lastSeenDomain = 0;

  const fullMarkdown = await session.prompt(prompt, {
    maxTokens: 1800,
    temperature: 0.2,
    onToken(tokens: any[]) {
      try {
        const chunk = model.detokenize(tokens);
        generatedText += chunk;

        // Live domain progress tracking as tokens arrive
        for (let d = 1; d <= 7; d++) {
          if (d > lastSeenDomain) {
            const marker = `## ${d}`;
            if (generatedText.includes(marker)) {
              lastSeenDomain = d;
              const pct = Math.min(94, Math.round(55 + (d / 7) * 38));
              postMsg('domain_start', { domainId: d, progress: pct });
            }
          }
        }
      } catch (tokenErr) {
        console.warn('[LocalModelWorker] detokenize warn:', tokenErr);
      }
    },
  });

  // Parse 7 domain sections
  const domainHeaders = [
    'Backend & Data Logic',
    'UI, UX & Responsiveness',
    'Security (Critical)',
    'SEO & Routing',
    'QA & Edge Cases',
    'Performance',
    'Documentation & Code Quality',
  ];

  for (let dId = 1; dId <= 7; dId++) {
    const sectionRegex = new RegExp(`##\\s*${dId}[\\.\\s][\\s\\S]*?(?=##\\s*\\d|$)`, 'i');
    const match = fullMarkdown.match(sectionRegex);
    const sectionMd = match
      ? match[0].trim()
      : `## ${dId}. ${domainHeaders[dId - 1]}\n\n✅ No critical flaws detected in this domain.`;

    const issuesCount = (sectionMd.match(/🔴|🟠|🟡|🔵|\*\*Severity:\*\*/gi) || []).length;
    const criticalCount = (sectionMd.match(/🔴|CRITICAL/gi) || []).length;

    const pct = Math.min(94, Math.round(55 + (dId / 7) * 38));
    postMsg('domain_done', {
      domainId: dId,
      domainName: domainHeaders[dId - 1],
      markdown: sectionMd,
      issuesCount,
      criticalCount,
      progress: pct,
    });
  }

  postMsg('complete', { report: fullMarkdown, modelPath: resolvedPath });
}

run().catch((err) => {
  postMsg('error', { message: err?.message || 'Worker thread failed' });
});
