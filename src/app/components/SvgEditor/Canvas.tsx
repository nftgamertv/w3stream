import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useEditorStore, CANVAS_WIDTH, CANVAS_HEIGHT } from './store';
import { createColorPicker } from '@/utils/createColorPicker';
import type { Point, PathData, CanvasEvent, DrawingState, ToolId, SVGElement as SVGElementType } from './types';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { createClient } from '@/utils/supabaseClients/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// import type { useSVGCollaboration } from './ReactTogetherCollaboration';

// Custom hooks for Canvas functionality
const useCanvasEvents = () => {
  const {
    viewport,
    tools,
    selection,
    background,
    setSelectedElements,
    setActiveToolId,
    addToHistory,
    undo,
    redo,
    clearSelection,
  } = useEditorStore();

  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    // Prevent default for editor shortcuts
    if ((e.ctrlKey || e.metaKey) && ['z', 'y'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }

    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }

    // Delete selected elements
    if (['Delete', 'Backspace'].includes(e.key) && selection.selectedElements.length > 0) {
      e.preventDefault();
      selection.selectedElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.remove();
      });
      setSelectedElements([]);
      addToHistory();
      return;
    }

    // Clear selection
    if (e.key === 'Escape') {
      clearSelection();
      const mainLayer = document.getElementById('mainLayer');
      if (mainLayer) {
        mainLayer.querySelectorAll('*').forEach(el => {
          if (el instanceof SVGElement) {
            el.style.outline = 'none';
            el.style.outlineOffset = '0';
          }
        });
      }
      return;
    }

    // Tool shortcuts
    const toolShortcuts: Record<string, string> = {
      'v': 'select',
      'b': 'brush',
      'p': 'pen',
      'r': 'rectangle',
      'e': 'ellipse',
    };

    if (toolShortcuts[e.key.toLowerCase()]) {
      e.preventDefault();
      setActiveToolId(toolShortcuts[e.key.toLowerCase()] as ToolId);
    }
  }, [selection.selectedElements, setSelectedElements, addToHistory, undo, redo, clearSelection, setActiveToolId]);

  return { handleKeyboard };
};

const useDrawingState = () => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startPoint: null,
    currentPath: null,
    dragOffset: null,
  });

  const [penPoints, setPenPoints] = useState<Point[]>([]);
  const [currentPolygonPath, setCurrentPolygonPath] = useState<string | null>(null);

  return {
    drawingState,
    setDrawingState,
    penPoints,
    setPenPoints,
    currentPolygonPath,
    setCurrentPolygonPath,
  };
};

