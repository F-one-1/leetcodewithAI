'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Trash2,
  Loader,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { AIMessageFormatter } from './AIMessageFormatter';
import { AIClient } from '@/lib/ai-client';
import { extractModifiedCodeFromAnalysis } from '@/lib/utils';
import { CLAUDE_MODELS, DEFAULT_MODEL, type ClaudeModelName } from '@/lib/ai-config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import type { CodeEditorHandle } from '@/components/code-editor/CodeEditor';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AIPanelProps {
  code?: string;
  problemDescription?: string;
  testResults?: any[];
  onClose?: () => void;
  codeEditorRef?: React.RefObject<CodeEditorHandle>;
  onExecuteCode?: () => Promise<void>;
  onCodeChange?: (code: string) => void;
}

export const AIPanel = ({
  code = '',
  problemDescription = '',
  testResults = [],
  onClose,
  codeEditorRef,
  onExecuteCode,
  onCodeChange,
}: AIPanelProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '0',
      role: 'system',
      content: 'Hi! 我是你的 AI 编程助手。我可以帮你分析代码、找出问题、提供优化建议。',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAIPowerRunning, setIsAIPowerRunning] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ClaudeModelName>(DEFAULT_MODEL);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    let assistantContent = '';

    try {
      await AIClient.chat(inputValue, {
        onData: (chunk) => {
          assistantContent += chunk;
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.id === assistantMessageId) {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: assistantContent },
              ];
            }
            return [
              ...prev,
              {
                id: assistantMessageId,
                role: 'assistant',
                content: assistantContent,
                timestamp: new Date(),
              },
            ];
          });
        },
        onComplete: () => {
          setIsLoading(false);
        },
        onError: (error) => {
          toast.error(`错误: ${error}`);
          setIsLoading(false);
        },
      }, {
        conversationHistory: messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        code,
        problemDescription,
        model: selectedModel,
      });
    } catch (error) {
      toast.error('发送失败');
      setIsLoading(false);
    }
  };

  const handleClearMessages = () => {
    setMessages([messages[0]]); // 保留系统消息
    toast.success('对话已清除');
  };

  const handleAIPower = async () => {
    if (!code || isAIPowerRunning || isLoading) return;

    setIsAIPowerRunning(true);
    const assistantMessageId = Date.now().toString();
    let aiContent = '';

    try {
      // 添加用户操作消息
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() - 1).toString(),
          role: 'user',
          content: '请分析并改进这段代码',
          timestamp: new Date(),
        },
      ]);

      // 调用 AI Power - 使用 LangChain 链式分析（useChain: true）
      await AIClient.aiPower(code, {
        onData: (chunk) => {
          aiContent += chunk;
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.id === assistantMessageId) {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: aiContent },
              ];
            }
            return [
              ...prev,
              {
                id: assistantMessageId,
                role: 'assistant',
                content: aiContent,
                timestamp: new Date(),
              },
            ];
          });
        },
        onComplete: async () => {
          // 完成后处理：提取代码、修改编辑器、执行代码
          await executeAIPowerFlow(aiContent);
        },
        onError: (error) => {
          toast.error(`错误: ${error}`);
          setIsAIPowerRunning(false);
        },
      }, {
        problemDescription,
        useChain: true, // 启用 LangChain 链式分析
        model: selectedModel,
      });
    } catch (error) {
      toast.error('AI Power 处理失败');
      setIsAIPowerRunning(false);
    }
  };

  const executeAIPowerFlow = async (aiContent: string) => {
    try {
      // 1. 提取改进后的代码
      const modifiedCode = extractModifiedCodeFromAnalysis(aiContent);
      if (!modifiedCode) {
        toast.error('无法提取改进的代码');
        setIsAIPowerRunning(false);
        return;
      }

      // 2. 显示进度消息
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: '正在更新编辑器中的代码...',
          timestamp: new Date(),
        },
      ]);

      // 3. 通过打字机修改编辑器
      // delayMs: 每个字符的延迟时间（毫秒），数值越小速度越快
      if (codeEditorRef?.current?.streamCharByChar) {
        await codeEditorRef.current.streamCharByChar(modifiedCode, 5);
      }

      // 4. 更新代码状态
      onCodeChange?.(modifiedCode);

      // 5. 显示完成消息
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'system',
          content: '代码已更新完成！',
          timestamp: new Date(),
        },
      ]);

      // 6. 自动执行代码
      // 注意：onExecuteCode 会从编辑器直接获取最新代码，确保执行的是更新后的代码
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          role: 'system',
          content: '正在执行代码...',
          timestamp: new Date(),
        },
      ]);

      await onExecuteCode?.();

      // 7. 显示最终结果
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 4).toString(),
          role: 'system',
          content: '代码执行完成！请查看下方的测试结果。',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('AI Power 流程错误:', error);
      toast.error('执行流程出错');
    } finally {
      setIsAIPowerRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-[var(--border-quaternary)] rounded-[8px]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--border-quaternary)] bg-white">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          AI Assistant
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[var(--layer-bg-gray)] rounded transition-colors"
        >
          <X size={20} className="text-[var(--text-secondary)]" />
        </button>
      </div>


      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'system' ? (
              <div className="mb-3 text-center text-sm text-[var(--text-quaternary)] flex items-center justify-center gap-1">
                {msg.content}
              </div>
            ) : (
              <AIMessageFormatter content={msg.content} isUser={msg.role === 'user'} />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Loader className="animate-spin" size={16} />
            <span className="text-sm">正在思考...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-4 py-3 border-t border-[var(--border-quaternary)] bg-white space-y-2">
        {/* AI Power Button */}
        <div>
          <button
            onClick={handleAIPower}
            disabled={isAIPowerRunning || isLoading || !code}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium
              hover:border-black border border-transparent
              hover:cursor-pointer"
            style={{
              // If disabled, don't show pointer
              cursor: (isAIPowerRunning || isLoading || !code) ? 'not-allowed' : undefined,
            }}
          >
            <Zap size={16} />
            AI Assistant
          </button>
        </div>

        {/* Model Selector - 宽度为外层 1/2 */}
        <div className="w-1/2">
          <Select
            value={selectedModel}
            onValueChange={(value) => setSelectedModel(value as ClaudeModelName)}
            disabled={isLoading || isAIPowerRunning}
          >
            <SelectTrigger 
              className="w-full text-xs"
              title={CLAUDE_MODELS[selectedModel].description}
            >
              <SelectValue>
                {CLAUDE_MODELS[selectedModel].name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CLAUDE_MODELS).map(([key, value]) => (
                <SelectItem key={key} value={key} title={value.description}>
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="提问或输入命令..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-[var(--border-quaternary)] rounded text-sm focus:outline-none focus:ring-2  disabled:bg-[var(--layer-bg-gray)] disabled:cursor-not-allowed"
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity  hover:border-black border border-transparent hover:cursor-pointer"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Tips and Clear Button */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-quaternary)] flex items-center gap-1">
            <Lightbulb size={14} />
            <span>Tip: 按 Enter 发送，Shift+Enter 换行</span>
          </p>
          <button
            onClick={handleClearMessages}
            disabled={isLoading}
            title="清除对话"
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--layer-bg-gray)] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

