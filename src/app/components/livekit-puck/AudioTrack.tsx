'use client';
import React from 'react';
import { AudioTrack as LKAudioTrack, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { ComponentConfig } from '@measured/puck';
import { useLiveKitSafe, LiveKitPlaceholder } from './useLiveKitSafe';

export interface AudioTrackProps {
  source?: 'microphone' | 'screen_share_audio';
  participantIdentity?: string;
  volume?: number;
  muted?: boolean;
}

export const AudioTrack: React.FC<AudioTrackProps> = ({ source = 'microphone', participantIdentity, volume = 1, muted = false }) => {
  const isInRoom = useLiveKitSafe();

  if (!isInRoom) {
    return (
      <LiveKitPlaceholder
        icon={
          <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        }
        title="Audio Track"
        description="Connect to a room to enable audio"
        className="p-3 border border-dashed border-gray-300 rounded bg-gray-50 text-center"
      />
    );
  }

  const trackSource = source === 'microphone' ? Track.Source.Microphone : Track.Source.ScreenShareAudio;
  const tracks = useTracks([trackSource], { onlySubscribed: true });
  const track = participantIdentity ? tracks.find(t => t.participant.identity === participantIdentity) : tracks[0];

  if (!track) return null;
  return <LKAudioTrack trackRef={track} volume={volume} muted={muted} />;
};

export const AudioTrackConfig: ComponentConfig<AudioTrackProps> = {
  label: 'Audio Track',
  fields: {
    source: { type: 'select', label: 'Source', options: [
      { label: 'Microphone', value: 'microphone' },
      { label: 'Screen Share Audio', value: 'screen_share_audio' },
    ]},
    participantIdentity: { type: 'text', label: 'Participant Identity (optional)' },
    volume: { type: 'number', label: 'Volume', min: 0, max: 1 },
    muted: { type: 'radio', label: 'Muted', options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ]},
  },
  defaultProps: { source: 'microphone', volume: 1, muted: false },
  render: (props) => <AudioTrack {...props} />,
};
