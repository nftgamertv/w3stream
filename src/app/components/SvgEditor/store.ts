"use client";

import { create } from 'zustand';
import type { Point, PathData, SVGElement as SVGElementType, ToolId, CollaborativeUser } from './types';

// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 800;

// Tool configurations
export const TOOL_CONFIG = {
  brush: { minSize: 1, maxSize: 100, defaultSize: 20 },
  pen: { minSize: 1, maxSize: 50, defaultSize: 2 },
} as const;

// History configuration
const MAX_HISTORY_SIZE = 50;

interface WorkSetup {
  width: number;
  height: number;
  background: string;
}

interface ViewportState {
  zoom: number;
  panOffset: Point;
  minZoom: number;
  maxZoom: number;
}

interface SelectionState {
  selectedElements: string[];
  selectedAnchors: string[];
  selectionBounds: DOMRect | null;
}

interface ToolState {
  activeToolId: ToolId | null;
  brushSize: number;
  penSize: number;
  fillColor: string;
  strokeColor: string;
  currentPath: PathData | null;
}

interface BackgroundState {
  backgroundSvg: string | null;
  isEditingBackground: boolean;
  backgroundElements: Record<string, SVGElementType>;
}

interface HistoryState {
  past: SVGElementType[][];
  present: SVGElementType[];
  future: SVGElementType[][];
  canUndo: boolean;
  canRedo: boolean;
}

interface CollaborationState {
  sessionId: string | null;
  users: Record<string, CollaborativeUser>;
  currentUserId: string | null;
  isCollaborative: boolean;
  syncEnabled: boolean;
}

interface EditorState {
  // Core state
  workSetup: WorkSetup;
  viewport: ViewportState;
  selection: SelectionState;
  tools: ToolState;
  background: BackgroundState;
  history: HistoryState;
  collaboration: CollaborationState;
  
  // Computed state
  isReady: boolean;
  hasChanges: boolean;
  
  // Viewport actions
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: Point) => void;
  resetViewport: () => void;
  
  // Selection actions
  setSelectedElements: (elements: string[] | ((prev: string[]) => string[])) => void;
  setSelectedAnchors: (anchors: string[]) => void;
  clearSelection: () => void;
  
  // Tool actions
  setActiveToolId: (id: ToolId | null) => void;
  setBrushSize: (size: number) => void;
  setPenSize: (size: number) => void;
  setFillColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setCurrentPath: (path: PathData | null) => void;
  
  // Background actions
  setBackgroundSvg: (svg: string | null) => void;
  setIsEditingBackground: (isEditing: boolean) => void;
  updateBackgroundElement: (elementId: string, updates: Partial<SVGElementType>) => void;
  
  // History actions
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Collaboration actions
  setSessionId: (sessionId: string | null) => void;
  addUser: (user: CollaborativeUser) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<CollaborativeUser>) => void;
  setCurrentUser: (userId: string) => void;
  enableCollaboration: () => void;
  disableCollaboration: () => void;
  
  // Canvas actions
  addElement: (element: SVGElementType) => void;
  updateElement: (elementId: string, updates: Partial<SVGElementType>) => void;
  removeElement: (elementId: string) => void;
  duplicateElements: (elementIds: string[]) => void;
  
  // Utility actions
  reset: () => void;
  exportCanvasState: () => SVGElementType[];
  importCanvasState: (elements: SVGElementType[]) => void;
}

