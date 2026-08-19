import { SupportedLanguage } from './i18n';

export interface DocSection {
  title: string;
  subtitle: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface DomainItem {
  number: string;
  title: string;
  desc: string;
  isCritical?: boolean;
}

export interface QuickStepItem {
  step: number;
  title: string;
  desc: string;
}

export interface ModelTableItem {
  name: string;
  filename: string;
  quant: string;
  size: string;
  minRam: string;
  recRam: string;
  cpuSpec: string;
  strength: string;
  statusBadge: string;
}

export interface CloudEngineItem {
  name: string;
  badge: string;
  description: string;
  contextWindow: string;
  keyEnv: string;
  recommendedFor: string;
}

export interface DocsData {
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  navBack: string;
  tableOfContents: string;
  copyCode: string;
  copiedCode: string;
  searchPlaceholder: string;
  pillars: {
    ram: string;
    local: string;
    matrix: string;
    langs: string;
  };
  sec1: {
    title: string;
    subtitle: string;
    desc1: string;
    pipelineTitle: string;
    pipelineBadge: string;
    p1: { title: string; sub: string; note: string };
    p2: { title: string; sub: string; note: string };
    p3: { title: string; sub: string; note: string };
    p4: { title: string; sub: string; note: string };
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
  };
  sec2: {
    title: string;
    subtitle: string;
    steps: QuickStepItem[];
  };
  sec3: {
    title: string;
    subtitle: string;
    desc: string;
    hardwareTitle: string;
    hardwareDesc: string;
    thModel: string;
    thSize: string;
    thRamMin: string;
    thRamRec: string;
    thCpu: string;
    thStrength: string;
    models: ModelTableItem[];
    installTitle: string;
    method1: string;
    method2: string;
  };
  sec4: {
    title: string;
    subtitle: string;
    desc: string;
    engines: CloudEngineItem[];
    envTitle: string;
    envDesc: string;
  };
  sec5: {
    title: string;
    subtitle: string;
    desc: string;
    domains: DomainItem[];
  };
  sec6: {
    title: string;
    subtitle: string;
    desc: string;
    endpointPost: string;
    endpointStream: string;
  };
  sec7: {
    title: string;
    subtitle: string;
    desc: string;
    points: Array<{ title: string; desc: string }>;
  };
  sec8: {
    title: string;
    subtitle: string;
    faqs: FaqItem[];
  };
}

export const DOCS_CONTENT: Record<SupportedLanguage, DocsData> = {
  // =========================================================================
  // 1. KURDISH SORANI (کوردیی سۆرانی)
  // =========================================================================
  ckb: {
    badge: 'دۆکیۆمێنتەیشنی تەواوی سیستەم // Cyphix Docs',
    heroTitle: 'ڕێنمایی و دۆکیۆمێنتەیشنی Cyphix',
    heroSubtitle: 'ڕێبەری گشتگیر بۆ شیکاری سایبەری ٧-ڕەهەندی، مۆدێلە کلاودەکان و بزوێنەرە ناوخۆییە ئۆفلاینەکانی GGUF',
    navBack: 'گەڕانەوە بۆ سەرەتا',
    tableOfContents: 'پێڕستی بەشەکان',
    copyCode: 'کۆپیکردنی کۆد',
    copiedCode: 'کۆپی کرا!',
    searchPlaceholder: 'گەڕان لە دۆکیۆمێنتەیشن...',
    pillars: {
      ram: '١٠٠٪ لەناو RAM (بێ سێرڤەر)',
      local: 'مۆدێلی ناوخۆیی GGUF',
      matrix: 'شیکاری ٧-ڕەهەندی',
      langs: '٥ زمانی تەواو (RTL/LTR)',
    },
    sec1: {
      title: '١. تەلارسازی و شێوازی کارکردنی سیستەم',
      subtitle: 'چۆنیەتی بەڕێوەچوونی شیکاریی پڕۆژە لەناو بیرگەی خۆماڵی و ڕەوتی بریکارەکان',
      desc1:
        'سیستەمی Cyphix بە تەلارسازییەکی مۆدێرنی فرە-بریکار (Multi-Agent Architecture) داڕێژراوە. کاتێک فۆڵدەری پڕۆژەکەت دادەنێیت، تەواوی فایلەکان بە فلتەری تونددا دەڕۆن، فایلە زیادەکانی وەک node_modules و .git دەپاڵێورێن و کۆدەکان ڕاستەوخۆ لەناو بیرگەی RAM دەمێننەوە بێ ئەوەی لەسەر هیچ داتابەیسێک پاشەکەوت بکرێن.',
      pipelineTitle: 'ڕەوتی پاراستن و شیکاریی فرە-بریکار (Multi-Agent Pipeline)',
      pipelineBadge: '١٠٠٪ لەناو RAM دەمێنێتەوە',
      p1: {
        title: '١. وەرگرتن و فلتەر',
        sub: 'پاککردنەوەی فایلەکان',
        note: 'لابردنی node_modules و قفڵەکان',
      },
      p2: {
        title: '٢. پشکنەری خێرای AST',
        sub: 'دۆزینەوەی دەستبەجێی کێشەکان',
        note: 'دۆزینەوەی کلیلی ئاشکرا و SQLi',
      },
      p3: {
        title: '٣. فرە-بریکاری ٧-ڕەهەندی',
        sub: 'شیکاری بە ژیری دەستکرد',
        note: 'Cloud AI یان مۆدێلی ئۆفلاینی GGUF',
      },
      p4: {
        title: '٤. ڕاپۆرتی کۆتایی',
        sub: 'دەرکردنی ڕاپۆرتی ستاندارد',
        note: 'داگرتن بە Markdown و PDF',
      },
      pillar1Title: 'پارێزراوی تەواو (Privacy by Design & Air-Gapped)',
      pillar1Desc:
        'هەموو کردارەکانی پشکنین دەتوانرێت بە شێوەی ١٠٠٪ ئۆفلاین بەبێ ئینتەرنێت لەسەر مۆدێلە ناوخۆییەکان ئەنجام بدرێن، کە بۆ پڕۆژە هەستیار و حکومی و تایبەتەکان تەواو پارێزراوە.',
      pillar2Title: 'ستریمکردنی ڕاستەوخۆ (Real-time SSE Streaming)',
      pillar2Desc:
        'بە بەکارهێنانی Server-Sent Events، بەکارهێنەر لە سات بە ساتی لۆگەکان و پێشکەوتنی هەر ٧ دۆمەینەکە لە کاتی ڕاستەقینەدا ئاگادار دەبێتەوە.',
    },
    sec2: {
      title: '٢. ڕێنمایی دەستپێکردنی خێرا (Quickstart)',
      subtitle: '٤ هەنگاوی ئاسان بۆ پشکنینی هەر کۆدبەیسێک لە چەند چرکەیەکدا',
      steps: [
        {
          step: 1,
          title: 'فۆڵدەر یان فایلی کۆدەکان دابنێ (Drag & Drop)',
          desc: 'فۆڵدەری سەرەکی پڕۆژەکەت ڕابکێشە بۆ ناو ناوچەی پشکنین. سیستەم بە شێوەی خۆکار فایلە زیادەکان فلتەر دەکات و کورتەی قەبارە و دێڕەکانت پێ نیشان دەدات.',
        },
        {
          step: 2,
          title: 'بزوێنەری شیکاری هەڵبژێرە (Cloud یان Local)',
          desc: 'دەتوانیت بزوێنەرە کلاودەکان (Google Gemini, Anthropic Claude, DeepSeek Cloud) هەڵبژێریت بە کلیل، یان مۆدێلە ئۆفلاینەکانی ناوخۆیی بۆ پارێزراوی تەواو.',
        },
        {
          step: 3,
          title: 'دەستپێکردنی پشکنینی ڕاستەوخۆ (Start Audit)',
          desc: 'کلیک لەسەر دوگمەی دەستپێکردن بکە تا پشکنەری خێرای AST و دواتر ٧ بریکارە پسپۆڕەکە دەست بە شیکاری وردی کۆدەکان بکەن.',
        },
        {
          step: 4,
          title: 'وەرگرتن و داگرتنی ڕاپۆرت',
          desc: 'ڕاپۆرتێکی تێروتەسەل بە چوارچێوەی دەستنیشانکردنی کێشە و پێشنیاری ڕاستکردنەوە وەربگرە و بە فۆرماتی Markdown (.md) یان PDF دایبگرە.',
        },
      ],
    },
    sec3: {
      title: '٣. مۆدێلە ناوخۆییە ئۆفلاینەکان (Local Offline GGUF Models)',
      subtitle: 'شیکاری ١٠٠٪ پارێزراو لەسەر کۆمپیوتەری خۆت بەبێ ئینتەرنێت لە ڕێگەی CPU/RAM',
      desc:
        'مۆدێلە ئۆفلاینەکان بە فۆرماتی بەهێزی GGUF (4-bit Quantized) دابینکراون کە لە ڕێگەی کڕۆکی node-llama-cpp و بە فرە-ڕیشاڵکردنی CPU لەناو ڕامی ئاساییدا بەبێ پێویستی بە کارتی گرافیکی گرانبەها کار دەکەن.',
      hardwareTitle: 'پێداویستییە پێشنیارکراوەکانی کۆمپیوتەر (System Requirements)',
      hardwareDesc:
        'خشتەی خوارەوە بە وردی ئاستی ڕام و پرۆسێسەری پێویست بۆ هەر یەک لە سێ مۆدێلە ناوخۆییەکە ڕوون دەکاتەوە تا بزانێت کام مۆدێل بۆ ئامێرەکەت گونجاوە:',
      thModel: 'ناوی مۆدێل و فایلی GGUF',
      thSize: 'قەبارە',
      thRamMin: 'کەمترین ڕام',
      thRamRec: 'ڕامی پێشنیارکراو',
      thCpu: 'پرۆسێسەر (CPU)',
      thStrength: 'خاڵی بەهێز و بەکارهێنان',
      models: [
        {
          name: 'DeepSeek-R1-Distill-Qwen-7B',
          filename: 'model.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB - 32 GB RAM',
          cpuSpec: '8+ Cores (Core i7 / Ryzen 7+)',
          strength: 'بیرکردنەوەی قووڵی زنجیرەیی (Deep Reasoning)، ڕاوکردنی کەلێنە هەستیارەکانی هاک و لێکدانەوەی ئەندازیاری ئاڵۆز.',
          statusBadge: 'پێشنیارکراو (Recommended)',
        },
        {
          name: 'Qwen2.5-Coder-7B-Instruct',
          filename: 'qwen-coder-7b.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB RAM',
          cpuSpec: '6+ Cores (Core i5 / Ryzen 5+)',
          strength: 'نایاب بۆ ئەندازیاری کۆد، چارەسەری هەڵەی سینتاکس، خاوێنکردنەوەی جۆری TypeScript و خێرایی بەرز.',
          statusBadge: 'خێرا و تایبەت بە کۆد',
        },
        {
          name: 'Llama-3.2-3B-Instruct',
          filename: 'llama-3.2-3b.gguf',
          quant: 'Q4_K_M',
          size: '1.88 GB',
          minRam: '6 GB RAM',
          recRam: '8 GB RAM',
          cpuSpec: '4 Cores (هەر لاپتۆپ و PCیەک)',
          strength: 'زۆر کێش-سووک و کەم-خەرج، گونجاوە بۆ لاپتۆپە ئاساییەکان بە ڕامی ٨ گێگابایت بۆ پشکنینی خێرای ڕووکار و خاوێنی.',
          statusBadge: 'سووک بۆ ئامێری لاواز',
        },
      ],
      installTitle: 'شێوازەکانی داگرتنی مۆدێل بۆ ناو سیستەم',
      method1: 'ڕێگای ١ (ئاسانترین): کلیک لە دوگمەی "داگرتنی مۆدێل" لە سەرەوەی پەڕەکە بکە، مۆدێلەکان بە شێوەی خۆکار لەگەڵ توانای ڕاگرتن و دەستپێکردنەوە (Pause/Resume) دادەبەزنە فۆڵدەری models/.',
      method2: 'ڕێگای ٢ (لە ڕێگەی تێرمینالەوە): دەتوانیت بە Hugging Face CLI ڕاستەوخۆ مۆدێلەکان بۆ ناو فۆڵدەری models/ دابگریت:',
    },
    sec4: {
      title: '٤. بزوێنەرە کلاودەکان (Cloud AI Engines)',
      subtitle: 'بەستنەوە بە بەهێزترین مۆدێلە جیهانییەکان بۆ پڕۆژە زۆر گەورەکان بە کلیل',
      desc:
        'ئەگەر پڕۆژەکەت زۆر گەورەیە (دەیان هەزار دێڕ کۆد) و دەتەوێت لە چەند چرکەیەکی کەمدا لە ڕێگەی کلاودەوە شیکاری بۆ بکرێت، Cyphix سێ بزوێنەری کلاودی پێشەنگ دابین دەکات:',
      engines: [
        {
          name: 'Google Gemini',
          badge: 'Gemini 2.5 Flash / 1.5 Pro',
          description: 'خاوەنی گەورەترین بازنەی دەق (Context Window سەرووی ١ ملیۆن تۆکێن). دەتوانێت تەواوی کۆدبەیس و فایلەکان پێکەوە بە خێراییەکی ناوازە وەربگرێت و ٧ بریکارەکە بە شێوەی تەریب (Parallel) بەگەڕبخات.',
          contextWindow: '١,٠٠٠,٠٠٠+ تۆکێن',
          keyEnv: 'GEMINI_API_KEY',
          recommendedFor: 'پڕۆژە زۆر گەورەکان و شیکاری بە کۆمەڵ',
        },
        {
          name: 'Anthropic Claude',
          badge: 'Claude 3.5 Sonnet',
          description: 'پێوەر و ستانداردی جیهانییە بۆ لۆژیکی ئەندازیاری و تێگەیشتن لە پەیوەندی نێوان فایلە ئاڵۆزەکان و بەرهەمهێنانی پێشنیاری کۆدی بێ هەڵە.',
          contextWindow: '٢٠٠,٠٠٠ تۆکێن',
          keyEnv: 'ANTHROPIC_API_KEY',
          recommendedFor: 'قووڵترین وردبینی ئەندازیاری و ئاسایش',
        },
        {
          name: 'DeepSeek Cloud',
          badge: 'DeepSeek-V3 / Reasoner',
          description: 'مۆدێلێکی هەرزان و لە هەمان کاتدا خاوەن توانایەکی بێ وێنە لە لێکدانەوەی لۆژیکی ماتماتیکی و دۆزینەوەی کێشەی شاراوە.',
          contextWindow: '٦٤,٠٠٠ تۆکێن',
          keyEnv: 'DEEPSEEK_API_KEY',
          recommendedFor: 'تێچووی کەم لەگەڵ بیرکردنەوەی قووڵ',
        },
      ],
      envTitle: 'دانانی کلیلەکان لە فایلی .env.local',
      envDesc: 'دەتوانیت کلیلەکان لەناو فۆرمی کۆنترۆڵ داخڵ بکەیت، یان لە سێرڤەرەکەت لە فایلی .env.local داینێیت:',
    },
    sec5: {
      title: '٥. ماتریکسی ٧-ڕەهەندی پاراستن و ئەندازیاری (7-D Matrix)',
      subtitle: 'هەر بریکارێک بە تەنیا پسپۆڕی یەک بوارە تا وردترین دۆزینەوە بەدەستبێت',
      desc: 'بۆ ئەوەی هیچ کەم و کوڕییەک لە پشکنیندا لەدەست نەچێت، کۆدەکان دابەش دەکرێن بۆ سەر ٧ تەوەری سەرەکی:',
      domains: [
        {
          number: '1',
          title: 'لۆژیکی باکێند، دراوەکان و ئەندازیاری (Backend & Data Logic)',
          desc: 'پشکنینی کوێرییەکانی داتابەیس، ORM، مامەڵەکردن لەگەڵ مامەڵە داراییەکان، لۆژیکی API و ڕێگریکردن لە پەردەپۆشکردنی هەڵەکان.',
        },
        {
          number: '2',
          title: 'ڕووکار، دیزاین و گونجاوی شاشە (UI, UX & Responsiveness)',
          desc: 'شیکاری ئەزموونی بەکارهێنەر، کارپێکردنی سەر مۆبایل، دۆخی بارکردن (Loading States)، دەستڕاگەیشتن (ARIA) و ڕاست-بۆ-چەپ (RTL).',
        },
        {
          number: '3',
          title: 'ئاسایشی مەترسیدار و دژە-هاکینگ (Critical Security & OWASP Top 10)',
          desc: 'دۆزینەوەی کەلێنەکانی SQL Injection, XSS, CSRF, کلیلی ئاشکراکراو، کەلێنی دەسەڵات (Broken Auth/Access Control).',
          isCritical: true,
        },
        {
          number: '4',
          title: 'سێئۆ، مێتاداتا و ڕێڕەوەکان (SEO, Metadata & Routing)',
          desc: 'پشکنینی تایتڵ، تاگەکانی Open Graph، بەستەرە نێودەوڵەتییەکانی hreflang، کانونیکەڵ و یەکگرتوویی ڕێڕەوەکانی Next.js.',
        },
        {
          number: '5',
          title: 'کەیسە هەستیارەکان و تاقیکردنەوە (QA & Edge Cases)',
          desc: 'شیکاری کەیسە سنووردارەکان (Edge Cases)، داتای چاوەڕواننەکراو، پچڕانی ئینتەرنێت و یەکگرتوویی مامەڵەکردن بە هەڵە.',
        },
        {
          number: '6',
          title: 'خێرایی، کارایی و بەفیڕۆنەدانی بیرگە (Performance & Core Web Vitals)',
          desc: 'دۆزینەوەی دزەکردنی بیرگە (Memory Leaks)، گەورەیی قەبارەی باندڵ، بارکردنی فۆنت و کەمکردنەوەی ڕێندەری ناپێویست.',
        },
        {
          number: '7',
          title: 'دۆکیۆمێنتەیشن، لۆگکردن و خاوێنی کۆد (Documentation & Code Quality)',
          desc: 'پشکنینی پێناسەی TypeScript، پاکی و مۆدیولاربوونی پێکهاتە، لۆگکردنی دروست و نەبوونی ژمارە نەناسراوەکان (Magic Numbers).',
        },
      ],
    },
    sec6: {
      title: '٦. دۆکیۆمێنتەیشنی فەرمی API و خزمەتگوزارییەکان',
      subtitle: 'بەستنەوەی Cyphix بە پرۆسەی CI/CD یان کۆنسۆڵی تێرمینال لە ڕێگەی HTTP API',
      desc: 'سیستەمەکە دوو ڕێڕەوی ستانداردی سەرڤەرلێس بۆ شیکاری دابین دەکات:',
      endpointPost: 'POST /api/audit — شیکاری یەکجارەکی لەگەڵ وەڵامدانەوەی JSON',
      endpointStream: 'POST /api/audit/stream — پەخشی ڕاستەوخۆ بە Server-Sent Events (SSE)',
    },
    sec7: {
      title: '٧. ئاسایش، مەرجەکانی تایبەتمەندی و SOC 2',
      subtitle: 'چۆن دڵنیادەبینەوە لەوەی هیچ داتایەکی کۆدبەیسەکەت دزە ناکات؟',
      desc: 'Cyphix بە یاسای Privacy by Design دروستکراوە بەم تایبەتمەندییە توندانە:',
      points: [
        {
          title: 'هیچ فایلێک لەسەر دیسک پاشەکەوت ناکرێت',
          desc: 'هەموو کارەکان ڕاستەوخۆ لەناو بیرگەی کاتیی RAM ئەنجام دەدرێن و دوای تەواوبوونی پشکنین تەواوی زانیارییەکان پاک دەکرێنەوە.',
        },
        {
          title: 'فلتەرکردنی زانیارییە نهێنییەکان (.env / secrets)',
          desc: 'فایلەکانی .env و کلیلە نهێنییەکان بەر لە ناردن بە شێوەی خۆکار لەناو وێبگەڕدا لادەبرێن.',
        },
        {
          title: 'کارکردنی تەواو بەبێ ئینتەرنێت (Air-Gapped Ready)',
          desc: 'بە بەکارهێنانی مۆدێلە ناوخۆییەکانی GGUF، تەنانەت یەک بایت داتاش ناچێتە دەرەوەی کۆمپیوتەرەکەت.',
        },
      ],
    },
    sec8: {
      title: '٨. پرسیارە باوەکان (FAQ) و ڕێنمایی دیباگکردن',
      subtitle: 'وەڵامی هەموو ئەو پرسیارانەی لەوانەیە ڕووبەڕووت ببنەوە',
      faqs: [
        {
          q: 'ئایا پێویستم بە کارتی گرافیکی بەهێز (GPU) هەیە بۆ بەکارهێنانی مۆدێلە ئۆفلاینەکان؟',
          a: 'نەخێر! Cyphix بە تەواوی بۆ CPU و ڕامی ئاسایی کەمکراوەتەوە. تەنانەت بە کۆمپیوتەرێکی ئاسایی بە ٨ یان ١٦ گێگابایت ڕام دەتوانیت بە باشترین شێوە پشکنین ئەنجام بدەیت.',
        },
        {
          q: 'جیاوازی سەرەکی نێوان DeepSeek-R1 و Qwen-Coder چییە؟',
          a: 'مۆدێلی DeepSeek-R1 بۆ بیرکردنەوەی قووڵی زنجیرەیی و دۆزینەوەی کێشەی شاراوەی ئاسایش باشترینە، لە کاتێکدا Qwen-Coder بۆ خێرایی و پێشنیارکردنی کۆدی چاککراو و تایپەکانی TypeScript زۆر لەپێشە.',
        },
        {
          q: 'ئایا کلیلەکانی API (Gemini/Claude) لەسەر سێرڤەر هەڵدەگیرێن؟',
          a: 'نەخێر، کلیلەکان تەنها لەناو سێشنی وێبگەڕەکەتدا بەکاردێن و پاش گەڕانەوەی ئەنجام بە تەواوی دادەخرێن.',
        },
        {
          q: 'چۆن دەتوانم ڕاپۆرتەکەم بە شێوەی PDF پاشەکەوت بکەم؟',
          a: 'لە بەشی خوارەوەی ڕاپۆرتەکە کلیک لەسەر دوگمەی "Print / Export PDF" بکە، پەڕەی پرینتی وێبگەڕ دەکرێتەوە و دەتوانیت وەک PDF پاشەکەوتی بکەیت.',
        },
      ],
    },
  },

  // =========================================================================
  // 2. KURDISH BADINI (کوردییا بادینی)
  // =========================================================================
  badini: {
    badge: 'دۆکیۆمێنتەیشنا تەمام یا سیستەمی // Cyphix Docs',
    heroTitle: 'ڕێبەر و دۆکیۆمێنتەیشنا Cyphix',
    heroSubtitle: 'ڕێبەرێ گشتگیر بۆ شیکاریا سایبەری یا ٧-ڕەهەندی، مۆدێلێن کلاود و بزوێنەرێن ناڤخۆیی یێن ئۆفلاین GGUF',
    navBack: 'زڤرین بۆ دەستپێکێ',
    tableOfContents: 'پێڕستێ بەشان',
    copyCode: 'کۆپیکرنا کۆدی',
    copiedCode: 'کۆپی بوو!',
    searchPlaceholder: 'لێگەڕیان د ناڤ دۆکیۆمێنتەیشنێ دا...',
    pillars: {
      ram: '١٠٠٪ د ناڤ RAM دا (بێ سێرڤەر)',
      local: 'مۆدێلێ ناڤخۆیی GGUF',
      matrix: 'شیکاریا ٧-ڕەهەندی',
      langs: '٥ زمانێن تەمام (RTL/LTR)',
    },
    sec1: {
      title: '١. تەلارسازی و شێوازێ کارکرنا سیستەمی',
      subtitle: 'چەوانیا بڕێڤەچوونا شیکاریا پرۆژەی د ناڤ بیرگەها ناڤخۆیی و ڕەوتێ بریکاران دا',
      desc1:
        'سیستەمێ Cyphix ب تەلارسازیەکا مۆدێرن یا فرە-بریکار (Multi-Agent Architecture) هاتیە چێکرن. دەمێ تو فۆڵدەرێ پرۆژەیێ خۆ دادەنێی، هەمی فایل ب فلتەرەکێ توند دا دەرباز دبن و ڕاستەوخۆ د ناڤ بیرگەها RAM دا دمینن بێی کو ل سەر چ داتابەیسان بهێنە هەلگرتن.',
      pipelineTitle: 'ڕەوتێ پاراستن و شیکاریا فرە-بریکار (Multi-Agent Pipeline)',
      pipelineBadge: '١٠٠٪ د ناڤ RAM دا دمینیت',
      p1: {
        title: '١. وەرگرتن و فلتەر',
        sub: 'پاقژکرنا فایلان',
        note: 'لابردنا node_modules و قفلان',
      },
      p2: {
        title: '٢. پشکنەرێ لەزگین یێ AST',
        sub: 'دیتنا دەستبەجێ یا کێماسیان',
        note: 'دیتنا کلیلێن ئاشکرا و SQLi',
      },
      p3: {
        title: '٣. فرە-بریکارێ ٧-ڕەهەندی',
        sub: 'شیکاری ب ژیرییا دەستکرد',
        note: 'Cloud AI یان مۆدێلێ ئۆفلاین یێ GGUF',
      },
      p4: {
        title: '٤. ڕاپۆرتا دووماهیێ',
        sub: 'دەرئینانا ڕاپۆرتا ستاندارد',
        note: 'داگرتن ب Markdown و PDF',
      },
      pillar1Title: 'پاراستنا تەمام (Privacy by Design & Air-Gapped)',
      pillar1Desc:
        'هەمی کردارێن پشکنینێ دکارن ب شێوەیەکێ ١٠٠٪ ئۆفلاین بێی ئینتەرنێت ل سەر مۆدێلێن ناڤخۆیی بهێنە ئەنجامدان کو بۆ پرۆژەیێن هەستیار و فەرمی گەلەک یا پاراستیە.',
      pillar2Title: 'ستریمکرنا ڕاستەوخۆ (Real-time SSE Streaming)',
      pillar2Desc:
        'ب بکارئینانا Server-Sent Events، بکارئینەر د هەر دەقیقەیەکێ دا ژ پێشکەفتنا هەر ٧ تەوەران ب ڕاستەوخۆ ئاگەهدار دبیت.',
    },
    sec2: {
      title: '٢. ڕێنماییا دەستپێکرنا لەزگین (Quickstart)',
      subtitle: '٤ پێنگاڤێن ساناهی بۆ پشکنینا هەر کۆدبەیسەکی د چەند چرکەیان دا',
      steps: [
        {
          step: 1,
          title: 'فۆڵدەر یان فایلێ کۆدان دانە (Drag & Drop)',
          desc: 'فۆڵدەرێ سەرەکی یێ پرۆژەیێ خۆ بکێشە د ناڤ جهێ پشکنینێ دا. سیستەم ب شێوەیەکێ خۆکار فایلێن زێدە فلتەر دکەت.',
        },
        {
          step: 2,
          title: 'بزوێنەرێ شیکاریێ هەلبژێرە (Cloud یان Local)',
          desc: 'تو دشێی بزوێنەرێن کلاود (Google Gemini, Anthropic Claude, DeepSeek Cloud) هەلبژێری یان مۆدێلێن ئۆفلاین یێن ناڤخۆیی.',
        },
        {
          step: 3,
          title: 'دەستپێکرنا پشکنینا ڕاستەوخۆ (Start Audit)',
          desc: 'کلیکێ ل سەر دوگمەیا دەستپێکرنێ بکە دا کو پشکنەرێ خێرا یێ AST و ٧ بریکارێن پسپۆر دەست ب شیکاریا هویر بکەن.',
        },
        {
          step: 4,
          title: 'وەرگرتن و داگرتنا ڕاپۆرتێ',
          desc: 'ڕاپۆرتەکا تێر و تەسەل ب فۆرماتێ Markdown (.md) یان PDF دابگرە.',
        },
      ],
    },
    sec3: {
      title: '٣. مۆدێلێن ناڤخۆیی یێن ئۆفلاین (Local Offline GGUF Models)',
      subtitle: 'شیکاریا ١٠٠٪ پاراستی ل سەر کۆمپیۆتەرێ تە بێی ئینتەرنێت ب ڕێکا CPU/RAM',
      desc:
        'مۆدێلێن ئۆفلاین ب فۆرماتێ ب هێز یێ GGUF (4-bit Quantized) دابینکرینە کو ب ڕێکا node-llama-cpp د ناڤ ڕاما ئاسایی دا بێی پێدڤی ب کارتا گرافیکێ یا گران کار دکەن.',
      hardwareTitle: 'پێدڤیێن پێشنیارکری یێن ئامێری (System Requirements)',
      hardwareDesc:
        'خشتەیێ خوارێ ب هویربینی ئاستێ ڕام و پرۆسێسەرێ پێدڤی بۆ هەر ئێک ژ سێ مۆدێلان دیار دکەت:',
      thModel: 'ناڤێ مۆدێلی و فایلێ GGUF',
      thSize: 'قەبارە',
      thRamMin: 'کێمترین ڕام',
      thRamRec: 'ڕامێ پێشنیارکری',
      thCpu: 'پرۆسێسەر (CPU)',
      thStrength: 'خالا ب هێز و بکارئینان',
      models: [
        {
          name: 'DeepSeek-R1-Distill-Qwen-7B',
          filename: 'model.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB - 32 GB RAM',
          cpuSpec: '8+ Cores (Core i7 / Ryzen 7+)',
          strength: 'هزرکرنا کویر یا زنجیرەیی، دیتنا کێماسیێن پاراستنێ و شیکاریا ئەندازیاریا ئالۆز.',
          statusBadge: 'پێشنیارکری (Recommended)',
        },
        {
          name: 'Qwen2.5-Coder-7B-Instruct',
          filename: 'qwen-coder-7b.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB RAM',
          cpuSpec: '6+ Cores (Core i5 / Ryzen 5+)',
          strength: 'نایاب بۆ ئەندازیاریا کۆدی، ڕاستڤەکرنا سینتاکسی و خاوێنیا TypeScript ب لەزاتیەکا بلند.',
          statusBadge: 'خێرا و تایبەت ب کۆدی',
        },
        {
          name: 'Llama-3.2-3B-Instruct',
          filename: 'llama-3.2-3b.gguf',
          quant: 'Q4_K_M',
          size: '1.88 GB',
          minRam: '6 GB RAM',
          recRam: '8 GB RAM',
          cpuSpec: '4 Cores (هەر لاپتۆپ و PCیەک)',
          strength: 'گورک و کێم-مەسرەف، گونجایە بۆ ئامێرێن ئاسایی ب ڕامێ ٨ گێگابایت.',
          statusBadge: 'سڤک بۆ ئامێرێن لاواز',
        },
      ],
      installTitle: 'شێوازێن داگرتنا مۆدێلی',
      method1: 'ڕێکا ١: کلیکێ ل سەر دوگمەیا "داگرتنا مۆدێلی" ل سەرێ پەڕەی بکە بۆ داگرتنا ئۆتۆماتیکی ب شیانێن Pause/Resume.',
      method2: 'ڕێکا ٢: ب ڕێکا تێرمینالێ و Hugging Face CLI ڕاستەوخۆ فۆڵدەرێ models/ تژی بکە:',
    },
    sec4: {
      title: '٤. بزوێنەرێن کلاود (Cloud AI Engines)',
      subtitle: 'گرێدان ب ب هێزترین مۆدێلێن جیهانی بۆ پرۆژەیێن گەلەک مەزن',
      desc: 'بۆ پرۆژەیێن مەزن کو د ناڤ چەند چرکەیان دا بهێنە پشکنین، ئەڤ سێ بزوێنەرە بەردەستن:',
      engines: [
        {
          name: 'Google Gemini',
          badge: 'Gemini 2.5 Flash / 1.5 Pro',
          description: 'خودان مەزنترین ڕووبەرێ دەقی (زێدەتری ١ ملیۆن تۆکێن). دشێت تەواویا پرۆژەی ب ئێک جار وەرگریت.',
          contextWindow: '١,٠٠٠,٠٠٠+ تۆکێن',
          keyEnv: 'GEMINI_API_KEY',
          recommendedFor: 'پرۆژەیێن زۆر مەزن و شیکاریا ب کۆم',
        },
        {
          name: 'Anthropic Claude',
          badge: 'Claude 3.5 Sonnet',
          description: 'پیڤەرێ جیهانی یە بۆ لۆژیکێ ئەندازیاری و تێگەهشتنا د ناڤبەرا فایلێن ئالۆز دا.',
          contextWindow: '٢٠٠,٠٠٠ تۆکێن',
          keyEnv: 'ANTHROPIC_API_KEY',
          recommendedFor: 'هویرترین پشکنینا ئەندازیاری و ئاسایشێ',
        },
        {
          name: 'DeepSeek Cloud',
          badge: 'DeepSeek-V3 / Reasoner',
          description: 'مۆدێلەکێ کێم-تێچوو و خودان شیانێن بلند یێن لێکدانەڤەیا لۆژیکی.',
          contextWindow: '٦٤,٠٠٠ تۆکێن',
          keyEnv: 'DEEPSEEK_API_KEY',
          recommendedFor: 'تێچوویا کێم دگەل هزرکرنا کویر',
        },
      ],
      envTitle: 'دانانا کلیلا د فایلی .env.local دا',
      envDesc: 'تو دشێی کلیلان د ناڤ فۆرمێ دا بنڤیسی یان د فایلی .env.local دا جێگیر بکەی:',
    },
    sec5: {
      title: '٥. ماتریکسا ٧-ڕەهەندی یا پاراستن و ئەندازیاریێ',
      subtitle: 'هەر بریکارەک ب تەنێ پسپۆرێ تەوەرەکێ یە دا کو هویرترین ئەنجام بدەستڤە بهێت',
      desc: 'کۆد دهێنە دابەشکرن بۆ سەر ٧ تەوەرێن سەرەکی:',
      domains: [
        {
          number: '1',
          title: 'لۆژیکێ باکێند، داتایان و ئەندازیاری (Backend & Data Logic)',
          desc: 'پشکنینا کوێریێن داتابەیسی، ORM، و لۆژیکێ APIان.',
        },
        {
          number: '2',
          title: 'ڕووکار، دیزاین و گونجاندنا شاشەیان (UI, UX & Responsiveness)',
          desc: 'شیکاریا ئەزموونا بکارئینەری، مۆبایل، و جهێ RTL.',
        },
        {
          number: '3',
          title: 'پاراستنا مەترسیدار و دژە-هاککرن (Critical Security & OWASP Top 10)',
          desc: 'دیتنا کێماسیێن SQL Injection, XSS, CSRF و کلیلێن ئاشکرا.',
          isCritical: true,
        },
        {
          number: '4',
          title: 'سێئۆ، مێتاداتا و ڕێڕەو (SEO, Metadata & Routing)',
          desc: 'پشکنینا Open Graph و بەستەرێن hreflang یێن زمانان.',
        },
        {
          number: '5',
          title: 'کەیسێن هەستیار و تاقیکرن (QA & Edge Cases)',
          desc: 'شیکاریا داتایێن نەچاڤەڕێکری و پچڕانا ئینتەرنێتێ.',
        },
        {
          number: '6',
          title: 'خێرایی، کارایی و نەهێلانا بارگرانییا میمۆری (Performance & Web Vitals)',
          desc: 'دیتنا دزەکرنا بیرگەهێ (Memory Leaks) و قەبارەیێ باندلی.',
        },
        {
          number: '7',
          title: 'دۆکیۆمێنتەیشن، لۆگکرن و پاقژییا کۆدی (Documentation & Code Quality)',
          desc: 'پشکنینا TypeScript و پاقژیا کۆدی.',
        },
      ],
    },
    sec6: {
      title: '٦. دۆکیۆمێنتەیشنا فەرمی یا API',
      subtitle: 'گرێدانا Cyphix ب پرۆسەیێن CI/CD ب ڕێکا HTTP API',
      desc: 'دوو ڕێڕەوێن سەرڤەرلێس بەردەستن:',
      endpointPost: 'POST /api/audit — شیکاریا ئێکسەر ب وەڵاما JSON',
      endpointStream: 'POST /api/audit/stream — پەخشی ڕاستەوخۆ ب SSE',
    },
    sec7: {
      title: '٧. ئاسایش و مەرجێن پاراستنێ',
      subtitle: 'چەوانیا پاراستنا نهێنیێن پرۆژەیێ تە',
      desc: 'سیستەم ب یاسایا Privacy by Design هاتیە ئاڤاکرن:',
      points: [
        {
          title: 'چ فایل ل سەر دیسکێ نامینن',
          desc: 'هەمی کردار د ناڤ ڕاما دەمکی دا دهێنە ئەنجامدان.',
        },
        {
          title: 'فلتەرکرنا کلیلێن نهێنی (.env)',
          desc: 'فایلێن .env بەریا ناردنێ ب شێوەیەکێ خۆکار دهێنە لابردن.',
        },
        {
          title: 'کارکرنا تەمام بێی ئینتەرنێت',
          desc: 'ب مۆدێلێن GGUF، چ داتا ژ ئامێرێ تە دەرناکەڤیت.',
        },
      ],
    },
    sec8: {
      title: '٨. پرسیارێن بەربەلاڤ (FAQ)',
      subtitle: 'بەرسڤا وان پرسیارێن دبیت رووبەرووی تە ببن',
      faqs: [
        {
          q: 'ئەرێ پێدڤی ب GPUەکا ب هێز هەیە بۆ مۆدێلێن ئۆفلاین؟',
          a: 'نەخێر! Cyphix ب تەواوی بۆ CPU و ڕاما ئاسایی هاتیە گونجاندن.',
        },
        {
          q: 'جوداهیا سەرەکی یا DeepSeek-R1 و Qwen-Coder چییە؟',
          a: 'DeepSeek-R1 بۆ شیکاریا کویر یا ئاسایشێ یا ئێکجار باشە، و Qwen-Coder بۆ چێکرنا کۆدی.',
        },
        {
          q: 'ئەرێ کلیلێن کلاود دهێنە هەلگرتن؟',
          a: 'نەخێر، کلیل ب تەنێ د ناڤ سێشنا وێبگەڕێ تە دا دمینن.',
        },
        {
          q: 'چەوا ڕاپۆرتێ ب PDF بپارێزم؟',
          a: 'ل خوارا ڕاپۆرتێ کلیکێ ل سەر "Print / Export PDF" بکە.',
        },
      ],
    },
  },

  // =========================================================================
  // 3. ENGLISH (US)
  // =========================================================================
  en: {
    badge: 'Comprehensive System Architecture & Technical Manual // Cyphix Docs',
    heroTitle: 'Cyphix Documentation & Engine Manual',
    heroSubtitle: 'Comprehensive technical guide for 7-Dimensional cybersecurity auditing, cloud LLM engines, and local offline GGUF inference',
    navBack: 'Back to Home',
    tableOfContents: 'Table of Contents',
    copyCode: 'Copy Code',
    copiedCode: 'Copied!',
    searchPlaceholder: 'Search documentation...',
    pillars: {
      ram: '100% In-Memory (RAM Isolation)',
      local: 'Offline GGUF Model Runtime',
      matrix: '7-D Specialized Agents',
      langs: '5 Full Languages (RTL/LTR)',
    },
    sec1: {
      title: '1. System Architecture & Execution Pipeline',
      subtitle: 'Client-isolated AST pre-scanning and multi-agent pipeline mechanics',
      desc1:
        'Cyphix is built upon a high-concurrency multi-agent architecture. When you upload or drag a project directory, files undergo immediate AST filtering. Temporary artifacts like node_modules, build caches, and .git folders are eliminated in-memory, leaving source code safely evaluated in RAM without ever touching persistent server databases.',
      pipelineTitle: 'Multi-Agent Security & Evaluation Pipeline',
      pipelineBadge: '100% In-Memory Isolation',
      p1: {
        title: '1. Ingest & Filter',
        sub: 'Deterministic sanitization',
        note: 'Eliminates lockfiles & vendor code',
      },
      p2: {
        title: '2. Fast AST Pre-Scan',
        sub: 'Instant pattern matching',
        note: 'Hunts raw keys, SQLi, and empty catches',
      },
      p3: {
        title: '3. 7-D Multi-Agent',
        sub: 'Deep AI evaluation',
        note: 'Cloud LLMs or Local GGUF engines',
      },
      p4: {
        title: '4. Executive Report',
        sub: 'Standardized remediation',
        note: 'Markdown (.md) and PDF exports',
      },
      pillar1Title: 'Air-Gapped Privacy by Design',
      pillar1Desc:
        'All audits can be executed 100% offline with zero outbound network requests using local GGUF models, strictly adhering to SOC 2, HIPAA, and enterprise confidentiality constraints.',
      pillar2Title: 'Real-time Server-Sent Events (SSE)',
      pillar2Desc:
        'Live progress, individual agent completions, and AST findings stream instantaneously to the browser interface via reactive EventStreams.',
    },
    sec2: {
      title: '2. Quickstart Step-by-Step Guide',
      subtitle: '4 rapid steps to audit any modern codebase in seconds',
      steps: [
        {
          step: 1,
          title: 'Drag & Drop Codebase Folder',
          desc: 'Drop your source project directory into the upload zone. Cyphix instantly maps and summarizes lines of code, file counts, and architecture hierarchy in memory.',
        },
        {
          step: 2,
          title: 'Select AI Engine (Cloud vs Local Offline)',
          desc: 'Choose between high-speed Cloud models (Gemini, Claude, DeepSeek) with an API key, or select an offline GGUF model for 100% local CPU inference.',
        },
        {
          step: 3,
          title: 'Trigger Multi-Agent Audit',
          desc: 'Click "Start Audit". The fast AST scanner will run instantly, followed by the 7 specialized domain agents evaluating code concurrently or sequentially.',
        },
        {
          step: 4,
          title: 'Inspect & Export Executive Report',
          desc: 'Review actionable fixes, line-by-line vulnerabilities, and severity breakdowns. Export the report as formatted Markdown (.md) or printable PDF.',
        },
      ],
    },
    sec3: {
      title: '3. Local Offline GGUF Models & Hardware Requirements',
      subtitle: '100% private, offline inference on CPU & System RAM powered by node-llama-cpp',
      desc:
        'Offline models utilize 4-bit medium quantization (Q4_K_M) packaged in single GGUF binaries. They execute via node-llama-cpp multi-threaded CPU instructions without requiring expensive dedicated graphics cards or VRAM.',
      hardwareTitle: 'Recommended Computer Specs & Hardware Matrix',
      hardwareDesc:
        'Refer to the following benchmark matrix to choose the optimal offline model tailored to your workstation or laptop specifications:',
      thModel: 'Model Name & Binary File',
      thSize: 'Size',
      thRamMin: 'Min RAM',
      thRamRec: 'Recommended RAM',
      thCpu: 'Processor (CPU)',
      thStrength: 'Primary Strength & Use Case',
      models: [
        {
          name: 'DeepSeek-R1-Distill-Qwen-7B',
          filename: 'model.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB - 32 GB RAM',
          cpuSpec: '8+ Cores (Core i7 / Ryzen 7+)',
          strength: 'Chain-of-Thought deep reasoning, complex logic vulnerability hunting, multi-step attack simulation, and OWASP Top 10 penetration analysis.',
          statusBadge: 'Recommended Engine',
        },
        {
          name: 'Qwen2.5-Coder-7B-Instruct',
          filename: 'qwen-coder-7b.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB RAM',
          cpuSpec: '6+ Cores (Core i5 / Ryzen 5+)',
          strength: 'State-of-the-art coding intelligence, syntax defect remediation, strict TypeScript type validation, refactoring, and rapid token generation.',
          statusBadge: 'High-Speed Coder',
        },
        {
          name: 'Llama-3.2-3B-Instruct',
          filename: 'llama-3.2-3b.gguf',
          quant: 'Q4_K_M',
          size: '1.88 GB',
          minRam: '6 GB RAM',
          recRam: '8 GB RAM',
          cpuSpec: '4 Cores (Standard Laptops)',
          strength: 'Ultra-compact footprint, rapid inference on 8GB RAM laptops, ideal for quick UI/UX, documentation, and baseline code quality scans.',
          statusBadge: 'Ultra-Lightweight',
        },
      ],
      installTitle: 'Model Provisioning & Setup Methods',
      method1: 'Method 1 (Recommended UI Download): Click the "Download Model" button in the top navigation bar. Models download with pause/resume support directly into ./models.',
      method2: 'Method 2 (Hugging Face CLI): Download directly to the models directory using standard CLI tooling:',
    },
    sec4: {
      title: '4. Cloud AI Engines & API Credentials',
      subtitle: 'Massive context windows and global reasoning for massive enterprise repositories',
      desc: 'For enterprise codebases spanning tens of thousands of lines, Cyphix supports three leading cloud intelligence engines:',
      engines: [
        {
          name: 'Google Gemini',
          badge: 'Gemini 2.5 Flash / 1.5 Pro',
          description: 'Features a massive 1,000,000+ token context window. Ingests entire monorepos simultaneously with lightning-fast multi-agent parallel execution.',
          contextWindow: '1,000,000+ Tokens',
          keyEnv: 'GEMINI_API_KEY',
          recommendedFor: 'Large monorepos & bulk codebases',
        },
        {
          name: 'Anthropic Claude',
          badge: 'Claude 3.5 Sonnet',
          description: 'The premier industry standard for intricate code reasoning, multi-file architectural consistency, and subtle security vulnerability detection.',
          contextWindow: '200,000 Tokens',
          keyEnv: 'ANTHROPIC_API_KEY',
          recommendedFor: 'Highest architectural precision & security',
        },
        {
          name: 'DeepSeek Cloud',
          badge: 'DeepSeek-V3 / Reasoner',
          description: 'Exceptional reasoning capabilities with industry-leading cost efficiency, delivering math-like precision for algorithm reviews.',
          contextWindow: '64,000 Tokens',
          keyEnv: 'DEEPSEEK_API_KEY',
          recommendedFor: 'Cost-efficient deep logic evaluations',
        },
      ],
      envTitle: 'Configuring Environment Keys (.env.local)',
      envDesc: 'Input keys directly in the user interface controls, or store them in your local .env.local file:',
    },
    sec5: {
      title: '5. The 7-Dimensional Security & Architecture Matrix',
      subtitle: 'Dedicated specialist agents evaluating distinct dimensions to eliminate blindspots',
      desc: 'To prevent cognitive overload and missed vulnerabilities, codebase files are divided across 7 specialized domains:',
      domains: [
        {
          number: '1',
          title: 'Backend, Database Logic & Architecture',
          desc: 'Audits SQL/NoSQL queries, ORM integration, API contracts, input sanitization, race conditions, and unhandled exceptions.',
        },
        {
          number: '2',
          title: 'UI, UX & Mobile Responsiveness',
          desc: 'Evaluates layout responsiveness, mobile viewports, accessibility standards (WCAG 2.2 AA), loading states, and RTL support.',
        },
        {
          number: '3',
          title: 'Critical Security & OWASP Top 10 Vulnerabilities',
          desc: 'Detects SQL Injection, XSS, CSRF, hardcoded secret leaks, broken authorization, insecure CORS, and SSRF risks.',
          isCritical: true,
        },
        {
          number: '4',
          title: 'SEO, Metadata & Routing Integrity',
          desc: 'Verifies title tags, Open Graph meta objects, hreflang alternates, canonical routing, and Next.js App Router hygiene.',
        },
        {
          number: '5',
          title: 'QA, Edge Cases & Resilience',
          desc: 'Identifies unhandled nullish states, network timeout handling, state synchronization bugs, and memory cleanup.',
        },
        {
          number: '6',
          title: 'Performance, Bundle Size & Core Web Vitals',
          desc: 'Detects memory leaks, render-blocking stylesheets, unoptimized assets, heavy re-renders, and serverless cold-start bottlenecks.',
        },
        {
          number: '7',
          title: 'Documentation, Observability & Type Safety',
          desc: 'Ensures strict TypeScript typing, meaningful error logs, structured documentation, and elimination of magic numbers.',
        },
      ],
    },
    sec6: {
      title: '6. Official API Reference & Programmatic Integration',
      subtitle: 'Integrate Cyphix into CI/CD pipelines, pre-commit hooks, or external developer tools',
      desc: 'Cyphix provides two serverless REST endpoints for seamless automation:',
      endpointPost: 'POST /api/audit — Single-shot synchronous audit returning full JSON report',
      endpointStream: 'POST /api/audit/stream — Reactive Server-Sent Events (SSE) live stream',
    },
    sec7: {
      title: '7. Security, Compliance & Air-Gapped Guarantees',
      subtitle: 'Built from the ground up for strict confidentiality and data protection',
      desc: 'Cyphix implements zero-trust architecture principles across all layers:',
      points: [
        {
          title: 'Zero Persistent Disk Storage',
          desc: 'Source files are parsed and evaluated exclusively in transient memory (RAM) and freed immediately after audit completion.',
        },
        {
          title: 'Automatic Secret Stripping',
          desc: 'Environment secrets, private credentials, and local credentials are sanitized client-side before submission.',
        },
        {
          title: 'Air-Gapped Offline Execution',
          desc: 'Local GGUF execution runs entirely isolated on your workstation without transmitting a single byte over the network.',
        },
      ],
    },
    sec8: {
      title: '8. Frequently Asked Questions (FAQ) & Troubleshooting',
      subtitle: 'Answers to common setup, performance, and configuration questions',
      faqs: [
        {
          q: 'Do I need a dedicated GPU to run offline models?',
          a: 'No. Cyphix is engineered to run via multi-threaded CPU instructions and system RAM. Standard PCs and laptops with 8GB to 16GB RAM can execute audits smoothly.',
        },
        {
          q: 'What is the difference between DeepSeek-R1 and Qwen2.5-Coder?',
          a: 'DeepSeek-R1 excels at deep chain-of-thought cybersecurity analysis and vulnerability discovery, while Qwen2.5-Coder is optimized for rapid code generation, syntax corrections, and TypeScript typing.',
        },
        {
          q: 'Are my cloud API keys saved on any remote server?',
          a: 'No. API keys entered in the interface stay strictly within your browser session memory and are never persisted.',
        },
        {
          q: 'How can I save the final audit report as a PDF?',
          a: 'Click the "Print / Export PDF" button at the bottom of the audit results view to open the standard browser print dialog and save as PDF.',
        },
      ],
    },
  },

  // =========================================================================
  // 4. ARABIC (العربية الفصحى)
  // =========================================================================
  ar: {
    badge: 'دليل النظام والتوثيق الهندسي // Cyphix Docs',
    heroTitle: 'توثيق ودليل محرك Cyphix',
    heroSubtitle: 'دليل شامل للتقييم السيبراني سباعي الأبعاد، نماذج السحابة الذكية، ونماذج GGUF المحلية غير المتصلة',
    navBack: 'العودة للرئيسية',
    tableOfContents: 'فهرس المحتويات',
    copyCode: 'نسخ الشيفرة',
    copiedCode: 'تم النسخ!',
    searchPlaceholder: 'البحث في التوثيق...',
    pillars: {
      ram: '١٠٠٪ داخل الذاكرة (عزل تام في RAM)',
      local: 'محرك GGUF محلي بدون إنترنت',
      matrix: 'فحص سباعي الأبعاد',
      langs: '٥ لغات كاملة مع دعم RTL',
    },
    sec1: {
      title: '١. البنية الهندسية ومسار المعالجة',
      subtitle: 'آلية الفحص المسبق السريع وعمل الوكلاء المتخصصين داخل الذاكرة',
      desc1:
        'تم بناء Cyphix وفق بنية برمجية متطورة متعددة الوكلاء (Multi-Agent Architecture). عند إدراج مجلد المشروع، تخضع الملفات لفرز مباشر لاستبعاد الملفات المؤقتة مثل node_modules و .git، وتبقى الشيفرات محفوظة في ذاكرة RAM المؤقتة دون تخزينها في أي قواعد بيانات على الخادم.',
      pipelineTitle: 'مسار الأمان والتحليل متعدد الوكلاء (Multi-Agent Pipeline)',
      pipelineBadge: '١٠٠٪ معزول في الذاكرة المؤقتة',
      p1: {
        title: '١. الاستقبال والتنقية',
        sub: 'فرز أولي ذكي',
        note: 'استبعاد مكتبات vendor و lockfiles',
      },
      p2: {
        title: '٢. فاحص AST السريع',
        sub: 'كشف الأنماط المباشر',
        note: 'كشف المفاتيح العلنية وثغرات SQLi',
      },
      p3: {
        title: '٣. وكلاء الفحص الـ ٧',
        sub: 'تحليل معمق بالذكاء الاصطناعي',
        note: 'نماذج السحابة أو نماذج GGUF المحلية',
      },
      p4: {
        title: '٤. التقرير التنفيذي',
        sub: 'توصيات معالجة دقيقة',
        note: 'تصدير بصيغة Markdown و PDF',
      },
      pillar1Title: 'خصوصية كاملة بموجب معايير Air-Gapped',
      pillar1Desc:
        'يمكن إجراء الفحص بالكامل دون اتصال بالإنترنت عبر النماذج المحلية، مما يضمن توافقاً تاماً مع معايير الأمان المتقدمة مثل SOC 2 و HIPAA.',
      pillar2Title: 'بث مباشر للنتائج عبر SSE',
      pillar2Desc:
        'يتم إرسال الأحداث وتحديثات التقدم في الوقت الفعلي عبر تقنية Server-Sent Events مباشرة إلى واجهة المستخدم.',
    },
    sec2: {
      title: '٢. دليل البدء السريع (Quickstart)',
      subtitle: '٤ خطوات بسيطة لفحص أي مشروع برمجي خلال ثوانٍ معدودة',
      steps: [
        {
          step: 1,
          title: 'سحب وإفلات مجلد المشروع (Drag & Drop)',
          desc: 'قم بسحب مجلد الشيفرات البرمجية وإفلاته في منطقة الفحص. سيقوم النظام بفرز الملفات وحساب عدد الأسطر والحجم فورياً.',
        },
        {
          step: 2,
          title: 'اختيار محرك الذكاء الاصطناعي (Cloud أو Local)',
          desc: 'اختر بين نماذج السحابة (Gemini, Claude, DeepSeek) أو النماذج المحلية بدون إنترنت لحماية تامة للبيانات.',
        },
        {
          step: 3,
          title: 'بدء الفحص المباشر (Start Audit)',
          desc: 'انقر على زر البدء ليعمل فاحص AST السريع يليه وكلاء التحليل السبعة بالتوازي.',
        },
        {
          step: 4,
          title: 'معاينة وتصدير التقرير النهائي',
          desc: 'استعرض الثغرات ونقاط التحسين، وقم بتنزيل التقرير بصيغة Markdown (.md) أو مستند PDF قابل للطباعة.',
        },
      ],
    },
    sec3: {
      title: '٣. النماذج المحلية غير المتصلة (Local Offline GGUF Models)',
      subtitle: 'تحليل محلي ١٠٠٪ على جهازك بدون إنترنت عبر المعالج (CPU) وذاكرة RAM',
      desc:
        'تأتي النماذج المحلية بصيغة GGUF المكممة بدقة 4-bit وتعمل عبر مكتبة node-llama-cpp بكفاءة عالية على المعالج العادي دون الحاجة لبطاقات رسومية باهظة.',
      hardwareTitle: 'المواصفات ومتطلبات التشغيل للأجهزة (Hardware Specs)',
      hardwareDesc:
        'يوضح الجدول التالي متطلبات الذاكرة والمعالج لكل نموذج من النماذج المحلية الثلاثة لاختيار الأنسب لجهازك:',
      thModel: 'اسم النموذج وملف GGUF',
      thSize: 'الحجم',
      thRamMin: 'الحد الأدنى للذاكرة',
      thRamRec: 'الذاكرة الموصى بها',
      thCpu: 'المعالج (CPU)',
      thStrength: 'أبرز المزايا والاستخدام',
      models: [
        {
          name: 'DeepSeek-R1-Distill-Qwen-7B',
          filename: 'model.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB - 32 GB RAM',
          cpuSpec: '8+ نوى (Core i7 / Ryzen 7+)',
          strength: 'تفكير استدلالي معمق، كشف الثغرات الأمنية المعقدة، وتحليل هجمات OWASP Top 10.',
          statusBadge: 'النموذج الموصى به (Recommended)',
        },
        {
          name: 'Qwen2.5-Coder-7B-Instruct',
          filename: 'qwen-coder-7b.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB RAM',
          cpuSpec: '6+ نوى (Core i5 / Ryzen 5+)',
          strength: 'متخصص في بنية الشيفرات البرمجية، تصحيح الأخطاء النحوية، وضمان سلامة أنواع TypeScript بسرعة عالية.',
          statusBadge: 'سريع ومتخصص بالبرمجة',
        },
        {
          name: 'Llama-3.2-3B-Instruct',
          filename: 'llama-3.2-3b.gguf',
          quant: 'Q4_K_M',
          size: '1.88 GB',
          minRam: '6 GB RAM',
          recRam: '8 GB RAM',
          cpuSpec: '4 نوى (لأجهزة اللابتوب العادية)',
          strength: 'فائق الخفة والسرعة، مخصص للأجهزة ذات الذاكرة المحدودة (8GB RAM) لفحص الجودة والواجهات.',
          statusBadge: 'فائق الخفة للأجهزة الضعيفة',
        },
      ],
      installTitle: 'طرق تنزيل النماذج وتثبيتها',
      method1: 'الطريقة ١: انقر على زر "تنزيل النموذج" في القائمة العلوية للتنزيل التلقائي مع إمكانية الإيقاف والاستئناف.',
      method2: 'الطريقة ٢: التنزيل المباشر عبر سطر أوامر Hugging Face CLI إلى مجلد models/:',
    },
    sec4: {
      title: '٤. محركات الذكاء الاصطناعي السحابية (Cloud AI Engines)',
      subtitle: 'أعلى سرعة ونطاق سياق واسع للمشاريع الضخمة عبر مفاتيح API',
      desc: 'للمشاريع التي تضم عشرات آلاف أسطر الشيفرات البرمجية، يوفر Cyphix دعماً لثلاثة محركات سحابية رائدة:',
      engines: [
        {
          name: 'Google Gemini',
          badge: 'Gemini 2.5 Flash / 1.5 Pro',
          description: 'نطاق سياق هائل يتجاوز مليون تۆکێن. قادر على قراءة المشروع بالكامل دفعة واحدة وتشغيل الوكلاء السبعة بالتوازي.',
          contextWindow: '١,٠٠٠,٠٠٠+ رمز (Tokens)',
          keyEnv: 'GEMINI_API_KEY',
          recommendedFor: 'المشاريع الضخمة والتحليل الجماعي السريع',
        },
        {
          name: 'Anthropic Claude',
          badge: 'Claude 3.5 Sonnet',
          description: 'المعيار العالمي الأول في الدقة الهندسية والتحليل المعماري للشيفرات واكتشاف أدق الثغرات الأمنية.',
          contextWindow: '٢٠٠,٠٠٠ رمز (Tokens)',
          keyEnv: 'ANTHROPIC_API_KEY',
          recommendedFor: 'أعلى دقة معمارية وأمنية',
        },
        {
          name: 'DeepSeek Cloud',
          badge: 'DeepSeek-V3 / Reasoner',
          description: 'نموذج اقتصادي فائق الذكاء في الاستنتاج المنطقي وحل المسائل البرمجية المعقدة.',
          contextWindow: '٦٤,٠٠٠ رمز (Tokens)',
          keyEnv: 'DEEPSEEK_API_KEY',
          recommendedFor: 'تحليل منطقي عميق بتكلفة منخفضة',
        },
      ],
      envTitle: 'إعداد مفاتيح البيئة (.env.local)',
      envDesc: 'يمكنك إدخال المفتاح مباشرة في الواجهة، أو حفظه في ملف .env.local على الخادم:',
    },
    sec5: {
      title: '٥. مصفوفة التقييم سباعية الأبعاد (7-D Live Matrix)',
      subtitle: 'وكلاء متخصصون يفحصون أبعاداً برمجية محددة لضمان شمولية الفحص',
      desc: 'تتوزع ملفات المشروع على سبعة أبعاد هندسية وأمنية دقيقة:',
      domains: [
        {
          number: '1',
          title: 'منطق الواجهة الخلفية وقواعد البيانات (Backend & Data Logic)',
          desc: 'فحص استعلامات قواعد البيانات، دوال ORM، التعامل مع المعاملات والمدخلات، ومعالجة الاستثناءات.',
        },
        {
          number: '2',
          title: 'واجهة وتجربة المستخدم وتوافق الشاشات (UI, UX & Responsiveness)',
          desc: 'تقييم توافق الهواتف، معايير سهولة الوصول (WCAG 2.2 AA)، حالات التحميل، ودعم الاتجاه من اليمين لليسار (RTL).',
        },
        {
          number: '3',
          title: 'الأمان الحرج ومكافحة الاختراق (Critical Security & OWASP Top 10)',
          desc: 'كشف ثغرات حقن الاستعلامات (SQLi)، XSS، CSRF، المفاتيح المكشوفة، واختلالات الصلاحيات.',
          isCritical: true,
        },
        {
          number: '4',
          title: 'محركات البحث والبيانات الوصفية والمسارات (SEO, Metadata & Routing)',
          desc: 'التحقق من وسوم العناوين، وسوم Open Graph، وسوم اللغات hreflang، وتكامل مسارات Next.js.',
        },
        {
          number: '5',
          title: 'الحالات الاستثنائية وضمان الجودة (QA & Edge Cases)',
          desc: 'كشف معالجة القيم الفارغة (Nullish)، انقطاع الشبكة، وإدارة أخطاء الاتصال.',
        },
        {
          number: '6',
          title: 'الأداء والسرعة وتحسين الذاكرة (Performance & Web Vitals)',
          desc: 'كشف تسربات الذاكرة، تحسين حجم الحزم البرمجية، وتقليل إعادة الرسم غير الضروري.',
        },
        {
          number: '7',
          title: 'التوثيق وتسجيل الأخطاء وجودة الشيفرة (Documentation & Code Quality)',
          desc: 'التأكد من التوصيف الصارم بـ TypeScript، جودة سجلات الأخطاء، ونظافة البنية البرمجية.',
        },
      ],
    },
    sec6: {
      title: '٦. توثيق واجهة البرمجة الرسمية (API Reference)',
      subtitle: 'ربط Cyphix مع بيئات العمل وخطوط الإنتاج (CI/CD) عبر REST API',
      desc: 'يوفر النظام مسارين خادميين للتشغيل الآلي:',
      endpointPost: 'POST /api/audit — فحص متزامن يعيد تقريراً كاملاً بصيغة JSON',
      endpointStream: 'POST /api/audit/stream — بث تفاعلي للأحداث عبر تقنية SSE',
    },
    sec7: {
      title: '٧. معايير الأمان والامتثال والخصوصية',
      subtitle: 'حماية تامة وسرية مطلقة لكافة ملفات الشيفرات البرمجية',
      desc: 'تم تصميم النظام وفق مبدأ Privacy by Design الصارم:',
      points: [
        {
          title: 'عدم حفظ أي ملفات على القرص الصلب',
          desc: 'تتم المعالجة بالكامل داخل ذاكرة RAM المؤقتة وتحذف فور اكتمال الفحص.',
        },
        {
          title: 'تنقية المفاتيح السرية تلقائياً',
          desc: 'تستبعد ملفات .env والمفاتيح الخاصة من جانب المتصفح قبل بدء المعالجة.',
        },
        {
          title: 'فحص معزول تماماً عن الإنترنت (Air-Gapped)',
          desc: 'مع النماذج المحلية GGUF، لا يتم إرسال أي بايت خارج جهازك الحاسوبي.',
        },
      ],
    },
    sec8: {
      title: '٨. الأسئلة الشائعة (FAQ) وحلول المشكلات',
      subtitle: 'إجابات على أكثر الاستفسارات التقنية شيوعاً',
      faqs: [
        {
          q: 'هل أحتاج لكرت شاشة قوي (GPU) لتشغيل النماذج المحلية؟',
          a: 'لا! تم تحسين النماذج لتعمل بالكامل على المعالج العادي (CPU) وذاكرة RAM التقليدية بكفاءة عالية.',
        },
        {
          q: 'ما هو الفرق بين DeepSeek-R1 و Qwen-Coder؟',
          a: 'DeepSeek-R1 متفوق في الاستنتاج المنطقي واكتشاف الثغرات الأمنية، بينما Qwen-Coder متخصص في سرعة صياغة وتصحيح الشيفرات البرمجية.',
        },
        {
          q: 'هل يتم حفظ مفاتيح السحابة (API Keys) على الخادم؟',
          a: 'لا، تظل المفاتيح محفوظة في جلسة المتصفح فقط ولا يتم تخزينها في أي مكان.',
        },
        {
          q: 'كيف يمكنني تصدير التقرير كملف PDF؟',
          a: 'انقر على زر "Print / Export PDF" في أسفل صفحة النتائج لفتح نافذة الطباعة وحفظ التقرير كملف PDF.',
        },
      ],
    },
  },

  // =========================================================================
  // 5. PERSIAN (فارسی)
  // =========================================================================
  fa: {
    badge: 'مستندات جامع سیستم و راهنمای فنی // Cyphix Docs',
    heroTitle: 'مستندات و راهنمای جامع موتور Cyphix',
    heroSubtitle: 'راهنمای تخصصی ارزیابی امنیت سایبری ۷ بعدی، موتورهای ابری و هوش مصنوعی محلی آفلاین GGUF',
    navBack: 'بازگشت به صفحه اصلی',
    tableOfContents: 'فهرست بخش‌ها',
    copyCode: 'کپی کد',
    copiedCode: 'کپی شد!',
    searchPlaceholder: 'جستجو در مستندات...',
    pillars: {
      ram: '۱۰۰٪ در حافظه موقت (ایزوله در RAM)',
      local: 'موتور محلی آفلاین GGUF',
      matrix: 'ارزیابی ۷ بعدی سایبری',
      langs: '۵ زبان کامل (پشتیبانی کامل RTL)',
    },
    sec1: {
      title: '۱. معماری سیستم و پایپ‌لاین ارزیابی',
      subtitle: 'مکانیسم اسکن سریع AST و پایپ‌لاین چند عاملی در حافظه موقت مرورگر',
      desc1:
        'موتور Cyphix بر پایه یک معماری چند عاملی پیشرفته (Multi-Agent) ساخته شده است. با بارگذاری پوشه پروژه، فایل‌ها به سرعت فیلتر شده و مواردی چون node_modules و .git حذف می‌شوند. کدها به صورت ایزوله ۱۰۰٪ در رم پردازش شده و هرگز روی هیچ دیتابیسی ذخیره نمی‌شوند.',
      pipelineTitle: 'پایپ‌لاین امنیت و پردازش چند عاملی (Multi-Agent Pipeline)',
      pipelineBadge: '۱۰۰٪ ایزوله در حافظه RAM',
      p1: {
        title: '۱. دریافت و پالایش',
        sub: 'فیلتر هوشمند فایل‌ها',
        note: 'حذف کتابخانه‌های جانبی و lockfileها',
      },
      p2: {
        title: '۲. اسکنر سریع AST',
        sub: 'شناسایی آنی الگوها',
        note: 'کشف کلیدهای افشا شده و SQLi',
      },
      p3: {
        title: '۳. ۷ عامل هوشمند',
        sub: 'تحلیل عمیق هوش مصنوعی',
        note: 'موتورهای ابری یا مدل محلی GGUF',
      },
      p4: {
        title: '۴. گزارش نهایی',
        sub: 'راهکارهای اصلاحی',
        note: 'خروجی Markdown (.md) و PDF',
      },
      pillar1Title: 'حفظ حریم خصوصی به سبک Air-Gapped',
      pillar1Desc:
        'تمامی ممیزی‌ها می‌توانند بدون نیاز به اینترنت و با مدل‌های محلی آفلاین اجرا شوند تا با الزامات SOC 2 و HIPAA کاملاً منطبق باشند.',
      pillar2Title: 'استریم زنده نتایج با Server-Sent Events',
      pillar2Desc:
        'گزارشات و پیشرفت ۷ دامنه به صورت بلادرنگ و زنده به پنل کاربری ارسال می‌گردد.',
    },
    sec2: {
      title: '۲. راهنمای شروع سریع (Quickstart)',
      subtitle: '۴ گام ساده برای ممیزی هر پروژه در چند ثانیه',
      steps: [
        {
          step: 1,
          title: 'کشیدن و رها کردن پوشه پروژه (Drag & Drop)',
          desc: 'پوشه پروژه را در کادر ممیزی قرار دهید. سیستم به طور خودکار فایل‌ها را خلاصه کرده و آمار را نمایش می‌دهد.',
        },
        {
          step: 2,
          title: 'انتخاب موتور هوش مصنوعی (ابری یا محلی)',
          desc: 'بین مدل‌های ابری (Gemini, Claude, DeepSeek) یا مدل‌های محلی آفلاین یکی را انتخاب کنید.',
        },
        {
          step: 3,
          title: 'شروع ممیزی بلادرنگ (Start Audit)',
          desc: 'روی دکمه شروع کلیک کنید تا اسکنر سریع AST و سپس ۷ عامل تخصصی ارزیابی را آغاز کنند.',
        },
        {
          step: 4,
          title: 'بررسی و دانلود گزارش',
          desc: 'گزارش نهایی شامل راهکارهای رفع باگ‌ها را به صورت فرمت استاندارد Markdown یا PDF دریافت کنید.',
        },
      ],
    },
    sec3: {
      title: '۳. مدل‌های محلی آفلاین (Local Offline GGUF Models)',
      subtitle: 'ممیزی ۱۰۰٪ محرمانه روی سخت‌افزار سیستم شما بدون نیاز به اینترنت از طریق CPU و RAM',
      desc:
        'مدل‌های آفلاین با کوانتیزاسیون 4 بیتی (Q4_K_M) در قالب فایل‌های GGUF ارائه شده و از طریق node-llama-cpp روی پردازنده اصلی سیستم با چندنخی (Multi-threading) اجرا می‌شوند.',
      hardwareTitle: 'ماتریس مشخصات سخت‌افزاری و سیستم پیشنهادی (Hardware Specs)',
      hardwareDesc:
        'جدول زیر مشخصات مورد نیاز پردازنده و حافظه رم برای هر یک از سه مدل آفلاین را به تفکیک توضیح می‌دهد:',
      thModel: 'نام مدل و فایل GGUF',
      thSize: 'حجم',
      thRamMin: 'حداقل رم',
      thRamRec: 'رم پیشنهادی',
      thCpu: 'پردازنده (CPU)',
      thStrength: 'مزیت کلیدی و کاربرد',
      models: [
        {
          name: 'DeepSeek-R1-Distill-Qwen-7B',
          filename: 'model.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB - 32 GB RAM',
          cpuSpec: '8+ هسته (Core i7 / Ryzen 7+)',
          strength: 'استدلال زنجیره‌ای عمیق، کشف رخنه‌های امنیتی پیچیده و ارزیابی بردارهای نفوذ OWASP Top 10.',
          statusBadge: 'مدل پیشنهادی (Recommended)',
        },
        {
          name: 'Qwen2.5-Coder-7B-Instruct',
          filename: 'qwen-coder-7b.gguf',
          quant: 'Q4_K_M',
          size: '4.36 GB',
          minRam: '12 GB RAM',
          recRam: '16 GB RAM',
          cpuSpec: '6+ هسته (Core i5 / Ryzen 5+)',
          strength: 'تخصصی برای ساختار کد، اصلاح خطاهای نگارشی، بررسی Typeهای TypeScript با سرعت توکن‌ریزی بالا.',
          statusBadge: 'سریع و مخصوص کدنویسی',
        },
        {
          name: 'Llama-3.2-3B-Instruct',
          filename: 'llama-3.2-3b.gguf',
          quant: 'Q4_K_M',
          size: '1.88 GB',
          minRam: '6 GB RAM',
          recRam: '8 GB RAM',
          cpuSpec: '4 هسته (لپ‌تاپ‌های معمولی)',
          strength: 'بسیار سبک و بهینه، مناسب برای سیستم‌های دارای ۸ گیگابایت رم جهت بررسی‌های سریع کیفیت و UI/UX.',
          statusBadge: 'فوق سبک برای سیستم‌های معمولی',
        },
      ],
      installTitle: 'روش‌های دانلود و راه‌اندازی مدل‌ها',
      method1: 'روش ۱: کلیک روی دکمه "دانلود مدل" در منوی بالا جهت دانلود مستقیم با پشتیبانی از قابلیت توقف و ادامه (Pause/Resume).',
      method2: 'روش ۲: دانلود مستقیم از طریق خط فرمان Hugging Face CLI به پوشه models/:',
    },
    sec4: {
      title: '۴. موتورهای هوش مصنوعی ابری (Cloud AI Engines)',
      subtitle: 'پنجره زمینه بسیار وسیع برای ممیزی کدهای بسیار حجیم شرکتی',
      desc: 'برای پروژه‌های بزرگ با ده‌ها هزار خط کد، Cyphix از سه موتور هوش مصنوعی قدرتمند پشتیبانی می‌کند:',
      engines: [
        {
          name: 'Google Gemini',
          badge: 'Gemini 2.5 Flash / 1.5 Pro',
          description: 'دارای پنجره زمینه عظیم بیش از ۱,۰۰۰,۰۰۰ توکن. قابلیت پذیرش کل مخزن کد به صورت یکجا و اجرای همزمان ۷ عامل هوشمند.',
          contextWindow: '۱,۰۰۰,۰۰۰+ توکن',
          keyEnv: 'GEMINI_API_KEY',
          recommendedFor: 'پروژه‌های بزرگ و ممیزی یکپارچه',
        },
        {
          name: 'Anthropic Claude',
          badge: 'Claude 3.5 Sonnet',
          description: 'استاندارد مرجع جهانی در تحلیل معماری و درک ارتباطات پیچیده فایل‌ها و کشف دقیق‌ترین باگ‌های امنیتی.',
          contextWindow: '۲۰۰,۰۰۰ توکن',
          keyEnv: 'ANTHROPIC_API_KEY',
          recommendedFor: 'بالاترین دقت معماری و امنیت سایبری',
        },
        {
          name: 'DeepSeek Cloud',
          badge: 'DeepSeek-V3 / Reasoner',
          description: 'موتور استدلال پیشرفته و بسیار مقرون‌به‌صرفه با دقت تحلیلی شگفت‌انگیز در ساختار الگوریتم‌ها.',
          contextWindow: '۶۴,۰۰۰ توکن',
          keyEnv: 'DEEPSEEK_API_KEY',
          recommendedFor: 'استدلال عمیق با کمترین هزینه',
        },
      ],
      envTitle: 'تنظیم کلیدهای API در .env.local',
      envDesc: 'می‌توانید کلید را مستقیماً در رابط کاربری وارد کنید یا در فایل .env.local روی سرور ذخیره نمایید:',
    },
    sec5: {
      title: '۵. ماتریس ۷ بعدی ارزیابی امنیت و معماری',
      subtitle: 'عوامل تخصصی مجزا برای بررسی دقیق تمامی جنبه‌های پروژه',
      desc: 'فایل‌های پروژه در ۷ حوزه تخصصی مورد ارزیابی قرار می‌گیرند:',
      domains: [
        {
          number: '1',
          title: 'منطق بک‌اند، پایگاه داده و معماری (Backend & Data Logic)',
          desc: 'بررسی کوئری‌های دیتابیس، ORM، مدیریت داده‌ها، API و جلوگیری از سرکوب خطاهای ناگهانی.',
        },
        {
          number: '2',
          title: 'رابط کاربری، تجربه کاربری و واکنش‌گرایی (UI, UX & Responsiveness)',
          desc: 'ارزیابی واکنش‌گرایی در موبایل، استانداردهای دسترسی‌پذیری (WCAG 2.2 AA)، لودینگ‌ها و راست‌به‌چپ (RTL).',
        },
        {
          number: '3',
          title: 'امنیت بحرانی و رخنه‌های نفوذ (Critical Security & OWASP Top 10)',
          desc: 'کشف رخنه‌های SQL Injection، XSS، CSRF، افشای کلیدهای محرمانه و خطاهای دسترسی.',
          isCritical: true,
        },
        {
          number: '4',
          title: 'سئو، متادیتا و سلامت مسیرها (SEO, Metadata & Routing)',
          desc: 'بررسی تگ‌های عنوان، متاتگ‌های Open Graph، تگ‌های زبان hreflang و سلامت روت‌های Next.js.',
        },
        {
          number: '5',
          title: 'حالت‌های استثنا و تضمین کیفیت (QA & Edge Cases)',
          desc: 'بررسی حالت‌های نامشخص (Nullish)، قطعی شبکه و مدیریت خطاهای پیش‌بینی نشده.',
        },
        {
          number: '6',
          title: 'کارایی، بهینه‌سازی سرعت و حافظه (Performance & Web Vitals)',
          desc: 'شناسایی نشت حافظه (Memory Leak)، بهینه‌سازی حجم باندل و جلوگیری از رندرهای اضافی.',
        },
        {
          number: '7',
          title: 'مستندسازی، لاگینگ و تمیزی کدها (Documentation & Code Quality)',
          desc: 'بررسی تایپ‌های TypeScript، ساختار ماژولار و استفاده از متغیرهای نام‌گذاری شده.',
        },
      ],
    },
    sec6: {
      title: '۶. مستندات رسمی وب‌سرویس و API',
      subtitle: 'یکپارچه‌سازی با فرآیندهای CI/CD و ترمینال از طریق REST API',
      desc: 'سیستمی با دو روت بدون سرور استاندارد جهت اتوماسیون کامل:',
      endpointPost: 'POST /api/audit — ممیزی همگام و دریافت کامل خروجی JSON',
      endpointStream: 'POST /api/audit/stream — استریم زنده از طریق پروتکل SSE',
    },
    sec7: {
      title: '۷. استانداردهای امنیتی و عدم افشای اطلاعات',
      subtitle: 'حفظ محرمانگی مطلق اطلاعات سورس‌کد پروژه شما',
      desc: 'طراحی شده بر پایه اصل بنیادین Privacy by Design:',
      points: [
        {
          title: 'عدم ذخیره‌سازی هیچ فایلی روی دیسک',
          desc: 'تمامی پردازش‌ها مستقیماً در رم موقت انجام شده و بلافاصله پس از اتمام حذف می‌گردند.',
        },
        {
          title: 'حذف خودکار کلیدهای محرمانه (.env)',
          desc: 'فایل‌های محرمانه و اطلاعات حساس پیش از ارسال به صورت خودکار در سمت مرورگر فیلتر می‌شوند.',
        },
        {
          title: 'ممیزی کاملاً آفلاین (Air-Gapped)',
          desc: 'با مدل‌های محلی GGUF، حتی یک بایت داده نیز به خارج از سیستم شما ارسال نمی‌شود.',
        },
      ],
    },
    sec8: {
      title: '۸. سوالات متداول (FAQ) و عیب‌یابی',
      subtitle: 'پاسخ به سوالات متداول پیرامون سیستم و نحوه استفاده',
      faqs: [
        {
          q: 'آیا برای مدل‌های آفلاین به کارت گرافیک قوی نیاز دارم؟',
          a: 'خیر! Cyphix برای اجرا روی پردازنده اصلی (CPU) و رم معمولی بهینه‌سازی شده و با ۸ تا ۱۶ گیگابایت رم عملکردی عالی دارد.',
        },
        {
          q: 'تفاوت اصلی DeepSeek-R1 و Qwen-Coder در چیست؟',
          a: 'مدل DeepSeek-R1 برای استدلال عمیق سایبری و کشف رخنه‌ها برتر است، در حالی که Qwen-Coder برای سرعت بالا و اصلاح کدهای TypeScript عالی است.',
        },
        {
          q: 'آیا کلیدهای API روی سرور ذخیره می‌شوند؟',
          a: 'خیر، کلیدها فقط در نشست مرورگر شما باقی مانده و پس از اتمام درخواست کاملاً بسته می‌شوند.',
        },
        {
          q: 'چگونه گزارش را به صورت فایل PDF ذخیره کنم؟',
          a: 'کافی است روی دکمه "Print / Export PDF" در پایین گزارش کلیک کنید تا پنجره چاپ باز شده و آن را به صورت PDF ذخیره نمایید.',
        },
      ],
    },
  },
};
