# LeetCode with AI
https://www.leetcodewithai.xyz/
一个集成了 AI 助手的 LeetCode 练习平台，提供代码编辑、测试用例管理、代码执行和 AI 代码分析功能。

## ✨ 功能特性

- 📝 **代码编辑器**：基于 Monaco Editor 的代码编辑器，支持语法高亮和代码补全
- 🧪 **测试用例管理**：支持添加、编辑、删除自定义测试用例
- ▶️ **代码执行**：实时执行代码并查看测试结果
- 🤖 **AI 助手**：集成 Claude AI，提供代码分析、优化建议和问题解答
- 📊 **可调整布局**：支持拖拽调整面板大小，自定义工作区布局
- 🎨 **现代化 UI**：使用 Tailwind CSS 和 Radix UI 构建的现代化界面

## 🛠️ 技术栈

- **框架**：Next.js 16 (App Router)
- **UI 库**：React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS 4
- **代码编辑器**：Monaco Editor
- **AI 服务**：Anthropic Claude (claude-haiku-4-5-20251001)
- **UI 组件**：Radix UI
- **状态管理**：React Hooks
- **包管理器**：pnpm

## 📦 安装

### 前置要求

- Node.js 18+ 
- pnpm

### 安装依赖

```bash
pnpm install
```

## 🚀 开发

启动开发服务器：

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🔧 环境配置

### AI 服务配置

项目使用 Anthropic Claude API，需要配置环境变量：

创建 `.env.local` 文件：

```env
ANTHROPIC_API_KEY=your_api_key_here
```

## 📁 项目结构

```
leetcodewithai/
├── app/
│   ├── api/              # API 路由
│   │   ├── ai/           # AI 相关 API
│   │   ├── execute/      # 代码执行 API
│   │   └── problems/     # 问题数据 API
│   ├── components/       # React 组件
│   │   ├── ai/           # AI 面板组件
│   │   ├── code-editor/  # 代码编辑器组件
│   │   ├── test-cases/   # 测试用例组件
│   │   ├── problem/      # 问题描述组件
│   │   └── layout/       # 布局组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具函数和配置
│   └── constants/        # 常量定义
├── data/                 # 问题数据
├── types/                # TypeScript 类型定义
└── public/               # 静态资源
```

## 🎯 主要功能模块

### 代码编辑器

- 支持 JavaScript/TypeScript
- 语法高亮和代码补全
- 代码实时保存

### 测试用例管理

- 添加自定义测试用例
- 编辑和删除测试用例
- 查看测试执行结果

### AI 助手

- 代码分析和问题诊断
- 性能优化建议
- 代码改进方案
- 实时对话交流

### 代码执行

- 执行单个测试用例
- 执行所有测试用例
- 查看详细的执行结果

## 🧩 使用示例

### 导入组件

```typescript
import { CodeEditor, AIPanel, TestCasesPanel } from '@/components';
```

### 使用 Hooks

```typescript
import { useTestCases, useCodeExecution } from '@/hooks';

const { testCases, addTestCase } = useTestCases(problemId);
const { executeCode, submitCode } = useCodeExecution();
```

### 使用类型

```typescript
import type { TestCase, TestResult, ProblemData } from '@/types';
```

## 📝 脚本命令

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint
```

## 🚢 部署

### Vercel 部署

项目可以轻松部署到 Vercel：

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量 `ANTHROPIC_API_KEY`
4. 部署完成

### 其他平台

项目基于 Next.js，可以部署到任何支持 Node.js 的平台。

## 🔒 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API 密钥 | 是 |

## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Anthropic API](https://docs.anthropic.com/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org) - React 框架
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 代码编辑器
- [Anthropic](https://www.anthropic.com/) - AI 服务
- [Radix UI](https://www.radix-ui.com/) - UI 组件库
