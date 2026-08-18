import { SupportedLanguage, LANGUAGES } from '@/lib/i18n';

export interface AstFinding {
  id: string;
  ruleId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'security' | 'backend' | 'performance' | 'quality';
  file: string;
  line: number;
  snippet: string;
  issue: string;
  fix: string;
}

export interface AstScanResult {
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  findings: AstFinding[];
  durationMs: number;
}

interface SecretPattern {
  name: string;
  regex: RegExp;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'security' | 'backend' | 'performance' | 'quality';
  issueTemplate: Record<SupportedLanguage, string>;
  fixTemplate: Record<SupportedLanguage, string>;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'AWS Access Key ID',
    regex: /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    category: 'security',
    issueTemplate: {
      ckb: 'کلیلی ڕاستەقینەی AWS Access Key ئاشکراکراوە لەناو کۆددا.',
      badini: 'کلیلا ڕاستەقینە یا AWS Access Key د ناڤ کۆدی دا یا ئاشکەرایە.',
      en: 'Exposed hardcoded AWS Access Key ID detected in source code.',
      ar: 'تم كشف مفتاح AWS Access Key ID داخل الشيفرة البرمجية.',
      fa: 'کلید دسترسی مستقیم AWS Access Key در سورس‌کد افشا شده است.',
    },
    fixTemplate: {
      ckb: 'کلیلەکە لە فایلی نهێنی .env دابنێ و لە ڕێگەی process.env.AWS_ACCESS_KEY_ID بانگی بکە.',
      badini: 'کلیلێ د فایلا نهێنی یا .env دا دابنێ و ب process.env.AWS_ACCESS_KEY_ID بخوینە.',
      en: 'Move secret key to .env.local and reference it via process.env.AWS_ACCESS_KEY_ID.',
      ar: 'انقل المفتاح إلى ملف .env.local واقرأه عبر process.env.AWS_ACCESS_KEY_ID.',
      fa: 'کلید را به فایل .env.local منتقل کرده و از طریق process.env.AWS_ACCESS_KEY_ID فراخوانی کنید.',
    },
  },
  {
    name: 'Generic API Key / Secret Token',
    regex: /(?:api[_-]?key|secret[_-]?key|auth[_-]?token|bearer[_\s:]+token)['"]?\s*[:=]\s*['"][a-zA-Z0-9_\-]{24,}['"]/gi,
    severity: 'CRITICAL',
    category: 'security',
    issueTemplate: {
      ckb: 'تۆکەن یان کلیلی نهێنی API بە شێوازی دەستنووس ئاشکراکراوە.',
      badini: 'تۆکەن یان کلیلا نهێنی یا API د ناڤ کۆدی دا یا ئاشکەرایە.',
      en: 'Hardcoded API key or private secret token exposed directly.',
      ar: 'مفتاح API سري أو توكن مصادقة مكشوف مباشرة في الشيفرة.',
      fa: 'توکن احراز هویت یا کلید محرمانه API به صورت مستقیم افشا شده است.',
    },
    fixTemplate: {
      ckb: 'هەموو کلیلەکان لەناو .env دابنێ و هەرگیز مەیانخەرە ناو گیتهەب یان فایلی کڵایەنت.',
      badini: 'هەمی کلیلا بێخە ناڤ .env و چ جاران نەدانە سەر گیت هاب.',
      en: 'Store secrets in environment variables and add .env to .gitignore.',
      ar: 'احفظ الأسرار في متغيرات البيئة وأضف .env إلى .gitignore.',
      fa: 'تمام کلیدها را در متغیرهای محیطی ذخیره کرده و .env را در .gitignore قرار دهید.',
    },
  },
  {
    name: 'JWT Secret Hardcoded',
    regex: /jwt\.sign\([^,]+,\s*['"][^'"]{1,20}['"]/gi,
    severity: 'HIGH',
    category: 'security',
    issueTemplate: {
      ckb: 'کلیلی نهێنی JWT لاوازە یان بە شێوازی دەستنووس نووسراوە.',
      badini: 'کلیلا نهێنی یا JWT یا لاوازە یان ڕاستەوخۆ هاتیە نڤیسین.',
      en: 'Hardcoded weak JWT secret used for signing authentication tokens.',
      ar: 'استخدام مفتاح JWT ضعيف ومكشوف لتوقيع توكنات المصادقة.',
      fa: 'استفاده از کلید امضای ضعیف یا مستقیم برای JWT.',
    },
    fixTemplate: {
      ckb: 'کلیلی نهێنی JWT بکە بە لانی کەم ٣٢ کاراکتەری هەڕەمەکی لەناو .env.',
      badini: 'کلیلا JWT بکە لایەنێ کێم ٣٢ پیتێن هەڕەمەکی د ناڤ .env دا.',
      en: 'Use a cryptographically secure 256-bit secret loaded from process.env.JWT_SECRET.',
      ar: 'استخدم مفتاحاً مشفراً قوياً لا يقل عن 32 محرفاً من متغيرات البيئة.',
      fa: 'از یک کلید تصادفی امن و حداقل ۳۲ کاراکتری از طریق process.env.JWT_SECRET استفاده کنید.',
    },
  },
  {
    name: 'Dangerous eval() Execution',
    regex: /\beval\s*\([^\)]+\)/g,
    severity: 'CRITICAL',
    category: 'security',
    issueTemplate: {
      ckb: 'بەکارهێنانی فەنکشنی مەترسیداری eval() دەبێتە هۆی لێدانی کۆدی نادیار (Remote Code Execution).',
      badini: 'بکارئینانا فەنکشنا مەترسیدار یا eval() مەترسییا مەزن دروست دکەت.',
      en: 'Dangerous eval() function executes arbitrary dynamic code strings.',
      ar: 'استخدام دالة eval() الخطرة يتيح تنفيذ أوامر برمجية عشوائية.',
      fa: 'استفاده از تابع خطرناک eval() که ریسک اجرای کدهای مخرب را به همراه دارد.',
    },
    fixTemplate: {
      ckb: 'فەنکشنی eval() بسڕەوە و لەبری ئەوە JSON.parse() یان لۆژیکی ڕاستەوخۆ بەکاربهێنە.',
      badini: 'eval() ژێببە و ل شوونا وێ JSON.parse() بکاربینە.',
      en: 'Refactor code to use JSON.parse() or standard logic instead of eval().',
      ar: 'أزل eval() واستبدلها بدوال آمنة مثل JSON.parse().',
      fa: 'تابع eval() را حذف کرده و از متدهای امن نظیر JSON.parse() استفاده کنید.',
    },
  },
  {
    name: 'Unescaped dangerouslySetInnerHTML',
    regex: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/g,
    severity: 'HIGH',
    category: 'security',
    issueTemplate: {
      ckb: 'بەکارهێنانی dangerouslySetInnerHTML دەبێتە هۆی کەلێنی XSS ئەگەر داتاکان خاوێن نەکرێنەوە.',
      badini: 'بکارئینانا dangerouslySetInnerHTML دەرگەهێ هاککرنا XSS ڤەدکەت.',
      en: 'dangerouslySetInnerHTML exposes the component to Cross-Site Scripting (XSS).',
      ar: 'استخدام dangerouslySetInnerHTML يعرض الموقع لثغرات XSS إذا لم يتم تطهير المدخلات.',
      fa: 'استفاده از dangerouslySetInnerHTML بدون ضدعفونی کردن، موجب آسیب‌پذیری XSS می‌شود.',
    },
    fixTemplate: {
      ckb: 'پێش نیشاندانی HTML، لە ڕێگەی DOMPurify.sanitize() داتاکە فلتەر بکە.',
      badini: 'بەری پیشاندانێ ب DOMPurify.sanitize() داتایێ پاقژ بکە.',
      en: 'Sanitize the HTML payload with DOMPurify before injecting it.',
      ar: 'قم بتنقية المدخلات باستخدام مكتبة DOMPurify قبل حقنها في الصفحة.',
      fa: 'پیش از تزریق، محتوا را با پکیج DOMPurify ضدعفونی کنید.',
    },
  },
  {
    name: 'Unsanitized SQL Concatenation',
    regex: /(?:SELECT|INSERT|UPDATE|DELETE)\s+[^;\n]+(?:WHERE|SET|VALUES)\s+[^;\n]*(\+\s*|\$\{)[a-zA-Z0-9_\.]+/i,
    severity: 'CRITICAL',
    category: 'backend',
    issueTemplate: {
      ckb: 'کوێریی SQL بە لکاندنی ڕاستەوخۆی تێکست دروستکراوە (SQL Injection).',
      badini: 'کوێرییا SQL ب لکاندنا دەقی هاتیە چێکرن کو مەترسییا SQL Injection هەیە.',
      en: 'SQL query constructed via string concatenation, vulnerable to SQL Injection.',
      ar: 'بناء استعلام SQL عبر دمج النصوص يسبب ثغرات حقن الاستعلامات (SQL Injection).',
      fa: 'کوئری SQL از طریق الحاق مستقیم رشته ساخته شده که آسیب‌پذیر به SQL Injection است.',
    },
    fixTemplate: {
      ckb: 'کوێریی پارامەتەرکراو بەکاربهێنە وەک db.query("SELECT ... WHERE id = :id", params).',
      badini: 'کوێریێن Parameterized بکاربینە وەک db.query("... WHERE id = :id", params).',
      en: 'Use parameterized queries or ORM prepared statements (e.g. Prisma / Drizzle / query params).',
      ar: 'استخدم الاستعلامات المعلمة (Parameterized Queries) لمنع حقن SQL.',
      fa: 'از کوئری‌های پارامتری یا ORM استفاده کنید (نظیر query params).',
    },
  },
  {
    name: 'Unhandled Empty Catch Block',
    regex: /catch\s*\([^\)]*\)\s*\{\s*\}/g,
    severity: 'LOW',
    category: 'quality',
    issueTemplate: {
      ckb: 'بلۆکی catch بە بەتاڵی جێهێڵدراوە کە دەبێتە هۆی پەردەپۆشکردنی هەڵەکان (Silent Failure).',
      badini: 'بلۆکا catch یا بەتالە و خەلەتییان ڤەدشێریت.',
      en: 'Empty catch block silently suppresses unexpected runtime exceptions.',
      ar: 'كتلة catch فارغة تتجاهل الأخطاء البرمجية بصمت دون تسجيل.',
      fa: 'بلوک catch خالی خطاهای ناگهانی برنامه را بدون لاگ سرکوب می‌کند.',
    },
    fixTemplate: {
      ckb: 'لانی کەم هەڵەکە بە console.error تۆمار بکە یان بیپەڕێنەوە بۆ Error Boundary.',
      badini: 'خەلەتییێ ب console.error تۆمار بکە.',
      en: 'Log the error with structured logger or pass it to an error boundary.',
      ar: 'سجل الخطأ في السجلات أو اعرضه لمعالج الأخطاء.',
      fa: 'حداقل خطا را لاگ کنید یا به لایه مدیریت خطا ارسال نمایید.',
    },
  },
];

