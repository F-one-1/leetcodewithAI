// AI Power Demo 相关类型定义

export type DemoPhase = 'idle' | 'analyzing' | 'modifying' | 'running' | 'submitting' | 'completed' | 'cancelled';

export interface DemoStep {
  id: string;
  phase: DemoPhase;
  message: string;
  progress: number; // 0-100
}

export interface CursorPosition {
  x: number;
  y: number;
}

export interface CodeModification {
  originalCode: string;
  modifiedCode: string;
  changeSummary: string;
}

export interface AIPowerDemoState {
  isRunning: boolean;
  currentPhase: DemoPhase;
  currentStep: number;
  totalSteps: number;
  message: string;
  progress: number;
  cursorPosition: CursorPosition;
  modifiedCode?: string;
  analysisResult?: string;
  testResults?: any;
  error?: string;
}

