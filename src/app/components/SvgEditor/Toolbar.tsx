"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useEditorStore, TOOL_CONFIG, useCanUndo, useCanRedo, useHasSelection } from './store';
import { ToolId } from './types';
import Tooltip from '../Tooltip';
import TopMenu from './TopMenu';

import { 
  MousePointer2,
  Square, 
  Circle, 
  Pen,
  Paintbrush,
  Type,
  Eraser,
  Palette,
  Settings
} from 'lucide-react';

// Tool configuration with enhanced metadata
interface ToolConfig {
  id: ToolId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tooltip: string;
  shortcut: string;
  group: 'selection' | 'draw' | 'shape' | 'text' | 'utility';
  description: string;
}

const TOOLS: ToolConfig[] = [
  {
    id: 'select',
    icon: MousePointer2,
    label: 'Select',
    tooltip: 'Select Tool (V)',
    shortcut: 'V',
    group: 'selection',
    description: 'Select and move objects'
  },
  {
    id: 'rectangle',
    icon: Square,
    label: 'Rectangle',
    tooltip: 'Rectangle Tool (R)',
    shortcut: 'R',
    group: 'shape',
    description: 'Draw rectangles and squares'
  },
  {
    id: 'ellipse',
    icon: Circle,
    label: 'Ellipse',
    tooltip: 'Ellipse Tool (E)',
    shortcut: 'E',
    group: 'shape',
    description: 'Draw circles and ellipses'
  },
  {
    id: 'pen',
    icon: Pen,
    label: 'Pen',
    tooltip: 'Pen Tool (P)',
    shortcut: 'P',
    group: 'draw',
    description: 'Draw custom shapes and polygons'
  },
  {
    id: 'brush',
    icon: Paintbrush,
    label: 'Brush',
    tooltip: 'Brush Tool (B)',
    shortcut: 'B',
    group: 'draw',
    description: 'Free-form drawing and painting'
  }
];

// Color picker component
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  label, 
  disabled = false,
  size = 'md' 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className="relative">
      <Tooltip content={label} position="right">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`
            ${sizeClasses[size]} 
            ring-1 ring-border rounded cursor-pointer transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:ring-2 hover:ring-blue-400'}
            relative overflow-hidden
          `}
          style={{ backgroundColor: value }}
          aria-label={`${label}: ${value}`}
        >
          <input
            ref={inputRef}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            tabIndex={-1}
          />
          {disabled && (
            <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      </Tooltip>
    </div>
  );
};

// Size slider component
interface SizeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
  disabled?: boolean;
  showValue?: boolean;
}

