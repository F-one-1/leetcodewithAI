export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface TestResult {
  output: string;
  passed: boolean;
  error?: string;
  consoleOutput?: string;
}

