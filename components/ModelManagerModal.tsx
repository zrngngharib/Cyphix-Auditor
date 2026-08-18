'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  HardDrive,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Cpu,
  RefreshCw,
  FolderOpen,
  Check,
  ArrowRight,
  ExternalLink,
  Copy,
  StopCircle,
  Clock,
  Gauge,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export interface ModelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelReady?: () => void;
  onSelectModelPath?: (path: string) => void;
}

export interface ModelItemStatus {
  id: string;
  name: string;
  desc: string;
  badge: string;
  recommended: boolean;
  expectedBytes: number;
  expectedFormatted: string;
  downloaded: boolean;
  sizeBytes: number;
  sizeFormatted: string;
  actualFileName: string;
  filePath: string;
  isDownloading: boolean;
  downloadedBytes: number;
  downloadedFormatted: string;
  downloadProgress: number;
  speedFormatted?: string;
  etaFormatted?: string;
  errorMessage?: string | null;
  directUrl?: string;
}

export interface MultiModelStatusResponse {
  success: boolean;
  hasAnyReadyModel: boolean;
  activeModelId: string;
  activeModelPath: string;
  models: ModelItemStatus[];
}

export type ModelStatus = MultiModelStatusResponse;

const MODEL_DESCRIPTIONS: Record<string, Record<string, string>> = {
  'deepseek-r1-7b': {
    ckb: 'قووڵترین لۆژیک و شیکاری سایبەری (Deep Reasoning & Security)',
    badini: 'کوورترین لۆژیک و شیکاریا سایبەری (Deep Reasoning & Security)',
    en: 'Deep reasoning & cybersecurity vulnerability discovery',
    ar: 'تفكير استنتاجي عميق واكتشاف الثغرات الأمنية',
    fa: 'استدلال منطقی عمیق و کشف آسیب‌پذیری‌های سایبری',
  },
  'qwen-coder-7b': {
    ckb: 'زۆر بەهێز بۆ ئەندازیاری کۆد و ڕێکوپێکی (Code Architecture & Speed)',
    badini: 'گەلەک ب هێز بۆ ئەندازیاریا کۆدی و ڕێکخستنێ',
    en: 'Optimized for high-speed code architecture and refactoring',
    ar: 'فائق القوة في هندسة البرمجيات وسرعة المعالجة',
    fa: 'فوق‌العاده قدرتمند برای مهندسی و بازنویسی سورس‌کد',
  },
  'llama-3.2-3b': {
    ckb: 'مۆدێلی سووک بۆ ئەو کۆمپیوتەرانەی ڕامیان کەمە (Ultra-Lightweight for 8GB RAM)',
    badini: 'مۆدێلا سڤک بۆ وان کۆمپیوتەرێن ڕام کێم',
    en: 'Ultra-lightweight model ideal for systems with 8GB RAM',
    ar: 'نموذج خفيف جداً ومثالي للأجهزة ذات الذاكرة المحدودة',
    fa: 'مدل فوق‌العاده سبک و بهینه برای سیستم‌های با رم ۸ گیگابایت',
  },
};

const MODEL_BADGES: Record<string, Record<string, string>> = {
  'deepseek-r1-7b': {
    ckb: 'پێشنیارکراو',
    badini: 'پێشنیارکری',
    en: 'Recommended',
    ar: 'موصى به',
    fa: 'پیشنهادی',
  },
  'qwen-coder-7b': {
    ckb: 'خێرایی باڵا',
    badini: 'لەزاتییا بلند',
    en: 'High Speed',
    ar: 'سرعة فائقة',
    fa: 'سرعت بالا',
  },
  'llama-3.2-3b': {
    ckb: 'سووک و خێرا',
    badini: 'سڤک و ب لەز',
    en: 'Lightweight',
    ar: 'خفيف وسريع',
    fa: 'سبک و روان',
  },
};

