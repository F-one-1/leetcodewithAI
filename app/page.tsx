'use client';

import { useState } from 'react';
import axios from 'axios';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditor } from './components/CodeEditor';
import { AIPanel } from './components/AIPanel';
import { Play, Trash2, Plus, MessageCircle, X, GripVertical } from 'lucide-react';

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export default function Home() {
  const defaultCode = `// Write your code here
function solution() {
  return "Hello World";
}

console.log(solution());`;

  const [code, setCode] = useState(defaultCode);
  const [loading, setLoading] = useState(false);
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

  const selectedTestCase = testCases.find((tc) => tc.id === selectedTestCaseId);
  const selectedTestResult = selectedTestCaseId ? testResults[selectedTestCaseId] : null;

  // Left Panel - Problem Description
  const leftPanel = (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">Problem Description</h2>
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Problem Title</h3>
            <p className="text-gray-600">Add your problem description here</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">This is where the problem statement goes.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Example</h3>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-sm text-gray-600">Input: {"example input"}</p>
              <p className="text-sm text-gray-600">Output: {"example output"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Right Top Panel - Code Editor
  const rightTopPanel = (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Code Editor</h2>
        <button
          onClick={handleExecuteAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Play size={16} />
          {loading ? 'Running...' : 'Run'}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeEditor defaultCode={code} onCodeChange={handleCodeChange} language="javascript" />
      </div>
      {executionTime > 0 && (
        <div className="shrink-0 px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Execution Time: {executionTime}ms
        </div>
      )}
    </div>
  );

  // Right Bottom Panel - Test Cases
  const rightBottomPanel = (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Test Cases</h2>
        <button
          onClick={handleAddTestCase}
          className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="flex-1 overflow-auto flex flex-col">
        {/* Test Cases List */}
        <div className="shrink-0 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {testCases.map((tc) => (
              <button
                key={tc.id}
                onClick={() => setSelectedTestCaseId(tc.id)}
                className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${selectedTestCaseId === tc.id
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Case {testCases.indexOf(tc) + 1}
                {testResults[tc.id] && (
                  <span className={`ml-2 ${testResults[tc.id].passed ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults[tc.id].passed ? '✓' : '✗'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Test Case Editor */}
        {selectedTestCase && (
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Input</label>
              <textarea
                value={selectedTestCase.input}
                onChange={(e) => handleUpdateTestCase(selectedTestCase.id, 'input', e.target.value)}
                className="w-full h-24 p-3 border border-gray-200 rounded font-mono text-sm resize-none"
                placeholder="Enter test input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Expected Output</label>
              <textarea
                value={selectedTestCase.expectedOutput}
                onChange={(e) => handleUpdateTestCase(selectedTestCase.id, 'expectedOutput', e.target.value)}
                className="w-full h-24 p-3 border border-gray-200 rounded font-mono text-sm resize-none"
                placeholder="Enter expected output"
              />
            </div>

            {/* Test Result */}
            {selectedTestResult && (
              <div className={`p-3 rounded border-2 ${selectedTestResult.passed ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <p className={`font-semibold mb-2 ${selectedTestResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                  {selectedTestResult.passed ? '✓ Passed' : '✗ Failed'}
                </p>
                {selectedTestResult.error ? (
                  <p className="text-red-600 font-mono text-sm">{selectedTestResult.error}</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">Expected:</span> {selectedTestCase.expectedOutput}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Actual:</span> {selectedTestResult.output}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Delete Button */}
            {testCases.length > 1 && (
              <button
                onClick={() => handleDeleteTestCase(selectedTestCase.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
                Delete Test Case
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">LeetCode with AI</h1>
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          <MessageCircle size={18} />
          {showAIPanel ? 'Hide' : 'Show'} AI
        </button>
      </header>

      {/* Main Content with Resizable Panels */}
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="w-full h-full">
          {/* Left Panel - Problem Description */}
          <Panel defaultSize={35} minSize={20} maxSize={60} className="overflow-hidden">
            <div className="w-full h-full bg-white border-r border-gray-200 overflow-auto">
              {leftPanel}
            </div>
          </Panel>

          {/* Horizontal Resize Handle */}
          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize group flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={16} className="text-gray-400" />
            </div>
          </PanelResizeHandle>

          {/* Right Panel - Code Editor + Test Cases + AI */}
          <Panel defaultSize={65} minSize={40} maxSize={80} className="overflow-hidden">
            <PanelGroup direction="horizontal" className="w-full h-full">
              {/* Right Panel - Code Editor + Test Cases */}
              <Panel defaultSize={showAIPanel ? 60 : 100} minSize={30} maxSize={100} className="overflow-hidden">
                <PanelGroup direction="vertical" className="w-full h-full">
                  {/* Right Top Panel - Code Editor */}
                  <Panel defaultSize={50} minSize={30} maxSize={70} className="overflow-hidden">
                    <div className="w-full h-full bg-white border-b border-gray-200 overflow-auto">
                      {rightTopPanel}
                    </div>
                  </Panel>

                  {/* Vertical Resize Handle */}
                  <PanelResizeHandle className="h-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-row-resize group flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={16} className="text-gray-400 rotate-90" />
                    </div>
                  </PanelResizeHandle>

                  {/* Right Bottom Panel - Test Cases */}
                  <Panel defaultSize={50} minSize={30} maxSize={70} className="overflow-hidden">
                    <div className="w-full h-full bg-white overflow-auto">
                      {rightBottomPanel}
                    </div>
                  </Panel>
                </PanelGroup>
              </Panel>

              {/* AI Panel - Horizontal Resize Handle (if visible) */}
              {showAIPanel && (
                <>
                  <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize group flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={16} className="text-gray-400" />
                    </div>
                  </PanelResizeHandle>

                  {/* AI Panel */}
                  <Panel defaultSize={40} minSize={250} maxSize={70} className="overflow-hidden">
                    <AIPanel
                      code={code}
                      problemDescription=""
                      testResults={Object.values(testResults)}
                      onClose={() => setShowAIPanel(false)}
                    />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}
