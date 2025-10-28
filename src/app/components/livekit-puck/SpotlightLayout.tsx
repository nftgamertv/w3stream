'use client';
import React, { useMemo } from 'react';
import type { ComponentConfig } from '@measured/puck';
import { useParticipants, useTracks, useRoomContext, ParticipantTile } from '@livekit/components-react';
import { Track } from 'livekit-client';

export interface SpotlightLayoutProps {
  carouselPosition?: 'top' | 'bottom';
  carouselHeight?: number;
  autoSwitchOnScreenShare?: boolean;
  gap?: number;
}

const SpotlightLayoutInner: React.FC<SpotlightLayoutProps> = ({
  carouselPosition = 'bottom',
  carouselHeight = 128,
  autoSwitchOnScreenShare = true,
  gap = 16,
}) => {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ]);

  const screenShare = useMemo(() =>
    tracks.find(t => t.source === Track.Source.ScreenShare),
    [tracks]
  );

  const cameraTracks = useMemo(() =>
    tracks.filter(t => t.source === Track.Source.Camera),
    [tracks]
  );

  const mainTrack = (autoSwitchOnScreenShare && screenShare)
    ? screenShare
    : cameraTracks[0];

  const carouselTracks = useMemo(() => {
    if (screenShare && autoSwitchOnScreenShare) {
      return cameraTracks;
    }
    return cameraTracks.slice(1);
  }, [screenShare, cameraTracks, autoSwitchOnScreenShare]);

  const carouselElement = carouselTracks.length > 0 && (
    <div
      className="flex gap-4 overflow-x-auto"
      style={{
        height: carouselHeight,
        padding: `${gap}px`,
      }}
    >
      {carouselTracks.map((track) => (
        <div
          key={track.participant.identity}
          className="flex-shrink-0 rounded-lg overflow-hidden bg-gray-900"
          style={{ width: carouselHeight * 1.5, height: '100%' }}
        >
          <ParticipantTile trackRef={track} />
        </div>
      ))}
    </div>
  );

  const mainElement = (
    <div className="flex-1 min-h-0" style={{ padding: `${gap}px` }}>
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
    <div className="flex flex-col h-full w-full">
      {carouselPosition === 'top' && carouselElement}
      {mainElement}
      {carouselPosition === 'bottom' && carouselElement}
    </div>
  );
};

export const SpotlightLayout: React.FC<SpotlightLayoutProps> = (props) => {
  let room;
  try {
    room = useRoomContext();
  } catch {
    return (
      <div className="p-8 border-2 border-dashed border-gray-400 rounded-lg text-center h-full flex items-center justify-center">
        <div>
          <p className="text-sm text-gray-500 font-medium">Spotlight Layout</p>
          <p className="text-xs text-gray-400 mt-1">Connect to a room to see participants</p>
        </div>
      </div>
    );
  }
  return <SpotlightLayoutInner {...props} />;
};

export const SpotlightLayoutConfig: ComponentConfig<SpotlightLayoutProps> = {
  label: 'Spotlight Layout',
  fields: {
    carouselPosition: {
      type: 'select',
      label: 'Carousel Position',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
    carouselHeight: {
      type: 'number',
      label: 'Carousel Height (px)',
      min: 80,
      max: 200,
    },
    gap: {
      type: 'number',
      label: 'Gap (px)',
      min: 0,
      max: 32,
    },
    autoSwitchOnScreenShare: {
      type: 'radio',
      label: 'Auto-switch to Screen Share',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    carouselPosition: 'bottom',
    carouselHeight: 128,
    gap: 16,
    autoSwitchOnScreenShare: true,
  },
  render: (props) => <SpotlightLayout {...props} />,
};
