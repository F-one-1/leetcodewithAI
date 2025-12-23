/**
 * LangChain Code Analysis Chain
 * 多步骤代码分析链：问题分析 → 代码优化 → 结果格式化
 */

import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { DEFAULT_MODEL, type ClaudeModelName } from "@/lib/ai-config";

const outputParser = new StringOutputParser();

/**
 * Create LLM instance with specified model
 */
function createLLM(modelName?: ClaudeModelName): ChatAnthropic {
  return new ChatAnthropic({
    modelName: modelName || DEFAULT_MODEL,
    temperature: 0.7,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });
}

/**
 * 步骤1: 代码问题分析
 * 分析代码的正确性、性能、代码质量等问题
 */
const analysisPrompt = PromptTemplate.fromTemplate(`
你是一位专业的代码审查专家。请仔细分析以下代码，找出所有问题。

题目描述：
{problemDescription}

代码：
\`\`\`javascript
{code}
\`\`\`

请提供详细的分析报告，包括：
1. **正确性问题**：逻辑错误、边界条件处理、特殊情况等
2. **性能问题**：时间复杂度、空间复杂度、可优化点
3. **代码质量问题**：可读性、代码风格、最佳实践
4. **具体改进建议**：针对每个问题提供具体的改进方向

请用清晰的结构化格式输出你的分析结果。
`);

/**
 * 步骤2: 代码优化生成
 * 基于分析结果生成优化后的代码
 */
const optimizationPrompt = PromptTemplate.fromTemplate(`
基于以下代码分析结果，请生成改进后的完整代码。

原始代码：
\`\`\`javascript
{code}
\`\`\`

分析结果：
{analysis}

题目描述：
{problemDescription}

要求：
1. 修复所有已发现的正确性问题
2. 优化性能（时间和空间复杂度）
3. 提升代码质量和可读性
4. 遵循 JavaScript/TypeScript 最佳实践
5. 保持函数签名和接口不变

请直接输出优化后的完整代码，使用 \`\`\`javascript 代码块包裹。
代码应该可以直接运行，不要包含额外的解释文字（分析部分已经在第一步完成）。
`);

/**
 * 步骤3: 结果格式化
 * 将分析和优化结果格式化为最终输出
 */
const formatPrompt = PromptTemplate.fromTemplate(`
请将以下内容格式化为一个完整、易读的分析报告：

代码分析：
{analysis}

优化后的代码：
{optimizedCode}

请按照以下格式输出：

## 代码分析

（此处放置分析结果）

## 优化后的代码

（此处放置优化后的代码块）

确保格式清晰，代码块使用正确的 markdown 语法。
`);

/**
 * 创建代码分析链
 * 使用 RunnableSequence 将多个步骤串联起来
 */
export async function analyzeCodeWithChain(
  code: string,
  problemDescription?: string,
  modelName?: ClaudeModelName
): Promise<string> {
  try {
    const llm = createLLM(modelName);

    // 构建分析链
    const analysisChain = RunnableSequence.from([
      analysisPrompt,
      llm,
      outputParser,
    ]);

    const optimizationChain = RunnableSequence.from([
      optimizationPrompt,
      llm,
      outputParser,
    ]);

    const formatChain = RunnableSequence.from([
      formatPrompt,
      llm,
      outputParser,
    ]);

    // 步骤1: 代码分析
    const analysis = await analysisChain.invoke({
      code,
      problemDescription: problemDescription || "未提供题目描述",
    });

    // 步骤2: 代码优化
    const optimizedCode = await optimizationChain.invoke({
      code,
      analysis,
      problemDescription: problemDescription || "未提供题目描述",
    });

    // 步骤3: 格式化结果
    const formattedResult = await formatChain.invoke({
      analysis,
      optimizedCode,
    });

    return formattedResult;
  } catch (error) {
    console.error("LangChain code analysis error:", error);
    throw new Error(
      `代码分析失败: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
}

/**
 * 流式代码分析链（返回 AsyncGenerator）
 * 支持逐步输出分析结果
 */
export async function* analyzeCodeWithChainStream(
  code: string,
  problemDescription?: string,
  modelName?: ClaudeModelName
): AsyncGenerator<string, void, unknown> {
  try {
    const llm = createLLM(modelName);

    // 步骤1: 代码分析（流式）
    yield "🔍 **正在分析代码问题...**\n\n";
    
    const analysisChain = RunnableSequence.from([
      analysisPrompt,
      llm,
      outputParser,
    ]);
    
    const analysisStream = await analysisChain.stream({
      code,
      problemDescription: problemDescription || "未提供题目描述",
    });

    let analysis = "";
    for await (const chunk of analysisStream) {
      analysis += chunk;
      yield chunk;
    }

    yield "\n\n✨ **正在生成优化代码...**\n\n";

    // 步骤2: 代码优化（流式）
    const optimizationChain = RunnableSequence.from([
      optimizationPrompt,
      llm,
      outputParser,
    ]);
    
    const optimizationStream = await optimizationChain.stream({
      code,
      analysis,
      problemDescription: problemDescription || "未提供题目描述",
    });

    let optimizedCode = "";
    for await (const chunk of optimizationStream) {
      optimizedCode += chunk;
      yield chunk;
    }

    // 步骤3: 格式化（可选，如果需要可以在这里添加）
    // 对于流式输出，我们可以跳过格式化步骤，直接返回前两步的结果
    yield "\n\n✅ **分析完成！**";
  } catch (error) {
    console.error("LangChain code analysis stream error:", error);
    throw new Error(
      `代码分析失败: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
}

