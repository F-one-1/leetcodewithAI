import { useCallback } from 'react';

interface UseMonacoStreamOptions {
  onProgress?: (current: number, total: number) => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook 用于在 Monaco Editor 中流式更新代码
 * 使用 editorRef.current.setValue() 来直接更新编辑器内容
 * 这是处理 AI 流式输出的正确方式
 */
export const useMonacoStream = (options: UseMonacoStreamOptions = {}) => {
  const { onProgress, onComplete, onError } = options;

  /**
   * 直接更新编辑器内容（用于完整代码块）
   */
  const updateEditorContent = useCallback(
    (editorRef: any, content: string) => {
      if (!editorRef?.current) return;
      
      console.log('📝 updateEditorContent: 设置编辑器内容, 长度:', content.length);
      editorRef.current.setValue(content);
      
      // 自动滚动到底部
      const lineCount = editorRef.current.getModel()?.getLineCount() || 0;
      editorRef.current.revealLine(lineCount);
    },
    []
  );

  /**
   * 逐字符流式更新（真正的打字机效果）
   */
  const streamCharByChar = useCallback(
    async (editorRef: any, fullContent: string, delayMs: number = 50) => {
      if (!editorRef?.current) {
        onError?.('Editor ref not available');
        return;
      }

      console.log('🎬 streamCharByChar: 开始逐字符更新, 总长度:', fullContent.length);
      
      try {
        editorRef.current.setValue(''); // 清空编辑器
        let currentContent = '';

        for (let i = 0; i < fullContent.length; i++) {
          const nextChar = fullContent[i];
          currentContent += nextChar;

          // 使用 setValue 更新编辑器
          editorRef.current.setValue(currentContent);

          // 自动滚动到底部
          const lineCount = editorRef.current.getModel()?.getLineCount() || 0;
          editorRef.current.revealLine(lineCount);

          // 每 50 个字符打印一次日志
          if ((i + 1) % 50 === 0) {
            console.log(`📝 已输出 ${i + 1}/${fullContent.length} 字符`);
            onProgress?.(i + 1, fullContent.length);
          }

          // 等待指定的延迟
          await new Promise(r => setTimeout(r, delayMs));
        }

        console.log('✅ streamCharByChar 完成');
        onComplete?.();
      } catch (error) {
        console.error('❌ streamCharByChar 错误:', error);
        onError?.(error);
      }
    },
    [onProgress, onComplete, onError]
  );

  /**
   * 逐行流式更新
   */
  const streamLineByLine = useCallback(
    async (editorRef: any, lines: string[], delayMs: number = 300) => {
      if (!editorRef?.current) {
        onError?.('Editor ref not available');
        return;
      }

      console.log('🎬 streamLineByLine: 开始逐行更新, 总行数:', lines.length);
      
      try {
        editorRef.current.setValue(''); // 清空编辑器
        let currentContent = '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          currentContent += line + '\n';

          // 使用 setValue 更新编辑器
          editorRef.current.setValue(currentContent);

          // 自动滚动到底部
          const lineCount = editorRef.current.getModel()?.getLineCount() || 0;
          editorRef.current.revealLine(lineCount);

          console.log(`📝 已输出第 ${i + 1}/${lines.length} 行`);
          onProgress?.(i + 1, lines.length);

          // 等待指定的延迟
          await new Promise(r => setTimeout(r, delayMs));
        }

        console.log('✅ streamLineByLine 完成');
        onComplete?.();
      } catch (error) {
        console.error('❌ streamLineByLine 错误:', error);
        onError?.(error);
      }
    },
    [onProgress, onComplete, onError]
  );

  /**
   * 清空编辑器
   */
  const clearEditor = useCallback((editorRef: any) => {
    if (!editorRef?.current) return;
    console.log('🗑️  清空编辑器');
    editorRef.current.setValue('');
  }, []);

  return {
    updateEditorContent,
    streamCharByChar,
    streamLineByLine,
    clearEditor,
  };
};

