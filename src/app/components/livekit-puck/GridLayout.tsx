'use client';
import React from 'react';
import { GridLayout as LKGridLayout, useTracks, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { ComponentConfig } from '@measured/puck';

export interface GridLayoutProps {
  className?: string;
}

export const GridLayout: React.FC<GridLayoutProps> = ({ className }) => {
  // Check if we're inside a LiveKit room
  let room;
  try {
    room = useRoomContext();
  } catch (error) {
    // Not inside LiveKitRoom - show placeholder
    return (
      <div className={className || "p-4 border-2 border-dashed border-gray-400 rounded-lg text-center"}>
        <p className="text-sm text-gray-500">LiveKit Grid Layout</p>
        <p className="text-xs text-gray-400">Connect to a room to see participants</p>
      </div>
    );
  }

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return <LKGridLayout tracks={tracks} className={className} />;
};

export const GridLayoutConfig: ComponentConfig<GridLayoutProps> = {
  label: 'Grid Layout',
  fields: {
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: {},
  render: (props) => <GridLayout {...props} />,
};
