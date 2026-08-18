'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Download,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Flame,
  AlertCircle,
  Info,
  CheckCircle2,
  FileDown,
  Layers,
  Printer,
  Sparkles,
  Cpu,
  Cloud,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface ResultsViewProps {
  markdown: string;
  onReset: () => void;
  modelUsed?: string;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  markdown,
  onReset,
  modelUsed,
}) => {
  const { t, dir } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `Quantix-Audit-Report-${dateStr}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Format clean human-readable model name
  const cleanModelName = React.useMemo(() => {
    if (!modelUsed) return 'Gemini 2.5 Flash';
    if (modelUsed.includes('/') || modelUsed.includes('\\')) {
      const parts = modelUsed.split(/[/\\]/);
      const filename = parts[parts.length - 1].replace(/\.gguf$/i, '');
      return filename.replace(/^[a-z]/, (c) => c.toUpperCase());
    }
    return modelUsed.replace(/Local Offline\s*\(([^)]+)\)/i, '$1');
  }, [modelUsed]);

  const isLocalEngine = modelUsed?.toLowerCase().includes('local') || modelUsed?.toLowerCase().includes('.gguf');

  // Severity metrics calculation — accurate regex extraction
  const criticalCount = (markdown.match(/🔴\s*CRITICAL|\*\*Severity:\*\*\s*(?:\[?🔴\s*)?CRITICAL/gi) || []).length;
  const highCount = (markdown.match(/🟠\s*HIGH|\*\*Severity:\*\*\s*(?:\[?🟠\s*)?HIGH/gi) || []).length;
  const mediumCount = (markdown.match(/🟡\s*MEDIUM|\*\*Severity:\*\*\s*(?:\[?🟡\s*)?MEDIUM/gi) || []).length;
  const lowCount = (markdown.match(/🔵\s*LOW|\*\*Severity:\*\*\s*(?:\[?🔵\s*)?LOW/gi) || []).length;

  // Accurate Clean Domains calculation (out of 7 total domains)
  const cleanDomainsMatch = (markdown.match(/##\s*\d[^\n]*\n+[\s\S]*?✅/gi) || []).length;
  const totalIssuesFound = criticalCount + highCount + mediumCount + lowCount;
  const cleanDomains = Math.min(
    7,
    Math.max(0, cleanDomainsMatch > 0 ? cleanDomainsMatch : (totalIssuesFound === 0 ? 7 : 7 - Math.min(7, criticalCount + highCount)))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Actions & Summary Stats */}
      <div className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm border border-slate-200/90 rounded-3xl bg-white/95 backdrop-blur-xl">
        {/* Header Title + Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          {/* Left Title & Engine Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 flex items-center justify-center text-white shadow-md shadow-slate-900/10 shrink-0 border border-slate-700/50">
              <ShieldCheck className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-sans">
                  {t('reportHeader')}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('reportReady')}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-sans">
                <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-800 font-mono font-medium border border-slate-200/70">
                  {isLocalEngine ? <Cpu className="w-3.5 h-3.5 text-slate-600" /> : <Cloud className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{cleanModelName}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">{t('multiAgentReasoning')}</span>
              </div>
            </div>
          </div>

          {/* Right Action Toolbar — Clean Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownload}
              className="min-h-[42px] px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow focus-ring active:scale-[0.98]"
              aria-label="Download audit report as Markdown file"
            >
              <Download className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
              <span>{t('downloadMd')}</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="min-h-[42px] px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-950 transition-colors flex items-center gap-1.5 focus-ring active:scale-[0.98]"
              aria-label="Start new codebase audit"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
              <span>{t('newAudit')}</span>
            </button>
          </div>
        </div>

        {/* Severity Metrics Strip (Clerk Minimalist Modern Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {/* Critical Card */}
          <div className="group rounded-2xl p-4 flex items-center gap-3.5 bg-gradient-to-b from-red-50/80 to-red-50/30 border border-red-200/80 shadow-2xs hover:shadow-sm hover:border-red-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-100/90 text-red-600 border border-red-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[10px] text-red-800 font-bold uppercase tracking-wider font-sans">{t('critical')}</div>
              <div className="text-2xl font-black font-mono text-red-950 leading-tight">{criticalCount}</div>
            </div>
          </div>

          {/* High Card */}
          <div className="group rounded-2xl p-4 flex items-center gap-3.5 bg-gradient-to-b from-amber-50/80 to-amber-50/30 border border-amber-200/80 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-100/90 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[10px] text-amber-900 font-bold uppercase tracking-wider font-sans">{t('high')}</div>
              <div className="text-2xl font-black font-mono text-amber-950 leading-tight">{highCount}</div>
            </div>
          </div>

          {/* Medium Card */}
          <div className="group rounded-2xl p-4 flex items-center gap-3.5 bg-gradient-to-b from-yellow-50/80 to-yellow-50/30 border border-yellow-200/80 shadow-2xs hover:shadow-sm hover:border-yellow-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-yellow-100/90 text-yellow-700 border border-yellow-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[10px] text-yellow-900 font-bold uppercase tracking-wider font-sans">{t('medium')}</div>
              <div className="text-2xl font-black font-mono text-yellow-950 leading-tight">{mediumCount}</div>
            </div>
          </div>

          {/* Low Card */}
          <div className="group rounded-2xl p-4 flex items-center gap-3.5 bg-gradient-to-b from-blue-50/80 to-blue-50/30 border border-blue-200/80 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-100/90 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Info className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[10px] text-blue-900 font-bold uppercase tracking-wider font-sans">{t('low')}</div>
              <div className="text-2xl font-black font-mono text-blue-950 leading-tight">{lowCount}</div>
            </div>
          </div>

          {/* Clean Domains Card */}
          <div className="group col-span-2 sm:col-span-1 rounded-2xl p-4 flex items-center gap-3.5 bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 border border-emerald-200/80 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider font-sans">{t('cleanDomains')}</div>
              <div className="text-2xl font-black font-mono text-emerald-950 leading-tight">
                {cleanDomains}<span className="text-sm font-medium text-emerald-600">/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Markdown Content Body */}
      <div className="quantix-panel p-6 sm:p-10 space-y-6 shadow-sm border border-slate-200/90 rounded-3xl bg-white/95 backdrop-blur-xl">
        <article className="prose-quantix max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, children, ...props }) => (
                <h1
                  className="text-2xl sm:text-3xl font-black text-slate-950 border-b border-slate-200 pb-4 mb-6 flex items-center gap-3 font-sans"
                  {...props}
                >
                  <Sparkles className="w-6 h-6 text-slate-700 shrink-0" aria-hidden="true" />
                  <span>{children}</span>
                </h1>
              ),
              h2: ({ node, children, ...props }) => (
                <div className="pt-6 pb-2 border-t border-slate-100 mt-8 first:mt-0 first:pt-0 first:border-none">
                  <h2
                    className="text-lg sm:text-xl font-bold text-slate-950 flex items-center gap-2.5 font-sans bg-slate-50/80 p-4 rounded-2xl border border-slate-200 shadow-2xs"
                    {...props}
                  >
                    <Layers className="w-5 h-5 text-slate-600 shrink-0" aria-hidden="true" />
                    <span>{children}</span>
                  </h2>
                </div>
              ),
              h3: ({ node, children, ...props }) => (
                <h3
                  className="text-base sm:text-lg font-bold text-slate-900 mt-5 mb-2 font-sans flex items-center gap-2"
                  {...props}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-900" aria-hidden="true" />
                  <span>{children}</span>
                </h3>
              ),
              strong: ({ node, children, ...props }) => {
                const text = String(children);
                if (text.includes('🔴') || text.toUpperCase().includes('CRITICAL') || text.includes('مەترسیدار') || text.includes('حرج') || text.includes('بحرانی')) {
                  return (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-mono font-bold">
                      {children}
                    </span>
                  );
                }
                if (text.includes('🟠') || text.toUpperCase().includes('HIGH') || text.includes('بەرز') || text.includes('مرتفع') || text.includes('بالا')) {
                  return (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-mono font-bold">
                      {children}
                    </span>
                  );
                }
                if (text.includes('🟡') || text.toUpperCase().includes('MEDIUM') || text.includes('مامناوەند') || text.includes('متوسط')) {
                  return (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-mono font-bold">
                      {children}
                    </span>
                  );
                }
                if (text.includes('🔵') || text.toUpperCase().includes('LOW') || text.includes('نزم') || text.includes('منخفض') || text.includes('پایین')) {
                  return (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-mono font-bold">
                      {children}
                    </span>
                  );
                }
                return <strong className="text-slate-950 font-bold" {...props}>{children}</strong>;
              },
              code: ({ node, className, children, ...props }) => {
                return (
                  <code
                    className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-xs font-semibold"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>

        {/* Bottom Export Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500 font-sans">
            {t('exportNotice')}
          </span>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center justify-center gap-2 focus-ring active:scale-[0.98] shadow-2xs hover:border-slate-300"
              aria-label="Copy markdown report to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span className="text-emerald-700 font-bold">{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  <span>{t('copyMarkdown')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center justify-center gap-2 focus-ring active:scale-[0.98]"
              aria-label="Print or export report to PDF"
            >
              <Printer className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
              <span>{t('downloadPdf')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 focus-ring"
              aria-label="Download markdown report"
            >
              <FileDown className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
              <span>{t('downloadMd')}</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-950 text-xs font-semibold transition-all flex items-center justify-center gap-2 focus-ring active:scale-[0.98]"
              aria-label="Start new codebase audit"
            >
              <RotateCcw className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
              <span>{t('newAudit')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
