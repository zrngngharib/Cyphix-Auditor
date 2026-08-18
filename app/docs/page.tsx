'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  Shield,
  Layers,
  Zap,
  HardDrive,
  Lock,
  Globe2,
  CheckCircle2,
  Terminal,
  Activity,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  HelpCircle,
  Download,
  Cpu,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { LANGUAGES, SupportedLanguage } from '@/lib/i18n';
import { DOCS_CONTENT } from '@/lib/docsContent';
import { ModelManagerModal } from '@/components/ModelManagerModal';

export default function DocsPage() {
  const { language, setLanguage, dir, t } = useLanguage();
  const router = useRouter();
  const doc = DOCS_CONTENT[language] || DOCS_CONTENT.ckb;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [apiCodeTab, setApiCodeTab] = useState<'curl' | 'ts' | 'python'>('curl');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId((current) => (current === id ? null : current));
    }, 2000);
  };

  // Sync document title and description dynamically on client
  useEffect(() => {
    if (doc) {
      document.title = `${doc.heroTitle} — Quantix Docs`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', doc.heroSubtitle || doc.heroTitle);
    }
  }, [doc]);

  // Nav menu items — declared before useEffect so it's available in the dependency array
  const menuItems = useMemo(
    () => [
      { id: 'intro', label: doc.sec1.title, icon: Layers },
      { id: 'quickstart', label: doc.sec2.title, icon: Zap },
      { id: 'offline-llm', label: doc.sec3.title, icon: HardDrive },
      { id: 'cloud-engines', label: doc.sec4.title, icon: Cloud },
      { id: 'seven-domains', label: doc.sec5.title, icon: Shield },
      { id: 'api-reference', label: doc.sec6.title, icon: Terminal },
      { id: 'security-compliance', label: doc.sec7.title, icon: Lock },
      { id: 'faq', label: doc.sec8.title, icon: HelpCircle },
    ],
    [doc]
  );

  // Track active section on scroll — derived from menuItems (single source of truth)
  useEffect(() => {
    const handleScroll = () => {
      for (const item of menuItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    return menuItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, menuItems]);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

      // Update URL hash so sections are bookmarkable and linkable
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `#${id}`);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#fafafc] text-slate-900 font-sans">
      {/* Clerk Style Tech Circuit Background Grid */}
      <div className="fixed inset-0 clerk-circuit-grid pointer-events-none z-0 opacity-70" />

      {/* Top Navigation Bar (Clerk Clean Style) */}
      <header
        role="banner"
        className="w-full sticky top-0 z-50 transition-all pt-3.5 pb-2.5 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-white/90 hover:bg-white/95 border border-slate-200/90 backdrop-blur-2xl rounded-full px-5 py-2.5 shadow-sm shadow-slate-200/40 transition-all">
          {/* Brand & Back Link */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus-ring rounded-full"
            >
              <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-950 font-sans">
                Quantix <span className="text-slate-400 font-mono">//</span> Docs
              </span>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all"
            >
              <ArrowLeft
                className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`}
              />
              <span>{doc.navBack}</span>
            </Link>
          </div>

          {/* Quick Actions & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 transition-all flex items-center gap-1.5 shadow-2xs focus-ring active:scale-[0.98]"
                aria-expanded={langDropdownOpen}
                aria-haspopup="true"
                aria-label="Select Language"
              >
                <span className="text-sm" aria-hidden="true">
                  {LANGUAGES[language].flag}
                </span>
                <span className="font-semibold text-xs hidden md:inline">
                  {LANGUAGES[language].nativeName}
                </span>
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
                  className={`absolute ${
                    dir === 'rtl' ? 'left-0' : 'right-0'
                  } mt-2 min-w-[208px] max-w-[280px] w-max rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl py-1.5 z-50 divide-y divide-slate-100 animate-fade-in`}
                >
                  <div className="px-3.5 py-1.5 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    {t('languageMenuHeader')}
                  </div>

                  <div className="py-1">
                    {(Object.keys(LANGUAGES) as SupportedLanguage[]).map(
                      (langKey) => {
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
                              <span className="text-base" aria-hidden="true">
                                {item.flag}
                              </span>
                              <div>
                                <div className="font-semibold">
                                  {item.nativeName}
                                </div>
                                <div
                                  className={`text-[11px] ${
                                    isSelected
                                      ? 'text-slate-300'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {item.name}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <Check
                                className="w-4 h-4 text-white shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Model Manager Button */}
            <button
              type="button"
              onClick={() => setIsModelModalOpen(true)}
              className="min-h-[38px] px-3.5 sm:px-4 py-1.5 rounded-full btn-quantix-primary text-xs font-bold transition-all flex items-center gap-2 focus-ring active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span className="hidden sm:inline">
                {DOCS_CONTENT[language]?.pillars.local || 'GGUF Models'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Documentation Wrapper */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 flex-1">
        {/* Master Hero Banner */}
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-4 pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-slate-700" />
            <span>{doc.badge}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight font-sans">
              {doc.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto font-sans">
              {doc.heroSubtitle}
            </p>
          </div>

          {/* Quick Pillars Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto text-xs font-sans">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center gap-2 text-slate-700">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{doc.pillars.ram}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center gap-2 text-slate-700">
              <HardDrive className="w-4 h-4 text-slate-700 shrink-0" />
              <span className="font-semibold">{doc.pillars.local}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center gap-2 text-slate-700">
              <Shield className="w-4 h-4 text-slate-700 shrink-0" />
              <span className="font-semibold">{doc.pillars.matrix}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center gap-2 text-slate-700">
              <Globe2 className="w-4 h-4 text-slate-700 shrink-0" />
              <span className="font-semibold">{doc.pillars.langs}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Documentation Layout (Sidebar + Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-4 xl:col-span-3 sticky top-20 z-20 space-y-4">
            <div className="quantix-panel p-4 sm:p-5 space-y-4 shadow-sm">
              {/* Search in Docs */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute top-3 left-3.5 rtl:left-auto rtl:right-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={doc.searchPlaceholder}
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus-ring font-sans"
                />
              </div>

              {/* Table of Contents Header */}
              <div className="flex items-center justify-between px-1 pt-1 pb-2 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>{doc.tableOfContents}</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  v2.0.0
                </span>
              </div>

              {/* Navigation Items List */}
              <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {filteredMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollTo(item.id)}
                      className={`w-full min-h-[40px] px-3.5 py-2.5 rounded-xl text-xs font-medium text-left rtl:text-right flex items-center justify-between transition-all duration-150 focus-ring ${
                        isActive
                          ? 'bg-slate-900 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-500'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 opacity-50 ${
                          dir === 'rtl' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>

              {/* Quick Action Return to Audit */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href="/"
                  className="w-full min-h-[38px] px-4 py-2 rounded-xl btn-quantix-secondary text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft
                    className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`}
                  />
                  <span>{doc.navBack}</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-10">
            {/* ========================================================================= */}
            {/* SECTION 1: System Overview & Architecture */}
            {/* ========================================================================= */}
            <section
              id="intro"
              className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-24"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    {doc.sec1.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    {doc.sec1.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                <p>{doc.sec1.desc1}</p>

                {/* Architecture Visual Diagram Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 my-4 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-800 font-bold border-b border-slate-200 pb-2">
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-600" />
                      <span>{doc.sec1.pipelineTitle}</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 font-sans">
                      {doc.sec1.pipelineBadge}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center font-sans">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="text-slate-950 font-bold text-xs sm:text-sm">{doc.sec1.p1.title}</div>
                      <div className="text-xs text-slate-600">{doc.sec1.p1.sub}</div>
                      <div className="text-[11px] text-slate-500">{doc.sec1.p1.note}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="text-slate-950 font-bold text-xs sm:text-sm">{doc.sec1.p2.title}</div>
                      <div className="text-xs text-slate-600">{doc.sec1.p2.sub}</div>
                      <div className="text-[11px] text-slate-500">{doc.sec1.p2.note}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="text-slate-950 font-bold text-xs sm:text-sm">{doc.sec1.p3.title}</div>
                      <div className="text-xs text-slate-600">{doc.sec1.p3.sub}</div>
                      <div className="text-[11px] text-slate-500">{doc.sec1.p3.note}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="text-slate-950 font-bold text-xs sm:text-sm">{doc.sec1.p4.title}</div>
                      <div className="text-xs text-slate-600">{doc.sec1.p4.sub}</div>
                      <div className="text-[11px] text-slate-500">{doc.sec1.p4.note}</div>
                    </div>
                  </div>
                </div>

                {/* Key Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-bold text-slate-950 text-xs sm:text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>{doc.sec1.pillar1Title}</span>
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {doc.sec1.pillar1Desc}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-bold text-slate-950 text-xs sm:text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-700" />
                      <span>{doc.sec1.pillar2Title}</span>
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {doc.sec1.pillar2Desc}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 2: Step-by-Step Quickstart Guide */}
            {/* ========================================================================= */}
            <section
              id="quickstart"
              className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-24"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    {doc.sec2.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    {doc.sec2.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {doc.sec2.steps.map((item) => (
                  <div
                    key={item.step}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-950 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {item.step}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-950 font-sans">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans pl-10 rtl:pl-0 rtl:pr-10">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 3: Offline Local LLM (GGUF & node-llama-cpp) */}
            {/* ========================================================================= */}
            <section
              id="offline-llm"
              className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-24"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    {doc.sec3.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    {doc.sec3.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                <p>{doc.sec3.desc}</p>

                {/* Hardware Spec Notice Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/60 border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-950 text-xs sm:text-sm flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-slate-700" />
                    <span>{doc.sec3.hardwareTitle}</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doc.sec3.hardwareDesc}
                  </p>
                </div>

                {/* Supported Models Comprehensive Hardware Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-2xs">
                  <table className="w-full text-left rtl:text-right text-xs font-sans">
                    <thead className="bg-slate-50/90 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="p-3.5">{doc.sec3.thModel}</th>
                        <th className="p-3.5">{doc.sec3.thSize}</th>
                        <th className="p-3.5">{doc.sec3.thRamMin}</th>
                        <th className="p-3.5">{doc.sec3.thRamRec}</th>
                        <th className="p-3.5">{doc.sec3.thCpu}</th>
                        <th className="p-3.5">{doc.sec3.thStrength}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {doc.sec3.models.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-950 font-sans">{m.name}</div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">{m.filename} • {m.quant}</div>
                            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {m.statusBadge}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-semibold text-slate-800">{m.size}</td>
                          <td className="p-3.5 font-mono text-amber-800 font-semibold">{m.minRam}</td>
                          <td className="p-3.5 font-mono text-emerald-700 font-bold">{m.recRam}</td>
                          <td className="p-3.5 text-slate-800 font-medium">{m.cpuSpec}</td>
                          <td className="p-3.5 text-xs text-slate-600 leading-relaxed min-w-[200px]">{m.strength}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Model Download Instructions */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                  <h4 className="font-bold text-slate-950 text-xs sm:text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-700" />
                    <span>{doc.sec3.installTitle}</span>
                  </h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="font-medium text-slate-800">{doc.sec3.method1}</p>
                    <p className="text-slate-600">{doc.sec3.method2}</p>
                  </div>

                  {/* Code snippet */}
                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-[11px] overflow-x-auto">
                      <code>
                        huggingface-cli download Qwen/Qwen2.5-Coder-7B-Instruct-GGUF \{"\n"}
                        {"  "}qwen2.5-coder-7b-instruct-q4_k_m.gguf \{"\n"}
                        {"  "}--local-dir ./models
                      </code>
                    </pre>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `huggingface-cli download Qwen/Qwen2.5-Coder-7B-Instruct-GGUF qwen2.5-coder-7b-instruct-q4_k_m.gguf --local-dir ./models`,
                          'hf-cli'
                        )
                      }
                      className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1 font-sans"
                    >
                      {copiedCodeId === 'hf-cli' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{doc.copiedCode}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{doc.copyCode}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 4: Cloud AI Providers Setup */}
            {/* ========================================================================= */}
            <section
              id="cloud-engines"
              className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-24"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    {doc.sec4.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    {doc.sec4.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                <p>{doc.sec4.desc}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {doc.sec4.engines.map((engine, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-950 text-sm sm:text-base font-sans">
                            {engine.name}
                          </span>
                          <span className="text-[10px] text-slate-800 font-mono font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            {engine.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {engine.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Context Window:</span>
                          <span className="font-mono font-bold text-slate-900">{engine.contextWindow}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>ENV Key:</span>
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{engine.keyEnv}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 mt-1">
                          ✦ {engine.recommendedFor}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Env file setup */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 mt-4">
                  <h4 className="font-bold text-slate-950 text-xs sm:text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-700" />
                    <span>{doc.sec4.envTitle}</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {doc.sec4.envDesc}
                  </p>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-[11px] overflow-x-auto">
                    <code>
                      GEMINI_API_KEY=your_gemini_api_key_here{"\n"}
                      ANTHROPIC_API_KEY=your_anthropic_api_key_here{"\n"}
                      DEEPSEEK_API_KEY=your_deepseek_api_key_here
                    </code>
                  </pre>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 5: Deep Dive: 7-Dimensional Audit Matrix */}
            {/* ========================================================================= */}
            <section
              id="seven-domains"
              className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-24"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    {doc.sec5.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    {doc.sec5.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                <p>{doc.sec5.desc}</p>

                <div className="space-y-3.5">
                  {doc.sec5.domains.map((domain, idx) => (
                    <div
                      key={idx}
                      className={`p-4.5 rounded-2xl border space-y-2 ${
                        domain.isCritical
                          ? 'bg-red-50/70 border-red-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold ${
                            domain.isCritical
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {domain.number}
                        </span>
                        <h4
                          className={`font-bold text-sm ${
                            domain.isCritical ? 'text-red-950' : 'text-slate-950'
                          }`}
                        >
                          {domain.title}
                        </h4>
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          domain.isCritical
                            ? 'text-red-800'
                            : 'text-slate-600'
                        }`}
                      >
                        {domain.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 6: API & SDK Specification */}
            {/* ========================================================================= */}
            <section
              id="api-reference"
              className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-24"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    {doc.sec6.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    {doc.sec6.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                <p>{doc.sec6.desc}</p>

                {/* Endpoint Badge */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold">
                      POST
                    </span>
                    <span className="text-slate-900 font-bold">/api/audit</span>
                  </div>
                  <span className="text-slate-500 text-[11px] font-sans">
                    {doc.sec6.endpointPost}
                  </span>
                </div>

                {/* Code Tabs */}
                <div className="rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setApiCodeTab('curl')}
                        className={`px-3 py-1 rounded-lg transition-colors font-mono font-bold ${
                          apiCodeTab === 'curl'
                            ? 'bg-white text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        cURL
                      </button>
                      <button
                        type="button"
                        onClick={() => setApiCodeTab('ts')}
                        className={`px-3 py-1 rounded-lg transition-colors font-mono font-bold ${
                          apiCodeTab === 'ts'
                            ? 'bg-white text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        TypeScript / Next.js
                      </button>
                      <button
                        type="button"
                        onClick={() => setApiCodeTab('python')}
                        className={`px-3 py-1 rounded-lg transition-colors font-mono font-bold ${
                          apiCodeTab === 'python'
                            ? 'bg-white text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Python
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const snippet =
                          apiCodeTab === 'curl'
                            ? `curl -X POST https://your-quantix-instance/api/audit \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "codebase": "// File: app.ts\\nconsole.log(\\"Hello\\");",\n    "provider": "gemini",\n    "modelName": "gemini-2.5-flash",\n    "language": "${language}"\n  }'`
                            : apiCodeTab === 'ts'
                            ? `const response = await fetch('/api/audit', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    codebase: concatenatedSourceCode,\n    provider: 'gemini',\n    modelName: 'gemini-2.5-flash',\n    language: '${language}',\n  }),\n});\nconst data = await response.json();\nconsole.log(data.report);`
                            : `import requests\n\npayload = {\n    "codebase": "# Source files\\nprint('Audited')",\n    "provider": "gemini",\n    "modelName": "gemini-2.5-flash",\n    "language": "${language}"\n}\nres = requests.post("http://localhost:3000/api/audit", json=payload)\nprint(res.json()["report"])`;
                        copyToClipboard(snippet, `api-${apiCodeTab}`);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1 font-sans"
                    >
                      {copiedCodeId === `api-${apiCodeTab}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{doc.copiedCode}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{doc.copyCode}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto">
                    {apiCodeTab === 'curl' && (
                      <code>
                        curl -X POST https://your-quantix-instance/api/audit \{"\n"}
                        {"  "}-H &quot;Content-Type: application/json&quot; \{"\n"}
                        {"  "}-d &apos;{"{\n"}
                        {"    "}&quot;codebase&quot;: &quot;// File: app.ts\nconsole.log(\\&quot;Hello\\&quot;);&quot;,{"\n"}
                        {"    "}&quot;provider&quot;: &quot;gemini&quot;,{"\n"}
                        {"    "}&quot;modelName&quot;: &quot;gemini-2.5-flash&quot;,{"\n"}
                        {"    "}&quot;language&quot;: &quot;{language}&quot;{"\n"}
                        {"  "}&#125;&apos;
                      </code>
                    )}

                    {apiCodeTab === 'ts' && (
                      <code>
                        const response = await fetch(&apos;/api/audit&apos;, {"{\n"}
                        {"  "}method: &apos;POST&apos;,{"\n"}
                        {"  "}headers: &#123; &apos;Content-Type&apos;: &apos;application/json&apos; &#125;,{"\n"}
                        {"  "}body: JSON.stringify(&#123;{"\n"}
                        {"    "}codebase: concatenatedSourceCode,{"\n"}
                        {"    "}provider: &apos;gemini&apos;, // or &apos;local&apos;{"\n"}
                        {"    "}modelName: &apos;gemini-2.5-flash&apos;,{"\n"}
                        {"    "}language: &apos;{language}&apos;,{"\n"}
                        {"  "}&#125;),{"\n"}
                        &#125;);{"\n"}
                        const data = await response.json();{"\n"}
                        console.log(data.report); // Markdown Report
                      </code>
                    )}

                    {apiCodeTab === 'python' && (
                      <code>
                        import requests{"\n\n"}
                        payload = &#123;{"\n"}
                        {"    "}&quot;codebase&quot;: &quot;# Python project\nprint(&apos;Secure&apos;)&quot;,{"\n"}
                        {"    "}&quot;provider&quot;: &quot;gemini&quot;,{"\n"}
                        {"    "}&quot;modelName&quot;: &quot;gemini-2.5-flash&quot;,{"\n"}
                        {"    "}&quot;language&quot;: &quot;{language}&quot;{"\n"}
                        &#125;{"\n\n"}
                        res = requests.post(&quot;http://localhost:3000/api/audit&quot;, json=payload){"\n"}
                        print(res.json()[&quot;report&quot;])
                      </code>
                    )}
                  </pre>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 7: Air-Gapped Security & Compliance */}
            {/* ========================================================================= */}
            <section
              id="security-compliance"
              className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-24"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    {doc.sec7.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    {doc.sec7.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                <p>{doc.sec7.desc}</p>

                <ul className="space-y-2.5 list-none p-0">
                  {doc.sec7.points.map((rule, idx) => (
                    <li
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-950">{rule.title} </strong>
                        {rule.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 8: Troubleshooting & FAQ */}
            {/* ========================================================================= */}
            <section
              id="faq"
              className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-24"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    {doc.sec8.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    {doc.sec8.subtitle}
                  </p>
                </div>
              </div>

              {/* Accordion FAQ Items */}
              <div className="space-y-3">
                {doc.sec8.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 text-left rtl:text-right flex items-center justify-between text-xs sm:text-sm font-bold text-slate-950 hover:text-slate-700 transition-colors focus-ring"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] flex items-center justify-center shrink-0">
                          ?
                        </span>
                        <span>{faq.q}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          openFaq[idx] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {openFaq[idx] && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed font-sans border-t border-slate-200/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Model Manager Modal instance */}
      <ModelManagerModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
      />

      {/* Clerk Clean Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900">
              {t('footerTitle')}
            </span>
          </div>
          <div>{t('footerSub')}</div>
        </div>
      </footer>
    </div>
  );
}
