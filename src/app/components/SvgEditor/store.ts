"use client";

// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 800;

// Tool configurations
export const TOOL_CONFIG = {
  brush: { minSize: 1, maxSize: 100, defaultSize: 20 },
  pen: { minSize: 1, maxSize: 50, defaultSize: 2 },
} as const;
