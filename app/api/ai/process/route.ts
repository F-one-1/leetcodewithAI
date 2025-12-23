import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  AIActionType,
  AI_PROMPTS,
  getAIParams,
  type ClaudeModelName,
} from '@/lib/ai-config';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIProcessRequest {
  type: AIActionType;
  message?: string;
  conversationHistory?: Message[];
  code?: string;
  problemDescription?: string;
  model?: ClaudeModelName;
}

/**
 * Build the system prompt for chat action
 */
function buildSystemPrompt(
  code?: string,
  problemDescription?: string,
): string {
  const config = AI_PROMPTS['chat'];
  let systemPrompt = config.systemPrompt || '';

  if (problemDescription) {
    systemPrompt += `\n\nCurrent Problem Description:\n${problemDescription}`;
  }

  if (code) {
    systemPrompt += `\n\nCurrent Code:\n\`\`\`javascript\n${code}\n\`\`\``;
  }

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIProcessRequest = await request.json();
    const {
      type,
      message,
      conversationHistory = [],
      code,
      problemDescription,
      model,
    } = body;

    // Validate request
    if (!type || type !== 'chat') {
      return NextResponse.json(
        { error: `Invalid type: ${type}. Only 'chat' is supported.` },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required for chat type' },
        { status: 400 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // For chat, use conversation history
    const messages: Message[] = [
      ...conversationHistory,
      { role: 'user', content: message },
    ];
    const systemPrompt = buildSystemPrompt(code, problemDescription);

    // Get AI parameters for the specified model (or use default)
    const aiParams = getAIParams(model);

    // Create a readable stream for SSE
    const stream = await client.messages.stream({
      model: aiParams.model,
      max_tokens: aiParams.maxTokens,
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
