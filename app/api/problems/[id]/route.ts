import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export interface ProblemData {
    id: string;
    title: string;
    difficulty: string;
    content: string;
    codeExample?: string;
    testCases?: Array<{
        id: string;
        input: any;
        expectedOutput: any;
        description?: string;
    }>;
}

/**
 * 从题目目录名中解析题目信息
 * 目录格式: 121-easy-Best-Time-to-Buy-and-Sell-Stock
 */
function parseProblemId(dirName: string): {
    number: string;
    difficulty: string;
    title: string;
} | null {
    const parts = dirName.split('-');
    if (parts.length < 3) return null;

    const number = parts[0];
    const difficulty = parts[1];
    const title = parts.slice(2).join(' ');

    return { number, difficulty, title };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const problemId = id;
        const problemDir = path.join(process.cwd(), 'data', problemId);
        const contentPath = path.join(problemDir, 'content.txt');
        const codeExamplePath = path.join(problemDir, 'codeExample.txt');

        // 检查是否请求所有测试用例
        const { searchParams } = new URL(request.url);
        const allCases = searchParams.get('all') === 'true';
        const testCasesPath = path.join(problemDir, allCases ? 'testAllCases.json' : 'testCases.json');

        // 检查文件是否存在
        if (!fs.existsSync(contentPath)) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        // 读取内容
        const content = fs.readFileSync(contentPath, 'utf-8');

        // 读取代码模板（如果存在）
        let codeExample: string | undefined;
        if (fs.existsSync(codeExamplePath)) {
            codeExample = fs.readFileSync(codeExamplePath, 'utf-8');
        }

        // 读取测试用例（如果存在）
        let testCases: Array<{
            id: string;
            input: any;
            expectedOutput: any;
            description?: string;
        }> | undefined;
        if (fs.existsSync(testCasesPath)) {
            const testCasesContent = fs.readFileSync(testCasesPath, 'utf-8');
            testCases = JSON.parse(testCasesContent);
        }

        // 解析题目信息
        const parsedInfo = parseProblemId(problemId);
        if (!parsedInfo) {
            return NextResponse.json({ error: 'Invalid problem ID format' }, { status: 400 });
        }

        const problemData: ProblemData = {
            id: problemId,
            title: `${parsedInfo.number}. ${parsedInfo.title}`,
            difficulty: parsedInfo.difficulty.charAt(0).toUpperCase() + parsedInfo.difficulty.slice(1),
            content,
            codeExample,
            testCases,
        };

        return NextResponse.json(problemData);
    } catch (error) {
        console.error('Failed to load problem data:', error);
        return NextResponse.json(
            { error: 'Failed to load problem data' },
            { status: 500 }
        );
    }
}

