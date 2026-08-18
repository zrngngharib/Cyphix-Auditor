import { NextRequest, NextResponse } from 'next/server';
import { LANGUAGES, SupportedLanguage } from '@/lib/i18n';
import { resolveLocalModelPath } from '@/lib/utils/modelPathResolver';
import { truncateCodebase } from '@/lib/utils/llmInputHandler';
import path from 'path';
// Note: GoogleGenerativeAI is imported dynamically below (only when needed)

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 180; // 3 minutes for deep reasoning models

const API_ERROR_MESSAGES: Record<SupportedLanguage, {
  noCodebase: string;
  modelNotFound: (p: string) => string;
  claudeKeyMissing: string;
  deepseekKeyMissing: string;
  geminiKeyMissing: string;
  tokenLimitExceeded: string;
  invalidApiKey: string;
  quotaExceeded: string;
  genericError: string;
}> = {
  ckb: {
    noCodebase: 'هیچ کۆد یان فایلێک بۆ پشکنین دابین نەکراوە. تکایە سەرەتا پڕۆژەکەت لە هەنگاوی ١ دیاری بکە.',
    modelNotFound: (p: string) => `فایلی مۆدێلی ناوخۆیی (.gguf) نەدۆزرایەوە (${p}). تکایە لە ڕێگەی مۆداڵی داگرتن مۆدێلێک دابەزێنە یان فایلی .gguf دابنێ لە فۆڵدەری models/.`,
    claudeKeyMissing: 'کلیلی نهێنی Anthropic Claude پێویستە. تکایە کلیلەکەت لە ڕێکخستنەکان بنووسە.',
    deepseekKeyMissing: 'کلیلی نهێنی DeepSeek API پێویستە. تکایە کلیلەکەت لە ڕێکخستنەکان بنووسە.',
    geminiKeyMissing: 'کلیلی نهێنی Google Gemini پێویستە. تکایە کلیلەکەت لە ڕێکخستنەکان بنووسە یان مۆدێلی ناوخۆیی ئۆفلاین هەڵبژێرە.',
    tokenLimitExceeded: 'قەبارەی پڕۆژەکە زۆر گەورەیە و لە سنووری ڕێگەپێدراوی تۆکەنەکان زیاترە. تکایە سەرلەنوێ فایلە سەرەکییەکان باربکەرەوە.',
    invalidApiKey: 'کلیلی API نادروستە یان کار ناکات. تکایە لە ڕاستی کلیلەکەت دڵنیاببەرەوە.',
    quotaExceeded: 'سنووری بەکارهێنانی کلیلەکەت (Quota) تەواو بووە یان ڕێژەی داواکارییەکان زۆر بووە. تکایە کەمێکی تر هەوڵبدەرەوە.',
    genericError: 'هەڵەیەک ڕوویدا لە کاتی پەیوەندی کردن بە بزوێنەری ژیری دەستکرد.',
  },
  badini: {
    noCodebase: 'چ کۆد یان فایل بۆ پشکنینێ نەهاتیە بەرهەڤکرن. تکایە ل دەستپێکێ د گاڤا ١ دا پرۆژەیێ خۆ دیار بکە.',
    modelNotFound: (p: string) => `فایلا مۆدێلێ ناڤخۆیی (.gguf) نەهاتە دیتن (${p}). تکایە مۆدێلەکێ GGUF دابگرە یان بدانیە د ناڤ فۆلدەرێ models/ دا.`,
    claudeKeyMissing: 'کلیلا نهێنی یا Anthropic Claude پێدڤیە. تکایە کلیلا خۆ د ڕێکخستنان دا بنڤیسە.',
    deepseekKeyMissing: 'کلیلا نهێنی یا DeepSeek API پێدڤیە. تکایە کلیلا خۆ د ڕێکخستنان دا بنڤیسە.',
    geminiKeyMissing: 'کلیلا نهێنی یا Google Gemini پێدڤیە. تکایە کلیلا خۆ بنڤیسە یان مۆدێلێ ناڤخۆیی یێ ئۆفلاین هەلبژێرە.',
    tokenLimitExceeded: 'قەبارێ پرۆژەی گەلەک مەزنە و ژ سنوورێ ڕێپێدایێ تۆکەنان زێدەتر بوو. تکایە فایلێن سەرەکی بار بکەڤە.',
    invalidApiKey: 'کلیلا API یا نەدروستە. تکایە پشتڕاست بە ژ کلیلا خۆ.',
    quotaExceeded: 'سنوورێ بکارهێنانا کلیلێ (Quota) تەمام بوو یان فشار ل سەر سێرڤەری زێدە بوو. تکایە کێمەکا دی تاقی بکەڤە.',
    genericError: 'شاشیەک ڕوویدا ل دەمێ پەیوەندیکرن ب بزوێنەرێ ژیرییا دەستکرد.',
  },
  en: {
    noCodebase: 'No readable codebase content provided for auditing. Please select your project files in Step 1 first.',
    modelNotFound: (p: string) => `Local GGUF model file not found (${p}). Please download a model via the Model Manager or place a .gguf file in the ./models/ directory.`,
    claudeKeyMissing: 'Anthropic Claude API key is required. Please enter your Claude API key in the settings.',
    deepseekKeyMissing: 'DeepSeek API key is required. Please enter your DeepSeek API key in the settings.',
    geminiKeyMissing: 'Google Gemini API key is required. Please enter your Gemini key or switch to Local Offline LLM.',
    tokenLimitExceeded: 'The codebase payload is too large and exceeded the token limit. Please re-upload your core source code files.',
    invalidApiKey: 'Invalid API Key. Please verify your API key or switch to Local Offline LLM.',
    quotaExceeded: 'API quota exceeded or rate limit reached. Please try again in a few moments.',
    genericError: 'An error occurred while communicating with the AI engine.',
  },
  ar: {
    noCodebase: 'لم يتم تقديم أي شيفرات صالحة للفحص. يرجى تحديد مجلد المشروع في الخطوة الأولى.',
    modelNotFound: (p: string) => `لم يتم العثور على ملف النموذج المحلي (${p}). يرجى تنزيل نموذج محلي أو وضع ملف .gguf داخل مجلد models/.`,
    claudeKeyMissing: 'مفتاح Anthropic Claude API مطلوب. يرجى إدخال المفتاح في إعدادات الفحص.',
    deepseekKeyMissing: 'مفتاح DeepSeek API مطلوب. يرجى إدخال المفتاح في إعدادات الفحص.',
    geminiKeyMissing: 'مفتاح Google Gemini API مطلوب. يرجى إدخال المفتاح أو التبديل إلى المحرك المحلي بدون إنترنت.',
    tokenLimitExceeded: 'حجم المشروع كبير جداً وتجاوز الحد الأقصى للتوكنز. يرجى إعادة رفع الملفات الأساسية.',
    invalidApiKey: 'مفتاح API غير صالح. يرجى التحقق من صحة المفتاح.',
    quotaExceeded: 'تم استنفاد الحصة المخصصة للمفتاح (Quota). يرجى المحاولة بعد قليل.',
    genericError: 'حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي.',
  },
  fa: {
    noCodebase: 'هیچ سورس‌کدی برای ارزیابی ارائه نشده است. لطفاً ابتدا در گام ۱ پوشه پروژه را انتخاب کنید.',
    modelNotFound: (p: string) => `فایل مدل محلی (${p}) یافت نشد. لطفاً از طریق پنجره مدیریت، مدلی دانلود کنید یا فایل .gguf را در پوشه models/ قرار دهید.`,
    claudeKeyMissing: 'کلید Anthropic Claude API الزامی است. لطفاً کلید خود را در تنظیمات وارد نمایید.',
    deepseekKeyMissing: 'کلید DeepSeek API الزامی است. لطفاً کلید خود را در تنظیمات وارد نمایید.',
    geminiKeyMissing: 'کلید Google Gemini API الزامی است. لطفاً کلید خود را وارد کنید یا به حالت محلی آفلاین تغییر دهید.',
    tokenLimitExceeded: 'حجم پروژه بسیار زیاد است و از حد مجاز توکن‌ها فراتر رفت. لطفاً مجدداً سورس‌کد اصلی را بارگذاری کنید.',
    invalidApiKey: 'کلید API نامعتبر است. لطفاً از صحت کلید اطمینان حاصل نمایید.',
    quotaExceeded: 'محدودیت سهمیه API (Quota) به پایان رسیده است. لطفاً دقایقی دیگر مجدداً تلاش کنید.',
    genericError: 'خطایی در حین ارتباط با موتور هوش مصنوعی رخ داد.',
  },
};

