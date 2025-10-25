"use client";

import React, { useCallback } from 'react';
import { useEditorStore, useCanUndo, useCanRedo } from './store';
import { Undo, Redo, RotateCcw, Save, Download } from 'lucide-react';
import Tooltip from '../Tooltip';

interface TopMenuProps {
  disabled?: boolean;
}

const TopMenu: React.FC<TopMenuProps> = ({ disabled = false }) => {
  const { undo, redo, reset, exportCanvasState } = useEditorStore();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const handleUndo = useCallback(() => {
    if (!disabled && canUndo) {
      undo();
    }
  }, [disabled, canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (!disabled && canRedo) {
      redo();
    }
  }, [disabled, canRedo, redo]);

  const handleReset = useCallback(() => {
    if (!disabled && confirm('Are you sure you want to reset the canvas? This action cannot be undone.')) {
      reset();
    }
  }, [disabled, reset]);

  const handleExport = useCallback(() => {
    if (disabled) return;
    
    try {
      const canvasState = exportCanvasState();
      const dataStr = JSON.stringify(canvasState, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `canvas-export-${new Date().toISOString().slice(0, 19)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Failed to export canvas:', error);
    }
  }, [disabled, exportCanvasState]);

  const buttonBaseClass = `
    features-item draft group relative rounded-lg h-[32px] w-[32px] min-h-[32px] 
    flex flex-col items-center justify-center cursor-pointer overflow-hidden 
    bg-gradient-to-br from-[#2a2b2f] to-[#1a1b1e] p-[1px] transition-all 
    duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
  `;

  const getButtonClass = (isEnabled: boolean) => `
    ${buttonBaseClass}
    ${disabled || !isEnabled ? 
      'opacity-50 cursor-not-allowed' : 
      'hover:from-[#3a3b3f] hover:to-[#2a2b2e] hover:shadow-lg'
    }
  `;

  return (
    <div className="flex h-16 w-full items-center justify-end bg-card px-8">
      <div className="flex items-center space-x-2" role="group" aria-label="Editor Actions">
        {/* Undo Button */}
        <Tooltip content="Undo (Ctrl/⌘ + Z)" position="bottom">
          <button 
            className={getButtonClass(canUndo)}
            onClick={handleUndo}
            disabled={disabled || !canUndo}
            aria-label="Undo last action"
          >
            <Undo className="h-5 w-5" />
          </button>
        </Tooltip>

        {/* Redo Button */}
        <Tooltip content="Redo (Ctrl/⌘ + Shift + Z)" position="bottom">
          <button 
            className={getButtonClass(canRedo)}
            onClick={handleRedo}
            disabled={disabled || !canRedo}
            aria-label="Redo last undone action"
          >
            <Redo className="h-5 w-5" />
          </button>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-600 mx-2" />

        {/* Reset Button */}
        <Tooltip content="Reset Canvas" position="bottom">
          <button 
            className={getButtonClass(true)}
            onClick={handleReset}
            disabled={disabled}
            aria-label="Reset canvas to initial state"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </Tooltip>

        {/* Export Button */}
        <Tooltip content="Export Canvas Data" position="bottom">
          <button 
            className={getButtonClass(true)}
            onClick={handleExport}
            disabled={disabled}
            aria-label="Export canvas as JSON"
          >
            <Download className="h-5 w-5" />
          </button>
        </Tooltip>
      </div> 
    </div>
  );
};

export default TopMenu;