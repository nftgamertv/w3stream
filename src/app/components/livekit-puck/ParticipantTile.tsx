'use client';
import React from 'react';
import { ParticipantTile as LKParticipantTile, useParticipants, useTracks, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { ComponentConfig } from '@measured/puck';

export interface ParticipantTileProps {
  participantIdentity?: string;
  className?: string;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({ participantIdentity, className }) => {
  // Check if we're inside a LiveKit room
  try {
    useRoomContext();
  } catch (error) {
    // Not inside LiveKitRoom - show placeholder
    return (
      <div className={className || "p-4 border-2 border-dashed border-gray-400 rounded-lg text-center bg-gray-50"}>
        <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600">Participant Tile</p>
        <p className="text-xs text-gray-400">Connect to a room to see participant</p>
      </div>
    );
  }

  const participants = useParticipants();
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const participant = participantIdentity
    ? participants.find(p => p.identity === participantIdentity)
    : participants[0];

  if (!participant) {
    return <div className={className || "p-4 text-center"}>No participant available</div>;
  }

  const trackRef = tracks.find(t => t.participant.identity === participant.identity);

  if (!trackRef) {
    return (
      <div className={className || "p-4 text-center"}>
        Waiting for {participant.identity || participant.name || 'participant'}...
      </div>
    );
  }

  return <LKParticipantTile trackRef={trackRef} className={className} />;
};

export const ParticipantTileConfig: ComponentConfig<ParticipantTileProps> = {
  label: 'Participant Tile',
  fields: {
    participantIdentity: { type: 'text', label: 'Participant Identity (optional)' },
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: {},
  render: (props) => <ParticipantTile {...props} />,
};