const SizeSlider: React.FC<SizeSliderProps> = ({
  value,
  onChange,
  min,
  max,
  label,
  disabled = false,
  showValue = true
}) => {
  return (
    <div className={`px-2 w-full ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        {showValue && (
          <span className="text-xs text-muted-foreground">{value}px</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        aria-label={`${label}: ${value}px`}
      />
    </div>
  );
};

// Tool button component
interface ToolButtonProps {
  tool: ToolConfig;
  isActive: boolean;
  isDisabled: boolean;
  onClick: (toolId: ToolId) => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ 
  tool, 
  isActive, 
  isDisabled, 
  onClick 
}) => {
  const Icon = tool.icon;

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onClick(tool.id);
    }
  }, [isDisabled, onClick, tool.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
      e.preventDefault();
      onClick(tool.id);
    }
  }, [isDisabled, onClick, tool.id]);

  return (
    <Tooltip content={tool.tooltip} position="right">
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        aria-label={tool.tooltip}
        aria-pressed={isActive}
        className={`
          features-item relative h-[72px] w-[72px] min-h-[72px] flex flex-col 
          items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
          cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-[#2a2b2f] to-[#1a1b1e] p-[1px] 
          transition-all duration-300 
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#3a3b3f] hover:to-[#2a2b2e]'}
          ${isActive ? 'ring-4 ring-purple-500 bg-[#1e1f23]' : 'hover:bg-[#2a2b2f]'}
          bg-[#1e1f23] shadow-[inset_0px_2px_4px_rgba(255,255,255,0.1),inset_0px_-2px_4px_rgba(0,0,0,0.2),0_12px_25px_-8px_rgba(0,0,0,0.9)] 
          before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br 
          ${isActive ? 
            'before:from-gray-800/40 before:to-gray-950/60 before:opacity-100' : 
            'before:from-transparent before:to-black/20 before:opacity-0 hover:before:opacity-100'
          }
          before:transition-opacity before:duration-300
        `}
      >
        <Icon 
          className={`h-8 w-8 transition-all duration-300 ${
            isActive ? 'text-purple-400' : 'text-gray-400'
          }`}
        />
      </button>
    </Tooltip>
  );
};

// Background edit toggle component
interface BackgroundToggleProps {
  isEditing: boolean;
  onToggle: () => void;
}

const BackgroundToggle: React.FC<BackgroundToggleProps> = ({ isEditing, onToggle }) => {
  return (
    <Tooltip content="Edit Background Colors" position="right">
      <button
        onClick={onToggle}
        aria-label={isEditing ? "Stop editing background" : "Start editing background"}
        aria-pressed={isEditing}
        className={`
          
          ${isEditing ? 
            'shadow-[inset_0px_2px_4px_rgba(255,255,255,0.1),inset_0px_-2px_4px_rgba(0,0,0,0.2),0_0_20px_rgba(147,51,234,0.5),inset_0_0_10px_rgba(147,51,234,0.2)] before:from-purple-600/20 before:to-purple-900/40 before:opacity-100' : 
            ''
          }
        `}
      >
        <Palette className={`h-9 w-9 transition-all duration-300 ${isEditing ? 'text-purple-400' : 'text-gray-400'}`} />
      </button>
    </Tooltip>
  );
};

// Main Toolbar component
const Toolbar: React.FC = () => {
  const { 
    tools,
    selection,
    background,
    setActiveToolId,
    setBrushSize,
    setPenSize,
    setFillColor,
    setStrokeColor,
    setIsEditingBackground,
    addToHistory,
  } = useEditorStore();

  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const hasSelection = useHasSelection();

  const [activeColorPicker, setActiveColorPicker] = useState<'fill' | 'stroke'>('fill');

  // Tool handlers
  const handleToolClick = useCallback((toolId: ToolId) => {
    const newToolId = toolId === tools.activeToolId ? null : toolId;
    setActiveToolId(newToolId);
  }, [tools.activeToolId, setActiveToolId]);

  const handleColorChange = useCallback((color: string, type: 'fill' | 'stroke') => {
    if (type === 'fill') {
      setFillColor(color);
    } else {
      setStrokeColor(color);
    }

    // Apply color to selected elements
    if (hasSelection) {
      selection.selectedElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.setAttribute(type, color);
        }
      });
      addToHistory();
    }
  }, [setFillColor, setStrokeColor, hasSelection, selection.selectedElements, addToHistory]);

  const handleBackgroundToggle = useCallback(() => {
    setIsEditingBackground(!background.isEditingBackground);
  }, [background.isEditingBackground, setIsEditingBackground]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing in inputs
      }

      const tool = TOOLS.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (tool) {
        e.preventDefault();
        setActiveToolId(tool.id === tools.activeToolId ? null : tool.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tools.activeToolId, setActiveToolId]);

  // Memoized tool groups
  const toolsByGroup = useMemo(() => {
    return TOOLS.reduce((acc, tool) => {
      if (!acc[tool.group]) acc[tool.group] = [];
      acc[tool.group].push(tool);
      return acc;
    }, {} as Record<string, ToolConfig[]>);
  }, []);

  // Current tool config for size sliders
  const currentToolConfig = useMemo(() => {
    if (tools.activeToolId === 'brush') {
      return {
        value: tools.brushSize,
        onChange: setBrushSize,
        ...TOOL_CONFIG.brush,
        label: 'Brush Size'
      };
    }
    if (tools.activeToolId === 'pen') {
      return {
        value: tools.penSize,
        onChange: setPenSize,
        ...TOOL_CONFIG.pen,
        label: 'Pen Size'
      };
    }
    return null;
  }, [tools.activeToolId, tools.brushSize, tools.penSize, setBrushSize, setPenSize]);

  return (
    <div className="h-full bg-gray-800 flex flex-col" role="toolbar" aria-label="Drawing Tools">
      <div className="w-20 flex-1 px-2 py-4">
        {/* Top Menu */}
        <TopMenu disabled={background.isEditingBackground} />
        
        {/* Main Tools */}
        <div className="flex flex-col items-center space-y-3 mt-4" role="group" aria-label="Drawing Tools">
          {TOOLS.map((tool) => {
            const isActive = tool.id === tools.activeToolId;
            const isDisabled = background.isEditingBackground;
            
            return (
              <ToolButton
                key={tool.id}
                tool={tool}
                isActive={isActive}
                isDisabled={isDisabled}
                onClick={handleToolClick}
              />
            );
          })}

          {/* Size Controls */}
          {currentToolConfig && (
            <div className="w-full mt-6">
              <SizeSlider
                value={currentToolConfig.value}
                onChange={currentToolConfig.onChange}
                min={currentToolConfig.minSize}
                max={currentToolConfig.maxSize}
                label={currentToolConfig.label}
                disabled={background.isEditingBackground}
              />
            </div>
          )}
        </div>

        {/* Color Controls */}
        <div 
          className={`w-full flex justify-center mt-8 ${background.isEditingBackground ? 'opacity-50' : ''}`}
          role="group"
          aria-label="Color Controls"
        >
          <div className="relative w-12 h-12">
            {/* Stroke Color (back) */}
            <div
              className="absolute left-3 top-5 z-10"
              onClick={() => setActiveColorPicker('stroke')}
            >
              <ColorPicker
                value={tools.strokeColor}
                onChange={(color) => handleColorChange(color, 'stroke')}
                label="Stroke Color"
                disabled={background.isEditingBackground}
                size="md"
              />
            </div>

             {/* Background Edit Toggle */}
        <div className="w-full flex justify-center mt-6">
          <BackgroundToggle
            isEditing={background.isEditingBackground}
            onToggle={handleBackgroundToggle}
          />
        </div>
   
          </div>
        </div>


                 <div
              className="absolute left-0 top-0 z-20"
              onClick={() => setActiveColorPicker('fill')}
            >
              <ColorPicker
                value={tools.fillColor}
                onChange={(color) => handleColorChange(color, 'fill')}
                label="Fill Color"
                disabled={background.isEditingBackground}
                size="md"
              />
            </div>
      </div>
    </div>
  );
};

export default Toolbar;