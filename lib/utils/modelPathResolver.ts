/**
 * lib/utils/modelPathResolver.ts
 * Centralized GGUF model path resolution — prevents duplication across API routes and workers.
 */
import path from 'path';
import fs from 'fs';

/**
 * Resolves the local GGUF model path.
 * 1. Uses the provided path if it exists.
 * 2. Falls back to searching the ./models/ directory for any .gguf file.
 * @returns Absolute resolved path or null if no model found.
 */
export function resolveLocalModelPath(localModelPathInput?: string): string | null {
  let resolvedPath = localModelPathInput?.trim() || path.join(process.cwd(), 'models', 'model.gguf');

  if (!path.isAbsolute(resolvedPath)) {
    resolvedPath = path.join(process.cwd(), resolvedPath);
  }

  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }

  // Fallback: scan ./models/ for any ready .gguf file
  const modelsDir = path.join(process.cwd(), 'models');
  if (fs.existsSync(modelsDir)) {
    const files = fs.readdirSync(modelsDir);
    const gguf = files.find((f) => f.endsWith('.gguf') && !f.endsWith('.ipull') && !f.endsWith('.downloading'));
    if (gguf) {
      return path.join(modelsDir, gguf);
    }
  }

  return null;
}
