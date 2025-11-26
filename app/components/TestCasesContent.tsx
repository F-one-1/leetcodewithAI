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
                </div>
            )}
        </div>
    );
};

