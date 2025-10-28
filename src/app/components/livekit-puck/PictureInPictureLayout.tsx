'use client';
import React, { useMemo } from 'react';
import type { ComponentConfig } from '@measured/puck';
import { useTracks, useRoomContext, ParticipantTile } from '@livekit/components-react';
import { Track } from 'livekit-client';

export interface PictureInPictureLayoutProps {
  pipPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  pipSize?: number;
  margin?: number;
}

const PictureInPictureLayoutInner: React.FC<PictureInPictureLayoutProps> = ({
  pipPosition = 'bottom-right',
  pipSize = 200,
  margin = 16,
}) => {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ]);

  const mainTrack = tracks[0];
  const pipTrack = tracks[1];

  const positionStyles = useMemo(() => {
    const base = {
      position: 'absolute' as const,
      width: pipSize,
      height: pipSize * 0.75, // 4:3 aspect ratio
      zIndex: 10,
    };

    switch (pipPosition) {
      case 'top-left':
        return { ...base, top: margin, left: margin };
      case 'top-right':
        return { ...base, top: margin, right: margin };
      case 'bottom-left':
        return { ...base, bottom: margin, left: margin };
      case 'bottom-right':
        return { ...base, bottom: margin, right: margin };
      default:
        return { ...base, bottom: margin, right: margin };
    }
  }, [pipPosition, pipSize, margin]);

  return (
    <div className="relative h-full w-full">
      {/* Main participant - full screen */}
      <div className="absolute inset-0">
        {mainTrack ? (
          <ParticipantTile trackRef={mainTrack} />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <p className="text-gray-500">No participants in room</p>
          </div>
        )}
      </div>

      {/* Picture-in-picture participant */}
      {pipTrack && (
        <div
          style={positionStyles}
          className="rounded-lg overflow-hidden bg-gray-900 shadow-lg border-2 border-white/20"
        >
          <ParticipantTile trackRef={pipTrack} />
        </div>
      )}
    </div>
  );
};

export const PictureInPictureLayout: React.FC<PictureInPictureLayoutProps> = (props) => {
  let room;
  try {
    room = useRoomContext();
  } catch {
    return (
      <div className="p-8 border-2 border-dashed border-gray-400 rounded-lg text-center h-full flex items-center justify-center">
        <div>
          <p className="text-sm text-gray-500 font-medium">Picture-in-Picture Layout</p>
          <p className="text-xs text-gray-400 mt-1">Connect to a room to see participants</p>
        </div>
      </div>
    );
  }
  return <PictureInPictureLayoutInner {...props} />;
};

export const PictureInPictureLayoutConfig: ComponentConfig<PictureInPictureLayoutProps> = {
  label: 'Picture-in-Picture Layout',
  fields: {
    pipPosition: {
      type: 'select',
      label: 'PIP Position',
      options: [
        { label: 'Top Left', value: 'top-left' },
        { label: 'Top Right', value: 'top-right' },
        { label: 'Bottom Left', value: 'bottom-left' },
        { label: 'Bottom Right', value: 'bottom-right' },
      ],
    },
    pipSize: {
      type: 'number',
      label: 'PIP Size (px)',
      min: 100,
      max: 400,
    },
    margin: {
      type: 'number',
      label: 'Margin (px)',
      min: 8,
      max: 48,
    },
  },
  defaultProps: {
    pipPosition: 'bottom-right',
    pipSize: 200,
    margin: 16,
  },
  render: (props) => <PictureInPictureLayout {...props} />,
};
