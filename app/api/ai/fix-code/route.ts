import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface FixCodeRequest {
  code: string;
  issues: string[];
  problemDescription?: string;
  language?: 'javascript' | 'typescript';
}

export async function POST(request: NextRequest) {
  try {
    const body: FixCodeRequest = await request.json();
    const { code, issues = [], problemDescription, language = 'javascript' } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build fix prompt
    let prompt = 'Please fix the following code to address the identified issues. ';
    prompt += 'Provide only the fixed code without additional explanation.\n\n';

    if (problemDescription) {
      prompt += `Problem Description:\n${problemDescription}\n\n`;
    }

    prompt += `Current Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    if (issues.length > 0) {
      prompt += 'Issues to fix:\n';
      issues.forEach((issue, index) => {
        prompt += `${index + 1}. ${issue}\n`;
      });
      prompt += '\n';
    }

    prompt += `Please provide the corrected code in a ${language} code block. `;
    prompt += 'Make sure the fixed code:\n`;
    prompt += '- Handles all edge cases\n';
    prompt += '- Has proper error handling\n';
    prompt += '- Follows best practices\n';
    prompt += '- Is well-commented where necessary\n\n';
    prompt += 'After the code block, provide a brief explanation of the changes made.';

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

