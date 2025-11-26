export interface ExecuteRequest {
  code: string;
  testCases?: Array<{
    input?: any;
    expectedOutput?: any;
  }>;
}

export interface ExecuteResponse {
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

