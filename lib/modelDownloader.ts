import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

export interface ModelDownloadInfo {
  id: string;
  name: string;
  fileName: string;
  url: string;
  expectedBytes: number;
  expectedFormatted: string;
  size: string;
}

export const MODEL_CONFIGS: Record<string, ModelDownloadInfo> = {
  'deepseek-r1-7b': {
    id: 'deepseek-r1-7b',
    name: 'DeepSeek-R1-Distill-Qwen-7B (Q4_K_M)',
    fileName: 'deepseek-r1-7b.gguf',
    url: 'https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-7B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf',
    expectedBytes: 4683073504,
    expectedFormatted: '4.68 GB',
    size: '4.68 GB',
  },
  'qwen-coder-7b': {
    id: 'qwen-coder-7b',
    name: 'Qwen2.5-Coder-7B-Instruct (Q4_K_M)',
    fileName: 'qwen-coder-7b.gguf',
    url: 'https://huggingface.co/bartowski/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf',
    expectedBytes: 4683074336,
    expectedFormatted: '4.68 GB',
    size: '4.68 GB',
  },
  'llama-3.2-3b': {
    id: 'llama-3.2-3b',
    name: 'Llama-3.2-3B-Instruct (Q4_K_M)',
    fileName: 'llama-3.2-3b.gguf',
    url: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    expectedBytes: 2019377696,
    expectedFormatted: '2.00 GB',
    size: '2.0 GB',
  },
};

