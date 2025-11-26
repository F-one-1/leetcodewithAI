'use client';

import { useState, useEffect } from 'react';
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
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [allTestCases, setAllTestCases] = useState<TestCase[]>([]); // 存储所有测试用例（用于提交）
  const [isSubmitMode, setIsSubmitMode] = useState(false); // 标记是否为提交模式
  const [selectedTestCaseId, setSelectedTestCaseId] = useState('');
  const [testResults, setTestResults] = useState<Record<string, { output: string; passed: boolean; error?: string }>>({});
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [activeTestTab, setActiveTestTab] = useState('test-cases');

  // 加载测试用例数据
  useEffect(() => {
    const loadTestCases = async () => {
      try {
        const response = await axios.get(`/api/problems/${problemId}`);
        const problemData = response.data;

        if (problemData.testCases && problemData.testCases.length > 0) {
          // 将 JSON 格式转换为 TestCase 格式
          const formattedTestCases: TestCase[] = problemData.testCases.map((tc: any) => ({
            id: tc.id,
            input: Array.isArray(tc.input) ? JSON.stringify(tc.input) : String(tc.input),
            expectedOutput: String(tc.expectedOutput),
          }));

          setTestCases(formattedTestCases);
          if (formattedTestCases.length > 0) {
            setSelectedTestCaseId(formattedTestCases[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load test cases:', error);
        // 如果加载失败，使用默认测试用例
        const defaultTestCase: TestCase = {
          id: '1',
          input: '',
          expectedOutput: '',
        };
        setTestCases([defaultTestCase]);
        setSelectedTestCaseId('1');
      }
    };

    loadTestCases();
  }, [problemId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleExecuteAll = async () => {
    setLoading(true);
    setTestResults({});
    setAllTestCases([]); // 清除所有测试用例，只显示当前测试用例
    setIsSubmitMode(false); // 设置为运行模式

    try {
      const results: Record<string, { output: string; passed: boolean; error?: string }> = {};

      // Parse test cases for API
      const apiTestCases = testCases.map((tc) => {
        let input: any;
        try {
          // Try to parse input as JSON if it's a string
          if (typeof tc.input === 'string' && tc.input.trim()) {
            input = JSON.parse(tc.input);
          } else {
            input = tc.input;
          }
        } catch {
          input = tc.input;
        }

        return {
          input,
          expectedOutput: tc.expectedOutput,
        };
      });

      // Call API once with all test cases
      try {
        const response = await axios.post('/api/execute', {
          code,
          testCases: apiTestCases,
        });

        const { success, output: execOutput, error: execError, executionTime: time, testResults: apiTestResults } = response.data;
        setExecutionTime(time);

        if (success) {
          // If API returned test results, use them
          if (apiTestResults && apiTestResults.length > 0) {
            testCases.forEach((tc, index) => {
              if (apiTestResults[index]) {
                results[tc.id] = {
                  output: apiTestResults[index].output || '',
                  passed: apiTestResults[index].passed || false,
                  error: apiTestResults[index].error,
                };
              }
            });
          } else {
            // Fallback: compare output with expected output
            testCases.forEach((tc) => {
              const passed = execOutput.trim() === tc.expectedOutput.trim();
              results[tc.id] = {
                output: execOutput,
                passed,
              };
            });
          }
        } else {
          // If execution failed, mark all test cases as failed
          testCases.forEach((tc) => {
            results[tc.id] = {
              output: '',
              passed: false,
              error: execError,
            };
          });
        }
      } catch (err) {
        // If API call failed, mark all test cases as failed
        testCases.forEach((tc) => {
          results[tc.id] = {
            output: '',
            passed: false,
            error: err instanceof Error ? err.message : 'Failed to execute',
          };
        });
      }

      setTestResults(results);
      // 切换到测试结果标签页
      setActiveTestTab('test-results');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setTestResults({});

    try {
      // 加载所有测试用例
      const response = await axios.get(`/api/problems/${problemId}?all=true`);
      const problemData = response.data;

      if (!problemData.testCases || problemData.testCases.length === 0) {
        console.error('No test cases found');
        return;
      }

      // 将测试用例转换为 API 格式
      const apiTestCases = problemData.testCases.map((tc: any) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }));

      // 执行所有测试用例
      const executeResponse = await axios.post('/api/execute', {
        code,
        testCases: apiTestCases,
      });

      const { success, testResults: apiTestResults, error: execError } = executeResponse.data;
      const results: Record<string, { output: string; passed: boolean; error?: string }> = {};

      if (success && apiTestResults && apiTestResults.length > 0) {
        // 将 API 返回的结果映射到 testResults
        problemData.testCases.forEach((tc: any, index: number) => {
          if (apiTestResults[index]) {
            results[tc.id] = {
              output: apiTestResults[index].output || '',
              passed: apiTestResults[index].passed || false,
              error: apiTestResults[index].error,
            };
          }
        });
      } else {
        // 如果执行失败，标记所有测试用例为失败
        problemData.testCases.forEach((tc: any) => {
          results[tc.id] = {
            output: '',
            passed: false,
            error: execError || 'Execution failed',
          };
        });
      }

      // 将 testAllCases 转换为 TestCase 格式并存储（仅用于统计）
      const formattedAllTestCases: TestCase[] = problemData.testCases.map((tc: any) => ({
        id: tc.id,
        input: Array.isArray(tc.input) ? JSON.stringify(tc.input) : String(tc.input),
        expectedOutput: String(tc.expectedOutput),
      }));
      setAllTestCases(formattedAllTestCases);
      setIsSubmitMode(true); // 设置为提交模式

      setTestResults(results);
      // 切换到测试结果标签页
      setActiveTestTab('test-results');
    } catch (error) {
      console.error('提交失败:', error);
      // 如果加载或执行失败，显示错误
      setTestResults({
        'error': {
          output: '',
          passed: false,
          error: error instanceof Error ? error.message : 'Failed to submit',
        }
      });
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
