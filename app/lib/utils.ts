import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 从 AI 分析结果中提取修改后的代码
 * 使用正则表达式查找 markdown 代码块
 */
export function extractModifiedCodeFromAnalysis(analysisText: string): string | null {
  console.log('\n📝 extractModifiedCodeFromAnalysis called');
  console.log('输入文本长度:', analysisText.length);
  
  // 查找 markdown 代码块
  const regex = /```(?:javascript|js|typescript|ts)?\n([\s\S]*?)\n```/;
  console.log('使用正则表达式');
  
  const codeBlockMatch = analysisText.match(regex);
  console.log('匹配结果:', codeBlockMatch ? '找到' : '未找到');

  if (codeBlockMatch && codeBlockMatch[1]) {
    const extractedCode = codeBlockMatch[1].trim();
    console.log('✅ 成功提取代码');
    console.log('提取的代码长度:', extractedCode.length);
    return extractedCode;
  }

  // 如果没有找到代码块，返回 null
  console.log('❌ 未找到代码块');
  console.log('文本内容预览:', analysisText.substring(0, 200));
  return null;
}

