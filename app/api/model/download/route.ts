import { NextRequest, NextResponse } from 'next/server';
import { modelDownloader, MODEL_CONFIGS } from '@/lib/modelDownloader';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelKey = 'deepseek-r1-7b', customUrl, action = 'start' } = body;

    const config = MODEL_CONFIGS[modelKey] || MODEL_CONFIGS['deepseek-r1-7b'];

    if (action === 'cancel') {
      const cancelled = modelDownloader.cancelDownload(modelKey);
      return NextResponse.json({
        success: true,
        message: cancelled ? `Download cancelled for ${config.name}` : `No active download to cancel`,
        modelId: modelKey,
      });
    }

    // Start or Retry Download
    const result = await modelDownloader.startDownload(modelKey, customUrl);

    return NextResponse.json({
      success: true,
      message: result.message,
      modelId: modelKey,
      fileName: config.fileName,
      url: customUrl || config.url,
    });
  } catch (error: any) {
    console.error('Error initiating model download:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to start model download' },
      { status: 500 }
    );
  }
}
