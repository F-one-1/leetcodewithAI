/**
 * AI Configuration - Centralized Prompt and Parameter Management
 * Defines different AI operations and their specific prompts
 */

export type AIActionType = 'chat' | 'analyze' | 'fix' | 'optimize';

export interface AIPromptConfig {
  type: AIActionType;
  systemPrompt?: string;  // For chat-like operations
  userPrompt?: string;    // For single-turn operations
  description: string;
}

export interface AIRequestOptions {
  optimizationType?: 'performance' | 'readability' | 'both';
  language?: 'javascript' | 'typescript';
  issues?: string[];
}

/**
 * Prompt templates for different AI operations
 * Use {placeholder} for dynamic values that will be replaced at runtime
 */
export const AI_PROMPTS: Record<AIActionType, AIPromptConfig> = {
  chat: {
    type: 'chat',
    systemPrompt: `You are an expert code assistant for LeetCode-style problems.
You help users understand problems, review code, suggest improvements, and fix bugs.
Always provide clear, concise explanations.
When discussing code, use code blocks with proper formatting.
Focus on JavaScript and TypeScript.`,
    description: 'General code discussion and Q&A',
  },

  analyze: {
    type: 'analyze',
    userPrompt: `Please analyze the following code for a LeetCode-style problem.
Provide a detailed analysis covering:
1. Correctness issues (if any)
2. Time complexity and space complexity
3. Edge cases that might fail
4. Code quality and readability issues
5. Performance optimization suggestions
6. Best practices recommendations

Provide your analysis in a structured format with clear sections.`,
    description: 'Analyze code quality and provide insights',
  },

  fix: {
    type: 'fix',
    userPrompt: `Please fix the following code to address the identified issues.
Provide only the fixed code without additional explanation.

Please provide the corrected code in a {language} code block.
Make sure the fixed code:
- Handles all edge cases
- Has proper error handling
- Follows best practices
- Is well-commented where necessary

After the code block, provide a brief explanation of the changes made.`,
    description: 'Fix identified issues in the code',
  },

  optimize: {
    type: 'optimize',
    userPrompt: `Please optimize the following code.
{optimizationFocus}
Provide the optimized code in a code block followed by explanation of optimizations.

Please provide the optimized code in a {language} code block.
Then explain:
1. What optimizations were made
2. Why these optimizations improve the code
3. Performance impact (if applicable)`,
    description: 'Optimize code for performance or readability',
  },
};

/**
 * Optimization type descriptions
 */
export const OPTIMIZATION_FOCUS: Record<
  'performance' | 'readability' | 'both',
  string
> = {
  performance:
    'Focus on performance optimization. Reduce time and space complexity where possible.',
  readability:
    'Focus on code readability and maintainability. Improve naming, structure, and documentation.',
  both: 'Optimize for both performance and readability.',
};

/**
 * AI Model and request parameters
 */
export const AI_PARAMS = {
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 2048,
};