const useBackgroundInteraction = () => {
  const { background, setIsEditingBackground } = useEditorStore();
  const [backgroundContent, setBackgroundContent] = useState<string | null>(null);

  const setupBackgroundInteraction = useCallback((backgroundRef: React.RefObject<SVGSVGElement>) => {
    if (!backgroundRef.current || !backgroundContent) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(backgroundContent, 'image/svg+xml');
    const originalSvg = doc.documentElement;

    // Setup viewport and scaling
    const viewBox = originalSvg.getAttribute('viewBox');
    if (viewBox) {
      const [,, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
      const scale = Math.min(CANVAS_WIDTH / vbWidth, CANVAS_HEIGHT / vbHeight);
      
      const g = doc.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute('transform', `scale(${scale})`);
      
      while (originalSvg.firstChild) {
        g.appendChild(originalSvg.firstChild);
      }

      originalSvg.setAttribute('width', CANVAS_WIDTH.toString());
      originalSvg.setAttribute('height', CANVAS_HEIGHT.toString());
      originalSvg.setAttribute('viewBox', `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`);
      originalSvg.appendChild(g);
    } else {
      originalSvg.setAttribute('width', CANVAS_WIDTH.toString());
      originalSvg.setAttribute('height', CANVAS_HEIGHT.toString());
      originalSvg.setAttribute('viewBox', `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`);
    }

    backgroundRef.current.innerHTML = originalSvg.outerHTML;

    // Setup color picker for background editing
    const colorPicker = createColorPicker();
    const elements = backgroundRef.current.querySelectorAll('*');
    const cleanupListeners: (() => void)[] = [];

    elements.forEach(element => {
      if (!(element instanceof SVGElement)) return;

      element.style.cursor = background.isEditingBackground ? 'pointer' : 'default';
      
      const handleClick = (e: Event) => {
        if (!background.isEditingBackground) return;
        e.stopPropagation();
        
        const target = e.target as SVGElement;
        const currentFill = target.getAttribute('fill');
        const currentStroke = target.getAttribute('stroke');
        
        colorPicker.show(
          (e as MouseEvent).clientX, 
          (e as MouseEvent).clientY, 
          currentFill || currentStroke || '#000000', 
          (newColor: string) => {
            if (currentFill !== null) {
              target.setAttribute('fill', newColor);
            }
            if (currentStroke !== null) {
              target.setAttribute('stroke', newColor);
            }
            setBackgroundContent(backgroundRef.current!.innerHTML);
          }
        );
      };

      element.addEventListener('click', handleClick);
      cleanupListeners.push(() => {
        element.removeEventListener('click', handleClick);
        colorPicker.hide();
      });
    });

    return () => cleanupListeners.forEach(cleanup => cleanup());
  }, [background.isEditingBackground, backgroundContent]);

  useEffect(() => {
    if (background.backgroundSvg && !backgroundContent) {
      setBackgroundContent(background.backgroundSvg);
    }
  }, [background.backgroundSvg, backgroundContent]);

  return {
    backgroundContent,
    setBackgroundContent,
    setupBackgroundInteraction,
  };
};

const useCanvasSubmission = () => {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const { clearSelection } = useEditorStore();

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      clearSelection();

      // Clear all element outlines
      const mainLayer = document.getElementById('mainLayer');
      if (mainLayer) {
        mainLayer.querySelectorAll('*').forEach(el => {
          if (el instanceof SVGElement) {
            el.style.outline = 'none';
            el.style.outlineOffset = '0';
          }
        });
      }

      // Create combined SVG
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const combinedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      combinedSvg.setAttribute('width', CANVAS_WIDTH.toString());
      combinedSvg.setAttribute('height', CANVAS_HEIGHT.toString());
      combinedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      combinedSvg.setAttribute('viewBox', `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`);

      // Add background
      const backgroundRef = document.getElementById('backgroundWrapper');
      if (backgroundRef) {
        const backgroundGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        backgroundGroup.innerHTML = backgroundRef.innerHTML;
        combinedSvg.appendChild(backgroundGroup);
      }

      // Add drawing layer
      if (mainLayer) {
        const drawingGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        drawingGroup.innerHTML = mainLayer.innerHTML;
        combinedSvg.appendChild(drawingGroup);
      }

      await new Promise(requestAnimationFrame);

      // Convert to PNG
      const svgData = new XMLSerializer().serializeToString(combinedSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          URL.revokeObjectURL(url);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
          }, 'image/png');
        };
        img.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };
        img.src = url;
      });

      // Upload to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const fileName = `${user.id}_${Date.now()}.png`;
      const filePath = `submissions/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('svgs')
        .upload(filePath, pngBlob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          svg_content: filePath,
          round: 1
        });

      if (submissionError) throw submissionError;

      toast.success('Image submitted successfully!');
      router.push('/submissions');

    } catch (error) {
      console.error('Failed to submit canvas:', error);
      toast.error(`Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [supabase, router, clearSelection]);

  return { handleSubmit, loading };
};