export interface ActiveDownloadState {
  modelId: string;
  status: 'downloading' | 'completed' | 'error' | 'cancelled';
  downloadedBytes: number;
  totalBytes: number;
  progress: number;
  speedBytesPerSec: number;
  speedFormatted: string;
  etaSeconds: number;
  etaFormatted: string;
  errorMessage: string | null;
  startTime: number;
  lastUpdateTime: number;
  lastDownloadedBytes: number;
  tempFilePath: string;
  finalFilePath: string;
  abortController?: AbortController;
  activeRequest?: http.ClientRequest;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatSpeed(bytesPerSec: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 KB/s';
  if (bytesPerSec >= 1024 * 1024) {
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  }
  return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
}

function formatEta(seconds: number): string {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return '--';
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const remainingSecs = Math.round(seconds % 60);
  if (mins < 60) {
    return `${mins}m ${remainingSecs}s`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

class DownloadManager {
  private activeDownloads: Map<string, ActiveDownloadState> = new Map();

  constructor() {
    this.ensureModelsDirectory();
  }

  private getModelsDir(): string {
    return path.join(process.cwd(), 'models');
  }

  private ensureModelsDirectory() {
    const modelsDir = this.getModelsDir();
    if (!fs.existsSync(modelsDir)) {
      try {
        fs.mkdirSync(modelsDir, { recursive: true });
      } catch (err) {
        console.error('Could not create models directory:', err);
      }
    }
  }

  public getDownloadState(modelId: string): ActiveDownloadState | null {
    return this.activeDownloads.get(modelId) || null;
  }

  public getAllActiveStates(): Record<string, ActiveDownloadState> {
    const result: Record<string, ActiveDownloadState> = {};
    this.activeDownloads.forEach((val, key) => {
      result[key] = { ...val, abortController: undefined, activeRequest: undefined };
    });
    return result;
  }

  public cancelDownload(modelId: string): boolean {
    const state = this.activeDownloads.get(modelId);
    if (!state) return false;

    if (state.status === 'downloading') {
      state.status = 'cancelled';
      if (state.abortController) {
        try {
          state.abortController.abort();
        } catch (abortErr) {
          console.warn('[ModelDownloader] abort signal error:', abortErr);
        }
      }
      if (state.activeRequest) {
        try {
          state.activeRequest.destroy();
        } catch (destroyErr) {
          console.warn('[ModelDownloader] request destroy error:', destroyErr);
        }
      }
      return true;
    }
    return false;
  }

  public async startDownload(modelId: string, customUrl?: string): Promise<{ success: boolean; message: string }> {
    this.ensureModelsDirectory();
    const config = MODEL_CONFIGS[modelId];
    if (!config) {
      throw new Error(`Unknown model ID: ${modelId}`);
    }

    // Check if already downloading
    const existing = this.activeDownloads.get(modelId);
    if (existing && existing.status === 'downloading') {
      return { success: true, message: `Download for ${config.name} is already in progress.` };
    }

    const modelsDir = this.getModelsDir();
    const finalFilePath = path.join(modelsDir, config.fileName);
    const tempFilePath = path.join(modelsDir, `${config.fileName}.downloading`);
    const rawDownloadUrl = customUrl || config.url;

    // -------------------------------------------------------------------------
    // SSRF Prevention: validate customUrl strictly
    // -------------------------------------------------------------------------
    let downloadUrl: string;
    if (customUrl) {
      const TRUSTED_HOSTS = [
        'huggingface.co',
        'cdn-lfs.huggingface.co',
        'cdn-lfs-us-1.huggingface.co',
        'lfs.huggingface.co',
        'modelscope.cn',
        'storage.googleapis.com',
      ];
      try {
        const parsed = new URL(customUrl);
        if (parsed.protocol !== 'https:') {
          throw new Error('Only HTTPS URLs are allowed for model downloads.');
        }
        const hostBase = parsed.hostname.toLowerCase();
        const isTrusted = TRUSTED_HOSTS.some(
          (h) => hostBase === h || hostBase.endsWith(`.${h}`)
        );
        if (!isTrusted) {
          throw new Error(
            `Untrusted host "${parsed.hostname}". Only HuggingFace and approved CDN hosts are allowed.`
          );
        }
        downloadUrl = customUrl;
      } catch (ssrfErr: any) {
        throw new Error(`SSRF check failed: ${ssrfErr.message}`);
      }
    } else {
      downloadUrl = config.url;
    }


    // Check if partial temp file exists for resume support
    let startByte = 0;
    if (fs.existsSync(tempFilePath)) {
      try {
        const stats = fs.statSync(tempFilePath);
        startByte = stats.size;
      } catch (err) {
        console.warn('Could not read partial temp file size:', err);
        startByte = 0;
      }
    }

    const abortController = new AbortController();

    const state: ActiveDownloadState = {
      modelId,
      status: 'downloading',
      downloadedBytes: startByte,
      totalBytes: config.expectedBytes,
      progress: Math.min(99, Math.round((startByte / config.expectedBytes) * 100)),
      speedBytesPerSec: 0,
      speedFormatted: '0 MB/s',
      etaSeconds: 0,
      etaFormatted: 'Calculating...',
      errorMessage: null,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      lastDownloadedBytes: startByte,
      tempFilePath,
      finalFilePath,
      abortController,
    };

    this.activeDownloads.set(modelId, state);

    // Run async background downloader
    this.executeStreamingDownload(modelId, downloadUrl, tempFilePath, finalFilePath, startByte, config.expectedBytes)
      .catch((err) => {
        console.error(`Download error for model ${modelId}:`, err);
        const cur = this.activeDownloads.get(modelId);
        if (cur && cur.status !== 'cancelled') {
          cur.status = 'error';
          cur.errorMessage = err?.message || 'Network error occurred during download';
        }
      });

    return {
      success: true,
      message: `Direct background download initiated for ${config.name}`,
    };
  }

  private executeStreamingDownload(
    modelId: string,
    initialUrl: string,
    tempFilePath: string,
    finalFilePath: string,
    startByte: number,
    expectedBytes: number,
    redirectCount = 0
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (redirectCount > 10) {
        return reject(new Error('Too many HTTP redirects from model host'));
      }

      const state = this.activeDownloads.get(modelId);
      if (!state || state.status === 'cancelled') {
        return resolve();
      }

      const parsedUrl = new URL(initialUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const headers: Record<string, string> = {
        'User-Agent': 'Cyphix-Codebase-Auditor/1.0 (Mozilla/5.0; Windows NT 10.0; Win64; x64)',
        Accept: '*/*',
      };

      if (startByte > 0) {
        headers['Range'] = `bytes=${startByte}-`;
      }

      const req = client.get(
        initialUrl,
        {
          headers,
          signal: state.abortController?.signal,
        },
        (res) => {
          // Handle HTTP Redirects (301, 302, 303, 307, 308)
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            const redirectUrl = new URL(res.headers.location, initialUrl).toString();
            res.resume(); // Discard redirect body
            return this.executeStreamingDownload(
              modelId,
              redirectUrl,
              tempFilePath,
              finalFilePath,
              startByte,
              expectedBytes,
              redirectCount + 1
            )
              .then(resolve)
              .catch(reject);
          }

          if (
            res.statusCode &&
            res.statusCode !== 200 &&
            res.statusCode !== 206
          ) {
            // If Range request failed with 416 (Range Not Satisfiable), start fresh
            if (res.statusCode === 416 && startByte > 0) {
              res.resume();
              if (fs.existsSync(tempFilePath)) {
                try {
                  fs.unlinkSync(tempFilePath);
                } catch (unlinkErr) {
                  console.warn('[ModelDownloader] temp file unlink warning:', unlinkErr);
                }
              }
              return this.executeStreamingDownload(
                modelId,
                initialUrl,
                tempFilePath,
                finalFilePath,
                0,
                expectedBytes,
                0
              )
                .then(resolve)
                .catch(reject);
            }

            res.resume();
            return reject(
              new Error(`Host returned HTTP ${res.statusCode}: ${res.statusMessage}`)
            );
          }

          // If starting fresh or server doesn't support Range (res.statusCode === 200)
          const isFresh = res.statusCode === 200 || startByte === 0;
          if (isFresh && startByte > 0) {
            startByte = 0;
            state.downloadedBytes = 0;
            state.lastDownloadedBytes = 0;
          }

          const contentLengthHeader = res.headers['content-length'];
          const contentRangeHeader = res.headers['content-range'];

          if (res.statusCode === 200 && contentLengthHeader) {
            const parsedLength = parseInt(contentLengthHeader, 10);
            if (!isNaN(parsedLength) && parsedLength > 0) {
              state.totalBytes = parsedLength;
            }
          } else if (res.statusCode === 206 && contentRangeHeader) {
            // E.g. bytes 1000-5000/10000 -> extract 10000
            const totalMatch = contentRangeHeader.match(/\/(\d+)$/);
            if (totalMatch && totalMatch[1]) {
              const parsedTotal = parseInt(totalMatch[1], 10);
              if (!isNaN(parsedTotal) && parsedTotal > 0) {
                state.totalBytes = parsedTotal;
              }
            }
          } else if (contentLengthHeader) {
            const parsedLength = parseInt(contentLengthHeader, 10);
            if (!isNaN(parsedLength) && parsedLength > 0) {
              state.totalBytes = isFresh ? parsedLength : startByte + parsedLength;
            }
          } else if (!state.totalBytes || state.totalBytes <= 0) {
            state.totalBytes = expectedBytes;
          }

          // Open write stream in append mode if resuming, write mode if fresh
          const writeStream = fs.createWriteStream(tempFilePath, {
            flags: isFresh ? 'w' : 'a',
          });

          let bytesWrittenSinceUpdate = 0;
          let speedSampleStart = Date.now();
          let speedSampleBytes = 0;

          res.on('data', (chunk: Buffer) => {
            if (state.status === 'cancelled') {
              res.destroy();
              writeStream.destroy();
              return resolve();
            }

            state.downloadedBytes += chunk.length;
            bytesWrittenSinceUpdate += chunk.length;
            speedSampleBytes += chunk.length;

            const now = Date.now();
            const timeSinceLastUpdate = now - state.lastUpdateTime;

            if (timeSinceLastUpdate >= 800) {
              // Calculate Speed
              const elapsedSec = (now - speedSampleStart) / 1000;
              if (elapsedSec > 0.5) {
                const currentSpeed = speedSampleBytes / elapsedSec;
                // Exponential moving average for smooth speed display
                state.speedBytesPerSec =
                  state.speedBytesPerSec === 0
                    ? currentSpeed
                    : state.speedBytesPerSec * 0.4 + currentSpeed * 0.6;
                state.speedFormatted = formatSpeed(state.speedBytesPerSec);

                // Calculate ETA
                const remainingBytes = Math.max(0, state.totalBytes - state.downloadedBytes);
                if (state.speedBytesPerSec > 0) {
                  state.etaSeconds = remainingBytes / state.speedBytesPerSec;
                  state.etaFormatted = formatEta(state.etaSeconds);
                }

                speedSampleStart = now;
                speedSampleBytes = 0;
              }

              // Update Progress
              state.progress = Math.min(
                99,
                Math.round((state.downloadedBytes / (state.totalBytes || expectedBytes)) * 100)
              );
              state.lastUpdateTime = now;
            }
          });

          res.pipe(writeStream);

          writeStream.on('finish', () => {
            if (state.status === 'cancelled') {
              return resolve();
            }

            // Verify file size
            try {
              if (fs.existsSync(tempFilePath)) {
                const stats = fs.statSync(tempFilePath);
                const minRequiredBytes = 50_000_000;
                const expectedTotal = state.totalBytes || expectedBytes;
                const isComplete = stats.size >= minRequiredBytes && stats.size >= expectedTotal * 0.95;

                if (isComplete) {
                  // Atomically rename temporary file to final model file
                  if (fs.existsSync(finalFilePath)) {
                    try {
                      fs.unlinkSync(finalFilePath);
                    } catch (unlinkFinalErr) {
                      console.warn('[ModelDownloader] unlink old final file warning:', unlinkFinalErr);
                    }
                  }
                  fs.renameSync(tempFilePath, finalFilePath);

                  state.status = 'completed';
                  state.progress = 100;
                  state.downloadedBytes = stats.size;
                  state.totalBytes = stats.size;
                  state.speedFormatted = '0 MB/s';
                  state.etaFormatted = 'Completed';
                  resolve();
                  return;
                } else {
                  throw new Error(
                    `Downloaded file is smaller than expected (${formatBytes(stats.size)}). Download may have been truncated.`
                  );
                }
              } else {
                throw new Error('Downloaded temp file does not exist on disk.');
              }
            } catch (err: any) {
              state.status = 'error';
              state.errorMessage = err?.message || 'Failed to save downloaded model file';
              reject(err);
            }
          });

          writeStream.on('error', (err) => {
            state.status = 'error';
            state.errorMessage = `Disk write error: ${err.message}`;
            reject(err);
          });

          res.on('error', (err) => {
            state.status = 'error';
            state.errorMessage = `Network stream error: ${err.message}`;
            reject(err);
          });
        }
      );

      state.activeRequest = req;

      req.on('error', (err: any) => {
        if (state.status === 'cancelled') {
          return resolve();
        }
        state.status = 'error';
        state.errorMessage = `Connection error: ${err.message}`;
        reject(err);
      });
    });
  }
}

// Global Singleton to maintain state across Next.js API route invocations
declare global {
  var __cyphixModelDownloader: DownloadManager | undefined;
}

if (!global.__cyphixModelDownloader) {
  global.__cyphixModelDownloader = new DownloadManager();
}

export const modelDownloader = global.__cyphixModelDownloader;
export { formatBytes, formatSpeed, formatEta };
