export interface ParsedCodeFile {
  path: string;
  content: string;
  linesCount: number;
  sizeBytes: number;
}

export interface DomainChunk {
  domainId: number;
  domainName: string;
  files: ParsedCodeFile[];
  totalCharacters: number;
  concatenatedPayload: string;
}

export function parseConcatenatedCodebase(rawCodebase: string): ParsedCodeFile[] {
  const files: ParsedCodeFile[] = [];
  const fileHeaderRegex = /={10,}\s*\n(?:FILE|فایل|الملف):\s*([^\n]+)\s*\n={10,}\s*\n/gi;

  const matches = Array.from(rawCodebase.matchAll(fileHeaderRegex));

  if (matches.length === 0) {
    // If single monolithic file
    return [
      {
        path: 'project/source.ts',
        content: rawCodebase,
        linesCount: rawCodebase.split('\n').length,
        sizeBytes: Buffer.byteLength(rawCodebase, 'utf8'),
      },
    ];
  }

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const filePath = currentMatch[1].trim();
    const startIndex = (currentMatch.index || 0) + currentMatch[0].length;
    const nextMatch = matches[i + 1];
    const endIndex = nextMatch ? nextMatch.index : rawCodebase.length;

    const fileContent = rawCodebase.slice(startIndex, endIndex).trim();
    files.push({
      path: filePath,
      content: fileContent,
      linesCount: fileContent.split('\n').length,
      sizeBytes: Buffer.byteLength(fileContent, 'utf8'),
    });
  }

  return files;
}

export function routeFilesByDomain(
  files: ParsedCodeFile[],
  maxCharsPerDomain = 40_000
): Record<number, DomainChunk> {
  const domainChunks: Record<number, DomainChunk> = {
    1: { domainId: 1, domainName: 'Backend & Data Logic', files: [], totalCharacters: 0, concatenatedPayload: '' },
    2: { domainId: 2, domainName: 'UI, UX & Responsiveness', files: [], totalCharacters: 0, concatenatedPayload: '' },
    3: { domainId: 3, domainName: 'Security (Critical)', files: [], totalCharacters: 0, concatenatedPayload: '' },
    4: { domainId: 4, domainName: 'SEO & Routing', files: [], totalCharacters: 0, concatenatedPayload: '' },
    5: { domainId: 5, domainName: 'QA & Edge Cases', files: [], totalCharacters: 0, concatenatedPayload: '' },
    6: { domainId: 6, domainName: 'Performance', files: [], totalCharacters: 0, concatenatedPayload: '' },
    7: { domainId: 7, domainName: 'Documentation & Code Quality', files: [], totalCharacters: 0, concatenatedPayload: '' },
  };

  const isBackend = (p: string) => /(?:api|server|route|controller|service|model|db|schema|prisma|sql|query|middleware|\.py|\.php|\.go|\.java|\.kt|\.cs|\.rs|\.rb|\.c|\.cpp|\.sol)/i.test(p);
  const isSecurity = (p: string) => /(?:auth|jwt|crypto|security|password|hash|session|permission|rbac|login|signup|token|\.env|oauth|cors|policy)/i.test(p);
  const isFrontend = (p: string) => /(?:component|view|layout|page|screen|ui|style|css|tsx|jsx|hook|html|\.vue|\.svelte|\.astro|\.dart|\.swift)/i.test(p);
  const isConfig = (p: string) => /(?:package\.json|tsconfig|next\.config|env|tailwind|docker|yaml|yml|requirements\.txt|pom\.xml|cargo\.toml|composer\.json|gemfile|go\.mod)/i.test(p);

  for (const file of files) {
    const p = file.path;

    // Config files go to domain 1, 3, 7
    if (isConfig(p)) {
      domainChunks[1].files.push(file);
      domainChunks[3].files.push(file);
      domainChunks[7].files.push(file);
    }

    // Security files
    if (isSecurity(p)) {
      domainChunks[3].files.push(file);
      domainChunks[1].files.push(file);
    }

    // Backend files
    if (isBackend(p)) {
      domainChunks[1].files.push(file);
      domainChunks[5].files.push(file);
      domainChunks[6].files.push(file);
    }

    // Frontend files
    if (isFrontend(p)) {
      domainChunks[2].files.push(file);
      domainChunks[4].files.push(file);
      domainChunks[6].files.push(file);
    }

    // QA & Quality gets everything within limits
    if (!domainChunks[5].files.includes(file)) {
      domainChunks[5].files.push(file);
    }
    if (!domainChunks[7].files.includes(file)) {
      domainChunks[7].files.push(file);
    }
  }

  // Fallback: If any domain has 0 files, distribute all files
  for (let d = 1; d <= 7; d++) {
    if (domainChunks[d].files.length === 0) {
      domainChunks[d].files = [...files];
    }
  }

  // Build concatenated payload with character budget capping
  for (let d = 1; d <= 7; d++) {
    const chunk = domainChunks[d];
    let payload = '';

    for (const f of chunk.files) {
      const header = `\n// ========================================\n// FILE: ${f.path}\n// ========================================\n`;
      if (payload.length + header.length + f.content.length > maxCharsPerDomain) {
        payload += `${header}${f.content.slice(0, Math.max(500, maxCharsPerDomain - payload.length))}\n// [TRUNCATED FOR DOMAIN ${d} BUDGET]`;
        break;
      }
      payload += `${header}${f.content}\n`;
    }

    chunk.concatenatedPayload = payload;
    chunk.totalCharacters = payload.length;
  }

  return domainChunks;
}
