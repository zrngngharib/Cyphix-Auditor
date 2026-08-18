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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container (Clerk Clean White) */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-sm shrink-0">
              {type === 'docs' ? (
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Info className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-950 font-sans">
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
            className="min-h-[40px] min-w-[40px] rounded-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 border border-slate-200 transition-colors flex items-center justify-center focus-ring"
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
          <div className="space-y-4 text-xs font-sans text-slate-700 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-slate-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-700" />
                <span>{t('aboutTitle')}</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {t('aboutDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-xl font-bold font-mono text-slate-950">7</div>
                <div className="text-[11px] text-slate-600 font-semibold">{t('aboutStatDomains')}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-xl font-bold font-mono text-slate-950">5</div>
                <div className="text-[11px] text-slate-600 font-semibold">{t('aboutStatLangs')}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-xl font-bold font-mono text-slate-950">100%</div>
                <div className="text-[11px] text-slate-600 font-semibold">{t('aboutStatMemory')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Button */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-6 py-2 rounded-full btn-quantix-secondary text-xs font-semibold"
          >
            {t('closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
