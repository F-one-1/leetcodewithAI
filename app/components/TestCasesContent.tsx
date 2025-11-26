'use client';

import { Trash2 } from 'lucide-react';
import { TestCase } from './TestCasesPanel';

interface TestCasesContentProps {
    testCases: TestCase[];
    selectedTestCaseId: string;
    testResults: Record<string, { output: string; passed: boolean; error?: string }>;
    onDeleteTestCase: (id: string) => void;
    onUpdateTestCase: (id: string, field: 'input' | 'expectedOutput', value: string) => void;
    onSelectTestCase: (id: string) => void;
}

export const TestCasesContent = ({
    testCases,
    selectedTestCaseId,
    testResults,
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
                <div className="flex overflow-x-auto">
                    {testCases.map((tc) => (
                        <button
                            key={tc.id}
                            onClick={() => onSelectTestCase(tc.id)}
                            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${selectedTestCaseId === tc.id
                                ? 'border-[var(--light-blue-60)] text-[var(--light-blue-60)] font-semibold'
                                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
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
                    ))}
                </div>
            </div>

            {/* Test Case Editor */}
            {selectedTestCase && (
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                            Input
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
                            Expected Output
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

                    {/* Delete Button */}
                    {testCases.length > 1 && (
                        <button
                            onClick={() => onDeleteTestCase(selectedTestCase.id)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--red-10)] text-[var(--red-60)] rounded hover:opacity-80 transition-opacity"
                        >
                            <Trash2 size={16} />
                            Delete Test Case
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

