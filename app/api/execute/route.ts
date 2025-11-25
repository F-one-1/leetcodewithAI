import { NextRequest, NextResponse } from 'next/server';
import { createContext, runInContext } from 'vm';

interface ExecuteRequest {
  code: string;
  testCases?: Array<{
    input?: any;
    expectedOutput?: any;
  }>;
}

interface ExecuteResponse {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  testResults?: Array<{
    passed: boolean;
    output: string;
    expectedOutput?: any;
    error?: string;
  }>;
}

// Helper function to execute code with timeout
function executeCodeWithTimeout(
  code: string,
  outputs: string[],
  timeoutMs: number = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Code execution timeout (5s)'));
    }, timeoutMs);

    try {
      const sandbox = {
        console: {
          log: (...args: any[]) => {
            outputs.push(
              args
                .map((arg) => {
                  if (typeof arg === 'object') {
                    try {
                      return JSON.stringify(arg);
                    } catch {
                      return String(arg);
                    }
                  }
                  return String(arg);
                })
                .join(' ')
            );
          },
        },
      };

      const context = createContext(sandbox);
      runInContext(code, context);
      clearTimeout(timeoutId);
      resolve();
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<ExecuteResponse>> {
  try {
    const body: ExecuteRequest = await request.json();
    const { code, testCases = [] } = body;

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          success: false,
          output: '',
          error: 'Code is required and must be a string',
          executionTime: 0,
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const outputs: string[] = [];
    const testResults = [];

    try {
      // Execute the user code
      await executeCodeWithTimeout(code, outputs);
      const executionTime = Date.now() - startTime;

      // If there are test cases, run them
      if (testCases.length > 0) {
        for (const testCase of testCases) {
          try {
            const testOutputs: string[] = [];
            await executeCodeWithTimeout(code, testOutputs);

            const testOutput = testOutputs[testOutputs.length - 1] || '';
            const passed = testOutput === String(testCase.expectedOutput);

            testResults.push({
              passed,
              output: testOutput,
              expectedOutput: testCase.expectedOutput,
            });
          } catch (error) {
            testResults.push({
              passed: false,
              output: '',
              expectedOutput: testCase.expectedOutput,
              error: String(error),
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        output: outputs.join('\n'),
        executionTime,
        testResults: testResults.length > 0 ? testResults : undefined,
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return NextResponse.json({
        success: false,
        output: outputs.join('\n'),
        error: errorMessage,
        executionTime,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        output: '',
        error: 'Invalid request body',
        executionTime: 0,
      },
      { status: 400 }
    );
  }
}

