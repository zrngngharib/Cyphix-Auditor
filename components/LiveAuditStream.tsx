'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Terminal,
  ShieldAlert,
  Database,
  Layout,
  Globe,
  Bug,
  FileCode2,
  CheckCircle2,
  Loader2,
  Clock,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { AstFinding } from '@/lib/scanner/astScanner';

export interface LiveStreamEvent {
  step?: string;
  message?: string;
  progress?: number;
  totalFiles?: number;
  totalBytes?: number;
  totalLines?: number;
  astFindings?: AstFinding[];
  domainId?: number;
  domainName?: string;
  issuesCount?: number;
  criticalCount?: number;
  durationMs?: number;
  markdownSnippet?: string;
  timestamp: string;
}

interface LiveAuditStreamProps {
  logs: LiveStreamEvent[];
  currentProgress: number;
  currentStatusText: string;
  activeDomainId: number | null;
  completedDomains: Record<number, { issuesCount: number; criticalCount: number; durationMs: number }>;
  astFindings: AstFinding[];
  metrics: { files: number; lines: number; bytes: number };
  elapsedSeconds: number;
}

export const LiveAuditStream: React.FC<LiveAuditStreamProps> = ({
  logs,
  currentProgress,
  currentStatusText,
  activeDomainId,
  completedDomains,
  astFindings,
  metrics,
  elapsedSeconds,
}) => {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<'domains' | 'ast' | 'terminal'>('domains');

  const DOMAIN_ICONS = [
    Database,
    Layout,
    ShieldAlert,
    Globe,
    Bug,
    Zap,
    FileCode2,
  ];

  return (
    <div className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm border border-slate-200">
      {/* Header Banner & Live Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-950 font-sans">
                {t('liveStreamTitle')}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('liveAgentsRunning')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              {currentStatusText || t('liveStreamSub')}
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{elapsedSeconds}s</span>
          </div>

          {metrics.files > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <strong className="text-slate-950">{metrics.files}</strong> {t('liveMetricFiles')}
            </div>
          )}

          {astFindings.length > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>{astFindings.length} AST</span>
            </div>
          )}
        </div>
      </div>

      {/* Real Percentage Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600 font-sans flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
            <span>{currentStatusText}</span>
          </span>
          <span className="font-bold text-slate-950">{currentProgress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200 shadow-inner">
          <div
            className="bg-slate-900 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, currentProgress)}%` }}
          />
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('domains')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'domains'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t('step2Title')} (7 Agents)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ast')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'ast'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{t('liveFindingsTab')}</span>
          {astFindings.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
              {astFindings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('terminal')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'terminal'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{t('liveTerminalTab')}</span>
        </button>
      </div>

      {/* TAB 1: 7-DOMAIN AGENT MATRIX */}
      {activeTab === 'domains' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((dId) => {
            const Icon = DOMAIN_ICONS[dId - 1] || Sparkles;
            const isRunning = activeDomainId === dId;
            const completed = completedDomains[dId];
            const isDone = Boolean(completed);

            return (
              <div
                key={`domain-card-${dId}`}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isRunning
                    ? 'bg-slate-900 border-slate-950 text-white shadow-md scale-[1.01]'
                    : isDone
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200/80 text-slate-500 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isRunning
                          ? 'bg-slate-800 text-white'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-white text-slate-400 border border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold font-sans">
                        {dId}. {t(`domain${dId}Title` as any)}
                      </div>
                      <div className="text-[10px] font-mono opacity-80">
                        {isRunning
                          ? 'Agent analyzing...'
                          : isDone
                          ? `${completed.durationMs}ms`
                          : 'In queue'}
                      </div>
                    </div>
                  </div>

                  {isRunning && <Loader2 className="w-4 h-4 animate-spin text-amber-300 shrink-0" />}
                  {isDone && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono shrink-0 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>{completed.issuesCount} issues</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INSTANT AST FINDINGS DRAWER */}
      {activeTab === 'ast' && (
        <div className="space-y-3 animate-fade-in">
          {astFindings.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-sans">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <span>No critical syntax flaws or hardcoded secrets found in static pre-scan.</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {astFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {finding.file}:{finding.line}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-100 text-red-800">
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-slate-700 font-sans">{finding.issue}</p>
                  <pre className="p-2 rounded-lg bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto">
                    <code>{finding.snippet}</code>
                  </pre>
                  <div className="text-[11px] text-emerald-700 font-sans">
                    <strong>Fix:</strong> {finding.fix}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE TERMINAL CONSOLE */}
      {activeTab === 'terminal' && (
        <div className="rounded-2xl bg-slate-950 text-slate-200 p-4 font-mono text-xs space-y-1.5 max-h-72 overflow-y-auto border border-slate-800 shadow-inner">
          <div className="text-slate-500 text-[10px] pb-1 border-b border-slate-800 flex items-center justify-between">
            <span>QUANTIX MULTI-AGENT SSE PIPELINE // CONSOLE</span>
            <span>LIVE</span>
          </div>
          {logs.map((log, idx) => (
            <div key={`log-${idx}`} className="text-[11px] flex items-start gap-2">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span className="text-emerald-400 shrink-0">&gt;</span>
              <span className="text-slate-200">
                {log.message || `Domain ${log.domainId} completed (${log.issuesCount} issues)`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
