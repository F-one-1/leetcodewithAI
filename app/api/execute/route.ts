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

// Helper function to detect function name from code (LeetCode style)
function detectFunctionName(code: string): string | null {
  // Match patterns like: var functionName = function(...) or function functionName(...) or const functionName = (...)
  const patterns = [
    /(?:var|let|const)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>)/,
    /function\s+(\w+)\s*\(/,
    /(?:var|let|const)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Helper function to execute code with timeout
function executeCodeWithTimeout(
  code: string,
  outputs: string[],
  timeoutMs: number = 5000,
  functionName?: string | null,
  functionArgs?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Code execution timeout (5s)'));
    }, timeoutMs);

    try {
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

      // If function name and args are provided, call the function and log the result
      if (functionName && functionArgs !== undefined) {
        const func = context[functionName];
        if (typeof func === 'function') {
          // For LeetCode style, usually the function takes an array as the first parameter
          // If functionArgs is already an array, pass it directly; otherwise wrap it
          let result: any;
          if (Array.isArray(functionArgs)) {
            // Pass array as first parameter (common LeetCode pattern)
            result = func(functionArgs);
          } else {
            // For non-array inputs, pass directly
            result = func(functionArgs);
          }
          
          // Log the result
          if (typeof result === 'object') {
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

            // Execute code and call function with test case input
            await executeCodeWithTimeout(code, testOutputs, 5000, functionName, functionArgs);

            const testOutput = testOutputs[testOutputs.length - 1] || '';
            
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

