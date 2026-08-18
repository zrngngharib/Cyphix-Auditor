import { ScannedFile, CodebaseSummary } from './types';

// Directories to ignore during scanning
const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.next',
  '.turbo',
  '.vscode',
  '.idea',
  'coverage',
  '.nyc_output',
  '__pycache__',
  'venv',
  '.venv',
  '.cache',
  'vendor/bundle',
  '.ds_store',
  'dist',
  'build',
  'out',
  '.gradle',
  'target',
  'bin',
  'obj'
]);

// Binary & design/asset file extensions to strictly ignore
const BINARY_EXTENSIONS = new Set([
  // Images & Vector
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'avif', 'bmp', 'tiff', 'svgz',
  // Adobe & Design files (large binary assets)
  'psd', 'ai', 'eps', 'indd', 'raw', 'cr2', 'nef', 'sketch', 'fig', 'xd', 'blend', 'fbx', 'obj', 'stl', 'dwg', 'dxf', 'prproj', 'aep',
  // Documents & Archives
  'pdf', 'zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz', 'tgz', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  // Fonts
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  // Audio & Video
  'mp4', 'webm', 'ogg', 'mp3', 'wav', 'flac', 'mov', 'avi', 'mkv', 'wmv', 'm4a', 'aac',
  // Binaries & Executables
  'exe', 'dll', 'so', 'dylib', 'bin', 'class', 'jar', 'war', 'ear', 'pyc', 'pyo', 'pyd',
  'iso', 'dmg', 'apk', 'ipa', 'a', 'lib', 'o', 'obj', 'wasm',
  // Databases
  'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'bak'
]);

// Lockfiles to ignore
const IGNORED_LOCKFILES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'composer.lock',
  'cargo.lock',
  'gemfile.lock',
  'poetry.lock',
  'mix.lock'
]);

// Maximum safety budget (characters) to stay safely within Gemini 1M token limit
const MAX_TOTAL_CHARACTERS = 2_200_000;
const MAX_SINGLE_FILE_CHARACTERS = 400_000; // ~100k tokens per single file

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Check if string contains binary null bytes or excessive non-printable chars
function isBinaryContent(text: string): boolean {
  if (!text) return false;
  const sample = text.slice(0, 1000);
  if (sample.includes('\0')) return true;

  let nonPrintable = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
      nonPrintable++;
    }
  }
  return nonPrintable > sample.length * 0.15;
}

export function shouldIncludeFile(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const segments = normalizedPath.split('/');

  // Check if any directory segment matches ignored directories
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i].toLowerCase();
    if (IGNORED_DIRECTORIES.has(seg)) {
      return false;
    }
  }

  const fileName = segments[segments.length - 1];
  if (!fileName) return false;

  const lowerFileName = fileName.toLowerCase();

  // Ignore system files
  if (lowerFileName === '.ds_store' || lowerFileName === 'thumbs.db') {
    return false;
  }

  // Ignore exact lockfiles
  if (IGNORED_LOCKFILES.has(lowerFileName)) {
    return false;
  }

  // Ignore git internal files
  if (lowerFileName.startsWith('.git') && lowerFileName !== '.gitignore' && lowerFileName !== '.gitattributes') {
    return false;
  }

  // Check extension against binary extensions
  const parts = fileName.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase() || '';
    if (BINARY_EXTENSIONS.has(ext)) {
      return false;
    }
  }

  return true;
}

// Read File object into text with safety limits and binary check
export async function readFileAsText(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) {
      resolve(`// [File too large: ${formatBytes(file.size)} - skipped body for token budget]`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let text = (reader.result as string) || '';

      if (isBinaryContent(text)) {
        resolve(null);
        return;
      }

      if (text.length > MAX_SINGLE_FILE_CHARACTERS) {
        text =
          text.slice(0, MAX_SINGLE_FILE_CHARACTERS) +
          `\n\n// [Truncated: File exceeded ${formatBytes(MAX_SINGLE_FILE_CHARACTERS)} to stay within Gemini token budget]`;
      }

      resolve(text);
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsText(file);
  });
}

