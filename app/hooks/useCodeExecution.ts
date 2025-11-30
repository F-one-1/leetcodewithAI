import { useState } from 'react';
import axios from 'axios';
import type { TestCase, TestResult } from '@/types';

export function useCodeExecution() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isSubmitMode, setIsSubmitMode] = useState(false);
  const [allTestCases, setAllTestCases] = useState<TestCase[]>([]);

  const executeCode = async (code: string, testCases: TestCase[]) => {
    setLoading(true);
    setTestResults({});
    setAllTestCases([]);
    setIsSubmitMode(false);

    try {
      const results: Record<string, TestResult> = {};

      // Parse test cases for API
      const apiTestCases = testCases.map((tc) => {
        let input: any;
        try {
          if (typeof tc.input === 'string' && tc.input.trim()) {
            input = JSON.parse(tc.input);
          } else {
            input = tc.input;
          }
        } catch {
          input = tc.input;
        }

        return {
          input,
          expectedOutput: tc.expectedOutput,
        };
      });

      try {
        const response = await axios.post('/api/execute', {
          code,
          testCases: apiTestCases,
        });

        const {
          success,
          output: execOutput,
          error: execError,
          executionTime: time,
          testResults: apiTestResults,
        } = response.data;
        setExecutionTime(time);

        if (success) {
          if (apiTestResults && apiTestResults.length > 0) {
            testCases.forEach((tc, index) => {
              if (apiTestResults[index]) {
                results[tc.id] = {
                  output: apiTestResults[index].output || '',
                  passed: apiTestResults[index].passed || false,
                  error: apiTestResults[index].error,
                  consoleOutput: apiTestResults[index].consoleOutput,
                };
              }
            });
          } else {
            // Fallback: compare output with expected output
            testCases.forEach((tc) => {
              const passed = execOutput.trim() === tc.expectedOutput.trim();
              results[tc.id] = {
                output: execOutput,
                passed,
              };
            });
          }
        } else {
          testCases.forEach((tc) => {
            results[tc.id] = {
              output: '',
              passed: false,
              error: execError,
            };
          });
        }
      } catch (err) {
        testCases.forEach((tc) => {
          results[tc.id] = {
            output: '',
            passed: false,
            error: err instanceof Error ? err.message : 'Failed to execute',
          };
        });
      }

      setTestResults(results);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (code: string, problemId: string) => {
    setSubmitting(true);
    setTestResults({});

    try {
      const response = await axios.get(`/api/problems/${problemId}?all=true`);
      const problemData = response.data;

      if (!problemData.testCases || problemData.testCases.length === 0) {
        console.error('No test cases found');
        return false;
      }

      const apiTestCases = problemData.testCases.map((tc: any) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }));

      const executeResponse = await axios.post('/api/execute', {
        code,
        testCases: apiTestCases,
      });

      const { success, testResults: apiTestResults, error: execError } = executeResponse.data;
      const results: Record<string, TestResult> = {};

      if (success && apiTestResults && apiTestResults.length > 0) {
        problemData.testCases.forEach((tc: any, index: number) => {
          if (apiTestResults[index]) {
            results[tc.id] = {
              output: apiTestResults[index].output || '',
              passed: apiTestResults[index].passed || false,
              error: apiTestResults[index].error,
              consoleOutput: apiTestResults[index].consoleOutput,
            };
          }
        });
      } else {
        problemData.testCases.forEach((tc: any) => {
          results[tc.id] = {
            output: '',
            passed: false,
            error: execError || 'Execution failed',
          };
        });
      }

      const formattedAllTestCases: TestCase[] = problemData.testCases.map((tc: any) => ({
        id: tc.id,
        input: Array.isArray(tc.input) ? JSON.stringify(tc.input) : String(tc.input),
        expectedOutput: String(tc.expectedOutput),
      }));
      setAllTestCases(formattedAllTestCases);
      setIsSubmitMode(true);
      setTestResults(results);
      return true;
    } catch (error) {
      console.error('提交失败:', error);
      setTestResults({
        error: {
          output: '',
          passed: false,
          error: error instanceof Error ? error.message : 'Failed to submit',
        },
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    executionTime,
    testResults,
    isSubmitMode,
    allTestCases,
    executeCode,
    submitCode,
  };
}

