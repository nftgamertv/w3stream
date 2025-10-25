import type { Point, SVGElement as SVGElementType, SelectionBounds } from './types';

/**
 * Modern SVG utility functions for the SVG editor
 */

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Creates an SVG element with specified attributes
 */
export function createSVGElement(
  tagName: string, 
  attributes: Record<string, string> = {},
  textContent?: string
): SVGElement {
  const element = document.createElementNS(SVG_NAMESPACE, tagName);
  
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
}

/**
 * Safely parses an SVG string and returns the document
 */
export function parseSVG(svgString: string): Document | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    // Check for parsing errors
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      console.error('SVG parsing error:', errorNode.textContent);
      return null;
    }
    
    return doc;
  } catch (error) {
    console.error('Failed to parse SVG:', error);
    return null;
  }
}

/**
 * Serializes an SVG element to string
 */
export function serializeSVG(svgElement: SVGElement): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
}

/**
 * Gets the bounding box of an SVG element
 */
export function getElementBounds(element: SVGGraphicsElement): SelectionBounds {
  const bbox = element.getBBox();
  return {
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height
  };
}

/**
 * Transforms a point using the current transformation matrix
 */
export function transformPoint(point: Point, ctm: DOMMatrix): Point {
  const svgPoint = new DOMPoint(point.x, point.y);
  const transformedPoint = svgPoint.matrixTransform(ctm);
  return { x: transformedPoint.x, y: transformedPoint.y };
}

/**
 * Gets the screen coordinates to SVG coordinate transformation matrix
 */
export function getScreenToSVGMatrix(svgElement: SVGSVGElement): DOMMatrix | null {
  return svgElement.getScreenCTM()?.inverse() || null;
}

/**
 * Converts screen coordinates to SVG coordinates
 */
export function screenToSVG(
  screenPoint: Point, 
  svgElement: SVGSVGElement
): Point {
  const ctm = getScreenToSVGMatrix(svgElement);
  if (!ctm) return screenPoint;
  
  return transformPoint(screenPoint, ctm);
}

/**
 * Creates a path data string from an array of points
 */
export function createPathFromPoints(points: Point[], closed = false): string {
  if (points.length === 0) return '';
  
  const [first, ...rest] = points;
  const moveTo = `M ${first.x},${first.y}`;
  const lineTos = rest.map(p => `L ${p.x},${p.y}`).join(' ');
  const closePath = closed ? ' Z' : '';
  
  return `${moveTo} ${lineTos}${closePath}`;
}

/**
 * Extracts points from a path data string
 */
export function extractPointsFromPath(pathData: string): Point[] {
  const points: Point[] = [];
  const commands = pathData.match(/[MLZ][^MLZ]*/g) || [];

  commands.forEach((command: string) => {
    const type = command[0];
    const coords = command.slice(1).trim();

    if (type === 'M' || type === 'L') {
      const [x, y] = coords.split(/[,\s]+/).map(Number);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
      }
    }
  });

  return points;
}

/**
 * Translates a path by the given offset
 */
export function translatePath(pathData: string, dx: number, dy: number): string {
  return pathData.replace(
    /([ML])\s*([0-9]+(?:\.[0-9]*)?)[,\s]+([0-9]+(?:\.[0-9]*)?)/g,
    (match, command, x, y) => {
      const newX = parseFloat(x) + dx;
      const newY = parseFloat(y) + dy;
      return `${command} ${newX},${newY}`;
    }
  );
}

/**
 * Scales an SVG element to fit within given dimensions
 */
export function scaleToFit(
  svgElement: SVGSVGElement,
  targetWidth: number,
  targetHeight: number
): void {
  const viewBox = svgElement.getAttribute('viewBox');
  
  if (viewBox) {
    const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    const scale = Math.min(targetWidth / vbWidth, targetHeight / vbHeight);
    
    // Create a group to contain all elements with scaling
    const g = createSVGElement('g', {
      transform: `scale(${scale})`
    });
    
    // Move all children to the group
    while (svgElement.firstChild) {
      g.appendChild(svgElement.firstChild);
    }
    
    svgElement.appendChild(g);
  }
  
  // Update SVG dimensions
  svgElement.setAttribute('width', targetWidth.toString());
  svgElement.setAttribute('height', targetHeight.toString());
  svgElement.setAttribute('viewBox', `0 0 ${targetWidth} ${targetHeight}`);
}

/**
 * Validates if a string is a valid SVG
 */
export function isValidSVG(svgString: string): boolean {
  if (!svgString.trim()) return false;
  
  const doc = parseSVG(svgString);
  if (!doc) return false;
  
  const svgElement = doc.documentElement;
  return svgElement.tagName.toLowerCase() === 'svg';
}

/**
 * Sanitizes SVG content by removing potentially dangerous elements
 */
export function sanitizeSVG(svgString: string): string {
  const doc = parseSVG(svgString);
  if (!doc) return '';
  
  // Remove script elements and event handlers
  const dangerousElements = doc.querySelectorAll('script, object, embed, foreignObject');
  dangerousElements.forEach(el => el.remove());
  
  // Remove event handler attributes
  const allElements = doc.querySelectorAll('*');
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return serializeSVG(doc.documentElement as unknown as SVGElement);
}

/**
 * Generates a unique ID for SVG elements
 */
export function generateElementId(prefix = 'element'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Converts SVG element to a data structure
 */
export function elementToData(element: SVGElement): SVGElementType {
  return {
    id: element.id || generateElementId(),
    type: element.tagName.toLowerCase(),
    attributes: Object.fromEntries(
      Array.from(element.attributes).map(attr => [attr.name, attr.value])
    ),
    content: element.textContent || '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Creates an SVG element from data structure
 */
export function dataToElement(data: SVGElementType): SVGElement {
  const element = createSVGElement(data.type, data.attributes, data.content);
  element.id = data.id;
  return element;
}

/**
 * Deep clones an SVG element
 */
export function cloneSVGElement(element: SVGElement): SVGElement {
  return element.cloneNode(true) as SVGElement;
}

/**
 * Calculates the distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Checks if a point is inside a rectangle
 */
export function pointInRect(point: Point, rect: SelectionBounds): boolean {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width &&
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
}

/**
 * Creates a selection bounds from multiple elements
 */
export function getSelectionBounds(elements: SVGGraphicsElement[]): SelectionBounds | null {
  if (elements.length === 0) return null;
  
  const bounds = elements.map(getElementBounds);
  
  const minX = Math.min(...bounds.map(b => b.x));
  const minY = Math.min(...bounds.map(b => b.y));
  const maxX = Math.max(...bounds.map(b => b.x + b.width));
  const maxY = Math.max(...bounds.map(b => b.y + b.height));
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Optimizes SVG by removing redundant attributes and empty elements
 */
export function optimizeSVG(svgString: string): string {
  const doc = parseSVG(svgString);
  if (!doc) return svgString;
  
  // Remove empty elements
  const emptyElements = doc.querySelectorAll('g:empty, defs:empty');
  emptyElements.forEach(el => el.remove());
  
  // Remove redundant attributes
  const allElements = doc.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove default values
    if (el.getAttribute('fill') === 'black') el.removeAttribute('fill');
    if (el.getAttribute('stroke') === 'none') el.removeAttribute('stroke');
    if (el.getAttribute('stroke-width') === '1') el.removeAttribute('stroke-width');
  });
  
  return serializeSVG(doc.documentElement as unknown as SVGElement);
}