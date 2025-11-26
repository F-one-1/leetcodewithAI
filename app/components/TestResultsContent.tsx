'use client';

import { TestCase } from './TestCasesPanel';

interface TestResultsContentProps {
    testCases: TestCase[];
    testResults: Record<string, { output: string; passed: boolean; error?: string }>;
}

export const TestResultsContent = ({
    testCases,
    testResults,
}: TestResultsContentProps) => {
    // 留空，后续开发
    return (
        <div className="flex-1 overflow-auto p-4">
            {/* 测试结果内容将在这里开发 */}
        </div>
    );
};

