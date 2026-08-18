import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';

// ─── SEO: Full metadata with Open Graph + Twitter Card ──────────────────────
export const metadata: Metadata = {
  title: 'Quantix Codebase Auditor — 7-Dimensional AI Security Intelligence',
  description:
    'Deep multi-agent codebase auditor and security engine powered by Google Gemini AI and Local Offline LLMs. Comprehensive 7-dimensional evaluation: security, performance, SEO, UX, QA, backend & documentation.',
  keywords: [
    'codebase audit', 'AI security', 'code review', 'OWASP', 'LLM audit',
    'Gemini AI', 'local LLM', 'Next.js', 'security scanner', 'Quantix',
  ],
  authors: [{ name: 'Quantix Team' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Quantix Codebase Auditor — 7-Dimensional AI Security Intelligence',
    description:
      'Deep multi-agent codebase auditor powered by Google Gemini AI and Local Offline LLMs. Comprehensive 7-dimensional security evaluation.',
    url: 'https://quantix-audit.vercel.app',
    siteName: 'Quantix',
    images: [
      {
        url: 'https://quantix-audit.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Quantix — AI Codebase Auditor',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantix Codebase Auditor — 7-Dimensional AI Security Intelligence',
    description:
      'Deep multi-agent codebase auditor powered by Google Gemini AI and Local Offline LLMs.',
    images: ['https://quantix-audit.vercel.app/og-image.png'],
  },
  // hreflang: inform search engines about all 5 language variants
  alternates: {
    canonical: 'https://quantix-audit.vercel.app',
    languages: {
      'ku': 'https://quantix-audit.vercel.app/?lang=ckb',
      'en': 'https://quantix-audit.vercel.app/?lang=en',
      'ar': 'https://quantix-audit.vercel.app/?lang=ar',
      'fa': 'https://quantix-audit.vercel.app/?lang=fa',
      'x-default': 'https://quantix-audit.vercel.app',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // NOTE: lang/dir are set dynamically on <html> by LanguageProvider via useEffect (client-side).
    // The default here (ckb/rtl) is the server-side fallback for initial render.
    // This prevents a SEO mismatch on first load while keeping client-side i18n working.
    <html lang="ckb" dir="rtl" className="light" suppressHydrationWarning>
      <head>
        {/* Google Fonts — preconnect for performance, single <link> (no @import in CSS) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Estedad:wght@100..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#fafafc] text-slate-900 min-h-screen antialiased selection:bg-slate-900 selection:text-white font-sans overflow-x-hidden relative"
      >
        {/* Clerk Style Subtle Circuit Grid Background */}
        <div className="fixed inset-0 clerk-circuit-grid pointer-events-none z-0 opacity-70" />

        {/* Main Content Provider — also sets lang/dir dynamically on <html> */}
        <LanguageProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
