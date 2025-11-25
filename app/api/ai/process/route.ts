import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  AIActionType,
  AI_PROMPTS,
  AI_PARAMS,
  OPTIMIZATION_FOCUS,
  AIRequestOptions,
} from '@/lib/ai-config';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TestResult {
  id: string;
  passed: boolean;
  output: string;
  expectedOutput: string;
  error?: string;
}

interface AIProcessRequest {
  type: AIActionType;
  code?: string;
  message?: string;
  conversationHistory?: Message[];
  problemDescription?: string;
  testResults?: TestResult[];
  issues?: string[];
  optimizationType?: 'performance' | 'readability' | 'both';
  language?: 'javascript' | 'typescript';
}

/**
 * Build the prompt for the given action type
 */
function buildPrompt(
  action: AIActionType,
  data: {
    code?: string;
    message?: string;
    problemDescription?: string;
    testResults?: TestResult[];
    issues?: string[];
    language?: string;
    optimizationType?: 'performance' | 'readability' | 'both';
  }
): string {
  const config = AI_PROMPTS[action];
  let prompt = config.userPrompt || '';

  // Replace placeholders
  if (action === 'optimize' && data.optimizationType) {
    prompt = prompt.replace(
      '{optimizationFocus}',
      OPTIMIZATION_FOCUS[data.optimizationType]
    );
  }

  if (data.language) {
    prompt = prompt.replace(/{language}/g, data.language);
  } else {
    prompt = prompt.replace(/{language}/g, 'javascript');
  }

  // Add problem description if provided
  if (data.problemDescription) {
    prompt += `\n\nProblem Description:\n${data.problemDescription}`;
  }

  // Add code if provided
  if (data.code) {
    const language = data.language || 'javascript';
    prompt += `\n\nCode to ${action === 'analyze' ? 'analyze' : action}:\n\`\`\`${language}\n${data.code}\n\`\`\``;
  }

  // Add test results for analyze action
  if (action === 'analyze' && data.testResults && data.testResults.length > 0) {
    const failedTests = data.testResults.filter((t) => !t.passed);
    if (failedTests.length > 0) {
      prompt += `\n\nTest Results:\n`;
      prompt += `- ${data.testResults.length} total tests\n`;
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

  // Add issues for fix action
  if (action === 'fix' && data.issues && data.issues.length > 0) {
    prompt = `Issues to fix:\n`;
    data.issues.forEach((issue, index) => {
      prompt += `${index + 1}. ${issue}\n`;
    });
    prompt += '\n' + config.userPrompt;
  }

  return prompt;
}

/**
 * Build the system prompt for chat action
 */
function buildSystemPrompt(
  action: AIActionType,
  data: {
    code?: string;
    problemDescription?: string;
  }
): string {
  if (action !== 'chat') {
    return '';
  }

  const config = AI_PROMPTS[action];
  let systemPrompt = config.systemPrompt || '';

  if (data.problemDescription) {
    systemPrompt += `\n\nCurrent Problem Description:\n${data.problemDescription}`;
  }

  if (data.code) {
    systemPrompt += `\n\nCurrent Code:\n\`\`\`javascript\n${data.code}\n\`\`\``;
  }

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIProcessRequest = await request.json();
    const {
      type,
      code,
      message,
      conversationHistory = [],
      problemDescription,
      testResults,
      issues,
      optimizationType = 'both',
      language = 'javascript',
    } = body;

    // Validate request
    if (!type || !Object.keys(AI_PROMPTS).includes(type)) {
      return NextResponse.json(
        { error: `Invalid type: ${type}. Must be one of: ${Object.keys(AI_PROMPTS).join(', ')}` },
        { status: 400 }
      );
    }

    if (type === 'chat' && !message) {
      return NextResponse.json(
        { error: 'Message is required for chat type' },
        { status: 400 }
      );
    }

    if (
      (type === 'analyze' || type === 'fix' || type === 'optimize') &&
      !code
    ) {
      return NextResponse.json(
        { error: `Code is required for ${type} type` },
        { status: 400 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Prepare the AI request based on type
    let messages: Message[];
    let systemPrompt = '';

    if (type === 'chat') {
      // For chat, use conversation history
      messages = [
        ...conversationHistory,
        { role: 'user', content: message! },
      ];
      systemPrompt = buildSystemPrompt(type, {
        code,
        problemDescription,
      });
    } else {
      // For analyze/fix/optimize, build the complete prompt
      const prompt = buildPrompt(type, {
        code,
        problemDescription,
        testResults,
        issues,
        language,
        optimizationType,
      });
      messages = [{ role: 'user', content: prompt }];
    }

    // Create a readable stream for SSE
    const stream = await client.messages.stream({
      model: AI_PARAMS.model,
      max_tokens: AI_PARAMS.maxTokens,
      ...(systemPrompt && { system: systemPrompt }),
      messages: messages,
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

