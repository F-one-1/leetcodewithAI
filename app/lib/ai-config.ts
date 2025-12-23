/**
 * AI Configuration - Centralized Prompt and Parameter Management
 * Defines AI operations and their specific prompts
 */

export type AIActionType = 'chat' | 'analyze-with-chain';

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
2. Code quality and readability issues
3. Performance optimization recommendation
4. Best practice recommendation

After your analysis, provide an improved version of the code that addresses the issues you identified.
Please provide the improved code in a code block with proper syntax highlighting.`;

/**
 * Available Claude Models Configuration
 */
export const CLAUDE_MODELS = {
  'claude-haiku-4-5-20251001': {
    name: 'Claude Haiku',
    description: '快速且高效，适合简单任务',
    maxTokens: 2048,
  },
  'claude-sonnet-4-5-20250514': {
    name: 'Claude Sonnet',
    description: '平衡性能和智能，适合大多数任务',
    maxTokens: 8192,
  },
  'claude-opus-4-5-20250514': {
    name: 'Claude Opus',
    description: '最智能的模型，适合复杂任务',
    maxTokens: 8192,
  },
  'claude-3-5-sonnet-20241022': {
    name: 'Claude 3.5 Sonnet',
    description: '最新版本，代码能力更强',
    maxTokens: 8192,
  },
} as const;

export type ClaudeModelName = keyof typeof CLAUDE_MODELS;

/**
 * Default model
 */
export const DEFAULT_MODEL: ClaudeModelName = 'claude-haiku-4-5-20251001';

/**
 * Get AI parameters for a specific model
 */
export function getAIParams(modelName?: ClaudeModelName) {
  const model = modelName || DEFAULT_MODEL;
  const modelConfig = CLAUDE_MODELS[model];
  return {
    model,
    maxTokens: modelConfig.maxTokens,
  };
}

/**
 * AI Model and request parameters (deprecated, use getAIParams instead)
 * @deprecated Use getAIParams() instead
 */
export const AI_PARAMS = {
  model: DEFAULT_MODEL,
  maxTokens: CLAUDE_MODELS[DEFAULT_MODEL].maxTokens,
};