const initialState = {
  workSetup: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: 'transparent',
  },
  viewport: {
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    minZoom: 0.1,
    maxZoom: 10,
  },
  selection: {
    selectedElements: [],
    selectedAnchors: [],
    selectionBounds: null,
  },
  tools: {
    activeToolId: null,
    brushSize: TOOL_CONFIG.brush.defaultSize,
    penSize: TOOL_CONFIG.pen.defaultSize,
    fillColor: '#ffffff',
    strokeColor: '#000000',
    currentPath: null,
  },
  background: {
    backgroundSvg: null,
    isEditingBackground: false,
    backgroundElements: {},
  },
  history: {
    past: [],
    present: [],
    future: [],
    canUndo: false,
    canRedo: false,
  },
  collaboration: {
    sessionId: null,
    users: {},
    currentUserId: null,
    isCollaborative: false,
    syncEnabled: false,
  },
  isReady: false,
  hasChanges: false,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  // Viewport actions
  setZoom: (zoom) => {
    const currentState = get();
    const clampedZoom = Math.max(currentState.viewport.minZoom, Math.min(currentState.viewport.maxZoom, zoom));
    set((state) => ({
      viewport: { ...state.viewport, zoom: clampedZoom }
    }));
  },

  setPanOffset: (offset) => set((state) => ({
    viewport: { ...state.viewport, panOffset: offset }
  })),

  resetViewport: () => set((state) => ({
    viewport: { ...state.viewport, zoom: 1, panOffset: { x: 0, y: 0 } }
  })),

  // Selection actions
  setSelectedElements: (elements) => set((state) => ({
    selection: {
      ...state.selection,
      selectedElements: typeof elements === 'function' ? elements(state.selection.selectedElements) : elements
    }
  })),

  setSelectedAnchors: (anchors) => set((state) => ({
    selection: { ...state.selection, selectedAnchors: anchors }
  })),

  clearSelection: () => set((state) => ({
    selection: {
      ...state.selection,
      selectedElements: [],
      selectedAnchors: [],
      selectionBounds: null
    }
  })),

  // Tool actions
  setActiveToolId: (id) => set((state) => ({
    tools: { ...state.tools, activeToolId: id }
  })),

  setBrushSize: (size) => {
    const clampedSize = Math.max(TOOL_CONFIG.brush.minSize, Math.min(TOOL_CONFIG.brush.maxSize, size));
    set((state) => ({
      tools: { ...state.tools, brushSize: clampedSize }
    }));
  },

  setPenSize: (size) => {
    const clampedSize = Math.max(TOOL_CONFIG.pen.minSize, Math.min(TOOL_CONFIG.pen.maxSize, size));
    set((state) => ({
      tools: { ...state.tools, penSize: clampedSize }
    }));
  },

  setFillColor: (color) => set((state) => ({
    tools: { ...state.tools, fillColor: color }
  })),

  setStrokeColor: (color) => set((state) => ({
    tools: { ...state.tools, strokeColor: color }
  })),

  setCurrentPath: (path) => set((state) => ({
    tools: { ...state.tools, currentPath: path }
  })),

  // Background actions
  setBackgroundSvg: (svg) => set((state) => ({
    background: { ...state.background, backgroundSvg: svg },
    isReady: svg !== null
  })),

  setIsEditingBackground: (isEditing) => set((state) => ({
    background: { ...state.background, isEditingBackground: isEditing },
    selection: isEditing ? { ...state.selection, selectedElements: [] } : state.selection,
    tools: isEditing ? { ...state.tools, activeToolId: null } : state.tools
  })),

  updateBackgroundElement: (elementId, updates) => set((state) => {
    const element = state.background.backgroundElements[elementId];
    if (!element) return state;
    
    return {
      background: {
        ...state.background,
        backgroundElements: {
          ...state.background.backgroundElements,
          [elementId]: { ...element, ...updates }
        }
      }
    };
  }),

  // History actions
  addToHistory: () => {
    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) return;

    const currentState = Array.from(mainLayer.children).map(child => {
      const element = child as Element;
      return {
        id: element.id,
        type: element.tagName.toLowerCase(),
        attributes: Object.fromEntries(
          Array.from(element.attributes).map(attr => [attr.name, attr.value])
        ),
        content: element.textContent || '',
      } as SVGElementType;
    });

    set((state) => {
      const newPast = [...state.history.past];
      if (newPast.length >= MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      newPast.push(state.history.present);

      return {
        history: {
          past: newPast,
          present: currentState,
          future: [],
          canUndo: newPast.length > 0,
          canRedo: false,
        },
        hasChanges: true
      };
    });
  },

  undo: () => {
    const state = get();
    if (!state.history.canUndo) return;

    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) return;

    const previous = state.history.past[state.history.past.length - 1];
    const current = state.history.present;

    // Apply DOM changes
    while (mainLayer.firstChild) {
      mainLayer.removeChild(mainLayer.firstChild);
    }

    previous.forEach(elementData => {
      const element = document.createElementNS("http://www.w3.org/2000/svg", elementData.type);
      element.id = elementData.id;
      Object.entries(elementData.attributes).forEach(([name, value]) => {
        element.setAttribute(name, value);
      });
      if (elementData.content) {
        element.textContent = elementData.content;
      }
      mainLayer.appendChild(element);
    });

    set((state) => ({
      history: {
        past: state.history.past.slice(0, -1),
        present: previous,
        future: [current, ...state.history.future],
        canUndo: state.history.past.length > 1,
        canRedo: true,
      }
    }));
  },

  redo: () => {
    const state = get();
    if (!state.history.canRedo) return;

    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) return;

    const next = state.history.future[0];
    const current = state.history.present;

    // Apply DOM changes
    while (mainLayer.firstChild) {
      mainLayer.removeChild(mainLayer.firstChild);
    }

    next.forEach(elementData => {
      const element = document.createElementNS("http://www.w3.org/2000/svg", elementData.type);
      element.id = elementData.id;
      Object.entries(elementData.attributes).forEach(([name, value]) => {
        element.setAttribute(name, value);
      });
      if (elementData.content) {
        element.textContent = elementData.content;
      }
      mainLayer.appendChild(element);
    });

    set((state) => ({
      history: {
        past: [...state.history.past, current],
        present: next,
        future: state.history.future.slice(1),
        canUndo: true,
        canRedo: state.history.future.length > 1,
      }
    }));
  },

  clearHistory: () => set((state) => ({
    history: {
      past: [],
      present: [],
      future: [],
      canUndo: false,
      canRedo: false,
    },
    hasChanges: false
  })),

  // Collaboration actions
  setSessionId: (sessionId) => set((state) => ({
    collaboration: {
      ...state.collaboration,
      sessionId,
      isCollaborative: sessionId !== null
    }
  })),

  addUser: (user) => set((state) => ({
    collaboration: {
      ...state.collaboration,
      users: { ...state.collaboration.users, [user.id]: user }
    }
  })),

  removeUser: (userId) => set((state) => {
    const { [userId]: removed, ...users } = state.collaboration.users;
    return {
      collaboration: { ...state.collaboration, users }
    };
  }),

  updateUser: (userId, updates) => set((state) => {
    const user = state.collaboration.users[userId];
    if (!user) return state;
    
    return {
      collaboration: {
        ...state.collaboration,
        users: {
          ...state.collaboration.users,
          [userId]: { ...user, ...updates }
        }
      }
    };
  }),

  setCurrentUser: (userId) => set((state) => ({
    collaboration: { ...state.collaboration, currentUserId: userId }
  })),

  enableCollaboration: () => set((state) => ({
    collaboration: { ...state.collaboration, syncEnabled: true }
  })),

  disableCollaboration: () => set((state) => ({
    collaboration: { ...state.collaboration, syncEnabled: false }
  })),

  // Canvas actions
  addElement: (element) => set({ hasChanges: true }),

  updateElement: (elementId, updates) => set({ hasChanges: true }),

  removeElement: (elementId) => set((state) => ({
    selection: {
      ...state.selection,
      selectedElements: state.selection.selectedElements.filter(id => id !== elementId)
    },
    hasChanges: true
  })),

  duplicateElements: (elementIds) => set({ hasChanges: true }),

  // Utility actions
  reset: () => set(() => ({ ...initialState })),

  exportCanvasState: () => {
    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) return [];

    return Array.from(mainLayer.children).map(child => {
      const element = child as Element;
      return {
        id: element.id,
        type: element.tagName.toLowerCase(),
        attributes: Object.fromEntries(
          Array.from(element.attributes).map(attr => [attr.name, attr.value])
        ),
        content: element.textContent || '',
      } as SVGElementType;
    });
  },

  importCanvasState: (elements) => {
    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) return;

    while (mainLayer.firstChild) {
      mainLayer.removeChild(mainLayer.firstChild);
    }

    elements.forEach(elementData => {
      const element = document.createElementNS("http://www.w3.org/2000/svg", elementData.type);
      element.id = elementData.id;
      Object.entries(elementData.attributes).forEach(([name, value]) => {
        element.setAttribute(name, value);
      });
      if (elementData.content) {
        element.textContent = elementData.content;
      }
      mainLayer.appendChild(element);
    });

    set({ hasChanges: true });
  },
}));

// Computed selectors
export const useCanUndo = () => useEditorStore(state => state.history.canUndo);
export const useCanRedo = () => useEditorStore(state => state.history.canRedo);
export const useHasSelection = () => useEditorStore(state => state.selection.selectedElements.length > 0);
export const useIsCollaborative = () => useEditorStore(state => state.collaboration.isCollaborative);
export const useActiveUsers = () => useEditorStore(state => Object.values(state.collaboration.users));