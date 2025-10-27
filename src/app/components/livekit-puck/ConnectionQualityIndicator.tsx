'use client';
import React from 'react';
import { ConnectionQualityIndicator as LKConnectionQualityIndicator, useParticipants } from '@livekit/components-react';
import type { ComponentConfig } from '@measured/puck';
import { useLiveKitSafe } from './useLiveKitSafe';

export interface ConnectionQualityIndicatorProps {
  participantIdentity?: string;
  className?: string;
}

export const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({ participantIdentity, className }) => {
  const isInRoom = useLiveKitSafe();

  if (!isInRoom) {
    return (
      <div className={className || "w-4 h-4"}>
        <div className="w-full h-full rounded-full bg-gray-300" title="Connection Quality (not connected)" />
      </div>
    );
  }

  const participants = useParticipants();
  const participant = participantIdentity ? participants.find(p => p.identity === participantIdentity) : participants[0];

  if (!participant) return null;
  return <LKConnectionQualityIndicator participant={participant} className={className} />;
};

export const ConnectionQualityIndicatorConfig: ComponentConfig<ConnectionQualityIndicatorProps> = {
  label: 'Connection Quality Indicator',
  fields: {
    participantIdentity: { type: 'text', label: 'Participant Identity (optional)' },
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: {},
  render: (props) => <ConnectionQualityIndicator {...props} />,
};
