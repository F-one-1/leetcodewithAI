/**
 * AI Configuration - Centralized Prompt and Parameter Management
 * Defines AI operations and their specific prompts
 */

export type AIActionType = 'chat';

export interface AIPromptConfig {
  type: AIActionType;
  systemPrompt?: string;  // For chat-like operations
  description: string;
}

/**
 * Prompt templates for AI operations
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
};

/**
 * AI Power mode prompt - for code analysis and improvement
 */
export const AI_POWER_PROMPT = `Please analyze the following code for a LeetCode-style problem.
Provide a detailed analysis covering:
1. Correctness issues (if any)
2. Time complexity and space complexity
3. Edge cases that might fail
4. Code quality and readability issues
5. Performance optimization suggestions
6. Best practices recommendations

After your analysis, provide an improved version of the code that addresses the issues you identified.
Please provide the improved code in a code block with proper syntax highlighting.`;

/**
 * AI Model and request parameters
 */
export const AI_PARAMS = {
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 2048,
};
