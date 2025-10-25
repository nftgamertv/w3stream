import type { 
  CollaborativeUser, 
  CollaborationEvent, 
  SyncOperation, 
  SVGElement as SVGElementType 
} from './types';

/**
 * Collaboration service for real-time SVG editing
 * This module provides the foundation for collaborative features
 * and is designed to work with react-together or similar libraries
 */

export interface CollaborationConfig {
  sessionId: string;
  userId: string;
  userName: string;
  userColor: string;
  maxUsers: number;
  syncInterval: number;
  conflictResolution: 'last-write-wins' | 'operational-transform';
}

export interface CollaborationService {
  // Session management
  joinSession(sessionId: string): Promise<void>;
  leaveSession(): Promise<void>;
  
  // User management
  getCurrentUser(): CollaborativeUser | null;
  getActiveUsers(): CollaborativeUser[];
  updateUserCursor(position: { x: number; y: number }): void;
  updateUserSelection(elementIds: string[]): void;
  
  // Synchronization
  broadcastOperation(operation: SyncOperation): void;
  onOperation(callback: (operation: SyncOperation) => void): void;
  
  // Element operations
  createElement(element: SVGElementType): void;
  updateElement(elementId: string, updates: Partial<SVGElementType>): void;
  deleteElement(elementId: string): void;
  
  // Events
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}
 
/**
 * Operational Transform utilities for conflict resolution
 */
export class OperationalTransform {
  /**
   * Transforms two concurrent operations to maintain consistency
   */
  static transform(op1: SyncOperation, op2: SyncOperation): [SyncOperation, SyncOperation] {
    // Simplified OT - in real implementation this would be more sophisticated
    
    if (op1.elementId !== op2.elementId) {
      // Operations on different elements don't conflict
      return [op1, op2];
    }

    if (op1.timestamp < op2.timestamp) {
      // op1 happened first, op2 needs to be transformed
      return [op1, { ...op2, dependencies: [op1.id] }];
    } else {
      // op2 happened first, op1 needs to be transformed
      return [{ ...op1, dependencies: [op2.id] }, op2];
    }
  }

  /**
   * Applies an operation to the current state
   */
  static apply(operation: SyncOperation, currentState: SVGElementType[]): SVGElementType[] {
    const newState = [...currentState];
    
    switch (operation.type) {
      case 'insert':
        newState.push(operation.data as SVGElementType);
        break;
        
      case 'update':
        const updateIndex = newState.findIndex(el => el.id === operation.elementId);
        if (updateIndex !== -1) {
          newState[updateIndex] = { ...newState[updateIndex], ...operation.data };
        }
        break;
        
      case 'delete':
        const deleteIndex = newState.findIndex(el => el.id === operation.elementId);
        if (deleteIndex !== -1) {
          newState.splice(deleteIndex, 1);
        }
        break;
    }
    
    return newState;
  }
}

/**
 * Conflict resolution strategies
 */
export class ConflictResolver {
  /**
   * Last-write-wins strategy
   */
  static lastWriteWins(operations: SyncOperation[]): SyncOperation[] {
    const operationsByElement = new Map<string, SyncOperation[]>();
    
    // Group operations by element
    operations.forEach(op => {
      if (!operationsByElement.has(op.elementId)) {
        operationsByElement.set(op.elementId, []);
      }
      operationsByElement.get(op.elementId)!.push(op);
    });
    
    // Keep only the latest operation for each element
    const resolvedOps: SyncOperation[] = [];
    operationsByElement.forEach(ops => {
      const latest = ops.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest
      );
      resolvedOps.push(latest);
    });
    
    return resolvedOps;
  }
  
  /**
   * Merge strategy for compatible operations
   */
  static merge(operations: SyncOperation[]): SyncOperation[] {
    // This would implement intelligent merging of compatible operations
    // For now, fall back to last-write-wins
    return this.lastWriteWins(operations);
  }
}

/**
 * User presence indicators
 */
export interface UserPresence {
  userId: string;
  cursor?: { x: number; y: number };
  selection?: string[];
  isTyping?: boolean;
  lastActivity: number;
}

export class PresenceManager {
  private presences: Map<string, UserPresence> = new Map();
  private updateCallbacks: Set<(presences: UserPresence[]) => void> = new Set();
  private cleanupInterval: number;

  constructor() {
    // Clean up inactive users every 30 seconds
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupInactiveUsers();
    }, 30000);
  }

  updatePresence(userId: string, updates: Partial<UserPresence>): void {
    const current = this.presences.get(userId) || {
      userId,
      lastActivity: Date.now()
    };
    
    const updated: UserPresence = {
      ...current,
      ...updates,
      lastActivity: Date.now()
    };
    
    this.presences.set(userId, updated);
    this.notifyUpdates();
  }

  removeUser(userId: string): void {
    this.presences.delete(userId);
    this.notifyUpdates();
  }

  getPresences(): UserPresence[] {
    return Array.from(this.presences.values());
  }

  onUpdate(callback: (presences: UserPresence[]) => void): void {
    this.updateCallbacks.add(callback);
  }

  offUpdate(callback: (presences: UserPresence[]) => void): void {
    this.updateCallbacks.delete(callback);
  }

  private notifyUpdates(): void {
    const presences = this.getPresences();
    this.updateCallbacks.forEach(callback => callback(presences));
  }

  private cleanupInactiveUsers(): void {
    const now = Date.now();
    const timeout = 60000; // 1 minute
    
    for (const [userId, presence] of this.presences) {
      if (now - presence.lastActivity > timeout) {
        this.presences.delete(userId);
      }
    }
    
    this.notifyUpdates();
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.presences.clear();
    this.updateCallbacks.clear();
  }
}

/**
 * Factory function to create collaboration service
 */
 