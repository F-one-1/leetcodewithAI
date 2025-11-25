'use client';

import Editor from '@monaco-editor/react';
import { useState } from 'react';

interface CodeEditorProps {
  defaultCode?: string;
  onCodeChange?: (code: string) => void;
  language?: 'javascript' | 'typescript';
}

export const CodeEditor = ({ 
  defaultCode = '// Write your code here\nfunction solution() {\n  \n}\n\nconsole.log(solution());', 
  onCodeChange,
  language = 'javascript'
}: CodeEditorProps) => {
  const [code, setCode] = useState(defaultCode);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onCodeChange?.(value);
    }
  };

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={code}
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

