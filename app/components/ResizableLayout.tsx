'use client';

import { ReactNode } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';

interface ResizableLayoutProps {
  leftPanel: ReactNode;
  rightTopPanel: ReactNode;
  rightBottomPanel: ReactNode;
}

export const ResizableLayout = ({
  leftPanel,
  rightTopPanel,
  rightBottomPanel,
}: ResizableLayoutProps) => {
  return (
    <PanelGroup direction="horizontal" className="w-full h-full">
      {/* Left Panel - Problem Description */}
      <Panel defaultSize={50} minSize={20} maxSize={80} className="overflow-hidden">
        <div className="w-full h-full bg-white border-r border-gray-200 overflow-auto">
          {leftPanel}
        </div>
      </Panel>

      {/* Horizontal Resize Handle */}
      <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize group flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} className="text-gray-400" />
        </div>
      </PanelResizeHandle>

      {/* Right Panel - Code Editor + Test Cases */}
      <Panel defaultSize={50} minSize={20} maxSize={80} className="overflow-hidden">
        <PanelGroup direction="vertical" className="w-full h-full">
          {/* Right Top Panel - Code Editor */}
          <Panel defaultSize={50} minSize={30} maxSize={70} className="overflow-hidden">
            <div className="w-full h-full bg-white border-b border-gray-200 overflow-auto">
              {rightTopPanel}
            </div>
          </Panel>

          {/* Vertical Resize Handle */}
          <PanelResizeHandle className="h-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-row-resize group flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={16} className="text-gray-400 rotate-90" />
            </div>
          </PanelResizeHandle>

          {/* Right Bottom Panel - Test Cases */}
          <Panel defaultSize={50} minSize={30} maxSize={70} className="overflow-hidden">
            <div className="w-full h-full bg-white overflow-auto">
              {rightBottomPanel}
            </div>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
};

