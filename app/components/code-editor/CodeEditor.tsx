'use client';

import Editor from '@monaco-editor/react';
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';

interface CodeEditorProps {
  defaultCode?: string;
  onCodeChange?: (code: string) => void;
  language?: 'javascript' | 'typescript';
  problemId?: string;
}

export interface CodeEditorHandle {
  setValue: (code: string) => void;
  getValue: () => string;
  streamCharByChar: (code: string, delayMs?: number) => Promise<void>;
  streamLineByLine: (lines: string[], delayMs?: number) => Promise<void>;
  clearEditor: () => void;
}

const CodeEditorComponent = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditorComponentImpl(
  {
    defaultCode,
    onCodeChange,
    language = 'javascript',
    problemId
  },
  ref
) {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState(defaultCode || '// Write your code here\nfunction solution() {\n  \n}\n\nconsole.log(solution());');
  const [loading, setLoading] = useState(false);

  // 加载代码模板
  useEffect(() => {
    const loadCodeTemplate = async () => {
      if (!problemId) {
        // 如果没有 problemId，使用 defaultCode 或默认模板
        if (defaultCode) {
          setCode(defaultCode);
          // 同时更新 Editor 实例
          if (editorRef.current) {
            editorRef.current.setValue(defaultCode);
          }
        }
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/problems/${problemId}`);
        const codeExample = response.data.codeExample;

        if (codeExample) {
          setCode(codeExample);
          if (editorRef.current) {
            editorRef.current.setValue(codeExample);
          }
          onCodeChange?.(codeExample);
        } else if (defaultCode) {
          setCode(defaultCode);
          if (editorRef.current) {
            editorRef.current.setValue(defaultCode);
          }
        }
      } catch (error) {
        console.error('Failed to load code template:', error);
        // 如果加载失败，使用 defaultCode 或默认模板
        if (defaultCode) {
          setCode(defaultCode);
          if (editorRef.current) {
            editorRef.current.setValue(defaultCode);
          }
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

  const handleEditorDidMount = (editorInstance: any, monaco: any) => {
    editorRef.current = editorInstance;

    // 禁用 Ctrl+S (或 Cmd+S on Mac) 的默认保存行为
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // 什么都不做，阻止默认的保存行为
    });
  };

  // 暴露编辑器方法给父组件
  useImperativeHandle(ref, () => ({
    setValue: (newCode: string) => {
      if (editorRef.current) {
        editorRef.current.setValue(newCode);
        setCode(newCode);
        onCodeChange?.(newCode);
      }
    },
    getValue: () => {
      return editorRef.current?.getValue() || code;
    },
    streamCharByChar: async (fullContent: string, delayMs: number = 50) => {
      if (!editorRef.current) return;

      console.log('🎬 streamCharByChar: 开始逐字符更新');
      editorRef.current.setValue('');
      let currentContent = '';

      for (let i = 0; i < fullContent.length; i++) {
        const nextChar = fullContent[i];
        currentContent += nextChar;

        editorRef.current.setValue(currentContent);
        setCode(currentContent);

        // 自动滚动到底部
        const lineCount = editorRef.current.getModel()?.getLineCount() || 0;
        editorRef.current.revealLine(lineCount);

        if ((i + 1) % 50 === 0) {
          console.log(`📝 已输出 ${i + 1}/${fullContent.length} 字符`);
          onCodeChange?.(currentContent);
        }

        await new Promise(r => setTimeout(r, delayMs));
      }

      onCodeChange?.(fullContent);
      console.log('✅ streamCharByChar 完成');
    },
    streamLineByLine: async (lines: string[], delayMs: number = 300) => {
      if (!editorRef.current) return;

      console.log('🎬 streamLineByLine: 开始逐行更新');
      editorRef.current.setValue('');
      let currentContent = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        currentContent += line + '\n';

        editorRef.current.setValue(currentContent);
        setCode(currentContent);

        // 自动滚动到底部
        const lineCount = editorRef.current.getModel()?.getLineCount() || 0;
        editorRef.current.revealLine(lineCount);

        console.log(`📝 已输出第 ${i + 1}/${lines.length} 行`);
        onCodeChange?.(currentContent);

        await new Promise(r => setTimeout(r, delayMs));
      }

      console.log('✅ streamLineByLine 完成');
    },
    clearEditor: () => {
      if (editorRef.current) {
        editorRef.current.setValue('');
        setCode('');
        onCodeChange?.('');
      }
    },
  }), [code, onCodeChange]);

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
        defaultValue={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
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
});

export const CodeEditor = CodeEditorComponent;

