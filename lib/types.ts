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

export type AuditStage =
  | 'idle'
  | 'reading'
  | 'analyzing'
  | 'generating'
  | 'completed'
  | 'error';

export interface AuditDomainStatus {
  id: number;
  title: string;
  icon: string;
  status: 'pending' | 'analyzing' | 'done';
}
