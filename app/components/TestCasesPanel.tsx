'use client';

import { FileText, CheckCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { TestCasesContent } from './TestCasesContent';
import { TestResultsContent } from './TestResultsContent';

export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
}

interface TestCasesPanelProps {
    testCases: TestCase[];
    selectedTestCaseId: string;
    testResults: Record<string, { output: string; passed: boolean; error?: string }>;
    onAddTestCase: () => void;
    onDeleteTestCase: (id: string) => void;
    onUpdateTestCase: (id: string, field: 'input' | 'expectedOutput', value: string) => void;
    onSelectTestCase: (id: string) => void;
    activeTab?: string;
    onTabChange?: (value: string) => void;
    isSubmitMode?: boolean;
    allTestCases?: TestCase[];
}

export const TestCasesPanel = ({
    testCases,
    selectedTestCaseId,
    testResults,
    onAddTestCase,
    onDeleteTestCase,
    onUpdateTestCase,
    onSelectTestCase,
    activeTab,
    onTabChange,
    isSubmitMode = false,
    allTestCases = [],
}: TestCasesPanelProps) => {
    return (
        <div className="flex flex-col h-full">
            <Tabs
                value={activeTab || "test-cases"}
                onValueChange={onTabChange}
                className="flex flex-col h-full"
            >
                <div className="shrink-0 px-3 py-1 border-b border-[var(--border-quaternary)] bg-white">
                    <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-4">
                        <TabsTrigger
                            value="test-cases"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-1 text-base data-[state=active]:text-[var(--text-primary)] data-[state=inactive]:text-[var(--text-tertiary)] rounded-none flex items-center gap-2 data-[state=active]:[&>svg]:text-[hsl(var(--sd-green-500))] data-[state=inactive]:[&>svg]:text-[var(--text-tertiary)]"
                        >
                            <FileText size={16} />
                            测试用例
                        </TabsTrigger>
                        <TabsTrigger
                            value="test-results"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-1 text-base data-[state=active]:text-[var(--text-primary)] data-[state=inactive]:text-[var(--text-tertiary)] rounded-none flex items-center gap-2 data-[state=active]:[&>svg]:text-[hsl(var(--sd-green-500))] data-[state=inactive]:[&>svg]:text-[var(--text-tertiary)]"
                        >
                            <CheckCircle size={16} />
                            测试结果
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="test-cases" className="flex-1 flex flex-col m-0 mt-0 overflow-hidden">
                    <TestCasesContent
                        testCases={testCases}
                        selectedTestCaseId={selectedTestCaseId}
                        testResults={testResults}
                        onAddTestCase={onAddTestCase}
                        onDeleteTestCase={onDeleteTestCase}
                        onUpdateTestCase={onUpdateTestCase}
                        onSelectTestCase={onSelectTestCase}
                    />
                </TabsContent>

                <TabsContent value="test-results" className="flex-1 flex flex-col m-0 mt-0 overflow-hidden">
                    <TestResultsContent
                        testCases={testCases}
                        selectedTestCaseId={selectedTestCaseId}
                        testResults={testResults}
                        onAddTestCase={onAddTestCase}
                        onDeleteTestCase={onDeleteTestCase}
                        onUpdateTestCase={onUpdateTestCase}
                        onSelectTestCase={onSelectTestCase}
                        isSubmitMode={isSubmitMode}
                        allTestCases={allTestCases}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