export const ModelManagerModal: React.FC<ModelManagerModalProps> = ({
  isOpen,
  onClose,
  onModelReady,
  onSelectModelPath,
}) => {
  const { t, language, dir } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<MultiModelStatusResponse | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});
  const [cancellingIds, setCancellingIds] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedActiveId, setSelectedActiveId] = useState<string>('deepseek-r1-7b');
  const [copiedUrlModelId, setCopiedUrlModelId] = useState<string | null>(null);
  const [showDirectLinks, setShowDirectLinks] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/model/status', { cache: 'no-store' });
      if (res.ok) {
        const json: MultiModelStatusResponse = await res.json();
        setData(json);
        if (json.hasAnyReadyModel && onModelReady) {
          onModelReady();
        }
      }
    } catch (err) {
      console.error('Failed to fetch models status:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchStatus();
    // Poll faster (every 1.5s) to update download progress & speed smoothly
    const interval = setInterval(fetchStatus, 1500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleStartDownload = async (modelKey: string, action: 'start' | 'retry' = 'start') => {
    setDownloadingIds((prev) => ({ ...prev, [modelKey]: true }));
    setErrorMessage(null);

    try {
      const res = await fetch('/api/model/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelKey, action }),
      });

      const contentType = res.headers.get('content-type');
      let json: any = {};
      if (contentType && contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(`Server response (${res.status}): ${text.slice(0, 150)}`);
        }
      }

      if (!res.ok) {
        throw new Error(json.error || 'Failed to initiate download');
      }

      await fetchStatus();
    } catch (err: any) {
      console.error('Download error:', err);
      setErrorMessage(err.message || 'Failed to start download');
    } finally {
      setDownloadingIds((prev) => ({ ...prev, [modelKey]: false }));
    }
  };

  const handleCancelDownload = async (modelKey: string) => {
    setCancellingIds((prev) => ({ ...prev, [modelKey]: true }));
    try {
      const res = await fetch('/api/model/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelKey, action: 'cancel' }),
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err: any) {
      console.error('Cancel error:', err);
    } finally {
      setCancellingIds((prev) => ({ ...prev, [modelKey]: false }));
    }
  };

  const handleCopyDirectUrl = (url: string, modelId: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrlModelId(modelId);
      setTimeout(() => setCopiedUrlModelId(null), 3000);
    });
  };

  const handleSelectModel = (model: ModelItemStatus) => {
    setSelectedActiveId(model.id);
    if (onSelectModelPath) {
      onSelectModelPath(model.filePath);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-manager-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
    >
      {/* Frosted Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card (Clerk Clean White) */}
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl z-10 space-y-6"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-sm shrink-0">
              <HardDrive className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="model-manager-title"
                className="text-base sm:text-lg font-bold text-slate-950 font-sans"
              >
                {t('modelManagerTitle')}
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                {t('modelManagerSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchStatus}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 border border-slate-200 transition-colors focus-ring"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] rounded-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 border border-slate-200 transition-colors flex items-center justify-center focus-ring"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <span className="font-bold">{t('downloadErrorNotice')}</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 3 Model Cards List */}
        <div className="space-y-4">
          {data?.models.map((model) => {
            const isStarting = Boolean(downloadingIds[model.id]);
            const isCancelling = Boolean(cancellingIds[model.id]);
            const isDownloading = model.isDownloading || isStarting;
            const isSelectedActive = selectedActiveId === model.id;
            const hasError = Boolean(model.errorMessage);
            const localizedDesc =
              MODEL_DESCRIPTIONS[model.id]?.[language] ||
              MODEL_DESCRIPTIONS[model.id]?.en ||
              model.desc;
            const localizedBadge =
              MODEL_BADGES[model.id]?.[language] ||
              MODEL_BADGES[model.id]?.en ||
              model.badge;

            return (
              <div
                key={model.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  model.downloaded
                    ? 'bg-slate-50/80 border-slate-200 shadow-2xs'
                    : isDownloading
                    ? 'bg-slate-50 border-slate-300 shadow-2xs ring-1 ring-slate-300'
                    : hasError
                    ? 'bg-red-50/40 border-red-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                {/* Top Row: Title, Badge, Size */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                        {model.name}
                      </span>
                      {model.recommended && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
                          {localizedBadge}
                        </span>
                      )}
                      {model.downloaded && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t('modelReadyBadge')}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-sans">
                      {localizedDesc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <span className="text-xs font-mono font-bold bg-white text-slate-700 px-3 py-1 rounded-xl border border-slate-200">
                      {model.downloaded ? model.sizeFormatted : model.expectedFormatted}
                    </span>
                  </div>
                </div>

                {/* Specific Model Error Message */}
                {hasError && !model.downloaded && !isDownloading && (
                  <div className="p-3 rounded-xl bg-red-100/70 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2">
                    <span className="truncate">
                      <strong>{t('downloadErrorNotice')}</strong> {model.errorMessage}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartDownload(model.id, 'retry')}
                      className="px-3 py-1 rounded-lg bg-red-700 text-white text-[11px] font-bold hover:bg-red-800 shrink-0 transition-colors"
                    >
                      {t('retryDownloadBtn')}
                    </button>
                  </div>
                )}

                {/* Progress Bar & Live Stats if Downloading */}
                {isDownloading && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-slate-700 animate-spin" />
                        <span>{t('downloadingBackground')}</span>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[11px] text-slate-700">
                        {model.speedFormatted && (
                          <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            <Gauge className="w-3 h-3 text-slate-500" />
                            <span>{model.speedFormatted}</span>
                          </span>
                        )}
                        {model.etaFormatted && (
                          <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{model.etaFormatted}</span>
                          </span>
                        )}
                        <span className="font-bold text-slate-950">
                          {model.downloadProgress}% ({model.downloadedFormatted} / {model.expectedFormatted})
                        </span>
                      </div>
                    </div>

                    <div
                      className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 shadow-inner"
                      role="progressbar"
                      aria-valuenow={model.downloadProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="bg-slate-950 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, model.downloadProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 font-mono truncate max-w-sm">
                    {model.downloaded ? `📁 ${model.actualFileName}` : t('quantizedBadge')}
                  </div>

                  <div className="flex items-center gap-2">
                    {isDownloading ? (
                      <button
                        type="button"
                        onClick={() => handleCancelDownload(model.id)}
                        disabled={isCancelling}
                        className="min-h-[38px] px-4 py-1.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-colors flex items-center gap-1.5 focus-ring"
                      >
                        <StopCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>{t('cancelDownloadBtn')}</span>
                      </button>
                    ) : model.downloaded ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSelectModel(model)}
                          className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 focus-ring ${
                            isSelectedActive
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-800'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isSelectedActive ? t('activeModelSelectedBtn') : t('selectActiveModelBtn')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartDownload(model.id)}
                          disabled={isDownloading}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
                          title="Re-download this model"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{t('reDownloadBtn')}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartDownload(model.id)}
                        disabled={isDownloading}
                        className="min-h-[38px] px-5 py-2 rounded-full btn-quantix-primary text-xs font-bold transition-all flex items-center gap-2 focus-ring active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" />
                        <span>{t('downloadModelBtn')} ({model.expectedFormatted})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct Download Accordion (For Slow Connections / IDM) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <button
            type="button"
            onClick={() => setShowDirectLinks(!showDirectLinks)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-slate-600" />
              <span>{t('directDownloadTitle')}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 underline">
              {showDirectLinks ? t('hideLinksBtn') : t('showLinksBtn')}
            </span>
          </button>

          {showDirectLinks && (
            <div className="space-y-3 pt-2 border-t border-slate-200 animate-fade-in text-xs">
              <p className="text-slate-600">
                {t('directDownloadDesc')}
              </p>

              <div className="space-y-2">
                {data?.models.map((model) => (
                  <div
                    key={`direct-${model.id}`}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 truncate max-w-md">
                      <div className="font-bold text-slate-900 font-mono text-[11px]">{model.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{model.directUrl}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => model.directUrl && handleCopyDirectUrl(model.directUrl, model.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                      >
                        {copiedUrlModelId === model.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">{t('copiedDirectLink')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t('copyDirectLink')}</span>
                          </>
                        )}
                      </button>

                      {model.directUrl && (
                        <a
                          href={model.directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-950 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t('directDownloadBtn')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-sans">
            {t('modelsSavedDirNotice')}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-full btn-quantix-primary text-xs font-bold active:scale-[0.98]"
          >
            {t('doneBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
