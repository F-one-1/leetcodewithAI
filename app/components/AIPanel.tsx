'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Zap,
  Wrench,
  Lightbulb,
  Trash2,
  Loader,
} from 'lucide-react';
import { AIMessageFormatter } from './AIMessageFormatter';
import { AIClient } from '@/lib/ai-client';
import toast from 'react-hot-toast';

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
}

export const AIPanel = ({
  code = '',
  problemDescription = '',
  testResults = [],
  onClose,
}: AIPanelProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '0',
      role: 'system',
      content: '👋 Hi! 我是你的 AI 编程助手。我可以帮你分析代码、找出问题、提供优化建议。',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<'analyze' | 'fix' | 'optimize' | null>(null);
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
      });
    } catch (error) {
      toast.error('发送失败');
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: 'analyze' | 'fix' | 'optimize') => {
    if (!code || isLoading) {
      toast.error('请先输入代码');
      return;
    }

    setCurrentAction(action);
    setIsLoading(true);

    const actionMessages = {
      analyze: '📊 分析代码中...',
      fix: '🔧 修复代码中...',
      optimize: '⚡ 优化代码中...',
    };

    const assistantMessageId = Date.now().toString();
    let assistantContent = '';

    try {
      if (action === 'analyze') {
        await AIClient.analyzeCode(code, {
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
            setCurrentAction(null);
          },
          onError: (error) => {
            toast.error(`错误: ${error}`);
            setIsLoading(false);
            setCurrentAction(null);
          },
        }, {
          problemDescription,
          testResults,
        });
      } else if (action === 'fix') {
        await AIClient.fixCode(code, {
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
            setCurrentAction(null);
          },
          onError: (error) => {
            toast.error(`错误: ${error}`);
            setIsLoading(false);
            setCurrentAction(null);
          },
        }, {
          problemDescription,
        });
      } else if (action === 'optimize') {
        await AIClient.optimizeCode(code, {
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
            setCurrentAction(null);
          },
          onError: (error) => {
            toast.error(`错误: ${error}`);
            setIsLoading(false);
            setCurrentAction(null);
          },
        }, {
          optimizationType: action === 'optimize' ? 'both' : undefined,
          problemDescription,
        });
      }

      // 添加用户操作消息
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() - 1).toString(),
          role: 'user',
          content: actionMessages[action],
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      toast.error('操作失败');
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const handleClearMessages = () => {
    setMessages([messages[0]]); // 保留系统消息
    toast.success('对话已清除');
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-[var(--border-quaternary)]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--border-quaternary)] bg-white">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          {/* Claude Logo: 可用lucide-react的 bot icon */}
          <Lightbulb size={20} className="text-[var(--light-blue-60)]" />
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
              <div className="mb-3 text-center text-sm text-[var(--text-quaternary)]">{msg.content}</div>
            ) : (
              <AIMessageFormatter content={msg.content} isUser={msg.role === 'user'} />
            )}
          </div>
        ))}

        {isLoading && !currentAction && (
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Loader className="animate-spin" size={16} />
            <span className="text-sm">正在思考...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-4 py-3 border-t border-[var(--border-quaternary)] bg-white space-y-2">
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
            className="flex-1 px-3 py-2 border border-[var(--border-quaternary)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--light-blue-60)] disabled:bg-[var(--layer-bg-gray)] disabled:cursor-not-allowed"
          />

          {/* Quick Action Buttons - Icon Only */}
          <button
            onClick={() => handleQuickAction('analyze')}
            disabled={isLoading || !code}
            title="分析代码"
            className="p-2 text-[var(--light-blue-60)] hover:bg-[var(--layer-bg-gray)] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Zap size={18} />
          </button>
          <button
            onClick={() => handleQuickAction('fix')}
            disabled={isLoading || !code}
            title="修复代码"
            className="p-2 text-[var(--light-brand-orange)] hover:bg-[var(--layer-bg-gray)] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Wrench size={18} />
          </button>
          <button
            onClick={() => handleQuickAction('optimize')}
            disabled={isLoading || !code}
            title="优化代码"
            className="p-2 text-[var(--light-green-60)] hover:bg-[var(--layer-bg-gray)] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Lightbulb size={18} />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-2 bg-[var(--light-blue-60)] text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Tips and Clear Button */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-quaternary)]">
            💡 Tip: 按 Enter 发送，Shift+Enter 换行
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

