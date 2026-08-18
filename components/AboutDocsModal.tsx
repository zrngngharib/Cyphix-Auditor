'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  BookOpen,
  Info,
  Shield,
  Sparkles,
  Lock,
  ArrowRight,
  User,
  Globe,
  Mail,
  ExternalLink,
  Cpu,
  Layers,
  CheckCircle2,
  GraduationCap,
  Code2,
  Github,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export interface AboutDocsModalProps {
  isOpen: boolean;
  type: 'about' | 'docs';
  onClose: () => void;
}

export const AboutDocsModal: React.FC<AboutDocsModalProps> = ({
  isOpen,
  type,
  onClose,
}) => {
  const { t, dir } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 flex items-center justify-center text-white shadow-sm shrink-0 border border-slate-700">
              {type === 'docs' ? (
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-400" aria-hidden="true" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 font-sans tracking-tight">
                {type === 'docs' ? t('docsTitle') : t('aboutTitle')}
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                {type === 'docs' ? t('docsSubtitle') : t('aboutSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 border border-slate-200 transition-colors flex items-center justify-center focus-ring"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        {type === 'docs' ? (
          /* Documentation Content */
          <div className="space-y-4 text-xs font-sans text-slate-700 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-slate-950 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-700" />
                <span>{t('docsHowItWorks')}</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {t('docsHowItWorksDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{t('docsCloud')}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{t('docsCloudDesc')}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{t('docsLocal')}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{t('docsLocalDesc')}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="font-bold text-emerald-800 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>{t('docsPrivacy')}</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                {t('docsPrivacyDesc')}
              </p>
            </div>

            {/* Direct Link to Full Portal */}
            <div className="pt-2">
              <Link
                href="/docs"
                onClick={onClose}
                className="w-full min-h-[46px] px-5 py-3 rounded-full btn-quantix-primary text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{t('docsOpenFullPortal')}</span>
                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>
        ) : (
          /* About Content */
          <div className="space-y-5 text-xs font-sans text-slate-700 leading-relaxed">
            {/* 1. Project Overview Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>{t('aboutTitle')}</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                {t('aboutDesc')}
              </p>
            </div>

            {/* 2. Key Pillars Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs">
                <div className="text-xl font-bold font-mono text-slate-950">7</div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{t('aboutStatDomains')}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs">
                <div className="text-xl font-bold font-mono text-slate-950">5</div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{t('aboutStatLangs')}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs">
                <div className="text-xl font-bold font-mono text-emerald-700">100%</div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{t('aboutStatMemory')}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs">
                <div className="text-xl font-bold font-mono text-blue-700">0 KB</div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{t('aboutStatPrivacy')}</div>
              </div>
            </div>

            {/* 3. Why Quantix Was Created (Vibe Coding Era) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
              <h4 className="font-bold text-xs sm:text-sm text-slate-950 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{t('aboutWhyTitle')}</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {t('aboutWhyDesc')}
              </p>
            </div>

            {/* 4. Creator & Founder Profile Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-bold text-base shadow-md shrink-0 border border-white/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h5 className="text-base sm:text-lg font-black text-white font-sans tracking-tight">
                      {t('aboutCreatorName')}
                    </h5>
                    <p className="text-xs text-slate-400 font-sans flex items-center gap-1.5 mt-0.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('aboutCreatorExp')}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lead Architect</span>
                  </span>
                </div>
              </div>

              {/* Education & Credentials Badge */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center gap-3 text-xs text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Academic Credential</div>
                  <div className="font-bold text-slate-100">{t('aboutCreatorDegree')}</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {t('aboutCreatorBio')}
              </p>

              {/* Creator Links & Contact Bar */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="https://github.com/zrngngharib"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 focus-ring"
                >
                  <Github className="w-4 h-4 text-white" />
                  <span>github.com/zrngngharib</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href="mailto:info@zrngnawroz.xyz"
                  className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 focus-ring"
                >
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>info@zrngnawroz.xyz</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer Button */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-6 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
          >
            {t('closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
