# 模型选择功能实现文档

## 概述

已成功实现 Claude 模型选择功能，用户可以在 AI 面板中选择不同的 Claude 模型进行分析和对话。

## 实现的功能

### 1. 可用的 Claude 模型

在 `app/lib/ai-config.ts` 中定义了以下模型：

- **Claude Haiku** (`claude-haiku-4-5-20251001`)
  - 快速且高效，适合简单任务
  - 默认模型
  - Max Tokens: 2048

- **Claude Sonnet** (`claude-sonnet-4-5-20250514`)
  - 平衡性能和智能，适合大多数任务
  - Max Tokens: 8192

- **Claude Opus** (`claude-opus-4-5-20250514`)
  - 最智能的模型，适合复杂任务
  - Max Tokens: 8192

- **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`)
  - 最新版本，代码能力更强
  - Max Tokens: 8192

### 2. UI 变更

在 AI 面板的 Header 区域添加了模型选择下拉框：

- 位置：AI Assistant 标题右侧，关闭按钮左侧
- 功能：选择不同的 Claude 模型
- 状态：在加载或 AI Power 运行时禁用
- 提示：鼠标悬停显示模型描述

### 3. 代码变更

#### 配置文件 (`app/lib/ai-config.ts`)
- 添加 `CLAUDE_MODELS` 对象定义所有可用模型
- 添加 `ClaudeModelName` 类型
- 添加 `getAIParams()` 函数根据模型名获取配置

#### 客户端 (`app/lib/ai-client.ts`)
- `chat()` 方法支持 `model` 参数
- `aiPower()` 方法支持 `model` 参数
- `aiPowerWithChain()` 方法支持 `model` 参数

#### API 路由 (`app/api/ai/process/route.ts`)
- 支持 `model` 请求参数
- 使用 `getAIParams()` 获取模型配置

#### LangChain 链 (`app/lib/langchain/code-analysis-chain.ts`)
- 添加 `createLLM()` 工厂函数
- `analyzeCodeWithChain()` 支持 `modelName` 参数
- `analyzeCodeWithChainStream()` 支持 `modelName` 参数

#### LangChain API (`app/api/ai/analyze-chain/route.ts`)
- 支持 `model` 请求参数
- 传递给 LangChain 链函数

#### UI 组件 (`app/components/ai/AIPanel.tsx`)
- 添加 `selectedModel` 状态
- 添加模型选择下拉框
- 在所有 API 调用中传递选中的模型

## 使用方法

### 用户使用

1. 打开 AI 面板
2. 在右上角找到模型选择下拉框
3. 选择想要使用的模型
4. 进行对话或代码分析时，将使用选中的模型

### 开发使用

```typescript
// 在代码中使用
import { CLAUDE_MODELS, DEFAULT_MODEL, type ClaudeModelName } from '@/lib/ai-config';

// 获取模型配置
const params = getAIParams('claude-sonnet-4-5-20250514');

// 在 API 调用中指定模型
await AIClient.chat(message, callbacks, {
  model: 'claude-sonnet-4-5-20250514',
  // ... 其他选项
});
```

## 向后兼容性

- 如果没有指定模型，默认使用 `DEFAULT_MODEL` (Claude Haiku)
- 现有的 API 调用不需要修改即可继续工作
- 所有模型参数都是可选的

## 注意事项

1. **模型成本**：不同的模型有不同的定价，Claude Opus 最贵，Claude Haiku 最便宜
2. **响应速度**：Claude Haiku 最快，Claude Opus 最慢但最智能
3. **Token 限制**：不同模型有不同的 max_tokens 限制
4. **API 密钥**：确保 `ANTHROPIC_API_KEY` 环境变量已正确设置

## 未来扩展

可以轻松添加更多模型：

1. 在 `CLAUDE_MODELS` 中添加新模型配置
2. UI 会自动显示新模型（无需修改组件代码）
3. 所有 API 和链都会自动支持新模型

## 测试建议

1. 测试不同模型的选择功能
2. 验证模型参数正确传递给 API
3. 测试模型切换后对话的连续性
4. 验证 LangChain 链式分析使用正确的模型
5. 检查在不同模型下的响应质量和速度

