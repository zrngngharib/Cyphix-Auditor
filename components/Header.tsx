'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ChevronDown,
  Check,
  BookOpen,
  Info,
  Download,
  HardDrive,
  Home,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { LANGUAGES, SupportedLanguage } from '@/lib/i18n';
import { ModelManagerModal, ModelStatus } from '@/components/ModelManagerModal';
import { AboutDocsModal } from '@/components/AboutDocsModal';

export const Header: React.FC = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [aboutDocsModal, setAboutDocsModal] = useState<{
    isOpen: boolean;
    type: 'about' | 'docs';
  }>({
    isOpen: false,
    type: 'docs',
  });
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchModelStatus = async () => {
    try {
      const res = await fetch('/api/model/status');
      if (res.ok) {
        const data: ModelStatus = await res.json();
        setModelStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch model status in header:', err);
    }
  };

  useEffect(() => {
    fetchModelStatus();
    const interval = setInterval(fetchModelStatus, 4000);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && langDropdownOpen) {
        setLangDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [langDropdownOpen]);

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-violet-600 text-white font-semibold text-xs rounded-full shadow-2xl focus-ring"
      >
        {t('skipToContent')}
      </a>

      {/* Simplified Clean Header (Clerk Style) */}
      <header
        role="banner"
        className="w-full sticky top-0 z-50 transition-all pt-3.5 pb-2.5 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-white/90 hover:bg-white/95 border border-slate-200/90 backdrop-blur-2xl rounded-full px-5 py-2.5 shadow-sm shadow-slate-200/40 transition-all">
          {/* 1. Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group focus-ring rounded-full">
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-base font-black tracking-tight text-slate-950 font-sans">
              Quantix <span className="text-slate-400 font-mono">//</span> Auditor
            </span>
          </Link>

          {/* 2. Documentation & About Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden sm:flex items-center gap-1.5"
          >
            <Link
              href="/"
              className="min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors flex items-center gap-1.5 focus-ring"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>{t('navHome')}</span>
            </Link>

            <Link
              href="/docs"
              className="min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors flex items-center gap-1.5 focus-ring"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>{t('navDocs')}</span>
            </Link>

            <button
              type="button"
              onClick={() => setAboutDocsModal({ isOpen: true, type: 'about' })}
              className="min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors flex items-center gap-1.5 focus-ring"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>{t('navAbout')}</span>
            </button>
          </nav>

          {/* 3. Download Button & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="min-h-[38px] min-w-[38px] px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 transition-all flex items-center gap-1.5 shadow-2xs focus-ring active:scale-[0.98]"
                aria-expanded={langDropdownOpen}
                aria-haspopup="true"
                aria-label="Select Language"
              >
                <span className="text-sm" aria-hidden="true">{LANGUAGES[language].flag}</span>
                <span className="font-semibold text-xs hidden md:inline">{LANGUAGES[language].nativeName}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                    langDropdownOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {langDropdownOpen && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  aria-label="Language options"
                  className={`absolute ${
                    dir === 'rtl' ? 'left-0' : 'right-0'
                  } mt-2 w-52 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl py-1.5 z-50 divide-y divide-slate-100 animate-fade-in`}
                >
                  <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {t('languageMenuHeader')}
                  </div>

                  <div className="py-1">
                    {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((langKey) => {
                      const item = LANGUAGES[langKey];
                      const isSelected = language === langKey;
                      return (
                        <button
                          key={langKey}
                          role="menuitem"
                          type="button"
                          onClick={() => {
                            setLanguage(langKey);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full min-h-[44px] px-3.5 py-2.5 text-left rtl:text-right flex items-center justify-between text-xs transition-colors focus-ring ${
                            isSelected
                              ? 'bg-slate-900 text-white font-bold'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base" aria-hidden="true">{item.flag}</span>
                            <div>
                              <div className="font-semibold">{item.nativeName}</div>
                              <div
                                className={`text-[10px] ${
                                  isSelected ? 'text-slate-300' : 'text-slate-400'
                                }`}
                              >
                                {item.name}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Prominent Download Button (Clerk Black Pill) */}
            <button
              type="button"
              onClick={() => setIsModelModalOpen(true)}
              className="min-h-[38px] px-4 sm:px-5 py-2 rounded-full btn-quantix-primary text-xs font-bold transition-all flex items-center gap-2 focus-ring active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span>{t('navDownload')}</span>
              {modelStatus?.hasAnyReadyModel && (
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono">
                  {t('readyBadge')}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Model Manager Modal */}
      <ModelManagerModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onModelReady={fetchModelStatus}
      />

      {/* About & Docs Modal */}
      <AboutDocsModal
        isOpen={aboutDocsModal.isOpen}
        type={aboutDocsModal.type}
        onClose={() => setAboutDocsModal({ isOpen: false, type: 'docs' })}
      />
    </>
  );
};
