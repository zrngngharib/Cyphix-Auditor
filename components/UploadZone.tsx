'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  FolderUp,
  FolderTree,
  FileCode,
  CheckCircle2,
  Trash2,
  Search,
  Eye,
  FileText,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  FilePlus,
  Loader2,
  Zap,
} from 'lucide-react';
import { CodebaseSummary } from '@/lib/types';
import { processFileList, processDataTransferItems } from '@/lib/file-utils';
import { useLanguage } from '@/lib/LanguageContext';

interface UploadZoneProps {
  summary: CodebaseSummary | null;
  onSummaryChange: (summary: CodebaseSummary | null) => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  summary,
  onSummaryChange,
  disabled = false,
}) => {
  const { t, dir } = useLanguage();
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState({
    processed: 0,
    total: 0,
    currentFile: '',
  });
  const [showFileList, setShowFileList] = useState(false);
  const [fileSearch, setFileSearch] = useState('');

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isReading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isReading) return;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      try {
        setIsReading(true);
        setReadingProgress({ processed: 0, total: 0, currentFile: 'Discovering project tree...' });
        const result = await processDataTransferItems(
          e.dataTransfer.items,
          (processed, total, currentFile) => {
            setReadingProgress({ processed, total, currentFile });
          }
        );
        onSummaryChange(result);
      } catch (err) {
        console.error('Error processing dropped folder:', err);
      } finally {
        setIsReading(false);
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      try {
        setIsReading(true);
        setReadingProgress({ processed: 0, total: 0, currentFile: 'Discovering files...' });
        const result = await processFileList(
          e.dataTransfer.files,
          (processed, total, currentFile) => {
            setReadingProgress({ processed, total, currentFile });
          }
        );
        onSummaryChange(result);
      } catch (err) {
        console.error('Error processing dropped files:', err);
      } finally {
        setIsReading(false);
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        setIsReading(true);
        setReadingProgress({ processed: 0, total: 0, currentFile: 'Reading selected items...' });
        const result = await processFileList(
          e.target.files,
          (processed, total, currentFile) => {
            setReadingProgress({ processed, total, currentFile });
          }
        );
        onSummaryChange(result);
      } catch (err) {
        console.error('Error processing chosen files:', err);
      } finally {
        setIsReading(false);
        e.target.value = '';
      }
    }
  };

  const handleClear = () => {
    onSummaryChange(null);
    setShowFileList(false);
    setFileSearch('');
    if (folderInputRef.current) folderInputRef.current.value = '';
    if (filesInputRef.current) filesInputRef.current.value = '';
  };

  const filteredFiles = summary?.files.filter((f) =>
    f.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  let percentComplete = 0;
  if (readingProgress.total > 0) {
    percentComplete = Math.min(
      100,
      Math.round((readingProgress.processed / readingProgress.total) * 100)
    );
  }

  return (
    <div className="w-full">
      {/* Hidden Folder Input */}
      <input
        type="file"
        id="folder-upload-input"
        ref={folderInputRef}
        onChange={handleFileInputChange}
        multiple
        className="sr-only"
        disabled={disabled || isReading}
        aria-label="Upload folder"
      />

      {/* Hidden Multi-Files Input */}
      <input
        type="file"
        id="multi-files-upload-input"
        ref={filesInputRef}
        onChange={handleFileInputChange}
        multiple
        className="sr-only"
        disabled={disabled || isReading}
        aria-label="Upload files"
      />

      {/* State 1: Reading Live Progress */}
      {isReading && (
        <div
          className="quantix-panel p-8 sm:p-10 space-y-6 animate-fade-in shadow-sm"
          aria-live="polite"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
                <Loader2 className="w-6 h-6 animate-spin text-slate-700" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
                  <span>{t('extractingTitle')}</span>
                  <span className="text-xs px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {t('ramSecureBadge')}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  {t('extractingDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 self-start sm:self-auto bg-slate-100 border border-slate-200 px-4 py-2 rounded-2xl">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-mono">
                {percentComplete}%
              </span>
              <span className="text-xs text-slate-500 font-sans">{t('uploadComplete')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5 font-sans">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {readingProgress.total > 0
                    ? t('processingFileOf', { current: readingProgress.processed, total: readingProgress.total })
                    : t('parsingFiles')}
                </span>
              </span>
              <span className="text-slate-500 font-mono font-medium">
                {t('filesExtractedCount', { count: readingProgress.processed })}
              </span>
            </div>

            <div
              className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200 shadow-inner"
              role="progressbar"
              aria-valuenow={percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-150"
                style={{ width: `${Math.max(5, percentComplete)}%` }}
              />
            </div>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <FileCode className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {t('currentFile')}
              </div>
              <div className="text-xs text-slate-700 font-mono truncate">
                {readingProgress.currentFile || t('scanningDirectoryTree')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State 2: Empty Drop Area (Clerk Clean Style) */}
      {!isReading && (!summary || summary.files.length === 0) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group rounded-3xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-white ${
            isDragging
              ? 'border-slate-900 bg-slate-50/90 shadow-md scale-[1.01]'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 group-hover:border-slate-300 group-hover:bg-slate-200/60 flex items-center justify-center transition-all duration-200 shadow-xs group-hover:scale-105">
              <FolderUp className="w-8 h-8 text-slate-700 transition-transform duration-200" aria-hidden="true" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h4 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight font-sans">
                {t('dropTitle')}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 font-sans">
                {t('dropSubtitle')}
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="btn-quantix-primary min-h-[44px] px-6 py-2.5 text-xs sm:text-sm flex items-center gap-2"
              >
                <FolderUp className="w-4 h-4" aria-hidden="true" />
                <span>{t('chooseFolderBtn')}</span>
              </button>

              <button
                type="button"
                onClick={() => filesInputRef.current?.click()}
                className="btn-quantix-secondary min-h-[44px] px-6 py-2.5 text-xs sm:text-sm flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>{t('chooseFilesBtn')}</span>
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2 pt-3 text-xs text-slate-500 font-sans">
              <span className="px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5 font-medium text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                {t('autoIgnores')}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5 font-medium text-slate-700">
                <FileCode className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                {t('supportedLangs')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* State 3: Codebase Loaded (Clerk Clean Style) */}
      {!isReading && summary && summary.files.length > 0 && (
        <div className="quantix-panel p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <FileCheck2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-950 flex items-center gap-2 font-sans">
                  <span>{t('codebaseExtractedTitle')}</span>
                  <span className="text-[11px] font-semibold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t('ramBufferBadge')}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 font-sans">
                  {t('codebaseExtractedSub', { total: summary.totalFiles })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFileList(!showFileList)}
                className="min-h-[38px] px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 focus-ring shadow-2xs"
                aria-expanded={showFileList}
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>{showFileList ? t('hideFiles') : t('inspectFiles')}</span>
                {showFileList ? (
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className="min-h-[38px] px-4 py-1.5 rounded-full bg-red-50 hover:bg-red-100/80 border border-red-200 text-xs font-semibold text-red-700 transition-colors flex items-center gap-1.5 focus-ring"
                aria-label="Remove uploaded codebase and start over"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('resetCodebase')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs text-slate-500 font-sans">{t('eligibleFiles')}</div>
              <div className="text-xl font-bold font-mono text-slate-950 mt-1">
                {summary.totalFiles}
              </div>
            </div>
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs text-slate-500 font-sans">{t('linesOfCode')}</div>
              <div className="text-xl font-bold font-mono text-slate-950 mt-1">
                ~{summary.totalLines.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs text-slate-500 font-sans">{t('payloadSize')}</div>
              <div className="text-xl font-bold font-mono text-slate-950 mt-1">
                {summary.totalSizeFormatted}
              </div>
            </div>
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs text-slate-500 font-sans">{t('charactersCount')}</div>
              <div className="text-xl font-bold font-mono text-slate-950 mt-1">
                {summary.totalCharacters.toLocaleString()}
              </div>
            </div>
          </div>

          {showFileList && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    type="text"
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    placeholder={t('searchFilesPlaceholder')}
                    className="w-full rtl:pr-8 rtl:pl-3 ltr:pl-8 ltr:pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus-ring font-mono"
                    aria-label="Filter extracted files"
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {t('showingFiles', { filtered: filteredFiles?.length || 0, total: summary.files.length })}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-inner">
                {filteredFiles && filteredFiles.length > 0 ? (
                  filteredFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        <span className="text-slate-800 font-mono truncate">
                          {file.path}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-slate-500 text-[11px] font-mono">
                        <span>{t('linesCount', { count: file.lineCount })}</span>
                        <span>{Math.round(file.size / 1024)} KB</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 font-sans">
                    {t('noFilesMatched')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
