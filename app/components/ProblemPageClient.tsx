'use client';

import { useState, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditor, AIPanel, Nav, ProblemDescription, TestCasesPanel } from '@/components';
import { useTestCases, useCodeExecution } from '@/hooks';
import { DEFAULT_CODE } from '@/constants';
import { GripVertical, Code } from 'lucide-react';
import type { CodeEditorHandle } from '@/components/code-editor/CodeEditor';
import type { ProblemData } from '@/types/problem';

interface ProblemPageClientProps {
  initialData: ProblemData;
}

export function ProblemPageClient({ initialData }: ProblemPageClientProps) {
  const codeEditorRef = useRef<CodeEditorHandle | null>(null);
  const [code, setCode] = useState(initialData.codeExample || DEFAULT_CODE);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [activeTestTab, setActiveTestTab] = useState('test-cases');

  // 使用自定义 Hooks
  const {
    testCases,
    selectedTestCaseId,
    setSelectedTestCaseId,
    addTestCase,
    deleteTestCase,
    updateTestCase,
  } = useTestCases(initialData.id);

  const {
    loading,
    submitting,
    testResults,
    isSubmitMode,
    allTestCases,
    executeCode,
    submitCode,
  } = useCodeExecution();

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleExecuteAll = async () => {
    const currentCode = codeEditorRef.current?.getValue() || code;
    const success = await executeCode(currentCode, testCases);
    if (success) {
      setActiveTestTab('test-results');
    }
  };

  const handleSubmit = async () => {
    const currentCode = codeEditorRef.current?.getValue() || code;
    const success = await submitCode(currentCode, initialData.id);
    if (success) {
      setActiveTestTab('test-results');
    }
  };

  const handleAIPower = () => {
    // 这个函数由 AIPanel 内部处理
  };

  // Right Top Panel - Code Editor
  const rightTopPanel = (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 py-2 border-b border-[var(--border-quaternary)] bg-white flex items-center gap-2">
        <Code className="w-5 h-5 text-[var(--text-primary)]" />
        <div className="text-base text-[var(--text-primary)]">代码</div>
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          ref={codeEditorRef as React.RefObject<CodeEditorHandle>}
          problemId={initialData.id}
          onCodeChange={handleCodeChange}
          language="javascript"
        />
      </div>
    </div>
  );

  // Right Bottom Panel - Test Cases
  const rightBottomPanel = (
    <TestCasesPanel
      testCases={testCases}
      selectedTestCaseId={selectedTestCaseId}
      testResults={testResults}
      onAddTestCase={addTestCase}
      onDeleteTestCase={deleteTestCase}
      onUpdateTestCase={updateTestCase}
      onSelectTestCase={setSelectedTestCaseId}
      activeTab={activeTestTab}
      onTabChange={setActiveTestTab}
      isSubmitMode={isSubmitMode}
      allTestCases={allTestCases}
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
        onAIPower={handleAIPower}
      />

      {/* Main Content with Resizable Panels */}
      <main className="flex-1 overflow-hidden pr-[10px] pb-[10px] pl-[10px]">
        <PanelGroup direction="horizontal" className="w-full h-full">
          {/* Left Panel - Problem Description */}
          <Panel defaultSize={35} minSize={20} maxSize={60} className="overflow-hidden">
            <div className="w-full h-full bg-white border-r border-[var(--border-quaternary)] overflow-auto rounded-[8px]">
              <ProblemDescription initialData={initialData} />
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
                problemDescription={initialData.content}
                testResults={Object.values(testResults)}
                onClose={() => setShowAIPanel(false)}
                codeEditorRef={codeEditorRef as React.RefObject<CodeEditorHandle>}
                onExecuteCode={handleExecuteAll}
                onCodeChange={handleCodeChange}
              />
            </Panel>
          )}
        </PanelGroup>
      </main>
    </div>
  );
}





