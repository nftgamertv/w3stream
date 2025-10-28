'use client';
import React, { useMemo } from 'react';
import type { ComponentConfig } from '@measured/puck';
import { useTracks, useRoomContext, ParticipantTile } from '@livekit/components-react';
import { Track } from 'livekit-client';

export interface SidebarLayoutProps {
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number;
  showScreenShare?: boolean;
  gap?: number;
}

const SidebarLayoutInner: React.FC<SidebarLayoutProps> = ({
  sidebarPosition = 'left',
  sidebarWidth = 256,
  showScreenShare = true,
  gap = 16,
}) => {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ]);

  const screenShare = useMemo(() => {
    if (!showScreenShare) return null;
    return tracks.find(t => t.source === Track.Source.ScreenShare);
  }, [tracks, showScreenShare]);

  const cameraTracks = useMemo(() =>
    tracks.filter(t => t.source === Track.Source.Camera),
    [tracks]
  );

  const mainTrack = screenShare ?? cameraTracks[0];
  const sidebarTracks = useMemo(() => {
    if (screenShare) {
      return cameraTracks;
    }
    return cameraTracks.slice(1);
  }, [screenShare, cameraTracks]);

  const sidebarElement = (
    <div
      className="flex flex-col overflow-y-auto"
      style={{
        width: sidebarWidth,
        gap: `${gap}px`,
        padding: `${gap}px`,
      }}
    >
      {sidebarTracks.map((track) => (
        <div
          key={track.participant.identity}
          className="aspect-video rounded-lg overflow-hidden bg-gray-900 flex-shrink-0"
        >
          <ParticipantTile trackRef={track} />
        </div>
      ))}
      {sidebarTracks.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          <p>No other participants</p>
        </div>
      )}
    </div>
  );

  const mainElement = (
    <div className="flex-1 min-w-0" style={{ padding: `${gap}px` }}>
      {mainTrack ? (
        <div className="h-full rounded-lg overflow-hidden bg-gray-900">
          <ParticipantTile trackRef={mainTrack} />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg">
          <p className="text-gray-500">No participants in room</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full w-full">
      {sidebarPosition === 'left' && sidebarElement}
      {mainElement}
      {sidebarPosition === 'right' && sidebarElement}
    </div>
  );
};

export const SidebarLayout: React.FC<SidebarLayoutProps> = (props) => {
  let room;
  try {
    room = useRoomContext();
  } catch {
    return (
      <div className="p-8 border-2 border-dashed border-gray-400 rounded-lg text-center h-full flex items-center justify-center">
        <div>
          <p className="text-sm text-gray-500 font-medium">Sidebar Layout</p>
          <p className="text-xs text-gray-400 mt-1">Connect to a room to see participants</p>
        </div>
      </div>
    );
  }
  return <SidebarLayoutInner {...props} />;
};

export const SidebarLayoutConfig: ComponentConfig<SidebarLayoutProps> = {
  label: 'Sidebar Layout',
  fields: {
    sidebarPosition: {
      type: 'select',
      label: 'Sidebar Position',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
    sidebarWidth: {
      type: 'number',
      label: 'Sidebar Width (px)',
      min: 150,
      max: 400,
    },
    gap: {
      type: 'number',
      label: 'Gap (px)',
      min: 0,
      max: 32,
    },
    showScreenShare: {
      type: 'radio',
      label: 'Show Screen Share in Main Area',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    sidebarPosition: 'left',
    sidebarWidth: 256,
    gap: 16,
    showScreenShare: true,
  },
  render: (props) => <SidebarLayout {...props} />,
};