export function runAstScan(
  files: Array<{ path: string; content: string }>,
  language: SupportedLanguage = 'ckb'
): AstScanResult {
  const startTime = Date.now();
  const findings: AstFinding[] = [];

  for (const file of files) {
    const filePathLower = file.path.toLowerCase();

    // Skip non-code files and sample demo fixtures (SampleProjects.tsx contains deliberate vulnerable code for demonstration)
    if (
      filePathLower.endsWith('.md') ||
      filePathLower.endsWith('.markdown') ||
      filePathLower.endsWith('.json') ||
      filePathLower.endsWith('.txt') ||
      filePathLower.endsWith('.lock') ||
      filePathLower.includes('astscanner.ts') || // prevent scanner from flagging its own rules
      filePathLower.includes('sampleprojects')   // demo fixtures designed specifically for testing the scanner
    ) {
      continue;
    }

    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const lineContent = lines[i];

      // Skip comment-only lines to prevent false positives
      const trimmed = lineContent.trim();
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('#')
      ) {
        continue;
      }

      for (const pattern of SECRET_PATTERNS) {
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(lineContent)) {
          findings.push({
            id: `ast-${findings.length + 1}`,
            ruleId: pattern.name.toLowerCase().replace(/\s+/g, '-'),
            severity: pattern.severity,
            category: pattern.category,
            file: file.path,
            line: i + 1,
            snippet: lineContent.trim().slice(0, 120),
            issue: pattern.issueTemplate[language] || pattern.issueTemplate.ckb,
            fix: pattern.fixTemplate[language] || pattern.fixTemplate.ckb,
          });
        }
      }
    }
  }

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter((f) => f.severity === 'LOW').length;

  return {
    totalIssues: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    findings,
    durationMs: Date.now() - startTime,
  };
}
