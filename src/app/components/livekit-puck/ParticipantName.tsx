'use client';
import React from 'react';
import { ParticipantName as LKParticipantName, useParticipants } from '@livekit/components-react';
import type { ComponentConfig } from '@measured/puck';
import { useLiveKitSafe } from './useLiveKitSafe';

export interface ParticipantNameProps {
  participantIdentity?: string;
  className?: string;
}

export const ParticipantName: React.FC<ParticipantNameProps> = ({ participantIdentity, className }) => {
  const isInRoom = useLiveKitSafe();

  if (!isInRoom) {
    return <span className={className || "text-sm text-gray-500"}>Participant Name</span>;
  }

  const participants = useParticipants();
  const participant = participantIdentity ? participants.find(p => p.identity === participantIdentity) : participants[0];

  if (!participant) return null;
  return <LKParticipantName participant={participant} className={className} />;
};

export const ParticipantNameConfig: ComponentConfig<ParticipantNameProps> = {
  label: 'Participant Name',
  fields: {
    participantIdentity: { type: 'text', label: 'Participant Identity (optional)' },
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: {},
  render: (props) => <ParticipantName {...props} />,
};
