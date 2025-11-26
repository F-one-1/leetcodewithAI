export interface ProblemData {
  id: string;
  title: string;
  difficulty: string;
  content: string;
  codeExample?: string;
  testCases?: Array<{
    id: string;
    input: any;
    expectedOutput: any;
    description?: string;
  }>;
}

