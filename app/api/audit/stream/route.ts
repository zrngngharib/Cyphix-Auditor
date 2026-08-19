import { NextRequest } from 'next/server';
import { LANGUAGES, SupportedLanguage } from '@/lib/i18n';
import { runAstScan } from '@/lib/scanner/astScanner';
import { parseConcatenatedCodebase, routeFilesByDomain } from '@/lib/orchestrator/chunker';
import { runDomainAgent, runLocalUnifiedAudit, AgentResult } from '@/lib/agents/agentRunner';
import { truncateCodebase } from '@/lib/utils/llmInputHandler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

// Typed request body
interface StreamAuditRequestBody {
  codebase: string;
  apiKey?: string;
  modelName?: string;
  provider?: 'gemini' | 'claude' | 'deepseek-cloud' | 'local';
  localModelPath?: string;
  language?: SupportedLanguage;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body: StreamAuditRequestBody = await req.json();
    const {
      codebase,
      apiKey: clientApiKey,
      modelName,
      provider = 'gemini',
      localModelPath,
      language = 'ckb',
    } = body;

    const targetLang: SupportedLanguage = LANGUAGES[language as SupportedLanguage]
      ? (language as SupportedLanguage)
      : 'ckb';

    if (!codebase || typeof codebase !== 'string' || codebase.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No readable codebase content provided.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type: string, data: any) => {
          const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        const overallStart = Date.now();

        try {
          // -----------------------------------------------------------------
          // STEP 1: PARSE FILES & EMIT INITIAL METRICS
          // -----------------------------------------------------------------
          sendEvent('status', {
            step: 'init',
            message: targetLang === 'ckb' ? 'دەرهێنانی فایلەکان و ئامادەکردنی بریکارەکان...' : 'Extracting files and initializing multi-agent pipeline...',
            progress: 10,
          });

          const files = parseConcatenatedCodebase(codebase);
          sendEvent('metrics', {
            totalFiles: files.length,
            totalBytes: Buffer.byteLength(codebase, 'utf8'),
            totalLines: files.reduce((acc, f) => acc + f.linesCount, 0),
          });

          // -----------------------------------------------------------------
          // STEP 2: RUN FAST AST STATIC SCANNER (<50ms)
          // -----------------------------------------------------------------
          sendEvent('status', {
            step: 'ast_scanning',
            message: targetLang === 'ckb' ? 'پشکنینی خێرای ستاتیکی (AST & Secrets Scan)...' : 'Running fast AST & secret entropy scan...',
            progress: 20,
          });

          const astResult = runAstScan(files, targetLang);
          sendEvent('ast_findings', astResult);

          // -----------------------------------------------------------------
          // STEP 3: ROUTE FILES TO DOMAIN CHUNKS
          // -----------------------------------------------------------------
          sendEvent('status', {
            step: 'routing',
            message: targetLang === 'ckb' ? 'دابەشکردنی فایلەکان بەسەر ٧ بریکاری تەریبدا...' : 'Routing files into 7 domain-specific agent chunks...',
            progress: 30,
          });

          const maxDomainChars = provider === 'local' ? 30_000 : 120_000;
          const domainChunks = routeFilesByDomain(files, maxDomainChars);

          // -----------------------------------------------------------------
          // STEP 4: RUN MULTI-AGENT DOMAIN EVALUATIONS
          // -----------------------------------------------------------------
          const agentResults: AgentResult[] = [];
          const totalDomains = 7;

          if (provider === 'gemini' || provider === 'claude' || provider === 'deepseek-cloud') {
            // Run Cloud agents concurrently in 2 batches to respect rate limits
            const domainIds = [1, 2, 3, 4, 5, 6, 7];
            const batch1 = domainIds.slice(0, 4);
            const batch2 = domainIds.slice(4);

            const runBatch = async (batch: number[]) => {
              const promises = batch.map(async (dId) => {
                sendEvent('domain_start', { domainId: dId, domainName: domainChunks[dId].domainName });
                const res = await runDomainAgent({
                  domainId: dId,
                  domainName: domainChunks[dId].domainName,
                  chunk: domainChunks[dId],
                  provider,
                  apiKey: clientApiKey,
                  modelName,
                  language: targetLang,
                });
                agentResults.push(res);
                sendEvent('domain_complete', {
                  domainId: dId,
                  domainName: res.domainName,
                  issuesCount: res.issuesCount,
                  criticalCount: res.criticalCount,
                  durationMs: res.durationMs,
                  markdownSnippet: res.markdown.slice(0, 300),
                });
              });
              await Promise.all(promises);
            };

            sendEvent('status', {
              step: 'agents_running',
              message: targetLang === 'ckb' ? 'شیکاری فرە-بریکار بە تەریبی (تەوەرەکانی ١-٤)...' : 'Running parallel agents (Domains 1-4)...',
              progress: 45,
            });
            await runBatch(batch1);

            sendEvent('status', {
              step: 'agents_running',
              message: targetLang === 'ckb' ? 'شیکاری فرە-بریکار بە تەریبی (تەوەرەکانی ٥-٧)...' : 'Running parallel agents (Domains 5-7)...',
              progress: 75,
            });
            await runBatch(batch2);
          } else {
            // Local Offline LLM - run directly but periodically yield to flush SSE events
            sendEvent('status', {
              step: 'local_agent',
              message: targetLang === 'ckb' ? 'مۆدێلی ناوخۆیی لەسەر CPU دەستیپێکردبە شیکاری...' : 'Local CPU model starting audit...',
              progress: 50,
            });

            // Yield to event loop so SSE can flush before we start blocking work
            await new Promise<void>((r) => setImmediate(r));

            const localResults = await runLocalUnifiedAudit({
              codebase,
              localModelPath,
              language: targetLang,
              astFindings: astResult.findings,
              onDomainStart: (dId) => {
                const progressPct = Math.min(94, Math.round(55 + (dId / 7) * 38));
                sendEvent('domain_start', { domainId: dId, domainName: domainChunks[dId]?.domainName || `Domain ${dId}` });
                sendEvent('status', {
                  step: 'local_agent',
                  message: targetLang === 'ckb' ? `بریکاری #${dId} لە ناو مارکداونی ئەنجام دەدات...` : `Agent #${dId} writing section...`,
                  progress: progressPct,
                });
              },
              onDomainDone: (res) => {
                const progressPct = Math.min(94, Math.round(55 + (res.domainId / 7) * 38));
                sendEvent('domain_complete', {
                  domainId: res.domainId,
                  domainName: res.domainName,
                  issuesCount: res.issuesCount,
                  criticalCount: res.criticalCount,
                  durationMs: res.durationMs,
                  markdownSnippet: res.markdown.slice(0, 300),
                });
                sendEvent('status', {
                  step: 'local_agent',
                  message: targetLang === 'ckb' ? `✓ تەواوبوون: ${res.domainName}` : `✓ Done: ${res.domainName}`,
                  progress: progressPct,
                });
              },
            });

            agentResults.push(...localResults);
          }

          // Sort agent results by domainId
          agentResults.sort((a, b) => a.domainId - b.domainId);

          // -----------------------------------------------------------------
          // STEP 5: ASSEMBLE MASTER AUDIT REPORT
          // -----------------------------------------------------------------
          sendEvent('status', {
            step: 'finalizing',
            message: targetLang === 'ckb' ? 'داڕشتنی ڕاپۆرتی کۆتایی و هەژمارکردنی نمرەی ئاسایش...' : 'Compiling final report and calculating security score...',
            progress: 95,
          });

          const totalCritical = astResult.criticalCount + agentResults.reduce((sum, r) => sum + r.criticalCount, 0);
          const totalHigh = astResult.highCount + agentResults.reduce((sum, r) => sum + Math.max(0, r.issuesCount - r.criticalCount), 0);
          const scoreDeductions = totalCritical * 15 + totalHigh * 6 + astResult.mediumCount * 3 + astResult.lowCount * 1;
          const healthScore = Math.max(12, 100 - scoreDeductions);

          const executiveSummaryTitles: Record<SupportedLanguage, string> = {
            ckb: 'پوختەی بەڕێوەبەری و نمرەی کۆتایی (Executive Summary)',
            badini: 'پوختەیا کارگێڕی و نمرەیا دووماهیێ (Executive Summary)',
            en: 'Executive Summary & Final Audit Score',
            ar: 'الملخص التنفيذي والتقييم النهائي (Executive Summary)',
            fa: 'خلاصه اجرایی و نمره ارزیابی نهایی (Executive Summary)',
          };

          const astHeaderTitles: Record<SupportedLanguage, string> = {
            ckb: 'دۆزینەوەکانی پشکنەری خێرای ستاتیکی (Fast AST Pre-Scan)',
            badini: 'دیتنێن پشکنەرێ بلەزێ ستاتیکی (Fast AST Pre-Scan)',
            en: 'Fast AST Static Scanner Findings',
            ar: 'نتائج الفحص الثابت السريع (Fast AST Pre-Scan)',
            fa: 'یافته‌های پویشگر ایستای سریع (Fast AST Pre-Scan)',
          };

          let compiledReport = `# ${executiveSummaryTitles[targetLang]}\n\n`;
          compiledReport += `**Overall Codebase Health Score:** \`${healthScore}/100\`\n\n`;
          compiledReport += `* **Analyzed Files:** ${files.length} files (${files.reduce((a, f) => a + f.linesCount, 0)} lines)\n`;
          compiledReport += `* **Multi-Agent Engine:** ${provider.toUpperCase()} (${agentResults.length} parallel specialized agents)\n`;
          compiledReport += `* **Total Identified Vulnerabilities:** ${totalCritical + totalHigh + astResult.mediumCount + astResult.lowCount} (Critical: 🔴 ${totalCritical} | High: 🟠 ${totalHigh})\n\n`;

          if (astResult.findings.length > 0) {
            compiledReport += `## ⚡ ${astHeaderTitles[targetLang]}\n\n`;
            for (const f of astResult.findings) {
              compiledReport += `- **Severity:** [${f.severity === 'CRITICAL' ? '🔴 CRITICAL' : f.severity === 'HIGH' ? '🟠 HIGH' : '🟡 MEDIUM'}]\n`;
              compiledReport += `  - **File/Location:** \`${f.file}:${f.line}\`\n`;
              compiledReport += `  - **Issue:** ${f.issue}\n`;
              compiledReport += `  - **Snippet:** \`${f.snippet}\`\n`;
              compiledReport += `  - **Fix:** ${f.fix}\n\n`;
            }
          }

          for (const res of agentResults) {
            compiledReport += `${res.markdown.trim()}\n\n`;
          }

          sendEvent('complete', {
            report: compiledReport,
            healthScore,
            totalCritical,
            totalHigh,
            totalDurationMs: Date.now() - overallStart,
            modelUsed: provider === 'local' ? `Local Offline GGUF` : modelName || provider,
            language: targetLang,
            provider,
          });

          controller.close();
        } catch (err: any) {
          console.error('SSE Stream Error:', err);
          sendEvent('error', {
            message: err?.message || 'An error occurred during distributed multi-agent auditing.',
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Failed to start stream' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
