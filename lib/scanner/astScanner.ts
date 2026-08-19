import { SupportedLanguage } from '@/lib/i18n';

export interface AstFinding {
  id: string;
  ruleId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'security' | 'backend' | 'performance' | 'quality';
  domainIds: number[];
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

interface SecurityRulePattern {
  name: string;
  regex: RegExp;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'security' | 'backend' | 'performance' | 'quality';
  domainIds: number[];
  issueTemplate: Record<SupportedLanguage, string>;
  fixTemplate: Record<SupportedLanguage, string>;
}

const UNIVERSAL_SECURITY_RULES: SecurityRulePattern[] = [
  // ---------------------------------------------------------------------------
  // 1. Cloud & API Keys (Universal)
  // ---------------------------------------------------------------------------
  {
    name: 'AWS Access Key ID',
    regex: /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [3],
    issueTemplate: {
      ckb: 'کلیلی ڕاستەقینەی AWS Access Key ئاشکراکراوە لەناو کۆددا.',
      badini: 'کلیلا ڕاستەقینە یا AWS Access Key د ناڤ کۆدی دا یا ئاشکەرایە.',
      en: 'Exposed hardcoded AWS Access Key ID detected in source code.',
      ar: 'تم كشف مفتاح AWS Access Key ID داخل الشيفرة البرمجية.',
      fa: 'کلید دسترسی مستقیم AWS Access Key در سورس‌کد افشا شده است.',
    },
    fixTemplate: {
      ckb: 'کلیلەکە لە فایلی نهێنی .env دابنێ و لە ڕێگەی process.env یان os.environ بیخوێنەوە.',
      badini: 'کلیلێ د فایلا نهێنی یا .env دا دابنێ.',
      en: 'Move secret key to environment variables (.env) and add to .gitignore.',
      ar: 'انقل المفتاح إلى ملف .env واقرأه عبر متغيرات البيئة.',
      fa: 'کلید را به متغیرهای محیطی (.env) منتقل کنید.',
    },
  },
  {
    name: 'Generic API Key / Secret Token',
    regex: /(?:api[_-]?key|secret[_-]?key|auth[_-]?token|bearer[_\s:]+token)['"]?\s*[:=]\s*['"][a-zA-Z0-9_\-]{24,}['"]/gi,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [3],
    issueTemplate: {
      ckb: 'تۆکەن یان کلیلی نهێنی API بە شێوازی دەستنووس ئاشکراکراوە.',
      badini: 'تۆکەن یان کلیلا نهێنی یا API د ناڤ کۆدی دا یا ئاشکەرایە.',
      en: 'Hardcoded API key or private secret token exposed directly.',
      ar: 'مفتاح API سري أو توكن مصادقة مكشوف مباشرة في الشيفرة.',
      fa: 'توکن احراز هویت یا کلید محرمانه API به صورت مستقیم افشا شده است.',
    },
    fixTemplate: {
      ckb: 'هەموو کلیلەکان لەناو .env دابنێ و هەرگیز مەیانخەرە ناو گیتهەب.',
      badini: 'هەمی کلیلا بێخە ناڤ .env و چ جاران نەدانە سەر گیت هاب.',
      en: 'Store secrets in environment variables and add .env to .gitignore.',
      ar: 'احفظ الأسرار في متغيرات البيئة وأضف .env إلى .gitignore.',
      fa: 'تمام کلیدها را در متغیرهای محیطی ذخیره کنید.',
    },
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /(?:ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{82})/g,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [3],
    issueTemplate: {
      ckb: 'تۆکەنی تایبەتی گیت‌هەب (GitHub PAT) ئاشکراکراوە.',
      badini: 'تۆکەنا تایبەت یا گیت هاب ئاشکەرایە.',
      en: 'Exposed GitHub Personal Access Token (PAT) detected.',
      ar: 'تم كشف توكن الوصول الشخصي لـ GitHub في الشيفرة.',
      fa: 'توکن دسترسی شخصی گیت‌هاب (GitHub PAT) افشا شده است.',
    },
    fixTemplate: {
      ckb: 'دەستبەجێ تۆکەنەکە لە گیت‌هەب بسڕەوە (Revoke) و نوێی بکەرەوە.',
      badini: 'یەکسەر تۆکەنێ Revoke بکە د گیت هاب دا.',
      en: 'Immediately revoke the token on GitHub and rotate credentials.',
      ar: 'قم بإلغاء التوكن فوراً من إعدادات GitHub وإنشاء واحد جديد.',
      fa: 'فورا توکن را در گیت‌هاب باطل (Revoke) کرده و آن را بازنشانی کنید.',
    },
  },
  {
    name: 'Private RSA / SSH Key',
    regex: /-----BEGIN (?:RSA|OPENSSH|EC|DSA) PRIVATE KEY-----/g,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [3],
    issueTemplate: {
      ckb: 'کلیلی نهێنی سێرڤەر (Private SSH/RSA Key) لەناو فایلدا جێهێڵدراوە.',
      badini: 'کلیلا تایبەت یا SSH/RSA د ناڤ فایلی دا یا هاتیە هێلان.',
      en: 'Private SSH / RSA Key found embedded directly in source tree.',
      ar: 'تم العثور على مفتاح SSH/RSA خاص مكشوف في الشيفرة.',
      fa: 'کلید خصوصی سرور (SSH/RSA) مستقیما در سورس‌کد قرار گرفته است.',
    },
    fixTemplate: {
      ckb: 'کلیلی تایبەت لە کۆد بسڕەوە و لە سێرڤەری پارێزراو دایبنێ.',
      badini: 'کلیلا تایبەت ژ کۆدی دەربینە.',
      en: 'Remove private keys from source code immediately.',
      ar: 'أزل المفاتيح الخاصة من الشيفرة البرمجية فوراً.',
      fa: 'کلید خصوصی را فورا از سورس‌کد حذف کنید.',
    },
  },

  // ---------------------------------------------------------------------------
  // 2. Python Security Flaws
  // ---------------------------------------------------------------------------
  {
    name: 'Python Insecure Deserialization (pickle)',
    regex: /(?:pickle|_pickle|cPickle)\.loads?\s*\(/g,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [1, 3],
    issueTemplate: {
      ckb: 'بەکارهێنانی pickle.loads لە پایتۆندا دەبێتە هۆی جێبەجێکردنی کۆدی نادیار (RCE).',
      badini: 'بکارئینانا pickle.loads د پایتۆن دا مەترسییا لێدانا کۆدی دروست دکەت.',
      en: 'Insecure Python pickle deserialization can lead to Remote Code Execution (RCE).',
      ar: 'إلغاء تسلسل pickle غير الآمن في بايثون يؤدي إلى تنفيذ أوامر عشوائية (RCE).',
      fa: 'دی‌سریالایز ناامن pickle در پایتون خطر اجرای کد از راه دور (RCE) دارد.',
    },
    fixTemplate: {
      ckb: 'لەبری pickle، فۆرماتی پارێزراوی json.loads() یان protobuf بەکاربهێنە.',
      badini: 'ل شوونا pickle فۆرماتێ پاراستی یێ json.loads() بکاربینە.',
      en: 'Use secure serialization formats like JSON (json.loads) or Protocol Buffers.',
      ar: 'استخدم صيغ تسلسل آمنة مثل json.loads بدلاً من pickle.',
      fa: 'از فرمت‌های امن نظیر json.loads() یا protobuf استفاده کنید.',
    },
  },
  {
    name: 'Python Command Injection (shell=True)',
    regex: /subprocess\.(?:Popen|run|call|check_output)\s*\([^)]*shell\s*=\s*True/g,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [1, 3],
    issueTemplate: {
      ckb: 'فەرمانی شێڵ لە پایتۆن بە shell=True ئەنجام دراوە (Command Injection).',
      badini: 'فەرمانا شێڵ ب shell=True هاتیە بکارئینان کو مەترسیدارە.',
      en: 'subprocess invoked with shell=True is vulnerable to OS Command Injection.',
      ar: 'تشغيل أوامر النظام عبر subprocess مع shell=True يسبب ثغرات Command Injection.',
      fa: 'فراخوانی دستور با shell=True در پایتون آسیب‌پذیر به تزریق دستورات سیستم‌عامل است.',
    },
    fixTemplate: {
      ckb: 'shell=False دابنێ و فەرمانەکە وەک لیستی ئارگیومێنت بنێرە.',
      badini: 'shell=False دابنێ و فەرمانێ ب لیستا ئارگیومێنتان بدە.',
      en: 'Set shell=False and pass arguments as a list: subprocess.run(["cmd", "arg1"]).',
      ar: 'اضبط shell=False ومرر الأوامر كمصفوفة لمنع حقن الأوامر.',
      fa: 'پارامتر را به shell=False تغییر داده و دستور را به شکل لیست آرگومان‌ها پاس دهید.',
    },
  },

  // ---------------------------------------------------------------------------
  // 3. PHP Security Flaws
  // ---------------------------------------------------------------------------
  {
    name: 'PHP Command Execution',
    regex: /\b(?:shell_exec|passthru|system|exec)\s*\(\s*\$_(?:GET|POST|REQUEST)/g,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [1, 3],
    issueTemplate: {
      ckb: 'فەرمانی سێرڤەر لە PHP بە ڕاستەوخۆ وەرگرتنی داتای بەکارهێنەر لێدراوە.',
      badini: 'فەرمانا سێرڤەری د PHP دا ب داتایێن بکارئینەری هاتیە لێدان.',
      en: 'Direct execution of unsanitized user input in PHP system commands (RCE).',
      ar: 'تنفيذ أوامر النظام في PHP عبر مدخلات المستخدم مباشرة (RCE).',
      fa: 'اجرای مستقیم ورودی کاربر در دستورات سیستمی PHP (خطر RCE).',
    },
    fixTemplate: {
      ckb: 'فەنکشنی escapeshellarg() و escapeshellcmd() بەکاربهێنە یان بەدووربە لە بانگکردنی سێرڤەر.',
      badini: 'escapeshellarg() بکاربینە بۆ پاقژکرنا داتایان.',
      en: 'Sanitize arguments with escapeshellarg() or avoid invoking OS shell.',
      ar: 'استخدم escapeshellarg() لتعقيم المدخلات أو تجنب استدعاء أوامر النظام.',
      fa: 'ورودی‌ها را با escapeshellarg() ضدعفونی کنید یا از اجرای دستورات مستقیم پرهیز نمایید.',
    },
  },
  {
    name: 'PHP Insecure Object Deserialization',
    regex: /\bunserialize\s*\(\s*\$_(?:GET|POST|COOKIE|REQUEST)/g,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [1, 3],
    issueTemplate: {
      ckb: 'فەنکشنی unserialize() بە داتای بەکارهێنەر دەبێتە هۆی Object Injection.',
      badini: 'unserialize() ب داتایێن بکارئینەری مەترسییا Object Injection دروست دکەت.',
      en: 'PHP unserialize() with untrusted user input allows PHP Object Injection.',
      ar: 'استخدام unserialize() في PHP مع مدخلات المستخدم يتيح ثغرات Object Injection.',
      fa: 'تابع unserialize() با ورودی کاربر در PHP موجب آسیب‌پذیری Object Injection می‌شود.',
    },
    fixTemplate: {
      ckb: 'لەبری unserialize، فۆرماتی پارێزراوی json_decode() بەکاربهێنە.',
      badini: 'json_decode() بکاربینە ل شوونا unserialize.',
      en: 'Use json_decode() for handling client-supplied data safely.',
      ar: 'استخدم json_decode() للتعامل مع البيانات بأمان.',
      fa: 'از json_decode() برای پردازش داده‌های کاربر استفاده نمایید.',
    },
  },

  // ---------------------------------------------------------------------------
  // 4. Java & Kotlin Security Flaws
  // ---------------------------------------------------------------------------
  {
    name: 'Log4Shell / JNDI Injection',
    regex: /\$\{jndi:(?:ldap|rmi|dns|nis|iiop)/gi,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [1, 3, 5],
    issueTemplate: {
      ckb: 'کەلێنی مەترسیداری Log4Shell (JNDI Injection) ئاشکراکراوە لە لۆگدا.',
      badini: 'مەترسییا Log4Shell (JNDI Injection) د ناڤ لۆگی دا یا هەی.',
      en: 'Critical Log4Shell JNDI Injection payload pattern detected.',
      ar: 'تم كشف نمط ثغرة Log4Shell (JNDI Injection) الحرجة.',
      fa: 'الگوی آسیب‌پذیری بحرانی Log4Shell (JNDI Injection) شناسایی شد.',
    },
    fixTemplate: {
      ckb: 'ڤێرژنی Log4j بکە بە 2.17.1+ و لۆگکردنی JNDI ناچالاک بکە.',
      badini: 'ڤێرژنا Log4j بکە 2.17.1+.',
      en: 'Upgrade Log4j to 2.17.1+ and disable JNDI lookup functionality.',
      ar: 'قم بترقية Log4j إلى 2.17.1+ وعطل خاصية JNDI lookups.',
      fa: 'پکیج Log4j را به نسخه 2.17.1+ ارتقا داده و JNDI lookups را غیرفعال کنید.',
    },
  },

  // ---------------------------------------------------------------------------
  // 5. C / C++ Memory Safety Flaws
  // ---------------------------------------------------------------------------
  {
    name: 'C/C++ Insecure Buffer Functions',
    regex: /\b(?:strcpy|strcat|gets|sprintf)\s*\(/g,
    severity: 'HIGH',
    category: 'security',
    domainIds: [3, 6],
    issueTemplate: {
      ckb: 'بەکارهێنانی فەنکشنە نائارامەکانی بیرگە دەبێتە هۆی Buffer Overflow.',
      badini: 'بکارئینانا فەنکشنێن نائارامێن بیرگەهێ مەترسییا Buffer Overflow دروست دکەت.',
      en: 'Insecure C/C++ memory functions prone to Buffer Overflow vulnerabilities.',
      ar: 'استخدام دوال إدارة الذاكرة غير الآمنة يسبب ثغرات طفح الذاكرة (Buffer Overflow).',
      fa: 'استفاده از توابع ناامن حافظه در C/C++ که خطر سرریز بافر (Buffer Overflow) دارد.',
    },
    fixTemplate: {
      ckb: 'لەبری ئەوانە، وەشانی پارێزراو بەکاربهێنە وەک strncpy_s, snprintf, fgets.',
      badini: 'فەنکشنێن پاراستی وەک snprintf یان strncpy بکاربینە.',
      en: 'Replace with bounded equivalents: strncpy_s, snprintf, or std::string.',
      ar: 'استبدلها بالدوال الآمنة والمحددة الحجم مثل snprintf و strncpy.',
      fa: 'از توابع امن‌تر با اندازه مشخص نظیر snprintf یا std::string استفاده کنید.',
    },
  },

  // ---------------------------------------------------------------------------
  // 6. JavaScript / TypeScript & Web Flaws
  // ---------------------------------------------------------------------------
  {
    name: 'Dangerous eval() Execution',
    regex: /\beval\s*\([^\)]+\)/g,
    severity: 'CRITICAL',
    category: 'security',
    domainIds: [1, 3],
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
    domainIds: [2, 3],
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
    domainIds: [1, 3],
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
    domainIds: [5, 7],
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
        trimmed.startsWith('#') ||
        trimmed.startsWith('--')
      ) {
        continue;
      }

      for (const pattern of UNIVERSAL_SECURITY_RULES) {
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(lineContent)) {
          findings.push({
            id: `ast-${findings.length + 1}`,
            ruleId: pattern.name.toLowerCase().replace(/\s+/g, '-'),
            severity: pattern.severity,
            category: pattern.category,
            domainIds: pattern.domainIds || [3],
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
