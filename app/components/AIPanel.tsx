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
          .map((m) => ({ role: m.role, content: m.content })),
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
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">🤖 AI Assistant</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="shrink-0 px-3 py-2 border-b border-gray-200 bg-gray-50 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickAction('analyze')}
            disabled={isLoading || !code}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Zap size={14} />
            分析
          </button>
          <button
            onClick={() => handleQuickAction('fix')}
            disabled={isLoading || !code}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Wrench size={14} />
            修复
          </button>
          <button
            onClick={() => handleQuickAction('optimize')}
            disabled={isLoading || !code}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Lightbulb size={14} />
            优化
          </button>
        </div>
        <button
          onClick={handleClearMessages}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
        >
          <Trash2 size={14} />
          清除对话
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
              <div className="mb-3 text-center text-sm text-gray-500">{msg.content}</div>
            ) : (
              <AIMessageFormatter content={msg.content} isUser={msg.role === 'user'} />
            )}
          </div>
        ))}

        {isLoading && !currentAction && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader className="animate-spin" size={16} />
            <span className="text-sm">正在思考...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-200 bg-gray-50 space-y-2">
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500">
          💡 Tip: 按 Enter 发送，Shift+Enter 换行
        </p>
      </div>
    </div>
  );
};

