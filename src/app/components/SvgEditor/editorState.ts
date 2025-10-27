"use client";

import { observable } from "@legendapp/state";
import type { Point, PathData, ToolId } from './types';
import { TOOL_CONFIG } from './store';

// Editor state using LegendApp State
export const editorState$ = observable({
  // Viewport
  viewport: {
    zoom: 1,
    panOffset: { x: 0, y: 0 } as Point,
    minZoom: 0.1,
    maxZoom: 10,
  },

  // Selection
  selection: {
    selectedElements: [] as string[],
    selectedAnchors: [] as string[],
    selectionBounds: null as DOMRect | null,
  },

  // Tools
  tools: {
    activeToolId: null as ToolId | null,
    brushSize: TOOL_CONFIG.brush.defaultSize as number,
    penSize: TOOL_CONFIG.pen.defaultSize as number,
    fillColor: '#ffffff' as string,
    strokeColor: '#000000' as string,
    currentPath: null as PathData | null,
  },

  // Background
  background: {
    backgroundSvg: null as string | null,
    isEditingBackground: false,
  },

  // History
  history: {
    past: [] as any[][],
    present: [] as any[],
    future: [] as any[][],
    canUndo: false,
    canRedo: false,
  },
});
