import React, { useEffect, useRef, useCallback } from 'react';
import type { CollaborativeUser } from './types';

interface CollaborativeSelectionProps {
  users: CollaborativeUser[]; // from reacttogether_docs.json: line 78 "useConnectedUsers" provides user list
  currentUserId?: string; // from reacttogether_docs.json: line 96 "useMyId" current user identification
}

const CollaborativeSelection: React.FC<CollaborativeSelectionProps> = ({
  users,
  currentUserId,
}) => {
  const appliedStylesRef = useRef<Map<string, string>>(new Map());

  const applySelectionStyles = useCallback(() => {
    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) {
      console.warn('CollaborativeSelection: mainLayer element not found');
      return;
    }

    // Build a map of element IDs to user colors - from reacttogether_docs.json: line 89 "useStateTogetherWithPerUserValues" per-user selection
    const elementToUserColor = new Map<string, string>();
    users.forEach(user => {
      if (user.id !== currentUserId && user.selection && user.selection.length > 0) { // from reacttogether_docs.json: line 96 "useMyId" exclude current user
        user.selection.forEach(elementId => { // from reacttogether_docs.json: line 89 "useStateTogetherWithPerUserValues" user selection data
          elementToUserColor.set(elementId, user.color);
        });
      }
    });

    // Remove styles from elements that are no longer selected
    appliedStylesRef.current.forEach((_, elementId) => {
      if (!elementToUserColor.has(elementId)) {
        const element = mainLayer.querySelector(`#${CSS.escape(elementId)}`);
        if (element instanceof SVGElement) {
          element.style.removeProperty('outline');
          element.style.removeProperty('outline-offset');
          element.style.removeProperty('filter');
        }
        appliedStylesRef.current.delete(elementId);
      }
    });

    // Apply styles to newly selected elements
    elementToUserColor.forEach((color, elementId) => {
      const element = mainLayer.querySelector(`#${CSS.escape(elementId)}`);
      if (element instanceof SVGElement) {
        // Only apply if not already applied or color changed
        if (appliedStylesRef.current.get(elementId) !== color) {
          element.style.setProperty('outline', `2px solid ${color}`, 'important');
          element.style.setProperty('outline-offset', '4px', 'important');
          element.style.setProperty('filter', 'drop-shadow(0 0 4px rgba(0,0,0,0.3))', 'important');
          appliedStylesRef.current.set(elementId, color);
        }
      }
    });
  }, [users, currentUserId]);

  useEffect(() => {
    applySelectionStyles();

    // Cleanup function to remove all applied styles
    return () => {
      const mainLayer = document.getElementById('mainLayer');
      if (mainLayer) {
        appliedStylesRef.current.forEach((_, elementId) => {
          const element = mainLayer.querySelector(`#${CSS.escape(elementId)}`);
          if (element instanceof SVGElement) {
            element.style.removeProperty('outline');
            element.style.removeProperty('outline-offset');
            element.style.removeProperty('filter');
          }
        });
        appliedStylesRef.current.clear();
      }
    };
  }, [applySelectionStyles]);

  return null; // This component only applies styles
};

export default CollaborativeSelection;