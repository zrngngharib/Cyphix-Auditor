import { SupportedLanguage } from './i18n';
import { DomainChunk } from './orchestrator/chunker';

/**
 * File & Ingestion Interfaces
 */
export interface ScannedFile {
  name: string;
  path: string;
  size: number;
  content: string;
  lineCount: number;
}

export interface CodebaseSummary {
  files: ScannedFile[];
  totalFiles: number;
  totalCharacters: number;
  totalLines: number;
  totalSizeFormatted: string;
  concatenatedCode: string;
}

/**
 * Audit Flow & Execution Types
 */
export type AuditStage =
  | 'idle'
  | 'reading'
  | 'analyzing'
  | 'generating'
  | 'completed'
  | 'error';

export type ModelProvider = 'gemini' | 'claude' | 'deepseek-cloud' | 'local';
export type ReasoningDepth = 'fast' | 'balanced' | 'deep';

export interface AuditDomainStatus {
  id: number;
  title: string;
  icon: string;
  status: 'pending' | 'analyzing' | 'done';
}

/**
 * Fast AST Static Scanner Interfaces
 */
export type ASTSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ASTFinding {
  severity: ASTSeverity;
  domainId: number;
  file: string;
  line: number;
  issue: string;
  snippet?: string;
  fixSuggestion?: string;
}

export interface FastASTReport {
  timestamp: string;
  totalScannedFiles: number;
  totalLinesOfCode: number;
  findings: ASTFinding[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

/**
 * Multi-Agent Orchestration Interfaces
 */
export interface AgentRunOptions {
  domainId: number;
  domainName: string;
  chunk: DomainChunk;
  provider: ModelProvider;
  apiKey?: string;
  modelName?: string;
  localModelPath?: string;
  language: SupportedLanguage;
  onChunk?: (text: string) => void;
}

export interface AgentResult {
  domainId: number;
  domainName: string;
  markdown: string;
  issuesCount: number;
  criticalCount: number;
  durationMs: number;
}

/**
 * Executive Report & Summary Interfaces
 */
export interface AuditMetrics {
  healthScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  cleanDomains: number;
  totalFiles: number;
  totalLines: number;
  durationMs: number;
}
