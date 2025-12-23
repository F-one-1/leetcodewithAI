/**
 * AI Client - Frontend utility for communicating with AI backend APIs
 * Handles streaming responses using EventSource (SSE)
 * 
 * All methods now use the unified /api/ai/process endpoint internally
 * while maintaining backward compatibility with the original API
 */

import type { ClaudeModelName } from '@/lib/ai-config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamCallback {
  onData?: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export class AIClient {
  /**
   * Internal method to call the unified AI process endpoint
   */
  private static async callAIProcess(
    type: 'chat',
    callbacks: StreamCallback,
    payload: Record<string, any>
  ): Promise<void> {
    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          ...payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      await this.handleStream(response, callbacks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks.onError?.(errorMessage);
    }
  }

  /**
   * Send a chat message and stream the response
   */
  static async chat(
    message: string,
    callbacks: StreamCallback,
    options?: {
      conversationHistory?: Message[];
      code?: string;
      problemDescription?: string;
      model?: ClaudeModelName;
    }
  ): Promise<void> {
    return this.callAIProcess('chat', callbacks, {
      message,
      conversationHistory: options?.conversationHistory || [],
      code: options?.code,
      problemDescription: options?.problemDescription,
      model: options?.model,
    });
  }

  /**
   * AI Power mode - analyze code and return improved version
   * 使用传统的单次调用方式
   */
  static async aiPower(
    code: string,
    callbacks: StreamCallback,
    options?: {
      problemDescription?: string;
      useChain?: boolean; // 是否使用 LangChain 链式分析
      model?: ClaudeModelName;
    }
  ): Promise<void> {
    // 如果启用链式分析，使用新的 LangChain 端点
    if (options?.useChain) {
      return this.aiPowerWithChain(code, callbacks, options);
    }

    // 原有的单次调用方式
    const { AI_POWER_PROMPT } = await import('@/lib/ai-config');
    
    const message = `${AI_POWER_PROMPT}\n\nCode to analyze:\n\`\`\`javascript\n${code}\n\`\`\``;
    
    return this.callAIProcess('chat', callbacks, {
      message,
      conversationHistory: [],
      code,
      problemDescription: options?.problemDescription,
      model: options?.model,
    });
  }

  /**
   * AI Power mode with LangChain - 使用多步骤链式分析
   */
  static async aiPowerWithChain(
    code: string,
    callbacks: StreamCallback,
    options?: {
      problemDescription?: string;
      model?: ClaudeModelName;
    }
  ): Promise<void> {
    try {
      const response = await fetch('/api/ai/analyze-chain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          problemDescription: options?.problemDescription,
          model: options?.model,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      await this.handleStream(response, callbacks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks.onError?.(errorMessage);
    }
  }

  /**
   * Handle SSE streaming response
   */
  private static async handleStream(
    response: Response,
    callbacks: StreamCallback
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError?.('Failed to get response stream');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              callbacks.onComplete?.();
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.error) {
                callbacks.onError?.(parsed.error);
                return;
              }

              if (parsed.content) {
                callbacks.onData?.(parsed.content);
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      }

      // Handle any remaining buffer
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6);
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              callbacks.onData?.(parsed.content);
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }

      callbacks.onComplete?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Stream error';
      callbacks.onError?.(errorMessage);
    } finally {
      reader.releaseLock();
    }
  }
}

