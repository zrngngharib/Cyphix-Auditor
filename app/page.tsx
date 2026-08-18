'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { UploadZone } from '@/components/UploadZone';
import { Controls, AIProvider } from '@/components/Controls';
import { LiveAuditStream, LiveStreamEvent } from '@/components/LiveAuditStream';
import { ResultsView } from '@/components/ResultsView';
import { SampleProjects } from '@/components/SampleProjects';
import { ModelManagerModal } from '@/components/ModelManagerModal';
import { CodebaseSummary } from '@/lib/types';
import { AstFinding } from '@/lib/scanner/astScanner';
import {
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
  HardDrive,
  Lock,
  Globe2,
  Copy,
  Check,
  ChevronRight,
  Terminal,
  Activity,
  Zap,
  Key,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function Home() {
  const { t, language, dir } = useLanguage();
  const [summary, setSummary] = useState<CodebaseSummary | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [localModelPath, setLocalModelPath] = useState<string>('./models/model.gguf');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [isHeroModelModalOpen, setIsHeroModelModalOpen] = useState(false);
  const [commandCopied, setCommandCopied] = useState(false);
  const [activeCommandTab, setActiveCommandTab] = useState<'agent' | 'cli' | 'offline'>('agent');

  // Real-Time Multi-Agent Streaming States
  const [streamLogs, setStreamLogs] = useState<LiveStreamEvent[]>([]);
  const [streamProgress, setStreamProgress] = useState<number>(0);
  const [streamStatusText, setStreamStatusText] = useState<string>('');
  const [activeDomainId, setActiveDomainId] = useState<number | null>(null);
  const [completedDomains, setCompletedDomains] = useState<
    Record<number, { issuesCount: number; criticalCount: number; durationMs: number }>
  >({});
  const [astFindings, setAstFindings] = useState<AstFinding[]>([]);
  const [streamMetrics, setStreamMetrics] = useState<{ files: number; lines: number; bytes: number }>({
    files: 0,
    lines: 0,
    bytes: 0,
  });
  const [streamElapsedSeconds, setStreamElapsedSeconds] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      setStreamElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setStreamElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  const copyCommandText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCommandCopied(true);
    setTimeout(() => setCommandCopied(false), 2000);
  };

  const handleStartAudit = async () => {
    if (!summary || !summary.concatenatedCode) {
      setError(t('step1Subtitle'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setAuditReport(null);
    setStreamLogs([]);
    setStreamProgress(5);
    setStreamStatusText(t('scanning'));
    setActiveDomainId(null);
    setCompletedDomains({});
    setAstFindings([]);
    setStreamMetrics({
      files: summary.files.length,
      lines: summary.totalLines,
      bytes: summary.files.reduce((a, f) => a + f.size, 0),
    });

    try {
      const response = await fetch('/api/audit/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codebase: summary.concatenatedCode,
          apiKey: apiKey.trim() || undefined,
          modelName: selectedModel,
          provider: provider,
          localModelPath: localModelPath.trim() || undefined,
          language: language,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to start multi-agent audit stream.');
      }

      if (!response.body) {
        throw new Error('Streaming response body is unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventType = 'message';
          let eventData = '';

          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData = line.slice(6).trim();
            }
          }

          if (eventData) {
            try {
              const data = JSON.parse(eventData);
              const nowTime = new Date().toLocaleTimeString();

              if (eventType === 'status') {
                setStreamStatusText(data.message);
                if (data.progress) setStreamProgress(data.progress);
                setStreamLogs((prev) => [
                  ...prev,
                  { message: data.message, timestamp: nowTime, progress: data.progress },
                ]);
              } else if (eventType === 'metrics') {
                setStreamMetrics({
                  files: data.totalFiles,
                  lines: data.totalLines,
                  bytes: data.totalBytes,
                });
              } else if (eventType === 'ast_findings') {
                setAstFindings(data.findings || []);
                setStreamLogs((prev) => [
                  ...prev,
                  {
                    message: `⚡ AST Scanner discovered ${data.totalIssues} preliminary issues in ${data.durationMs}ms`,
                    timestamp: nowTime,
                  },
                ]);
              } else if (eventType === 'domain_start') {
                setActiveDomainId(data.domainId);
                setStreamLogs((prev) => [
                  ...prev,
                  {
                    message: `Agent #${data.domainId} started analyzing: ${data.domainName}`,
                    timestamp: nowTime,
                    domainId: data.domainId,
                  },
                ]);
              } else if (eventType === 'domain_complete') {
                setCompletedDomains((prev) => ({
                  ...prev,
                  [data.domainId]: {
                    issuesCount: data.issuesCount,
                    criticalCount: data.criticalCount,
                    durationMs: data.durationMs,
                  },
                }));
                setStreamLogs((prev) => [
                  ...prev,
                  {
                    message: `Agent #${data.domainId} finished: ${data.domainName} (${data.issuesCount} issues found in ${data.durationMs}ms)`,
                    timestamp: nowTime,
                    domainId: data.domainId,
                    issuesCount: data.issuesCount,
                  },
                ]);
              } else if (eventType === 'complete') {
                setStreamProgress(100);
                setAuditReport(data.report);
                setStreamLogs((prev) => [
                  ...prev,
                  { message: 'Audit report fully compiled and ready!', timestamp: nowTime },
                ]);
              } else if (eventType === 'error') {
                throw new Error(data.message || 'Error occurred during streaming audit.');
              }
            } catch (jsonErr) {
              console.error('Failed to parse SSE event JSON:', jsonErr, eventData);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Audit execution failed:', err);
      setError(
        err.message ||
        'Failed to communicate with the AI engine. Please check your configuration and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAuditReport(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#fafafc] text-slate-900 font-sans">
      {/* Clerk Style Tech Circuit Background Grid */}
      <div className="fixed inset-0 clerk-circuit-grid pointer-events-none z-0 opacity-70" />

      {/* Header */}
      <Header />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 relative z-10">
        {/* Master Hero Section (Clerk.com Style) */}
        {!auditReport && (
          <div className="text-center max-w-4xl mx-auto space-y-8 pt-6 pb-6 animate-fade-in relative">
            {/* Top Translucent Lock Orb & Connector Lines */}
            <div className="clerk-top-lock-container" aria-hidden="true">
              <div className="clerk-top-lock-lines" />
              <div className="clerk-top-lock-orb">
                <Lock className="w-6 h-6 text-slate-700" />
              </div>
            </div>

            {/* Hero Main Headline (Clerk Massive Bold) */}
            <div className="space-y-4 pt-10">
              <h1 className="text-4xl sm:text-5xl md:text-5xl font-black tracking-tight text-slate-950 leading-[1.08] font-sans">
                {t('heroTitle')} <br />
                <span className="text-slate-900">
                  {t('heroTitleHighlight')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-sans">
                {t('heroDesc')}
              </p>
            </div>

            {/* Clerk Interactive Command Pill Box */}
            <div className="max-w-lg mx-auto space-y-3 pt-2">
              <div className="clerk-command-box p-4 text-left rtl:text-right space-y-3">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveCommandTab('agent')}
                    className={`pb-1 transition-colors ${activeCommandTab === 'agent'
                      ? 'text-slate-950 font-bold border-b-2 border-slate-950'
                      : 'hover:text-slate-800'
                      }`}
                  >
                    {t('agentTab')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCommandTab('cli')}
                    className={`pb-1 transition-colors ${activeCommandTab === 'cli'
                      ? 'text-slate-950 font-bold border-b-2 border-slate-950'
                      : 'hover:text-slate-800'
                      }`}
                  >
                    {t('cliTab')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCommandTab('offline')}
                    className={`pb-1 transition-colors ${activeCommandTab === 'offline'
                      ? 'text-slate-950 font-bold border-b-2 border-slate-950'
                      : 'hover:text-slate-800'
                      }`}
                  >
                    {t('offlineTab')}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-50 px-3.5 py-2.5 rounded-xl font-mono text-xs text-slate-800 border border-slate-200/70">
                  <span className="truncate select-all">
                    {activeCommandTab === 'agent' && 'npx quantix-auditor@latest . --agent'}
                    {activeCommandTab === 'cli' && 'quantix audit ./src --report=markdown'}
                    {activeCommandTab === 'offline' && 'quantix --local-model=./models/deepseek-r1-7b.gguf'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const cmd =
                        activeCommandTab === 'agent'
                          ? 'npx quantix-auditor@latest . --agent'
                          : activeCommandTab === 'cli'
                            ? 'quantix audit ./src --report=markdown'
                            : 'quantix --local-model=./models/deepseek-r1-7b.gguf';
                      copyCommandText(cmd);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors focus-ring"
                    aria-label="Copy command"
                  >
                    {commandCopied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quickstart guide CTA */}
              <button
                type="button"
                onClick={() => setIsHeroModelModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-sans"
              >
                <span>{t('manageLocalModelsBtn')}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 4 Pillars Grid Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-left rtl:text-right">
              <div className="clerk-feature-card">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">{t('pillar1Title')}</div>
                <div className="text-[11px] text-slate-500">{t('pillar1Sub')}</div>
              </div>

              <div className="clerk-feature-card">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">{t('pillar2Title')}</div>
                <div className="text-[11px] text-slate-500">{t('pillar2Sub')}</div>
              </div>

              <div className="clerk-feature-card">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">{t('pillar3Title')}</div>
                <div className="text-[11px] text-slate-500">{t('pillar3Sub')}</div>
              </div>

              <div className="clerk-feature-card">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">{t('pillar4Title')}</div>
                <div className="text-[11px] text-slate-500">{t('pillar4Sub')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fade-in shadow-2xs font-sans"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1 flex-1">
              <span className="font-bold">{t('errorTitle')}</span>
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Main Audit Workflow Area */}
        {auditReport ? (
          /* Results View */
          <ResultsView
            markdown={auditReport}
            onReset={handleReset}
            modelUsed={
              provider === 'local'
                ? `Local Offline (${(localModelPath.split(/[/\\]/).pop() || 'Model').replace(/\.gguf$/i, '')})`
                : selectedModel
            }
          />
        ) : (
          /* Setup & Upload View */
          <div className="space-y-10">
            {/* Upload Drag & Drop Zone */}
            <section id="step-1-section" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-mono font-bold">1</span>
                  <span>{t('step1Title')}</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-sans">
                  {t('step1Subtitle')}
                </span>
              </div>
              <UploadZone
                summary={summary}
                onSummaryChange={setSummary}
                disabled={isLoading}
              />
            </section>

            {/* Controls & AI Provider */}
            <section id="step-2-section" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-mono font-bold">2</span>
                  <span>{t('step2Title')}</span>
                </h3>
              </div>
              <Controls
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                provider={provider}
                onProviderChange={setProvider}
                localModelPath={localModelPath}
                onLocalModelPathChange={setLocalModelPath}
                onStartAudit={handleStartAudit}
                isLoading={isLoading}
                canStart={Boolean(summary && summary.files.length > 0)}
              />
            </section>

            {/* In-Flight Real-Time Multi-Agent Visualizer */}
            {isLoading && (
              <section className="space-y-3 animate-fade-in">
                <LiveAuditStream
                  logs={streamLogs}
                  currentProgress={streamProgress}
                  currentStatusText={streamStatusText}
                  activeDomainId={activeDomainId}
                  completedDomains={completedDomains}
                  astFindings={astFindings}
                  metrics={streamMetrics}
                  elapsedSeconds={streamElapsedSeconds}
                />
              </section>
            )}

            {/* Quick Sample Selector if no folder uploaded yet */}
            {!summary && !isLoading && (
              <section id="samples-section" className="pt-2">
                <SampleProjects
                  onLoadSample={(s) => setSummary(s)}
                  disabled={isLoading}
                />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Hero Model Manager Modal instance */}
      <ModelManagerModal
        isOpen={isHeroModelModalOpen}
        onClose={() => setIsHeroModelModalOpen(false)}
      />

      {/* Clerk Clean Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900">{t('footerTitle')}</span>
          </div>
          <div>
            {t('footerSub')}
          </div>
        </div>
      </footer>
    </div>
  );
}
