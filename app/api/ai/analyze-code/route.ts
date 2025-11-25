import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface TestResult {
  id: string;
  passed: boolean;
  output: string;
  expectedOutput: string;
  error?: string;
}

interface AnalyzeRequest {
  code: string;
  problemDescription?: string;
  testResults?: TestResult[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { code, problemDescription, testResults = [] } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build analysis prompt
    let prompt = 'Please analyze the following code for a LeetCode-style problem. ';
    prompt += 'Provide a detailed analysis covering:\n';
    prompt += '1. Correctness issues (if any)\n';
    prompt += '2. Time complexity and space complexity\n';
    prompt += '3. Edge cases that might fail\n';
    prompt += '4. Code quality and readability issues\n';
    prompt += '5. Performance optimization suggestions\n';
    prompt += '6. Best practices recommendations\n\n';

    if (problemDescription) {
      prompt += `Problem Description:\n${problemDescription}\n\n`;
    }

    prompt += `Code to analyze:\n\`\`\`javascript\n${code}\n\`\`\`\n\n`;

    if (testResults.length > 0) {
      const failedTests = testResults.filter((t) => !t.passed);
      if (failedTests.length > 0) {
        prompt += `\nTest Results:\n`;
        prompt += `- ${testResults.length} total tests\n`;
        prompt += `- ${failedTests.length} failed tests\n`;
        failedTests.forEach((test) => {
          prompt += `\nFailed Test (ID: ${test.id}):\n`;
          prompt += `Expected: ${test.expectedOutput}\n`;
          prompt += `Got: ${test.output}\n`;
          if (test.error) {
            prompt += `Error: ${test.error}\n`;
          }
        });
      }
    }

    prompt += '\nProvide your analysis in a structured format with clear sections.';

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

