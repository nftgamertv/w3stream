import React, { useEffect, useState } from 'react';
import type { CollaborativeUser } from './types';

interface CollaborativeCursorsProps {
  users: CollaborativeUser[]; // from reacttogether_docs.json: line 78 "useConnectedUsers" provides user list
}

interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({ users }) => {
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});

  useEffect(() => {
    // Update cursor positions when users change - from reacttogether_docs.json: line 88 "useCursors" cursor tracking
    const newCursors: Record<string, CursorPosition> = {};
    
    users.forEach(user => {
      if (user.cursor) { // from reacttogether_docs.json: line 88 "useCursors" cursor position data
        newCursors[user.id] = {
          userId: user.id, // from reacttogether_docs.json: line 96 "useMyId" user identification
          x: user.cursor.x, // from reacttogether_docs.json: line 88 "useCursors" cursor x position
          y: user.cursor.y, // from reacttogether_docs.json: line 88 "useCursors" cursor y position
          color: user.color,
          name: user.name,
        };
      }
    });
    
    setCursors(newCursors);
  }, [users]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {Object.values(cursors).map(cursor => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-100 ease-out"
          style={{
            transform: `translate(${cursor.x}px, ${cursor.y}px)`,
          }}
        >
          {/* Cursor pointer */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="relative"
            style={{ marginLeft: -12, marginTop: -12 }}
          >
            <path
              d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="2"
            />
          </svg>
          
          {/* User label */}
          <div
            className="absolute top-4 left-4 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
            style={{
              backgroundColor: cursor.color,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollaborativeCursors;