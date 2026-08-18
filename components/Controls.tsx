'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Cpu,
  Zap,
  HardDrive,
  Globe,
  CheckCircle2,
  Sliders,
  Download,
  Bot,
  BrainCircuit,
  Check,
  Lock,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { ModelManagerModal } from '@/components/ModelManagerModal';

export type AIProvider = 'gemini' | 'claude' | 'deepseek-cloud' | 'local';

interface ControlsProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  provider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  localModelPath: string;
  onLocalModelPathChange: (path: string) => void;
  onStartAudit: () => void;
  isLoading: boolean;
  canStart: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  apiKey,
  onApiKeyChange,
  selectedModel,
  onModelChange,
  provider,
  onProviderChange,
  localModelPath,
  onLocalModelPathChange,
  onStartAudit,
  isLoading,
  canStart,
}) => {
  const { t, dir } = useLanguage();
  const [showKey, setShowKey] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [hasAnyReadyLocalModel, setHasAnyReadyLocalModel] = useState<boolean>(true);
  const [readyLocalModelName, setReadyLocalModelName] = useState<string>('DeepSeek-R1-Distill-Qwen-7B');
  const [showAdvancedPath, setShowAdvancedPath] = useState(false);

  const checkModelsStatus = async () => {
    try {
      const res = await fetch('/api/model/status', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setHasAnyReadyLocalModel(json.hasAnyReadyModel);
        const downloadedModel = json.models?.find((m: any) => m.downloaded);
        if (downloadedModel) {
          setReadyLocalModelName(downloadedModel.name);
        }
      }
    } catch (err) {
      console.error('Failed to check models status in controls:', err);
    }
  };

  useEffect(() => {
    checkModelsStatus();
    const interval = setInterval(checkModelsStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const isAuditDisabled =
    !canStart ||
    isLoading ||
    (provider === 'local' && !hasAnyReadyLocalModel);

  const PROVIDER_OPTIONS: Array<{
    id: AIProvider;
    name: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
    defaultModel: string;
  }> = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      badge: t('providerGeminiBadge'),
      desc: 'Gemini 2.5 Flash / Pro',
      icon: <Globe className="w-5 h-5" />,
      defaultModel: 'gemini-2.5-flash',
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      badge: t('providerClaudeBadge'),
      desc: 'Claude 3.5 Sonnet',
      icon: <BrainCircuit className="w-5 h-5 text-amber-500" />,
      defaultModel: 'claude-3-5-sonnet-20241022',
    },
    {
      id: 'deepseek-cloud',
      name: 'DeepSeek Cloud',
      badge: t('providerDeepSeekBadge'),
      desc: 'DeepSeek-R1 Reasoner',
      icon: <Bot className="w-5 h-5 text-cyan-500" />,
      defaultModel: 'deepseek-reasoner',
    },
    {
      id: 'local',
      name: 'Local Offline LLM',
      badge: t('providerLocalBadge'),
      desc: '100% Private (GGUF)',
      icon: <HardDrive className="w-5 h-5 text-emerald-500" />,
      defaultModel: 'local-gguf',
    },
  ];

  return (
    <>
      <div className="quantix-panel p-6 sm:p-8 space-y-7 shadow-sm relative overflow-hidden">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs">
              <Sliders className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 font-sans">
                {t('controlsTitle')}
              </h4>
              <p className="text-xs text-slate-500 font-sans">
                {t('controlsSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-STEP 1: CHOOSE AI ENGINE (4-Card Grid) */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">1</span>
              <span>{t('step2ChooseProvider')}</span>
            </label>
            <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
              {provider === 'local' ? t('localOfflineBadge') : t('cloudApiBadge')}
            </span>
          </div>

          {/* 4 Provider Select Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROVIDER_OPTIONS.map((item) => {
              const isSelected = provider === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onProviderChange(item.id);
                    if (item.defaultModel !== 'local-gguf') {
                      onModelChange(item.defaultModel);
                    }
                  }}
                  className={`relative p-4 rounded-2xl border text-left rtl:text-right transition-all flex flex-col justify-between gap-3 focus-ring active:scale-[0.99] ${
                    isSelected
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-950/20'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-900 shadow-2xs'
                  }`}
                >
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : item.id === 'local'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Bottom Row: Title + Selected Check */}
                  <div className="space-y-0.5 w-full pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm font-sans tracking-tight">
                        {item.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                    <p
                      className={`text-[11px] font-mono truncate ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-STEP 2: ENGINE CONFIGURATION */}
        {/* ========================================================================= */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">2</span>
              <span>{t('step2ConfigureSettings')}</span>
            </label>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-4">
            {/* 1. GOOGLE GEMINI CONFIG */}
            {provider === 'gemini' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end animate-fade-in">
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="gemini-api-key-input"
                      className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('apiKeyLabel')}</span>
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1 hover:underline focus-ring rounded transition-colors"
                    >
                      <span>{t('getApiKeyLink')}</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="gemini-api-key-input"
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => onApiKeyChange(e.target.value)}
                      placeholder={t('apiKeyPlaceholder')}
                      className="w-full min-h-[46px] bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-2.5 rtl:pl-12 rtl:pr-4 ltr:pr-12 ltr:pl-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus-ring font-mono transition-all shadow-2xs"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="min-h-[42px] min-w-[42px] absolute rtl:left-1 ltr:right-1 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-slate-900 focus-ring rounded-xl transition-colors flex items-center justify-center"
                      aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-2">
                  <label
                    htmlFor="gemini-model-select"
                    className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                  >
                    <Cpu className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>{t('modelEngineLabel')}</span>
                  </label>
                  <select
                    id="gemini-model-select"
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="w-full min-h-[46px] bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus-ring transition-all cursor-pointer font-sans shadow-2xs"
                  >
                    <option value="gemini-2.5-flash">{t('modelFlash')}</option>
                    <option value="gemini-2.5-pro">{t('modelPro')}</option>
                    <option value="gemini-1.5-pro">{t('model15Pro')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2. ANTHROPIC CLAUDE CONFIG */}
            {provider === 'claude' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end animate-fade-in">
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="claude-api-key-input"
                      className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('claudeApiKeyLabel')}</span>
                    </label>
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1 hover:underline focus-ring rounded transition-colors"
                    >
                      <span>{t('getClaudeKeyLink')}</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="claude-api-key-input"
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => onApiKeyChange(e.target.value)}
                      placeholder={t('claudeApiKeyPlaceholder')}
                      className="w-full min-h-[46px] bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-2.5 rtl:pl-12 rtl:pr-4 ltr:pr-12 ltr:pl-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus-ring font-mono transition-all shadow-2xs"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="min-h-[42px] min-w-[42px] absolute rtl:left-1 ltr:right-1 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-slate-900 focus-ring rounded-xl transition-colors flex items-center justify-center"
                      aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-2">
                  <label
                    htmlFor="claude-model-select"
                    className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    <span>{t('modelEngineLabel')}</span>
                  </label>
                  <select
                    id="claude-model-select"
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="w-full min-h-[46px] bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus-ring transition-all cursor-pointer font-sans shadow-2xs"
                  >
                    <option value="claude-3-5-sonnet-20241022">{t('claudeSonnet')}</option>
                    <option value="claude-3-5-haiku-20241022">{t('claudeHaiku')}</option>
                    <option value="claude-3-opus-20240229">{t('claudeOpus')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* 3. DEEPSEEK CLOUD CONFIG */}
            {provider === 'deepseek-cloud' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end animate-fade-in">
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="deepseek-api-key-input"
                      className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('deepseekApiKeyLabel')}</span>
                    </label>
                    <a
                      href="https://platform.deepseek.com/api_keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1 hover:underline focus-ring rounded transition-colors"
                    >
                      <span>{t('getDeepSeekKeyLink')}</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="deepseek-api-key-input"
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => onApiKeyChange(e.target.value)}
                      placeholder={t('deepseekApiKeyPlaceholder')}
                      className="w-full min-h-[46px] bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-2.5 rtl:pl-12 rtl:pr-4 ltr:pr-12 ltr:pl-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus-ring font-mono transition-all shadow-2xs"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="min-h-[42px] min-w-[42px] absolute rtl:left-1 ltr:right-1 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-slate-900 focus-ring rounded-xl transition-colors flex items-center justify-center"
                      aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-2">
                  <label
                    htmlFor="deepseek-model-select"
                    className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5 text-cyan-600" aria-hidden="true" />
                    <span>{t('modelEngineLabel')}</span>
                  </label>
                  <select
                    id="deepseek-model-select"
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="w-full min-h-[46px] bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus-ring transition-all cursor-pointer font-sans shadow-2xs"
                  >
                    <option value="deepseek-reasoner">{t('deepseekReasoner')}</option>
                    <option value="deepseek-chat">{t('deepseekChat')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* 4. LOCAL OFFLINE LLM (GGUF Hub) */}
            {provider === 'local' && (
              <div className="space-y-4 animate-fade-in">
                {/* Active Local Model Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-950 font-sans">
                          {t('activeModelLabel')}
                        </span>
                        {hasAnyReadyLocalModel ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{t('modelReadyBadge')}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-mono font-bold border border-amber-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>{t('modelMissingBadge')}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-700">
                        {hasAnyReadyLocalModel ? readyLocalModelName : t('modelMissingHelp')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsModelModalOpen(true)}
                    className="min-h-[42px] px-5 py-2 rounded-full btn-quantix-primary text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 focus-ring shadow-2xs active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>{t('manageLocalModelsBtn')}</span>
                  </button>
                </div>

                {/* Privacy Badge & Advanced Custom Path Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-sans text-[11px] font-medium">{t('localOfflineBadge')}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvancedPath(!showAdvancedPath)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>{t('advancedPathToggle')}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedPath ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showAdvancedPath && (
                  <div className="pt-2 animate-fade-in space-y-1.5">
                    <label
                      htmlFor="local-model-path-input"
                      className="text-[11px] font-semibold text-slate-700 font-sans"
                    >
                      {t('localModelPathLabel')}
                    </label>
                    <input
                      id="local-model-path-input"
                      type="text"
                      value={localModelPath}
                      onChange={(e) => onLocalModelPathChange(e.target.value)}
                      placeholder={t('localModelPathPlaceholder')}
                      className="w-full min-h-[42px] bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus-ring font-mono transition-all"
                      spellCheck="false"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-STEP 3: LAUNCH AUDIT BUTTON */}
        {/* ========================================================================= */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => {
              if (provider === 'local' && !hasAnyReadyLocalModel) {
                setIsModelModalOpen(true);
                return;
              }
              onStartAudit();
            }}
            disabled={isAuditDisabled && !(provider === 'local' && !hasAnyReadyLocalModel)}
            aria-busy={isLoading}
            aria-disabled={isAuditDisabled}
            className={`w-full min-h-[54px] py-3.5 px-6 rounded-full font-bold font-sans text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm focus-ring ${
              isLoading
                ? 'btn-quantix-primary opacity-90 cursor-wait'
                : provider === 'local' && !hasAnyReadyLocalModel
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm active:scale-[0.99]'
                : !canStart
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'btn-quantix-primary active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                <span>{t('auditingBtn')}</span>
              </>
            ) : provider === 'local' && !hasAnyReadyLocalModel ? (
              <>
                <Download className="w-5 h-5 text-slate-950" aria-hidden="true" />
                <span>{t('mustDownloadLocalFirst')}</span>
              </>
            ) : !canStart ? (
              <>
                <AlertCircle className="w-5 h-5 text-slate-400" aria-hidden="true" />
                <span>{t('uploadFirstNotice')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
                <span>{t('startAuditBtn')}</span>
                <Zap className="w-4 h-4 text-amber-300 ml-1 rtl:mr-1 rtl:ml-0" aria-hidden="true" />
              </>
            )}
          </button>

          {/* Engine Helper Micro-copy */}
          {canStart && !isLoading && (
            <p className="text-center text-[11px] text-slate-500 font-sans">
              <span>{t('readyToAuditWith')} </span>
              <strong className="font-mono text-slate-800">
                {provider === 'local'
                  ? `Offline (${readyLocalModelName || 'GGUF'})`
                  : provider === 'gemini'
                  ? 'Google Gemini 2.5 Flash'
                  : provider === 'claude'
                  ? 'Claude 3.5 Sonnet'
                  : 'DeepSeek-R1 Reasoner'}
              </strong>
            </p>
          )}
        </div>
      </div>

      {/* Model Manager Pop-up Modal */}
      <ModelManagerModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onModelReady={checkModelsStatus}
        onSelectModelPath={(path) => onLocalModelPathChange(path)}
      />
    </>
  );
};
