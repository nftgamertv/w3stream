"use client";

import React, { useCallback } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import Tooltip from '../Tooltip';

interface TopMenuProps {
  disabled?: boolean;
}

const TopMenu: React.FC<TopMenuProps> = ({ disabled = false }) => {
  const handleReset = useCallback(() => {
    if (!disabled && confirm('Are you sure you want to reset the canvas? This action cannot be undone.')) {
      // Clear the main layer
      const mainLayer = document.getElementById('mainLayer');
      if (mainLayer) {
        mainLayer.innerHTML = '';
      }
    }
  }, [disabled]);

  const handleExport = useCallback(() => {
    if (disabled) return;

    try {
      const mainLayer = document.getElementById('mainLayer');
      if (!mainLayer) {
        console.error('Main layer not found');
        return;
      }

      // Get all SVG elements from the main layer
      const svgElements = Array.from(mainLayer.children).map(el => el.outerHTML);

      const canvasState = {
        elements: svgElements,
        timestamp: new Date().toISOString()
      };

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
  }, [disabled]);

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