/**
 * AI Client - Frontend utility for communicating with AI backend APIs
 * Handles streaming responses using EventSource (SSE)
 */

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
   * Send a chat message and stream the response
   */
  static async chat(
    message: string,
    callbacks: StreamCallback,
    options?: {
      conversationHistory?: Message[];
      code?: string;
      problemDescription?: string;
    }
  ): Promise<void> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: options?.conversationHistory || [],
          code: options?.code,
          problemDescription: options?.problemDescription,
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
   * Analyze code for issues and improvements
   */
  static async analyzeCode(
    code: string,
    callbacks: StreamCallback,
    options?: {
      problemDescription?: string;
      testResults?: Array<{
        id: string;
        passed: boolean;
        output: string;
        expectedOutput: string;
        error?: string;
      }>;
    }
  ): Promise<void> {
    try {
      const response = await fetch('/api/ai/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          problemDescription: options?.problemDescription,
          testResults: options?.testResults,
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
   * Fix code issues
   */
  static async fixCode(
    code: string,
    callbacks: StreamCallback,
    options?: {
      issues?: string[];
      problemDescription?: string;
      language?: 'javascript' | 'typescript';
    }
  ): Promise<void> {
    try {
      const response = await fetch('/api/ai/fix-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          issues: options?.issues || [],
          problemDescription: options?.problemDescription,
          language: options?.language || 'javascript',
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
   * Optimize code for performance or readability
   */
  static async optimizeCode(
    code: string,
    callbacks: StreamCallback,
    options?: {
      optimizationType?: 'performance' | 'readability' | 'both';
      problemDescription?: string;
      language?: 'javascript' | 'typescript';
    }
  ): Promise<void> {
    try {
      const response = await fetch('/api/ai/optimize-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          optimizationType: options?.optimizationType || 'both',
          problemDescription: options?.problemDescription,
          language: options?.language || 'javascript',
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

