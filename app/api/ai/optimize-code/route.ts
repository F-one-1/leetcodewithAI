import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface OptimizeRequest {
  code: string;
  optimizationType?: 'performance' | 'readability' | 'both';
  problemDescription?: string;
  language?: 'javascript' | 'typescript';
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeRequest = await request.json();
    const {
      code,
      optimizationType = 'both',
      problemDescription,
      language = 'javascript',
    } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build optimization prompt
    let prompt = 'Please optimize the following code. ';

    if (optimizationType === 'performance') {
      prompt += 'Focus on performance optimization. ';
      prompt += 'Reduce time and space complexity where possible. ';
    } else if (optimizationType === 'readability') {
      prompt += 'Focus on code readability and maintainability. ';
      prompt += 'Improve naming, structure, and documentation. ';
    } else {
      prompt += 'Optimize for both performance and readability. ';
    }

    prompt += 'Provide the optimized code in a code block followed by explanation of optimizations.\n\n';

    if (problemDescription) {
      prompt += `Problem Description:\n${problemDescription}\n\n`;
    }

    prompt += `Current Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    prompt += `Please provide the optimized code in a ${language} code block. `;
    prompt += 'Then explain:\n';
    prompt += '1. What optimizations were made\n';
    prompt += '2. Why these optimizations improve the code\n';
    prompt += '3. Performance impact (if applicable)\n';

    // Create a readable stream for SSE
    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Create a new Response with streaming
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text;
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content: text })}\n\n`)
              );
            }
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

