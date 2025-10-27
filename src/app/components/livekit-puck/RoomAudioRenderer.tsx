'use client';
import React from 'react';
import { RoomAudioRenderer as LKRoomAudioRenderer } from '@livekit/components-react';
import type { ComponentConfig } from '@measured/puck';

export interface RoomAudioRendererProps {
  volume?: number;
}

export const RoomAudioRenderer: React.FC<RoomAudioRendererProps> = ({ volume = 1 }) => {
  return <LKRoomAudioRenderer volume={volume} />;
};

export const RoomAudioRendererConfig: ComponentConfig<RoomAudioRendererProps> = {
  label: 'Room Audio Renderer',
  fields: {
    volume: { type: 'number', label: 'Volume', min: 0, max: 1 },
  },
  defaultProps: { volume: 1 },
  render: (props) => <RoomAudioRenderer {...props} />,
};
