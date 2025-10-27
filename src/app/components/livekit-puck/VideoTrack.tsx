'use client';
import React from 'react';
import { VideoTrack as LKVideoTrack, useTracks, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { ComponentConfig } from '@measured/puck';

export interface VideoTrackProps {
  source?: 'camera' | 'screen_share' | 'unknown';
  participantIdentity?: string;
  className?: string;
}

export const VideoTrack: React.FC<VideoTrackProps> = ({ source = 'camera', participantIdentity, className }) => {
  // Check if we're inside a LiveKit room
  try {
    useRoomContext();
  } catch (error) {
    // Not inside LiveKitRoom - show placeholder
    return (
      <div className={className || "aspect-video bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400"}>
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-600">Video Track</p>
          <p className="text-xs text-gray-400">Connect to a room to see video</p>
        </div>
      </div>
    );
  }

  const trackSource = source === 'camera' ? Track.Source.Camera : source === 'screen_share' ? Track.Source.ScreenShare : Track.Source.Unknown;
  const tracks = useTracks([trackSource], { onlySubscribed: true });
  const track = participantIdentity ? tracks.find(t => t.participant.identity === participantIdentity) : tracks[0];

  if (!track) return <div className={className}>No video available</div>;
  return <LKVideoTrack trackRef={track} className={className} />;
};

export const VideoTrackConfig: ComponentConfig<VideoTrackProps> = {
  label: 'Video Track',
  fields: {
    source: { type: 'select', label: 'Source', options: [
      { label: 'Camera', value: 'camera' },
      { label: 'Screen Share', value: 'screen_share' },
    ]},
    participantIdentity: { type: 'text', label: 'Participant Identity (optional)' },
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: { source: 'camera' },
  render: (props) => <VideoTrack {...props} />,
};