// Process FileList from <input> or drag-and-drop
export async function processFileList(
  fileList: FileList | File[],
  onProgress?: (processed: number, total: number, currentFile: string) => void
): Promise<CodebaseSummary> {
  const files: ScannedFile[] = [];
  const rawFiles: File[] = Array.from(fileList);
  const eligibleFiles: File[] = [];

  for (const file of rawFiles) {
    const path = file.webkitRelativePath || file.name;
    if (shouldIncludeFile(path)) {
      eligibleFiles.push(file);
    }
  }

  const finalFilesToRead = eligibleFiles.length > 0 ? eligibleFiles : rawFiles.filter(f => shouldIncludeFile(f.name));

  const total = finalFilesToRead.length;
  let processed = 0;
  let totalChars = 0;
  let totalLines = 0;
  let totalBytes = 0;

  for (const file of finalFilesToRead) {
    const path = (file.webkitRelativePath || file.name).replace(/\\/g, '/');
    if (onProgress) {
      onProgress(processed + 1, total, path);
    }

    // Small yielding delay for smooth UI progress bar rendering
    if (total > 5) {
      await new Promise(r => setTimeout(r, 12));
    }

    try {
      const content = await readFileAsText(file);
      if (content !== null) {
        const lines = content.split('\n').length;
        totalChars += content.length;
        totalLines += lines;
        totalBytes += file.size;

        files.push({
          name: file.name,
          path,
          size: file.size,
          content,
          lineCount: lines,
        });
      }
    } catch (err) {
      console.warn(`Failed to read file ${path}:`, err);
    }

    processed++;
  }

  files.sort((a, b) => a.path.localeCompare(b.path));

  let concatenatedCode = '';
  let accumulatedChars = 0;

  for (const f of files) {
    const fileHeader =
      `================================================================================\n` +
      `FILE: ${f.path}\n` +
      `================================================================================\n`;
    
    if (accumulatedChars + fileHeader.length + f.content.length > MAX_TOTAL_CHARACTERS) {
      const remainingAllowance = MAX_TOTAL_CHARACTERS - accumulatedChars - fileHeader.length - 200;
      if (remainingAllowance > 500) {
        concatenatedCode += fileHeader + f.content.slice(0, remainingAllowance) + `\n// [Remaining codebase truncated for context window budget]\n\n`;
      }
      break;
    }

    concatenatedCode += fileHeader + f.content + `\n\n`;
    accumulatedChars = concatenatedCode.length;
  }

  return {
    files,
    totalFiles: files.length,
    totalCharacters: totalChars,
    totalLines,
    totalSizeFormatted: formatBytes(totalBytes),
    concatenatedCode,
  };
}

// Drag and drop directory reader using HTML5 FileSystem API
export async function processDataTransferItems(
  items: DataTransferItemList,
  onProgress?: (processed: number, total: number, currentFile: string) => void
): Promise<CodebaseSummary> {
  const extractedFiles: { file: File; path: string }[] = [];

  async function traverseDirectory(entry: any, currentPath: string) {
    if (!entry) return;

    if (entry.isFile) {
      const filePath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      if (shouldIncludeFile(filePath)) {
        try {
          const file: File = await new Promise((resolve, reject) =>
            entry.file(resolve, reject)
          );
          extractedFiles.push({ file, path: filePath });
        } catch (e) {
          console.warn(`Could not read entry file ${filePath}:`, e);
        }
      }
    } else if (entry.isDirectory) {
      const dirName = entry.name;
      if (IGNORED_DIRECTORIES.has(dirName.toLowerCase())) {
        return;
      }
      const dirReader = entry.createReader();
      const readEntries = async (): Promise<any[]> => {
        return new Promise((resolve, reject) => {
          dirReader.readEntries(resolve, reject);
        });
      };

      let entries: any[] = [];
      let batch: any[];
      do {
        batch = await readEntries();
        entries = entries.concat(batch);
      } while (batch.length > 0);

      const nextPath = currentPath ? `${currentPath}/${dirName}` : dirName;
      for (const childEntry of entries) {
        await traverseDirectory(childEntry, nextPath);
      }
    }
  }

  const entries: any[] = [];
  const directFiles: File[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        entries.push(entry);
      }
    } else if (item.getAsFile) {
      const file = item.getAsFile();
      if (file) {
        directFiles.push(file);
      }
    }
  }

  for (const entry of entries) {
    await traverseDirectory(entry, '');
  }

  if (extractedFiles.length === 0 && directFiles.length > 0) {
    for (const f of directFiles) {
      if (shouldIncludeFile(f.name)) {
        extractedFiles.push({ file: f, path: f.name });
      }
    }
  }

  const files: ScannedFile[] = [];
  const total = extractedFiles.length;
  let processed = 0;
  let totalChars = 0;
  let totalLines = 0;
  let totalBytes = 0;

  for (const item of extractedFiles) {
    const { file, path } = item;
    if (onProgress) {
      onProgress(processed + 1, total, path);
    }

    if (total > 5) {
      await new Promise(r => setTimeout(r, 12));
    }

    try {
      const content = await readFileAsText(file);
      if (content !== null) {
        const lines = content.split('\n').length;
        totalChars += content.length;
        totalLines += lines;
        totalBytes += file.size;

        files.push({
          name: file.name,
          path,
          size: file.size,
          content,
          lineCount: lines,
        });
      }
    } catch (err) {
      console.warn(`Failed to read file ${path}:`, err);
    }
    processed++;
  }

  files.sort((a, b) => a.path.localeCompare(b.path));

  let concatenatedCode = '';
  let accumulatedChars = 0;

  for (const f of files) {
    const fileHeader =
      `================================================================================\n` +
      `FILE: ${f.path}\n` +
      `================================================================================\n`;
    
    if (accumulatedChars + fileHeader.length + f.content.length > MAX_TOTAL_CHARACTERS) {
      const remainingAllowance = MAX_TOTAL_CHARACTERS - accumulatedChars - fileHeader.length - 200;
      if (remainingAllowance > 500) {
        concatenatedCode += fileHeader + f.content.slice(0, remainingAllowance) + `\n// [Remaining codebase truncated for context window budget]\n\n`;
      }
      break;
    }

    concatenatedCode += fileHeader + f.content + `\n\n`;
    accumulatedChars = concatenatedCode.length;
  }

  return {
    files,
    totalFiles: files.length,
    totalCharacters: totalChars,
    totalLines,
    totalSizeFormatted: formatBytes(totalBytes),
    concatenatedCode,
  };
}
