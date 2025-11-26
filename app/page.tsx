'use client';

import { useState } from 'react';
import axios from 'axios';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditor } from './components/CodeEditor';
import { AIPanel } from './components/AIPanel';
import { Nav } from './components/Nav';
import { ProblemDescription } from './components/ProblemDescription';
import { TestCasesPanel, type TestCase } from './components/TestCasesPanel';
import { GripVertical, Code } from 'lucide-react';

export default function Home() {
  const defaultCode = `// Write your code here
function solution() {
  return "Hello World";
}

console.log(solution());`;

  const [problemId] = useState('121-easy-Best-Time-to-Buy-and-Sell-Stock');
  const [code, setCode] = useState(defaultCode);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      input: 'test input 1',
      expectedOutput: 'Hello World',
    },
  ]);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState('1');
  const [testResults, setTestResults] = useState<Record<string, { output: string; passed: boolean; error?: string }>>({});
  const [showAIPanel, setShowAIPanel] = useState(true);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleExecuteAll = async () => {
    setLoading(true);
    setTestResults({});

    try {
      const results: Record<string, { output: string; passed: boolean; error?: string }> = {};

      for (const testCase of testCases) {
        try {
          const response = await axios.post('/api/execute', {
            code,
          });

          const { success, output: execOutput, error: execError, executionTime: time } = response.data;
          setExecutionTime(time);

          if (success) {
            const passed = execOutput.trim() === testCase.expectedOutput.trim();
            results[testCase.id] = {
              output: execOutput,
              passed,
            };
          } else {
            results[testCase.id] = {
              output: '',
              passed: false,
              error: execError,
            };
          }
        } catch (err) {
          results[testCase.id] = {
            output: '',
            passed: false,
            error: err instanceof Error ? err.message : 'Failed to execute',
          };
        }
      }

      setTestResults(results);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: 实现提交逻辑
      // await submitCode(code, testResults);
    } catch (error) {
      // TODO: 处理提交错误
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTestCase = () => {
    const newId = String(Date.now());
    const newTestCase: TestCase = {
      id: newId,
      input: '',
      expectedOutput: '',
    };
    setTestCases([...testCases, newTestCase]);
    setSelectedTestCaseId(newId);
  };

  const handleDeleteTestCase = (id: string) => {
    const filtered = testCases.filter((tc) => tc.id !== id);
    setTestCases(filtered);
    if (selectedTestCaseId === id && filtered.length > 0) {
      setSelectedTestCaseId(filtered[0].id);
    }
  };

  const handleUpdateTestCase = (id: string, field: 'input' | 'expectedOutput', value: string) => {
    setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)));
  };

  // Right Top Panel - Code Editor
  const rightTopPanel = (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 py-1 border-b border-[var(--border-quaternary)] bg-white flex items-center gap-2">
        <Code className="w-5 h-5 text-[var(--text-primary)]" />
        <div className="text-base text-[var(--text-primary)]">代码</div>
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeEditor problemId={problemId} onCodeChange={handleCodeChange} language="javascript" />
      </div>
    </div>
  );

  // Right Bottom Panel - Test Cases
  const rightBottomPanel = (
    <TestCasesPanel
      testCases={testCases}
      selectedTestCaseId={selectedTestCaseId}
      testResults={testResults}
      onAddTestCase={handleAddTestCase}
      onDeleteTestCase={handleDeleteTestCase}
      onUpdateTestCase={handleUpdateTestCase}
      onSelectTestCase={setSelectedTestCaseId}
    />
  );

  return (
    <div
      className="flex flex-col h-screen w-screen"
      style={{ backgroundColor: "hsl(var(--sd-background-gray))" }}
    >
      {/* Header/Nav */}
      <Nav
        onRun={handleExecuteAll}
        loading={loading}
        onSubmit={handleSubmit}
        submitting={submitting}
        showAIPanel={showAIPanel}
        onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
      />

      {/* Main Content with Resizable Panels */}
      <main className="flex-1 overflow-hidden pr-[10px] pb-[10px] pl-[10px]">
        <PanelGroup direction="horizontal" className="w-full h-full">
          {/* Left Panel - Problem Description */}
          <Panel defaultSize={35} minSize={20} maxSize={60} className="overflow-hidden">
            <div className="w-full h-full bg-white border-r border-[var(--border-quaternary)] overflow-auto rounded-[8px]">
              <ProblemDescription />
            </div>
          </Panel>

          {/* Resize Handle - Left to Middle */}
          <PanelResizeHandle className="w-1 bg-[var(--sd-background-gray)]  transition-colors cursor-col-resize group flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={16} className="text-[var(--text-quaternary)]" />
            </div>
          </PanelResizeHandle>

          {/* Middle Panel - Code Editor + Test Cases */}
          <Panel defaultSize={showAIPanel ? 50 : 65} minSize={30} maxSize={80} className="overflow-hidden">
            <PanelGroup direction="vertical" className="w-full h-full">
              {/* Top Panel - Code Editor */}
              <Panel defaultSize={50} minSize={30} maxSize={70} className="overflow-hidden">
                <div className="w-full h-full bg-white border-b border-[var(--border-quaternary)] overflow-auto rounded-[8px]">
                  {rightTopPanel}
                </div>
              </Panel>

              {/* Resize Handle - Top to Bottom */}
              <PanelResizeHandle className="h-1 bg-[var(--sd-background-gray)]  transition-colors cursor-row-resize group flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={16} className="text-[var(--text-quaternary)] rotate-90" />
                </div>
              </PanelResizeHandle>

              {/* Bottom Panel - Test Cases */}
              <Panel defaultSize={50} minSize={30} maxSize={70} className="overflow-hidden">
                <div className="w-full h-full bg-white overflow-auto rounded-[8px]">
                  {rightBottomPanel}
                </div>
              </Panel>
            </PanelGroup>
          </Panel>

          {/* Resize Handle - Middle to Right (AI Panel) */}
          {showAIPanel && (
            <PanelResizeHandle className="w-1 bg-[var(--sd-background-gray)]  transition-colors cursor-col-resize group flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity ">
                <GripVertical size={16} className="text-[var(--text-quaternary)]" />
              </div>
            </PanelResizeHandle>
          )}

          {/* Right Panel - AI Assistant */}
          {showAIPanel && (
            <Panel defaultSize={20} minSize={15} className="overflow-hidden rounded-[8px]">
              <AIPanel
                code={code}
                problemDescription=""
                testResults={Object.values(testResults)}
                onClose={() => setShowAIPanel(false)}
              />
            </Panel>
          )}
        </PanelGroup>
      </main>
    </div>
  );
}
