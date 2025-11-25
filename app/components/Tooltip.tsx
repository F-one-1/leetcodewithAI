'use client';

import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export const Tooltip = ({ 
  text, 
  children, 
  position = 'top' 
}: TooltipProps) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div
        className={`
          absolute whitespace-nowrap bg-gray-900 text-white text-xs 
          py-1 px-2 rounded opacity-0 group-hover:opacity-100 
          transition-opacity pointer-events-none z-10
          ${position === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2'}
          ${position === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2'}
        `}
      >
        {text}
      </div>
    </div>
  );
};

