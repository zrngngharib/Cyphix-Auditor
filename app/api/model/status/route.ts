import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises'; // Async file system — no event loop blocking
import {
  modelDownloader,
  MODEL_CONFIGS,
  formatBytes,
} from '@/lib/modelDownloader';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─── Named constants (no magic numbers) ──────────────────────────────────────
const MIN_MODEL_SIZE_BYTES = 50_000_000;         // 50 MB minimum for a valid model
const TEMP_FILE_FRESHNESS_MS = 10_000;           // 10 seconds — marks download as active

interface ModelDefinition {
  id: string;
  name: string;
  desc: string;
  expectedFileName: string;
  alternativeNames: string[];
  expectedBytes: number;
  badge: string;
  recommended: boolean;
  directUrl: string;
}

const MODEL_DEFINITIONS: ModelDefinition[] = [
  {
    id: 'deepseek-r1-7b',
    name: 'DeepSeek-R1-Distill-Qwen-7B (Q4_K_M)',
    desc: 'قووڵترین لۆژیک و شیکاری سایبەری (Deep Reasoning & Security)',
    expectedFileName: 'deepseek-r1-7b.gguf',
    alternativeNames: ['model.gguf', 'DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf', 'deepseek-r1.gguf'],
    expectedBytes: 4683073504,
    badge: 'Recommended',
    recommended: true,
    directUrl: 'https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-7B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf',
  },
  {
    id: 'qwen-coder-7b',
    name: 'Qwen2.5-Coder-7B-Instruct (Q4_K_M)',
    desc: 'زۆر بەهێز بۆ ئەندازیاری کۆد و ڕێکوپێکی (Code Architecture & Speed)',
    expectedFileName: 'qwen-coder-7b.gguf',
    alternativeNames: ['qwen2.5-coder-7b-instruct-q4_k_m.gguf', 'Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf', 'qwen-coder.gguf'],
    expectedBytes: 4683074336,
    badge: 'High Speed',
    recommended: false,
    directUrl: 'https://huggingface.co/bartowski/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf',
  },
  {
    id: 'llama-3.2-3b',
    name: 'Llama-3.2-3B-Instruct (Q4_K_M)',
    desc: 'مۆدێلی سووک بۆ ئەو کۆمپیوتەرانەی ڕامیان کەمە (Ultra-Lightweight for 8GB RAM)',
    expectedFileName: 'llama-3.2-3b.gguf',
    alternativeNames: ['Llama-3.2-3B-Instruct-Q4_K_M.gguf', 'llama-3.2-3b-instruct-q4_k_m.gguf', 'llama-3.2.gguf'],
    expectedBytes: 2019377696,
    badge: 'Lightweight',
    recommended: false,
    directUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
  },
];

export async function GET() {
  try {
    const modelsDir = path.join(process.cwd(), 'models');

    // Ensure models directory exists (async)
    try {
      await fs.access(modelsDir);
    } catch {
      try {
        await fs.mkdir(modelsDir, { recursive: true });
      } catch (mkdirErr: unknown) {
        console.warn(
          `[ModelStatus] Could not create models directory at ${modelsDir}:`,
          mkdirErr instanceof Error ? mkdirErr.message : mkdirErr
        );
      }
    }

    // Process all models in parallel using async fs operations
    const modelsStatus = await Promise.all(
      MODEL_DEFINITIONS.map(async (def) => {
        let isDownloaded = false;
        let actualFileName = def.expectedFileName;
        let sizeBytes = 0;
        let filePath = path.join(modelsDir, def.expectedFileName);

        // Check expected filename first
        try {
          const stats = await fs.stat(filePath);
          if (stats.size > MIN_MODEL_SIZE_BYTES) {
            isDownloaded = true;
            sizeBytes = stats.size;
          }
        } catch (e: unknown) {
          // File doesn't exist — expected, not an error
          if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.warn(`[ModelStatus] Could not stat ${filePath}:`, (e as Error).message);
          }
        }

        // Check alternative filenames if primary not found
        if (!isDownloaded) {
          for (const altName of def.alternativeNames) {
            const altPath = path.join(modelsDir, altName);
            try {
              const stats = await fs.stat(altPath);
              if (stats.size > MIN_MODEL_SIZE_BYTES) {
                isDownloaded = true;
                actualFileName = altName;
                sizeBytes = stats.size;
                filePath = altPath;
                break;
              }
            } catch (e: unknown) {
              if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
                console.warn(`[ModelStatus] Could not stat alt ${altPath}:`, (e as Error).message);
              }
            }
          }
        }

        // Check active in-memory download state
        const downloadState = modelDownloader.getDownloadState(def.id);
        let isDownloading = downloadState?.status === 'downloading';
        let downloadedBytes = downloadState?.downloadedBytes || 0;
        let downloadProgress = isDownloaded ? 100 : (downloadState?.progress || 0);
        let speedFormatted = downloadState?.speedFormatted || '0 MB/s';
        let etaFormatted = downloadState?.etaFormatted || '--';
        let errorMessage = downloadState?.status === 'error' ? downloadState.errorMessage : null;

        // Check for in-progress temp files on disk
        if (!isDownloading && !isDownloaded) {
          const tempPaths = [
            path.join(modelsDir, `${def.expectedFileName}.downloading`),
            path.join(modelsDir, `${def.expectedFileName}.ipull`),
            ...def.alternativeNames.map((n) => path.join(modelsDir, `${n}.downloading`)),
            ...def.alternativeNames.map((n) => path.join(modelsDir, `${n}.ipull`)),
          ];

          for (const tempPath of tempPaths) {
            try {
              const tempStats = await fs.stat(tempPath);
              if (tempStats.size > 0) {
                downloadedBytes = tempStats.size;
                downloadProgress = Math.min(
                  99,
                  Math.round((downloadedBytes / def.expectedBytes) * 100)
                );
                if (Date.now() - tempStats.mtimeMs < TEMP_FILE_FRESHNESS_MS) {
                  isDownloading = true;
                }
                break;
              }
            } catch (e: unknown) {
              if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
                console.warn(`[ModelStatus] Could not stat temp ${tempPath}:`, (e as Error).message);
              }
            }
          }
        }

        return {
          id: def.id,
          name: def.name,
          desc: def.desc,
          badge: def.badge,
          recommended: def.recommended,
          expectedBytes: def.expectedBytes,
          expectedFormatted: formatBytes(def.expectedBytes),
          downloaded: isDownloaded,
          sizeBytes,
          sizeFormatted: isDownloaded ? formatBytes(sizeBytes) : '0 B',
          actualFileName,
          filePath,
          isDownloading,
          downloadedBytes,
          downloadedFormatted: formatBytes(downloadedBytes),
          downloadProgress,
          speedFormatted,
          etaFormatted,
          errorMessage,
          directUrl: def.directUrl,
        };
      })
    );

    const readyModels = modelsStatus.filter((m) => m.downloaded);
    const hasAnyReadyModel = readyModels.length > 0;
    const activeModel = readyModels[0] || modelsStatus[0];

    return NextResponse.json(
      {
        success: true,
        hasAnyReadyModel,
        activeModelId: activeModel?.id || null,
        activeModelPath: activeModel?.filePath || null,
        models: modelsStatus,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    console.error('[ModelStatus] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check models status' },
      { status: 500 }
    );
  }
}
