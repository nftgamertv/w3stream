'use client';
import { useRoomContext } from '@livekit/components-react';

/**
 * Hook to safely check if we're inside a LiveKit room context
 * Returns true if inside a LiveKitRoom, false otherwise
 * Use this to handle components that might be rendered outside LiveKitRoom (like in Puck editor)
 */
export function useLiveKitSafe(): boolean {
  try {
    useRoomContext();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Placeholder component to show when LiveKit context is not available
 */
export function LiveKitPlaceholder({
  icon,
  title,
  description,
  className
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={className || "p-4 border-2 border-dashed border-gray-400 rounded-lg text-center bg-gray-50"}>
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}
