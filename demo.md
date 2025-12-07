# AI Agent 实现方式

## 核心架构

**LLM（推理） + Tools（工具集） + Loop（循环执行）**

## 三种实现方案

### 1. 浏览器自动化（通用）

- 使用 Puppeteer/Playwright 控制浏览器
- LLM 分析页面状态，选择工具（click、type、read）
- 执行 → 观察结果 → 继续决策

### 2. 前端内嵌 Agent（适合你的项目）

- 在现有 API 中添加 `tools` 参数
- 定义工具：`update_code_editor`、`run_tests`、`click_button`
- LLM 返回工具调用指令，前端执行并反馈结果

### 3. Agent 框架（快速开发）

- 使用 LangChain、AutoGPT 等框架
- 定义工具集，框架处理循环逻辑

## 关键技术点

- **ReAct 模式**：推理 → 行动 → 观察 → 继续
- **工具调用**：LLM 输出结构化指令，系统执行
- **状态管理**：维护页面状态，让 Agent 知道"现在在哪里"

## 面试要点

- **Agent = LLM + Tools + 循环执行**
- **从简单到复杂**：文本对话 → 工具调用 → 自主 Agent
- **挑战**：状态同步、错误恢复、效率优化


