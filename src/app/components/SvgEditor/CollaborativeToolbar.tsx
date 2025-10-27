import React from 'react';
import type { CollaborativeUser } from './types';
import { Button } from '@/components/ui/button';
import { Users, Eye, EyeOff } from 'lucide-react';

interface CollaborativeToolbarProps {
  users: CollaborativeUser[]; // from reacttogether_docs.json: line 78 "useConnectedUsers" provides user list
  currentUserId?: string; // from reacttogether_docs.json: line 96 "useMyId" current user identification
  onToggleUserVisibility?: (userId: string) => void;
  hiddenUsers?: Set<string>;
}

const CollaborativeToolbar: React.FC<CollaborativeToolbarProps> = ({
  users,
  currentUserId,
  onToggleUserVisibility,
  hiddenUsers = new Set(),
}) => {
  return (
    <div className="bg-gray-900 border-t border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Collaborators</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {users.map(user => (
              <div
                key={user.id}
                className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-800 border border-gray-700"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm text-gray-300">
                  {user.name}
                  {user.id === currentUserId && ' (You)'} 
                </span>
                {user.selection && user.selection.length > 0 && ( 
                  <span className="text-xs text-gray-500">
                    editing {user.selection.length} object{user.selection.length > 1 ? 's' : ''}
                  </span>
                )}
                {onToggleUserVisibility && user.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 p-0"
                    onClick={() => onToggleUserVisibility(user.id)}
                  >
                    {hiddenUsers.has(user.id) ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-800 rounded">Esc</kbd> to deselect
        </div>
      </div>
    </div>
  );
};

export default CollaborativeToolbar;