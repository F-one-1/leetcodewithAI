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
    consoleOutput?: string;
  }>;
}

// Helper function to detect function name from code (LeetCode style)
function detectFunctionName(code: string): string | null {
  // Match patterns like: var functionName = function(...) or function functionName(...) or const functionName = (...)
  const patterns = [
    /(?:var|let|const)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>)/,
    /function\s+(\w+)\s*\(/,
    /(?:var|let|const)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,
  ];
  // 乐观创建 + 
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Helper function to create a sandbox context with user code
function createCodeContext(code: string, outputs: string[]): any {
  const sandbox: any = {
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
  return context;
}

// Helper function to execute code with timeout
function executeCodeWithTimeout(
  code: string,
  outputs: string[],
  timeoutMs: number = 5000,
  functionName?: string | null,
  functionArgs?: any,
  existingContext?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Code execution timeout (5s)'));
    }, timeoutMs);

    try {
      // Use existing context if provided, otherwise create a new one
      const context = existingContext || createCodeContext(code, outputs);

      // If function name and args are provided, call the function and log the result
      if (functionName && functionArgs !== undefined) {
        // Verify function exists in the sandbox context
        if (typeof context[functionName] === 'function') {
          // Store function arguments in sandbox context
          // This allows the function call to happen within the sandbox
          context.__functionArgs__ = functionArgs;
          context.__result__ = undefined;

          // Execute function call within the sandbox context
          // This ensures the function runs in the same isolated environment
          try {
            // Build the function call code string
            // Handle different argument types (array, object, primitive)
            let callCode: string;
            if (Array.isArray(functionArgs)) {
              // For arrays, pass as single parameter (common LeetCode pattern)
              callCode = `__result__ = ${functionName}(__functionArgs__);`;
            } else {
              // For other types, pass directly
              callCode = `__result__ = ${functionName}(__functionArgs__);`;
            }

            // Execute the function call in the sandbox
            runInContext(callCode, context);

            // Get the result from the sandbox context
            const result = context.__result__;

            // Log the result
            if (typeof result === 'object' && result !== null) {
              try {
                outputs.push(JSON.stringify(result));
              } catch {
                outputs.push(String(result));
              }
            } else {
              outputs.push(String(result));
            }
            clearTimeout(timeoutId);
            resolve(result);
            return;
          } catch (callError) {
            // If function call fails, reject with the error
            clearTimeout(timeoutId);
            reject(callError);
            return;
          }
        }
      }

      clearTimeout(timeoutId);
      resolve(undefined);
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
      // Detect function name from code (for LeetCode style)
      const functionName = detectFunctionName(code);

      // Execute the user code first to define the function
      await executeCodeWithTimeout(code, outputs);

      // Create a shared context for test cases to avoid re-executing user code
      let sharedContext: any = null;
      if (testCases.length > 0 && functionName) {
        const tempOutputs: string[] = [];
        sharedContext = createCodeContext(code, tempOutputs);
      }

      // If there are test cases, run them by calling the function
      if (testCases.length > 0 && functionName) {
        for (const testCase of testCases) {
          try {
            const testOutputs: string[] = [];
            // Parse input - handle both array and single value
            let functionArgs: any;
            if (testCase.input !== undefined) {
              try {
                // Try to parse as JSON if it's a string
                if (typeof testCase.input === 'string') {
                  functionArgs = JSON.parse(testCase.input);
                } else {
                  functionArgs = testCase.input;
                }
              } catch {
                // If parsing fails, use as is
                functionArgs = testCase.input;
              }
            } else {
              functionArgs = [];
            }

            // Execute function call with test case input using shared context
            // This avoids re-executing the user code for each test case
            await executeCodeWithTimeout(code, testOutputs, 5000, functionName, functionArgs, sharedContext);

            // Separate console output from function return value
            // The last element is the function return value, everything else is console.log output
            const testOutput = testOutputs.length > 0 ? testOutputs[testOutputs.length - 1] || '' : '';
            const consoleOutput = testOutputs.length > 1
              ? testOutputs.slice(0, -1).join('\n')
              : '';

            // Compare output with expected output
            // Try to parse both as JSON for proper comparison of numbers, arrays, objects
            let passed = false;
            try {
              let testOutputValue: any = testOutput;
              let expectedOutputValue: any = testCase.expectedOutput;

              // Try to parse testOutput as JSON
              try {
                testOutputValue = JSON.parse(testOutput);
              } catch {
                // If parsing fails, try to convert to number if expected is number
                if (typeof expectedOutputValue === 'number') {
                  testOutputValue = Number(testOutput);
                }
              }

              // Compare values
              if (typeof testOutputValue === 'number' && typeof expectedOutputValue === 'number') {
                passed = testOutputValue === expectedOutputValue;
              } else if (typeof testOutputValue === 'object' && typeof expectedOutputValue === 'object') {
                passed = JSON.stringify(testOutputValue) === JSON.stringify(expectedOutputValue);
              } else {
                passed = String(testOutputValue) === String(expectedOutputValue);
              }
            } catch {
              // Fallback to string comparison
              passed = testOutput === String(testCase.expectedOutput);
            }

            testResults.push({
              passed,
              output: testOutput,
              consoleOutput: consoleOutput || undefined,
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
      } else if (testCases.length > 0 && !functionName) {
        // If test cases exist but no function detected, try to execute anyway
        for (const testCase of testCases) {
          try {
            const testOutputs: string[] = [];
            await executeCodeWithTimeout(code, testOutputs);

            // Separate console output from function return value
            const testOutput = testOutputs.length > 0 ? testOutputs[testOutputs.length - 1] || '' : '';
            const consoleOutput = testOutputs.length > 1
              ? testOutputs.slice(0, -1).join('\n')
              : '';
            const passed = testOutput === String(testCase.expectedOutput);

            testResults.push({
              passed,
              output: testOutput,
              consoleOutput: consoleOutput || undefined,
              expectedOutput: testCase.expectedOutput,
            });
          } catch (error) {
            testResults.push({
              passed: false,
              output: '',
              consoleOutput: undefined,
              expectedOutput: testCase.expectedOutput,
              error: String(error),
            });
          }
        }
      }

      const executionTime = Date.now() - startTime;

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

