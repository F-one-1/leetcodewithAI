'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import remarkGfm from 'remark-gfm';

interface AIMessageFormatterProps {
  content: string;
  isUser?: boolean;
}

export const AIMessageFormatter = ({ content, isUser = false }: AIMessageFormatterProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('复制失败');
    }
  };

  if (isUser) {
    return (
      <div className="mb-4 flex justify-end">
        <div className="bg-[var(--light-blue-60)] text-white rounded-lg p-3 text-sm max-w-full">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex justify-start">
      <div className="bg-[var(--layer-bg-gray)] rounded-lg p-3 text-sm border border-[var(--border-quaternary)] max-w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // 表格
            table({ children }) {
              return (
                <div className="my-3 overflow-x-auto">
                  <table className="w-full border-collapse border border-[var(--border-quaternary)]">{children}</table>
                </div>
              );
            },
            thead({ children }) {
              return <thead className="bg-[var(--layer-bg-pure)]">{children}</thead>;
            },
            tbody({ children }) {
              return <tbody>{children}</tbody>;
            },
            tr({ children }) {
              return <tr className="border border-[var(--border-quaternary)]">{children}</tr>;
            },
            th({ children }) {
              return (
                <th className="border border-[var(--border-quaternary)] px-3 py-2 text-left font-semibold text-[var(--text-primary)]">
                  {children}
                </th>
              );
            },
            td({ children }) {
              return (
                <td className="border border-[var(--border-quaternary)] px-3 py-2 text-[var(--text-secondary)]">
                  {children}
                </td>
              );
            },

            // 代码块
            code({ inline, className, children, ...props }) {
              const language = className?.replace(/language-/, '') || 'javascript';
              const codeContent = String(children).replace(/\n$/, '');

              if (inline) {
                return (
                  <code className="bg-[var(--layer-bg-pure)] px-2 py-0.5 rounded font-mono text-xs border border-[var(--border-quaternary)]">
                    {children}
                  </code>
                );
              }

              return (
                <div className="my-2 rounded overflow-hidden border border-[var(--border-quaternary)]">
                  <div className="flex items-center justify-between bg-[var(--gray-100)] px-3 py-2">
                    <span className="text-xs font-mono text-[var(--text-quaternary)]">{language}</span>
                    <button
                      onClick={() => handleCopyCode(codeContent)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--gray-90)] hover:bg-[var(--gray-80)] text-white rounded transition-colors"
                    >
                      {copiedCode === codeContent ? (
                        <>
                          <Check size={14} />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          复制
                        </>
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={language}
                    wrapLines
                    className="!m-0 !rounded-none !bg-[var(--gray-100)]"
                  >
                    {codeContent}
                  </SyntaxHighlighter>
                </div>
              );
            },

            // 列表
            ul({ children }) {
              return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
            },
            li({ children }) {
              return <li className="text-[var(--text-secondary)]">{children}</li>;
            },

            // 标题
            h1({ children }) {
              return <h1 className="text-lg font-bold my-2 text-[var(--text-primary)]">{children}</h1>;
            },
            h2({ children }) {
              return <h2 className="text-base font-bold my-2 text-[var(--text-primary)]">{children}</h2>;
            },
            h3({ children }) {
              return <h3 className="font-semibold my-1.5 text-[var(--text-primary)]">{children}</h3>;
            },

            // 强调
            strong({ children }) {
              return <strong className="font-bold text-[var(--text-primary)]">{children}</strong>;
            },
            em({ children }) {
              return <em className="italic text-[var(--text-secondary)]">{children}</em>;
            },

            // 段落
            p({ children }) {
              return <p className="my-2 text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap break-words">{children}</p>;
            },

            // 分割线
            hr() {
              return <hr className="my-3 border-[var(--border-quaternary)]" />;
            },

            // 引用
            blockquote({ children }) {
              return (
                <blockquote className="my-2 pl-3 border-l-4 border-[var(--light-blue-60)] bg-[var(--blue-10)] p-2 text-[var(--text-secondary)]">
                  {children}
                </blockquote>
              );
            },

            // 链接
            a({ children, href }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--light-blue-60)] hover:underline"
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