function buildSystemInstruction(langCode: SupportedLanguage): string {
  const langConfig = LANGUAGES[langCode] || LANGUAGES.ckb;

  return `You are an Elite Principal Software Architect, Cybersecurity Penetration Tester, and Code Auditor operating as a unified system of 7 specialized AI agents.
Your mission is to perform a deep, rigorous, 7-dimensional codebase audit on the provided project files.

================================================================================
CRITICAL MULTILINGUAL INSTRUCTION (HIGHEST PRIORITY):
You MUST write the ENTIRE audit report, all explanations, domain titles, issue descriptions, and actionable fixes in:
>>> ${langConfig.aiPromptLang} <<<

Keep code snippets, variable names, and standard technical identifiers (such as API, SQL, XSS, CSRF, JWT, Next.js, React, Tailwind, LCP, CLS, INP, async/await) in their standard technical format, but all explanations, advice, and summaries MUST be fluently written in ${langConfig.nativeName} (${langConfig.name}).
================================================================================

EVALUATE STRICTLY ACROSS THESE 7 DOMAINS:
1. [Backend & Data Logic / لۆژیکی باکێند و داتابەیس / منطق الواجهة الخلفية / منطق بک‌اند]:
   - API endpoints, DB queries, form validation, data integrity, race conditions, error handling.
2. [UI, UX & Responsiveness / ڕووکار و دیزاین / واجهة وتجربة المستخدم / رابط کاربری]:
   - Mobile-first responsiveness (320px-768px+), layout shifts, overflow, accessibility (a11y), semantic HTML.
3. [Security (Critical) / ئاسایش و دژە-هاکینگ / الأمان ومكافحة الاختراق / امنیت و ضد هک]:
   - OWASP Top 10 (SQL Injection, XSS, CSRF, SSRF), exposed secrets/API keys, insecure .env, broken access control (RBAC), input sanitization.
4. [SEO & Routing / سێئۆ و ڕێڕەوەکان / محركات البحث والمسارات / سئو و مسیریابی]:
   - Meta tags, OpenGraph, title hierarchy, broken routes/links, missing 404 page, robots/sitemap.
5. [QA & Edge Cases / کەیسە هەستیارەکان / الحالات القصوى واختبار الجودة / حالت‌های استثنا]:
   - Empty states, double submissions, edge inputs, race conditions, dropped network handling.
6. [Performance / خێرایی و کارایی / الأداء والسرعة / کارایی و پرفورمنس]:
   - Unnecessary re-renders, heavy package imports, unoptimized images, memory leaks, LCP/CLS/INP bottlenecks.
7. [Documentation & Code Quality / دۆکیومێنتەیشن و ڕێکخستن / التوثيق وجودة الشيفرة / مستندسازی]:
   - Error logging vs silent failures, descriptive comments, strict typing, clean architecture.

OUTPUT FORMAT REQUIREMENTS:
1. Start with an **Executive Summary** including an **Overall Code Health Score: [Score]/100** and a brief 2-3 sentence overview.
2. Create an H2 (##) for each of the 7 domains.
3. For every issue found, use this exact clean structure:
   - **Severity:** [🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🔵 LOW]
   - **File/Location:** \`[Exact file path or function name]\`
   - **Issue:** [Clear explanation of the flaw in ${langConfig.nativeName}]
   - **Fix:** [Actionable remedy and exact code snippet or configuration in ${langConfig.nativeName}]
4. If a domain is completely clean, explicitly write:
   "✅ [Clear message stating no issues found in this domain in ${langConfig.nativeName}]"
5. Do NOT hallucinate. Evaluate strictly based on the provided codebase files.`;
}

