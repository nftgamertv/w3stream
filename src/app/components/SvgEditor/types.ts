// types.ts

export interface Point {
  x: number;
  y: number;
}

export interface AnchorPoint extends Point {
  id: string;
  type: 'start' | 'end' | 'control';
  parentId?: string;
}

export interface PathData {
  id: string;
  d: string;
  anchors: AnchorPoint[];
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface WorkSetup {
  width: number;
  height: number;
  background: string;
}

export type ToolId = 'select' | 'rectangle' | 'ellipse' | 'pen' | 'brush' | 'eraser' | 'text';

export interface SVGElement {
  id: string;
  type: string;
  attributes: Record<string, string>;
  content: string;
  position?: Point;
  bounds?: DOMRect;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
}

export interface CollaborativeUser {
  id: string;
  name: string;
  color: string;
  cursor?: Point;
  selection?: string[];
  isActive: boolean;
  lastSeen: number;
}

export interface CollaborationEvent {
  id: string;
  type: 'element_added' | 'element_updated' | 'element_removed' | 'selection_changed' | 'cursor_moved';
  userId: string;
  timestamp: number;
  data: any;
}

export interface CanvasViewport {
  zoom: number;
  panOffset: Point;
  bounds: DOMRect;
}

export interface DrawingState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPath: string | null;
  dragOffset: Point | null;
}

export interface ColorPickerState {
  isOpen: boolean;
  position: Point;
  target: 'fill' | 'stroke';
  currentColor: string;
}

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  elements: SVGElement[];
}

export interface ExportOptions {
  format: 'svg' | 'png' | 'jpeg';
  quality?: number;
  scale?: number;
  background?: string;
  transparent?: boolean;
}

export interface EditorConfig {
  maxHistorySize: number;
  autoSave: boolean;
  autoSaveInterval: number;
  canvasSize: { width: number; height: number };
  defaultColors: {
    fill: string;
    stroke: string;
  };
  tools: {
    brush: { minSize: number; maxSize: number; defaultSize: number };
    pen: { minSize: number; maxSize: number; defaultSize: number };
  };
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
}

export interface AccessibilityOptions {
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
}

export type SetSelectedElementsAction = (elements: string[] | ((prev: string[]) => string[])) => void;

// Event types for canvas interactions
export interface CanvasEvent {
  type: 'mousedown' | 'mousemove' | 'mouseup' | 'click' | 'doubleclick';
  point: Point;
  target?: SVGElement;
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
  };
}

// Tool-specific data structures
export interface BrushStroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
}

export interface GeometricShape {
  id: string;
  type: 'rectangle' | 'ellipse' | 'line' | 'polygon';
  bounds: SelectionBounds;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

// Collaboration-specific types
export interface SessionInfo {
  id: string;
  name: string;
  createdAt: number;
  ownerId: string;
  participants: string[];
  isPublic: boolean;
}

export interface SyncOperation {
  id: string;
  type: 'insert' | 'update' | 'delete' | 'move';
  elementId: string;
  data: any;
  userId: string;
  timestamp: number;
  dependencies?: string[];
}

// Performance monitoring
export interface PerformanceMetrics {
  renderTime: number;
  syncLatency: number;
  memoryUsage: number;
  activeElements: number;
  operations: number;
}

// Error handling
export interface EditorError {
  id: string;
  type: 'sync' | 'render' | 'io' | 'validation';
  message: string;
  stack?: string;
  timestamp: number;
  context?: any;
}