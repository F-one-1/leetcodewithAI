'use client';

import { Trash2, Plus, X } from 'lucide-react';
import { TestCase } from './TestCasesPanel';

interface TestResultsContentProps {
    testCases: TestCase[];
    selectedTestCaseId: string;
    testResults: Record<string, { output: string; passed: boolean; error?: string }>;
    onAddTestCase: () => void;
    onDeleteTestCase: (id: string) => void;
    onUpdateTestCase: (id: string, field: 'input' | 'expectedOutput', value: string) => void;
    onSelectTestCase: (id: string) => void;
    isSubmitMode?: boolean;
    allTestCases?: TestCase[];
}

export const TestResultsContent = ({
    testCases,
    selectedTestCaseId,
    testResults,
    onAddTestCase,
    onDeleteTestCase,
    onUpdateTestCase,
    onSelectTestCase,
    isSubmitMode = false,
    allTestCases = [],
}: TestResultsContentProps) => {
    const selectedTestCase = testCases.find((tc) => tc.id === selectedTestCaseId);

    // 在提交模式下，使用 allTestCases 计算统计信息；否则使用 testCases
    const displayTestCases = isSubmitMode ? allTestCases : testCases;
    const totalTests = displayTestCases.length;
    const passedTests = displayTestCases.filter((tc) => testResults[tc.id]?.passed).length;
    const failedTests = totalTests - passedTests;

    return (
        <div className="flex-1 overflow-auto flex flex-col h-full">
            {/* Statistics Bar */}
            {totalTests > 0 && (
                <div className={`shrink-0 px-4 ${isSubmitMode ? 'py-8' : 'py-2'}`}>
                    {isSubmitMode && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                                <span className={passedTests === totalTests ? "text-[var(--light-green-60)]" : "text-[var(--light-red-60)]"}>
                                    {passedTests === totalTests ? "通过：" : "解答错误"}
                                </span>
                                <span className="text-[var(--text-primary)]">
                                    {passedTests} / {totalTests} 个通过的测试用例
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Test Cases List - 提交模式下不显示 */}
            {!isSubmitMode && (
                <div className="shrink-0 border-b border-[var(--border-quaternary)]">
                    <div className="flex overflow-x-auto items-center gap-2 px-3 py-2">
                        {testCases.map((tc) => (
                            <div
                                key={tc.id}
                                className="relative group"
                            >
                                <button
                                    onClick={() => onSelectTestCase(tc.id)}
                                    className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${selectedTestCaseId === tc.id
                                        ? 'bg-[var(--layer-bg-gray)] text-[var(--text-primary)] font-semibold'
                                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    Case {testCases.indexOf(tc) + 1}
                                    {testResults[tc.id] && (
                                        <span
                                            className={`ml-2 ${testResults[tc.id].passed
                                                ? 'text-[var(--light-green-60)]'
                                                : 'text-[var(--light-red-60)]'
                                                }`}
                                        >
                                            {testResults[tc.id].passed ? '✓' : '✗'}
                                        </span>
                                    )}
                                </button>
                                {testCases.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteTestCase(tc.id);
                                        }}
                                        className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-[var(--text-tertiary)] hover:bg-[var(--text-primary)] text-white transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete test case"
                                    >
                                        <X size={10} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={onAddTestCase}
                            className="px-3 py-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors flex items-center"
                            title="Add test case"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Test Case Editor - 提交模式下不显示 */}
            {!isSubmitMode && selectedTestCase && (
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                            输入
                        </label>
                        <textarea
                            value={selectedTestCase.input}
                            disabled
                            className="w-full h-24 p-3 border border-[var(--border-quaternary)] rounded font-mono text-sm resize-none bg-gray-50 text-[var(--text-tertiary)] cursor-not-allowed"
                            placeholder="Enter test input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                            预期结果
                        </label>
                        <textarea
                            value={selectedTestCase.expectedOutput}
                            disabled
                            className="w-full h-24 p-3 border border-[var(--border-quaternary)] rounded font-mono text-sm resize-none bg-gray-50 text-[var(--text-tertiary)] cursor-not-allowed"
                            placeholder="Enter expected output"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                            输出结果
                        </label>
                        <textarea
                            value={testResults[selectedTestCase.id]?.output || ''}
                            readOnly
                            className={`w-full h-24 p-3 border ${testResults[selectedTestCase.id]
                                ? testResults[selectedTestCase.id].passed
                                    ? 'border-[var(--light-green-60)]'
                                    : 'border-[var(--light-red-60)]'
                                : 'border-[var(--border-quaternary)]'
                                } rounded font-mono text-sm resize-none bg-gray-50 focus:outline-none`}
                            placeholder="Test output will be shown here"
                        />
                        {testResults[selectedTestCase.id]?.error && (
                            <div className="mt-2 text-sm text-[var(--light-red-60)] break-all">
                                错误：{testResults[selectedTestCase.id].error}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};