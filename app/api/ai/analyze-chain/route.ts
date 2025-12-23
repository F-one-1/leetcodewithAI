/**
 * LangChain Code Analysis Chain API
 * 提供基于 LangChain 的多步骤代码分析功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeCodeWithChain, analyzeCodeWithChainStream } from '@/lib/langchain';
import type { ClaudeModelName } from '@/lib/ai-config';

export const runtime = 'nodejs';
export const maxDuration = 120; // LangChain 链式调用可能需要更长时间

interface AnalyzeChainRequest {
  code: string;
  problemDescription?: string;
  stream?: boolean; // 是否使用流式输出
  model?: ClaudeModelName;
}

/**
 * POST /api/ai/analyze-chain
 * 使用 LangChain 多步骤链分析代码
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeChainRequest = await request.json();
    const { code, problemDescription, stream = false, model } = body;

    // 验证输入
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    // 流式输出
    if (stream) {
      const responseStream = new ReadableStream({
        async start(controller) {
          try {
            const generator = analyzeCodeWithChainStream(code, problemDescription, model);
            
            for await (const chunk of generator) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
              );
            }

            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(responseStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 非流式输出
    const result = await analyzeCodeWithChain(code, problemDescription, model);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Analyze chain error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