// Typed request body — prevents runtime surprises from unvalidated client input
interface AuditRequestBody {
  codebase: string;
  apiKey?: string;
  modelName?: string;
  provider?: 'gemini' | 'claude' | 'deepseek-cloud' | 'local';
  localModelPath?: string;
  language?: SupportedLanguage;
}

export async function POST(req: NextRequest) {
  let targetLang: SupportedLanguage = 'ckb';

  try {
    const body: AuditRequestBody = await req.json();
    const {
      codebase,
      apiKey: clientApiKey,
      modelName,
      provider = 'gemini',
      localModelPath,
      language = 'ckb',
    } = body;

    targetLang = LANGUAGES[language as SupportedLanguage]
      ? (language as SupportedLanguage)
      : 'ckb';

    const msgs = API_ERROR_MESSAGES[targetLang] || API_ERROR_MESSAGES.ckb;

    if (!codebase || typeof codebase !== 'string' || codebase.trim().length === 0) {
      return NextResponse.json(
        { error: msgs.noCodebase },
        { status: 400 }
      );
    }

    const systemInstruction = buildSystemInstruction(targetLang);

    // =========================================================================
    // PROVIDER 1: LOCAL OFFLINE LLM (node-llama-cpp)
    // =========================================================================
    if (provider === 'local') {
      // Use centralized model path resolver
      const resolvedModelPath = resolveLocalModelPath(localModelPath);
      if (!resolvedModelPath) {
        return NextResponse.json({ error: msgs.modelNotFound(localModelPath || 'models/model.gguf') }, { status: 404 });
      }

      // Use centralized truncation utility
      const safeCodebase = truncateCodebase(codebase, 'local');

      const os = await import('os');
      const cpuCount = os.cpus()?.length || 4;
      const optimalThreads = Math.min(8, Math.max(2, cpuCount - 1));

      const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
      const llama = await getLlama({ gpu: false });
      const model = await llama.loadModel({ modelPath: resolvedModelPath, gpuLayers: 0 });
      const context = await model.createContext({
        contextSize: 8192,
        threads: optimalThreads,
      });
      const session = new LlamaChatSession({
        contextSequence: context.getSequence(),
        systemPrompt: systemInstruction,
      });

      const userPrompt = `Please perform the 7-dimensional cybersecurity & code audit on the following codebase files. Write the complete report in ${LANGUAGES[targetLang].aiPromptLang}:\n\n${safeCodebase}`;

      const reportMarkdown = await session.prompt(userPrompt, {
        maxTokens: 2048,
        temperature: 0.2,
      });

      return NextResponse.json({
        success: true,
        report: reportMarkdown,
        modelUsed: `Local Offline (${path.basename(resolvedModelPath)})`,
        language: targetLang,
        provider: 'local',
        timestamp: new Date().toISOString(),
      });
    }

    // =========================================================================
    // PROVIDER 2: ANTHROPIC CLAUDE (Cloud AI)
    // =========================================================================
    if (provider === 'claude') {
      const activeApiKey = clientApiKey || process.env.ANTHROPIC_API_KEY;
      if (!activeApiKey) {
        return NextResponse.json(
          { error: msgs.claudeKeyMissing },
          { status: 401 }
        );
      }

      const selectedClaudeModel = modelName || 'claude-3-5-sonnet-20241022';
      const safeClaudeCodebase = truncateCodebase(codebase, 'claude');
      const userPrompt = `Please perform the 7-dimensional cybersecurity & code audit on the following codebase files. Write the complete report in ${LANGUAGES[targetLang].aiPromptLang}:\n\n${safeClaudeCodebase}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: selectedClaudeModel,
          max_tokens: 4096,
          system: systemInstruction,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to call Anthropic Claude API');
      }

      const reportMarkdown = data.content?.[0]?.text || '';

      return NextResponse.json({
        success: true,
        report: reportMarkdown,
        modelUsed: selectedClaudeModel,
        language: targetLang,
        provider: 'claude',
        timestamp: new Date().toISOString(),
      });
    }

    // =========================================================================
    // PROVIDER 3: DEEPSEEK CLOUD API (Cloud AI)
    // =========================================================================
    if (provider === 'deepseek-cloud') {
      const activeApiKey = clientApiKey || process.env.DEEPSEEK_API_KEY;
      if (!activeApiKey) {
        return NextResponse.json(
          { error: msgs.deepseekKeyMissing },
          { status: 401 }
        );
      }

      const selectedDeepSeekModel = modelName || 'deepseek-reasoner';
      const safeDeepSeekCodebase = truncateCodebase(codebase, 'deepseek-cloud');
      const userPrompt = `Please perform the 7-dimensional cybersecurity & code audit on the following codebase files. Write the complete report in ${LANGUAGES[targetLang].aiPromptLang}:\n\n${safeDeepSeekCodebase}`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeApiKey}`,
        },
        body: JSON.stringify({
          model: selectedDeepSeekModel,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 4096,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to call DeepSeek Cloud API');
      }

      const reportMarkdown = data.choices?.[0]?.message?.content || '';

      return NextResponse.json({
        success: true,
        report: reportMarkdown,
        modelUsed: selectedDeepSeekModel,
        language: targetLang,
        provider: 'deepseek-cloud',
        timestamp: new Date().toISOString(),
      });
    }

    // =========================================================================
    // PROVIDER 4: GOOGLE GEMINI (Cloud AI)
    // =========================================================================
    const activeApiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!activeApiKey) {
      return NextResponse.json(
        {
          error: msgs.geminiKeyMissing,
        },
        { status: 401 }
      );
    }

    const safeCodebase = truncateCodebase(codebase, 'gemini');

    const selectedGeminiModel = modelName || 'gemini-2.5-flash';
    // Dynamic import — only load GoogleGenerativeAI when Gemini provider is actually used
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({
      model: selectedGeminiModel,
      systemInstruction: systemInstruction,
    });

    const userPrompt = `Please perform the 7-dimensional cybersecurity & code audit on the following codebase files. Write the complete report in ${LANGUAGES[targetLang].aiPromptLang}:\n\n${safeCodebase}`;

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const reportMarkdown = response.text();

    return NextResponse.json({
      success: true,
      report: reportMarkdown,
      modelUsed: selectedGeminiModel,
      language: targetLang,
      provider: 'gemini',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Cyber Audit API Error:', error);

    const msgs = API_ERROR_MESSAGES[targetLang] || API_ERROR_MESSAGES.ckb;
    let errorMessage = (error instanceof Error ? error.message : String(error)) || msgs.genericError;

    if (errorMessage.includes('token count exceeds') || errorMessage.includes('1048576')) {
      errorMessage = msgs.tokenLimitExceeded;
    } else if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key')) {
      errorMessage = msgs.invalidApiKey;
    } else if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
      errorMessage = msgs.quotaExceeded;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
