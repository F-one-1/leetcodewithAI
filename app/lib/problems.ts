import fs from 'fs';
import path from 'path';
import type { ProblemData } from '@/types/problem';

const PROBLEMS_DIR = path.join(process.cwd(), 'data');

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

/**
 * 获取所有问题列表
 */
export async function getProblemList(): Promise<Array<{ id: string; title: string }>> {
  try {
    const dirs = fs.readdirSync(PROBLEMS_DIR, { withFileTypes: true });
    return dirs
      .filter((dir) => dir.isDirectory())
      .map((dir) => {
        const parsed = parseProblemId(dir.name);
        return {
          id: dir.name,
          title: parsed ? `${parsed.number}. ${parsed.title}` : dir.name,
        };
      })
      .sort((a, b) => {
        // 按题目编号排序
        const numA = parseInt(a.id.split('-')[0]) || 0;
        const numB = parseInt(b.id.split('-')[0]) || 0;
        return numA - numB;
      });
  } catch (error) {
    console.error('Failed to read problems directory:', error);
    return [];
  }
}

/**
 * 获取单个问题数据
 */
export async function getProblemData(problemId: string): Promise<ProblemData | null> {
  try {
    const problemDir = path.join(PROBLEMS_DIR, problemId);
    const contentPath = path.join(problemDir, 'content.txt');
    const codeExamplePath = path.join(problemDir, 'codeExample.txt');
    const testCasesPath = path.join(problemDir, 'testCases.json');

    if (!fs.existsSync(contentPath)) {
      return null;
    }

    const content = fs.readFileSync(contentPath, 'utf-8');
    const codeExample = fs.existsSync(codeExamplePath)
      ? fs.readFileSync(codeExamplePath, 'utf-8')
      : undefined;

    let testCases;
    if (fs.existsSync(testCasesPath)) {
      testCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf-8'));
    }

    const parsedInfo = parseProblemId(problemId);
    if (!parsedInfo) {
      return null;
    }

    return {
      id: problemId,
      title: `${parsedInfo.number}. ${parsedInfo.title}`,
      difficulty: parsedInfo.difficulty.charAt(0).toUpperCase() + parsedInfo.difficulty.slice(1),
      content,
      codeExample,
      testCases,
    };
  } catch (error) {
    console.error('Failed to load problem data:', error);
    return null;
  }
}





