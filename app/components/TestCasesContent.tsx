'use client';

import { Trash2, Plus, X } from 'lucide-react';
import { TestCase } from './TestCasesPanel';

interface TestCasesContentProps {
    testCases: TestCase[];
    selectedTestCaseId: string;
    testResults: Record<string, { output: string; passed: boolean; error?: string }>;
    onAddTestCase: () => void;
    onDeleteTestCase: (id: string) => void;
    onUpdateTestCase: (id: string, field: 'input' | 'expectedOutput', value: string) => void;
    onSelectTestCase: (id: string) => void;
}

export const TestCasesContent = ({
    testCases,
    selectedTestCaseId,
    testResults,
    onAddTestCase,
    onDeleteTestCase,
    onUpdateTestCase,
    onSelectTestCase,
}: TestCasesContentProps) => {
    const selectedTestCase = testCases.find((tc) => tc.id === selectedTestCaseId);
    const selectedTestResult = selectedTestCaseId ? testResults[selectedTestCaseId] : null;

    return (
        <div className="flex-1 overflow-auto flex flex-col h-full">
            {/* Test Cases List */}
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

            {/* Test Case Editor */}
            {selectedTestCase && (
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                            输入
                        </label>
                        <textarea
                            value={selectedTestCase.input}
                            onChange={(e) =>
                                onUpdateTestCase(selectedTestCase.id, 'input', e.target.value)
                            }
                            className="w-full h-24 p-3 border border-[var(--border-quaternary)] rounded font-mono text-sm resize-none focus:outline-none focus:border-[var(--light-blue-60)]"
                            placeholder="Enter test input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                            预期结果
                        </label>
                        <textarea
                            value={selectedTestCase.expectedOutput}
                            onChange={(e) =>
                                onUpdateTestCase(selectedTestCase.id, 'expectedOutput', e.target.value)
                            }
                            className="w-full h-24 p-3 border border-[var(--border-quaternary)] rounded font-mono text-sm resize-none focus:outline-none focus:border-[var(--light-blue-60)]"
                            placeholder="Enter expected output"
                        />
                    </div>

                    {/* Test Result */}
                    {selectedTestResult && (
                        <div
                            className={`p-3 rounded border-2 ${selectedTestResult.passed
                                ? 'bg-[var(--green-10)] border-[var(--green-60)]'
                                : 'bg-[var(--red-10)] border-[var(--red-60)]'
                                }`}
                        >
                            <p
                                className={`font-semibold mb-2 ${selectedTestResult.passed
                                    ? 'text-[var(--green-80)]'
                                    : 'text-[var(--red-80)]'
                                    }`}
                            >
                                {selectedTestResult.passed ? '✓ Passed' : '✗ Failed'}
                            </p>
                            {selectedTestResult.error ? (
                                <p className="text-[var(--red-60)] font-mono text-sm">
                                    {selectedTestResult.error}
                                </p>
                            ) : (
                                <div className="space-y-1 text-sm">
                                    <p className="text-[var(--text-secondary)]">
                                        <span className="font-semibold">Expected:</span>{' '}
                                        {selectedTestCase.expectedOutput}
                                    </p>
                                    <p className="text-[var(--text-secondary)]">
                                        <span className="font-semibold">Actual:</span> {selectedTestResult.output}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

