'use client';
import React from 'react';
import type { ComponentConfig } from '@measured/puck';
import { useState } from 'react';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';
import { Button } from '@/components/ui/button';

export interface SelfStageToggleProps {
  id?: string;
}

export const SelfStageToggle: React.FC<SelfStageToggleProps> = () => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [pending, setPending] = useState(false);

  const md = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {};
  const onStage = md.onStage === true;

  const setSelfStage = async (nextOnStage: boolean) => {
    try {
      setPending(true);
      const newMetadata = { ...md, onStage: nextOnStage };
      await fetch('/api/participant/update-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: localParticipant.identity,
          metadata: newMetadata,
        }),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="px-3 py-2 z-50 isolate">
      {onStage ? (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setSelfStage(false)}>
          Leave stage
        </Button>
      ) : (
        <Button size="sm" disabled={pending} onClick={() => setSelfStage(true)}>
          Go on stage
        </Button>
      )}
    </div>
  );
};

export const SelfStageToggleConfig: ComponentConfig<SelfStageToggleProps> = {
  label: 'Self Stage Toggle',
  fields: {},
  defaultProps: {},
  render: (props) => <SelfStageToggle {...props} />,
};
