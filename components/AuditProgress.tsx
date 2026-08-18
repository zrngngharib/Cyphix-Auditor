'use client';

import React, { useEffect, useState } from 'react';
import {
  Database,
  Layout,
  ShieldAlert,
  Globe,
  Bug,
  Zap,
  FileCode2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export const AuditProgress: React.FC = () => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const AUDIT_DOMAINS = [
    {
      id: 1,
      nameKey: 'domain1Title',
      descKey: 'domain1Desc',
      icon: Database,
    },
    {
      id: 2,
      nameKey: 'domain2Title',
      descKey: 'domain2Desc',
      icon: Layout,
    },
    {
      id: 3,
      nameKey: 'domain3Title',
      descKey: 'domain3Desc',
      icon: ShieldAlert,
    },
    {
      id: 4,
      nameKey: 'domain4Title',
      descKey: 'domain4Desc',
      icon: Globe,
    },
    {
      id: 5,
      nameKey: 'domain5Title',
      descKey: 'domain5Desc',
      icon: Bug,
    },
    {
      id: 6,
      nameKey: 'domain6Title',
      descKey: 'domain6Desc',
      icon: Zap,
    },
    {
      id: 7,
      nameKey: 'domain7Title',
      descKey: 'domain7Desc',
      icon: FileCode2,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % AUDIT_DOMAINS.length);
    }, 2400);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [AUDIT_DOMAINS.length]);

  return (
    <div className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-800"></span>
            </span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-950 flex items-center gap-2 font-sans">
              {t('analyzingTitle')}
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              {t('analyzingDesc')}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 self-start sm:self-auto shadow-2xs">
          {t('elapsed')} <strong className="text-slate-950">{elapsedSeconds}s</strong>
        </div>
      </div>

      {/* Domain Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {AUDIT_DOMAINS.map((domain, index) => {
          const Icon = domain.icon;
          const isCurrent = index === activeStep;
          const isDone = index < activeStep;

          return (
            <div
              key={domain.id}
              className={`p-4 rounded-2xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-slate-900 border-slate-950 text-white shadow-md scale-[1.01]'
                  : isDone
                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200/80 text-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    isCurrent
                      ? 'bg-slate-800 text-white'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-white text-slate-500 border border-slate-200'
                  } shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold truncate font-sans ${
                        isCurrent ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {domain.id}. {t(domain.nameKey as any)}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-slate-300 font-mono animate-pulse">
                        {t('scanning')}
                      </span>
                    )}
                    {isDone && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 line-clamp-1 font-sans ${
                      isCurrent ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {t(domain.descKey as any)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar Pulse */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 p-0.5 shadow-inner">
        <div className="bg-slate-900 h-full rounded-full w-full animate-pulse" />
      </div>
    </div>
  );
};
