'use client';

import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface CodeEditorProps {
  defaultCode?: string;
  onCodeChange?: (code: string) => void;
  language?: 'javascript' | 'typescript';
  problemId?: string;
}

export const CodeEditor = ({
  defaultCode,
  onCodeChange,
  language = 'javascript',
  problemId
}: CodeEditorProps) => {
  const [code, setCode] = useState(defaultCode || '// Write your code here\nfunction solution() {\n  \n}\n\nconsole.log(solution());');
  const [loading, setLoading] = useState(false);

  // 加载代码模板
  useEffect(() => {
    const loadCodeTemplate = async () => {
      if (!problemId) {
        // 如果没有 problemId，使用 defaultCode 或默认模板
        if (defaultCode) {
          setCode(defaultCode);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/problems/${problemId}`);
        const codeExample = response.data.codeExample;

        if (codeExample) {
          setCode(codeExample);
          onCodeChange?.(codeExample);
        } else if (defaultCode) {
          setCode(defaultCode);
        }
      } catch (error) {
        console.error('Failed to load code template:', error);
        // 如果加载失败，使用 defaultCode 或默认模板
        if (defaultCode) {
          setCode(defaultCode);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCodeTemplate();
  }, [problemId]); // 只在 problemId 变化时重新加载

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onCodeChange?.(value);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Loading code template...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full  rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};

