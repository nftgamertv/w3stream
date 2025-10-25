'use client';

// Modern SVG Editor - Refactored for React and real-time collaboration
import React, { useEffect, useState, useCallback } from 'react';
import { useEditorStore, CANVAS_WIDTH, CANVAS_HEIGHT } from './store';
import TopMenu from './TopMenu';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sanitizeSVG, isValidSVG } from './svgUtils';
// import { useSVGCollaboration } from './ReactTogetherCollaboration';
import CollaborativeCursors from './CollaborativeCursors';
import CollaborativeToolbar from './CollaborativeToolbar';
import CollaborativeSelection from './CollaborativeSelection';
import type { CollaborativeUser, SyncOperation } from './types';

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
  const { 
    setBackgroundSvg, 
    collaboration,
    setSessionId,
    addUser,
    removeUser,
    setCurrentUser,
    enableCollaboration,
    disableCollaboration
  } = useEditorStore();
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenUsers, setHiddenUsers] = useState<Set<string>>(new Set());
  
  // Initialize collaboration hook - from reacttogether_docs.json: hooks usage
  // const collaborationHook = useSVGCollaboration();
  
  // Sync collaboration state to store
  // useEffect(() => {
  //   if (collaborative && sessionId && collaborationHook.isConnected) {
  //     enableCollaboration();
  //     setSessionId(sessionId);
  //     setCurrentUser(collaborationHook.myId || '');
      
  //     // Notify when users join/leave
  //     collaborationHook.activeUsers.forEach(user => {
  //       if (!collaborationHook.currentUser || user.id !== collaborationHook.currentUser.id) {
  //         addUser(user);
  //         onCollaboratorJoined?.(user);
  //       }
  //     });
  //   }
    
  //   return () => {
  //     // Only clean up users, don't call disableCollaboration to avoid infinite loop
  //     if (collaborationHook.currentUser) {
  //       removeUser(collaborationHook.currentUser.id);
  //       onCollaboratorLeft?.(collaborationHook.currentUser);
  //     }
  //   };
  // }, [collaborative, sessionId, collaborationHook.isConnected, collaborationHook.activeUsers, collaborationHook.currentUser, collaborationHook.myId, enableCollaboration, setSessionId, setCurrentUser, addUser, removeUser, onCollaboratorJoined, onCollaboratorLeft]);
  
  // Handle collaboration state cleanup separately to avoid infinite loops
  useEffect(() => {
    // Disable collaboration when collaborative prop becomes false or component unmounts
    return () => {
      if (!collaborative) {
        disableCollaboration();
      }
    };
  }, [collaborative, disableCollaboration]);
  
  // Display collaboration errors
  // useEffect(() => {
  //   if (collaborationHook.error) {
  //     setError(`Collaboration error: ${collaborationHook.error.message}`);
  //     // Auto-clear collaboration errors after 5 seconds
  //     const timer = setTimeout(() => {
  //       collaborationHook.clearError();
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [collaborationHook.error, collaborationHook.clearError]);
  

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
      {collaborative && (
        <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* <div className={`w-2 h-2 rounded-full ${collaborationHook.isConnected ? 'bg-green-500' : 'bg-red-500'}`} /> */}
              <span className="text-sm text-gray-400">
                {/* {collaborationHook.isConnected ? 'Connected' : 'Disconnected'} */}
              </span>
            </div>
            {/* {collaborationHook.activeUsers.length > 0 && (
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
            )} */}
          </div>
          
          {/* Share Session Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const currentUrl = window.location.href;
                navigator.clipboard.writeText(currentUrl).then(() => {
                  // Show a toast or temporary feedback
                  const button = document.activeElement as HTMLButtonElement;
                  const originalText = button.textContent;
                  button.textContent = 'Copied!';
                  button.className = button.className.replace('bg-blue-600', 'bg-green-600');
                  setTimeout(() => {
                    button.textContent = originalText;
                    button.className = button.className.replace('bg-green-600', 'bg-blue-600');
                  }, 2000);
                }).catch(() => {
                  alert(`Share this URL to collaborate:\n${currentUrl}`);
                });
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              title="Copy collaboration link to clipboard"
            >
              Share Session
            </button>
            <div className="text-xs text-gray-500">
              Session ID: {sessionId?.slice(0, 8)}...
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Interface */}
      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar />
        <div className="flex-1 overflow-y-auto relative">
          <Canvas 
            // collaboration={collaborationHook} 
            onDrawingStart={onDrawingStart}
            onDrawingEnd={onDrawingEnd}
          />
          {collaborative && (
            <>
              {/* <CollaborativeCursors 
                users={collaborationHook.activeUsers.filter(u => !hiddenUsers.has(u.id))} 
              /> */}
              {/* <CollaborativeSelection
                users={collaborationHook.activeUsers}
                currentUserId={collaborationHook.myId}
              /> */}
            </>
          )}
        </div>
      </div>
      
      {/* Collaborative Toolbar */}
      {/* {collaborative && (
        <CollaborativeToolbar
          users={collaborationHook.activeUsers}
          currentUserId={collaborationHook.myId}
          hiddenUsers={hiddenUsers}
          onToggleUserVisibility={(userId) => {
            setHiddenUsers(prev => {
              const newSet = new Set(prev);
              if (newSet.has(userId)) {
                newSet.delete(userId);
              } else {
                newSet.add(userId);
              }
              return newSet;
            });
          }}
        />
      )} */}
    </div>
  );
}

// Export additional utilities and types for external use
export * from './types';
export * from './svgUtils';
export { useEditorStore } from './store';