interface CanvasProps {
  // collaboration?: ReturnType<typeof useSVGCollaboration>;
  onDrawingStart?: () => void;
  onDrawingEnd?: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  // collaboration, 
  onDrawingStart, onDrawingEnd }) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const backgroundRef = useRef<SVGSVGElement>(null);
  
  const {
    viewport,
    tools,
    selection,
    background,
    setSelectedElements,
    setActiveToolId,
    addToHistory,
  } = useEditorStore();

  const { handleKeyboard } = useCanvasEvents();
  const {
    drawingState,
    setDrawingState,
    penPoints,
    setPenPoints,
    currentPolygonPath,
    setCurrentPolygonPath,
  } = useDrawingState();

  const {
    backgroundContent,
    setupBackgroundInteraction,
  } = useBackgroundInteraction();

  const { handleSubmit, loading } = useCanvasSubmission();

  // Memoized mouse position calculator
  const getMousePosition = useCallback((event: React.MouseEvent<SVGSVGElement>): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const CTM = canvasRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };

    const point = canvasRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(CTM.inverse());
  }, []);

  // Path translation utility
  const translatePath = useCallback((pathD: string, dx: number, dy: number): string => {
    return pathD.replace(/([0-9]+(?:\.[0-9]*)?)[,\\s]([0-9]+(?:\.[0-9]*)?)/g, (_, x, y) => {
      const newX = parseFloat(x) + dx;
      const newY = parseFloat(y) + dy;
      return `${newX},${newY}`;
    });
  }, []);

  // Canvas event handlers
  const createCanvasEvent = useCallback((event: React.MouseEvent<SVGSVGElement>): CanvasEvent => ({
    type: event.type as any,
    point: getMousePosition(event),
    modifiers: {
      shift: event.shiftKey,
      ctrl: event.ctrlKey || event.metaKey,
      alt: event.altKey,
    },
  }), [getMousePosition]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (background.isEditingBackground) return;
    
    const target = e.target as SVGElement;
    const isSelectableElement = ['rect', 'ellipse', 'path'].includes(target.tagName.toLowerCase());
    
    if (isSelectableElement && target.id) {
      setSelectedElements([target.id]);
      setActiveToolId('select');
      
      // Clear other outlines
      const mainLayer = document.getElementById('mainLayer');
      if (mainLayer) {
        mainLayer.querySelectorAll('*').forEach(el => {
          if (el instanceof SVGElement) {
            el.style.outline = 'none';
            el.style.outlineOffset = '0';
          }
        });
      }
      
      target.style.outline = '2px solid #4299e1';
      target.style.outlineOffset = '2px';
    }
  }, [background.isEditingBackground, setSelectedElements, setActiveToolId]);

  const handleMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current || background.isEditingBackground || !tools.activeToolId) return;

    const canvasEvent = createCanvasEvent(event);
    const point = canvasEvent.point;
    
    setDrawingState(prev => ({ ...prev, startPoint: point }));

    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) return;

    // Handle selection tool
    if (tools.activeToolId === 'select') {
      const target = event.target as SVGElement;
      const isSelectableElement = ['rect', 'ellipse', 'path'].includes(target.tagName.toLowerCase());
      
      if (isSelectableElement && target.id) {
        setDrawingState(prev => ({ ...prev, isDrawing: true }));
        onDrawingStart?.(); // Notify that user started drawing (selection/drag)
        const targetBBox = (target as SVGGraphicsElement).getBBox();
        setDrawingState(prev => ({
          ...prev,
          dragOffset: {
            x: point.x - targetBBox.x,
            y: point.y - targetBBox.y
          }
        }));

        if (!canvasEvent.modifiers.shift) {
          setSelectedElements([target.id]);
        } else {
          setSelectedElements((prev: string[]) => 
            prev.includes(target.id) 
              ? prev.filter((id: string) => id !== target.id)
              : [...prev, target.id]
          );
        }
        target.style.outline = '2px solid #4299e1';
        target.style.outlineOffset = '2px';
      } else if (!canvasEvent.modifiers.shift) {
        setSelectedElements([]);
        mainLayer.querySelectorAll('*').forEach(el => {
          if (el instanceof SVGElement) {
            el.style.outline = 'none';
            el.style.outlineOffset = '0';
          }
        });
      }
      return;
    }

    setDrawingState(prev => ({ ...prev, isDrawing: true }));
    onDrawingStart?.(); // Notify that user started drawing
    console.log('🎨 Drawing started with tool:', tools.activeToolId);

    // Handle pen tool (polygon creation)
    if (tools.activeToolId === 'pen') {
      if (penPoints.length > 2) {
        const startPoint = penPoints[0];
        const distance = Math.sqrt(
          Math.pow(point.x - startPoint.x, 2) + 
          Math.pow(point.y - startPoint.y, 2)
        );
        
        // Close polygon if clicking near start point
        if (distance < 10) {
          const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
          const d = `M ${penPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
          pathElement.setAttribute('d', d);
          pathElement.setAttribute('fill', tools.fillColor);
          pathElement.setAttribute('stroke', tools.strokeColor);
          pathElement.setAttribute('stroke-width', tools.penSize.toString());
          pathElement.id = `polygon-${Date.now()}`;
          mainLayer.appendChild(pathElement);
          
          // Sync polygon creation
          // if (collaboration && collaboration.isConnected) {
          //   const svgElement: SVGElementType = {
          //     id: pathElement.id,
          //     type: 'path',
          //     attributes: {
          //       d: pathElement.getAttribute('d') || '',
          //       fill: pathElement.getAttribute('fill') || '',
          //       stroke: pathElement.getAttribute('stroke') || '',
          //       'stroke-width': pathElement.getAttribute('stroke-width') || '',
          //     },
          //     content: '',
          //   };
          //   collaboration?.createElement(svgElement);
          //   console.log('🔗 Synced element to collaboration:', svgElement.id, svgElement.type);
          // }
          
          setPenPoints([]);
          setCurrentPolygonPath(null);
          addToHistory();
          return;
        }
      }

      setPenPoints(prev => [...prev, point]);
      
      if (penPoints.length > 0) {
        if (currentPolygonPath) {
          const pathElement = document.getElementById(currentPolygonPath);
          if (pathElement) {
            const d = `M ${penPoints.map(p => `${p.x},${p.y}`).join(' L ')} L ${point.x},${point.y}`;
            pathElement.setAttribute('d', d);
          }
        } else {
          const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
          pathElement.setAttribute('d', `M ${point.x},${point.y}`);
          pathElement.setAttribute('fill', 'none');
          pathElement.setAttribute('stroke', tools.strokeColor);
          pathElement.setAttribute('stroke-width', tools.penSize.toString());
          pathElement.id = `pen-path-${Date.now()}`;
          mainLayer.appendChild(pathElement);
          setCurrentPolygonPath(pathElement.id);
        }
      }
    } else {
      // Create shape elements
      let element: SVGElement;
      
      switch (tools.activeToolId) {
        case 'brush': {
          element = document.createElementNS("http://www.w3.org/2000/svg", "path");
          element.setAttribute('d', `M ${point.x} ${point.y}`);
          element.setAttribute('fill', 'none');
          element.setAttribute('stroke', tools.fillColor);
          element.setAttribute('stroke-width', tools.brushSize.toString());
          element.setAttribute('stroke-linecap', 'round');
          element.setAttribute('stroke-linejoin', 'round');
          element.id = `brush-${Date.now()}`;
          setDrawingState(prev => ({ ...prev, currentPath: element.id }));
          
          // Sync with collaboration
          // if (collaboration && collaboration.isConnected) {
          //   const svgElement: SVGElementType = {
          //     id: element.id,
          //     type: 'path',
          //     attributes: {
          //       d: element.getAttribute('d') || '',
          //       fill: element.getAttribute('fill') || 'none',
          //       stroke: element.getAttribute('stroke') || '',
          //       'stroke-width': element.getAttribute('stroke-width') || '',
          //       'stroke-linecap': element.getAttribute('stroke-linecap') || '',
          //       'stroke-linejoin': element.getAttribute('stroke-linejoin') || '',
          //     },
          //     content: '',
          //   };
          //   collaboration?.createElement(svgElement);
          //   console.log('🔗 Synced element to collaboration:', svgElement.id, svgElement.type);
          // }
          break;
        }
        case 'rectangle': {
          element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          element.setAttribute('x', point.x.toString());
          element.setAttribute('y', point.y.toString());
          element.setAttribute('width', '0');
          element.setAttribute('height', '0');
          element.setAttribute('fill', tools.fillColor);
          element.setAttribute('stroke', tools.strokeColor);
          element.id = `rect-${Date.now()}`;
          
          // Sync with collaboration
          // if (collaboration && collaboration.isConnected) {
          //   const svgElement: SVGElementType = {
          //     id: element.id,
          //     type: 'rect',
          //     attributes: {
          //       x: element.getAttribute('x') || '0',
          //       y: element.getAttribute('y') || '0',
          //       width: element.getAttribute('width') || '0',
          //       height: element.getAttribute('height') || '0',
          //       fill: element.getAttribute('fill') || '',
          //       stroke: element.getAttribute('stroke') || '',
          //     },
          //     content: '',
          //   };
          //   collaboration?.createElement(svgElement);
          //   console.log('🔗 Synced element to collaboration:', svgElement.id, svgElement.type);
          // }
          break;
        }
        case 'ellipse': {
          element = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
          element.setAttribute('cx', point.x.toString());
          element.setAttribute('cy', point.y.toString());
          element.setAttribute('rx', '0');
          element.setAttribute('ry', '0');
          element.setAttribute('fill', tools.fillColor);
          element.setAttribute('stroke', tools.strokeColor);
          element.id = `ellipse-${Date.now()}`;
          
          // Sync with collaboration
          // if (collaboration && collaboration.isConnected) {
          //   const svgElement: SVGElementType = {
          //     id: element.id,
          //     type: 'ellipse',
          //     attributes: {
          //       cx: element.getAttribute('cx') || '0',
          //       cy: element.getAttribute('cy') || '0',
          //       rx: element.getAttribute('rx') || '0',
          //       ry: element.getAttribute('ry') || '0',
          //       fill: element.getAttribute('fill') || '',
          //       stroke: element.getAttribute('stroke') || '',
          //     },
          //     content: '',
          //   };
          //   collaboration?.createElement(svgElement);
          //   console.log('🔗 Synced element to collaboration:', svgElement.id, svgElement.type);
          // }
          break;
        }
        default:
          return;
      }
      
      mainLayer.appendChild(element);
    }
  }, [
    canvasRef, background.isEditingBackground, tools, createCanvasEvent, 
    setDrawingState, setSelectedElements, penPoints, setPenPoints, 
    currentPolygonPath, setCurrentPolygonPath, addToHistory, 
    // collaboration, 
    onDrawingStart
  ]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    const point = getMousePosition(event);
    
    // Update cursor position for collaboration
    // if (collaboration && collaboration.isConnected) {
    //   collaboration.updateUserCursor(point);
    // }

    if (!drawingState.isDrawing || !canvasRef.current || background.isEditingBackground) return;
    
    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) return;

    // Handle selection dragging
    if (tools.activeToolId === 'select' && drawingState.dragOffset && selection.selectedElements.length > 0) {
      selection.selectedElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;

        const newX = point.x - drawingState.dragOffset!.x;
        const newY = point.y - drawingState.dragOffset!.y;

        if (element instanceof SVGRectElement) {
          element.setAttribute('x', newX.toString());
          element.setAttribute('y', newY.toString());
        } else if (element instanceof SVGEllipseElement) {
          element.setAttribute('cx', (newX + element.rx.baseVal.value).toString());
          element.setAttribute('cy', (newY + element.ry.baseVal.value).toString());
        } else if (element instanceof SVGPathElement) {
          const bbox = element.getBBox();
          const dx = newX - bbox.x;
          const dy = newY - bbox.y;
          const d = element.getAttribute('d');
          if (d) {
            element.setAttribute('d', translatePath(d, dx, dy));
          }
        }
      });
      return;
    }

    if (!drawingState.startPoint) return;

    // Handle pen tool preview
    if (tools.activeToolId === 'pen') {
      if (penPoints.length > 0 && currentPolygonPath) {
        const pathElement = document.getElementById(currentPolygonPath);
        if(pathElement) {
          const d = `M ${penPoints.map(p => `${p.x},${p.y}`).join(' L ')} L ${point.x},${point.y}`;
          pathElement.setAttribute('d', d);
        }
      }
    } else if (drawingState.currentPath) {
      // Handle brush drawing
      const pathElement = document.getElementById(drawingState.currentPath) as unknown as SVGPathElement;
      if (pathElement) {
        const d = pathElement.getAttribute('d') || '';
        const newD = `${d} L ${point.x} ${point.y}`;
        pathElement.setAttribute('d', newD);
        
        // Sync path updates
        // if (collaboration && collaboration.isConnected) {
        //   collaboration.updateElement(drawingState.currentPath, {
        //     attributes: { d: newD }
        //   });
        // }
      }
    } else {
      // Handle shape resizing
      const lastElement = mainLayer.lastElementChild as SVGElement;
      if (!lastElement) return;

      switch (tools.activeToolId) {
        case 'rectangle': {
          if (lastElement instanceof SVGRectElement) {
            const width = point.x - drawingState.startPoint.x;
            const height = point.y - drawingState.startPoint.y;
            lastElement.setAttribute('x', (width >= 0 ? drawingState.startPoint.x : point.x).toString());
            lastElement.setAttribute('y', (height >= 0 ? drawingState.startPoint.y : point.y).toString());
            lastElement.setAttribute('width', Math.abs(width).toString());
            lastElement.setAttribute('height', Math.abs(height).toString());
            
            // Sync rectangle updates
            // if (collaboration && collaboration.isConnected && lastElement.id) {
            //   collaboration?.updateElement(lastElement.id, {
            //     attributes: {
            //       x: lastElement.getAttribute('x') || '0',
            //       y: lastElement.getAttribute('y') || '0',
            //       width: lastElement.getAttribute('width') || '0',
            //       height: lastElement.getAttribute('height') || '0',
            //     }
            //   });
            // }
          }
          break;
        }
        case 'ellipse': {
          if (lastElement instanceof SVGEllipseElement) {
            const rx = Math.abs(point.x - drawingState.startPoint.x);
            const ry = Math.abs(point.y - drawingState.startPoint.y);
            lastElement.setAttribute('rx', rx.toString());
            lastElement.setAttribute('ry', ry.toString());
            
            // Sync ellipse updates
            // if (collaboration && collaboration.isConnected && lastElement.id) {
            //   collaboration?.updateElement(lastElement.id, {
            //     attributes: {
            //       rx: lastElement.getAttribute('rx') || '0',
            //       ry: lastElement.getAttribute('ry') || '0',
            //     }
            //   });
            // }
          }
          break;
        }
      }
    }
  }, [
    drawingState, canvasRef, background.isEditingBackground, getMousePosition, 
    tools.activeToolId, selection.selectedElements, penPoints, currentPolygonPath, 
    translatePath, 
    // collaboration
  ]);

  const handleMouseUp = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!drawingState.isDrawing) return;
    
    if (tools.activeToolId !== 'pen') {
      setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPath: null,
        dragOffset: null,
      });
      onDrawingEnd?.(); // Notify that user stopped drawing
      console.log('🎨 Drawing ended with tool:', tools.activeToolId);
      
      if (tools.activeToolId !== 'select') {
        addToHistory();
      }
    }
  }, [drawingState.isDrawing, tools.activeToolId, setDrawingState, addToHistory, 
    // collaboration,
    onDrawingEnd]);

  // Sync collaborative elements
  // useEffect(() => {
  //   // if (!collaboration || !collaboration.isConnected) return;
    
  //   const mainLayer = document.getElementById('mainLayer');
  //   if (!mainLayer) return;
    
  //   // Clear and recreate elements from collaboration state
  //   const syncElements = () => {
  //     // Get current element IDs
  //     const currentIds = new Set(Array.from(mainLayer.children).map(el => el.id));
  //     // const collaborativeIds = new Set(collaboration.elements.map(el => el.id));
      
  //     // Add new elements
  //     // collaboration.elements.forEach(elementData => {
  //     //   if (!currentIds.has(elementData.id)) {
  //     //     const element = document.createElementNS("http://www.w3.org/2000/svg", elementData.type);
  //     //     element.id = elementData.id;
  //     //     Object.entries(elementData.attributes).forEach(([name, value]) => {
  //     //       element.setAttribute(name, value);
  //     //     });
  //     //     if (elementData.content) {
  //     //       element.textContent = elementData.content;
  //     //     }
  //     //     mainLayer.appendChild(element);
  //     //   } else {
  //     //     // Update existing elements
  //     //     const element = document.getElementById(elementData.id);
  //     //     if (element) {
  //     //       Object.entries(elementData.attributes).forEach(([name, value]:any) => {
  //     //         if (element.getAttribute(name) !== value) {
  //     //           element.setAttribute(name, value);
  //     //         }
  //     //       });
  //     //     }
  //     //   }
  //     // });
      
  //     // Remove deleted elements
  //     currentIds.forEach(id => {
  //       // if (!collaborativeIds.has(id)) {
  //       //   const element = document.getElementById(id);
  //       //   if (element) {
  //       //     element.remove();
  //       //   }
  //       // }
  //     });
  //   };
    
  //   // Sync on changes
  //   const interval = setInterval(syncElements, 100);
  //   return () => clearInterval(interval);
  // }, [collaboration]);

  // Effects
  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  useEffect(() => {
    const cleanup = setupBackgroundInteraction(backgroundRef);
    return cleanup;
  }, [setupBackgroundInteraction]);

  // GSAP animation for background editing
  const tl = useMemo(() => gsap.timeline({ paused: true }), []);

  useEffect(() => {       
    if (background.isEditingBackground) {
      tl.to("#backgroundWrapper", { 
        scale: 1.025, 
        filter: 'drop-shadow(10px 10px 4px #050709)', 
        position: 'absolute' 
      });
      tl.play();
    } else {
      tl.to("#backgroundWrapper", { 
        scale: 1, 
        filter: 'drop-shadow(0px 0px 0px #050709)', 
        position: 'absolute' 
      });
      tl.play();
    }
  }, [background.isEditingBackground, tl]);

  return (
    <div className="relative w-full max-w-5xl h-screen flex flex-col items-center justify-start overflow-hidden pt-6">
      <div className="relative w-[800px] h-[800px] mx-auto">
        {/* Background SVG Layer */}
        <svg
          ref={backgroundRef}
          id="background-layer" 
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `scale(${viewport.zoom}) translate(${viewport.panOffset.x}px, ${viewport.panOffset.y}px)`,
            transformOrigin: 'center',
            pointerEvents: background.isEditingBackground ? 'auto' : 'none',
            zIndex: background.isEditingBackground ? 9999 : 0,
          }}
        />

        {/* Drawing Canvas Layer */}
        <svg
          ref={canvasRef}
          id="drawing-canvas"
          className="absolute inset-0 w-full h-full"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          style={{
            transformOrigin: 'center',
            pointerEvents: background.isEditingBackground ? 'none' : 'auto',
            zIndex: background.isEditingBackground ? 10 : 20
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <defs />
          <g id="mainLayer" />
        </svg>

        {/* Submit Button */}
        <Button
          style={{ letterSpacing: '1.5px' }}
          className={`w-full right-4 h-12 mx-auto uppercase flex flex-col items-center justify-center 
            cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-[#2a2b2f] to-[#1a1b1e] p-[1px] 
            transition-all duration-300 hover:from-[#3a3b3f] hover:to-[#2a2b2e] btnTool sel absolute -bottom-20 left-0
            bg-[#1e1f23] shadow-[inset_0px_2px_4px_rgba(255,255,255,0.1),inset_0px_-2px_4px_rgba(0,0,0,0.2),0_12px_25px_-8px_rgba(0,0,0,0.9)] 
            before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-transparent 
            before:to-black/20 before:opacity-0 before:transition-opacity before:duration-300 
            group-hover:shadow-[inset_0px_2px_4px_rgba(255,255,255,0.15),0_16px_30px_-10px_rgba(0,0,0,0.9)] 
            group-hover:before:opacity-100 active:backdrop-saturate-150`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default Canvas;