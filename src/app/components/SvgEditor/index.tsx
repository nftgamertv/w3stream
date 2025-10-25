'use client';

// Modern SVG Editor - Refactored for React and real-time collaboration
import React, { useEffect, useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './store';
import TopMenu from './TopMenu';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sanitizeSVG, isValidSVG } from './svgUtils';
import { useStateTogether, useMyId, useConnectedUsers } from 'react-together';
import type { CollaborativeUser } from './types';

interface SVGEditorProps {
  svgurl: string;
  className?: string;
  collaborative?: boolean;
  sessionId?: string;
  userId?: string;
  userName?: string;
  onDrawingStart?: () => void;
  onDrawingEnd?: () => void;
  onCollaboratorJoined?: (user: CollaborativeUser) => void;
  onCollaboratorLeft?: (user: CollaborativeUser) => void;
}

export default function SVGEditor({ 
  svgurl, 
  className = '',
  collaborative = false,
  sessionId,
  userId,
  userName = 'Anonymous User',
  onDrawingStart,
  onDrawingEnd,
  onCollaboratorJoined,
  onCollaboratorLeft
}: SVGEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundSvg, setBackgroundSvg] = useState<string | null>(null);

  // Use app-level React Together hooks directly
  const myId = useMyId();
  const connectedUsers = useConnectedUsers();
  const [svgElements, setSvgElements] = useStateTogether<Record<string, any>>('svg-elements', {});

  // Generate stable color from user ID
  const getUserColor = useCallback((userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
  }, []);

  // Simple collaboration object to pass to Canvas
  const collaborationHook = {
    isConnected: !!myId,
    myId: myId || undefined,
    createElement: (element: any) => {
      if (!myId) return;
      setSvgElements(prev => ({
        ...prev,
        [element.id]: {
          ...element,
          lastModifiedBy: myId,
          lastModified: Date.now()
        }
      }));
    },
    updateElement: (elementId: string, updates: any) => {
      if (!myId) return;
      setSvgElements(prev => ({
        ...prev,
        [elementId]: {
          ...prev[elementId],
          ...updates,
          lastModifiedBy: myId,
          lastModified: Date.now()
        }
      }));
    },
    activeUsers: connectedUsers.map(user => ({
      id: user.userId,
      name: user.nickname || `User ${user.userId.slice(0, 4)}`,
      color: getUserColor(user.userId),
      isActive: true,
      lastSeen: Date.now()
    }))
  };

  // Sync remote elements to DOM
  useEffect(() => {
    if (!svgElements) return;

    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) return;

    Object.entries(svgElements).forEach(([id, elementData]: [string, any]) => {
      if (!elementData || !elementData.type) return;

      let element = document.getElementById(id);

      // Only create if element doesn't exist
      if (!element) {
        element = document.createElementNS('http://www.w3.org/2000/svg', elementData.type);
        element.id = id;
        mainLayer.appendChild(element);
        console.log('🔗 Created element from sync:', id, elementData.type);
      }

      // Always update attributes to keep in sync
      if (elementData.attributes) {
        Object.entries(elementData.attributes).forEach(([name, value]) => {
          if (element && value !== null && value !== undefined) {
            element.setAttribute(name, String(value));
          }
        });
      }
    });
  }, [svgElements]);
  

  // Load and validate SVG
  const loadSvg = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!svgurl) {
        throw new Error('SVG URL is required');
      }

      const response = await fetch(svgurl, {
        headers: {
          Accept: 'image/svg+xml, text/plain',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch SVG: ${response.statusText || `Status ${response.status}`}`
        );
      }

      const svgText = await response.text();
      
      // Validate SVG content
      if (!isValidSVG(svgText)) {
        throw new Error('Invalid SVG content received');
      }

      // Sanitize SVG for security
      const sanitizedSvg = sanitizeSVG(svgText);
      setBackgroundSvg(sanitizedSvg);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load SVG';
      console.error('SVG loading error:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [svgurl, setBackgroundSvg]);

  useEffect(() => {
    loadSvg();
  }, [loadSvg]);

  // Retry loading
  const handleRetry = useCallback(() => {
    loadSvg();
  }, [loadSvg]);

  if (error) {
    return (
      <div className={`flex flex-col h-screen bg-gray-800 ${className}`}>
        <Alert variant="destructive" className="m-4">
          <AlertTitle>Error Loading SVG</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            <button 
              onClick={handleRetry}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex flex-col h-screen bg-gray-800 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            <p className="text-white text-sm">Loading SVG Editor...</p>
            {collaborative && (
              <p className="text-gray-400 text-xs">Initializing collaboration features</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-gray-800 ${className}`}>
      {/* Collaboration status bar */}
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${collaborationHook.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {collaborationHook.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {collaborationHook.activeUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {collaborationHook.activeUsers.length} {collaborationHook.activeUsers.length === 1 ? 'user' : 'users'} online
              </span>
              <div className="flex -space-x-2">
                {collaborationHook.activeUsers.slice(0, 5).map(user => (
                  <div
                    key={user.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {collaborationHook.activeUsers.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                    +{collaborationHook.activeUsers.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Editor Interface */}
      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar />
        <div className="flex-1 overflow-y-auto relative">
          <Canvas
            collaboration={collaborationHook}
            onDrawingStart={onDrawingStart}
            onDrawingEnd={onDrawingEnd}
          />
        </div>
      </div>
    </div>
  );
}

// Export additional utilities and types for external use
export * from './types';
export * from './svgUtils';
export { editorState$ } from './editorState';