'use client';
import React from 'react';
import { RoomName as LKRoomName } from '@livekit/components-react';
import type { ComponentConfig } from '@measured/puck';

export interface RoomNameProps {
  className?: string;
}

export const RoomName: React.FC<RoomNameProps> = ({ className }) => {
  return <LKRoomName className={className} />;
};

export const RoomNameConfig: ComponentConfig<RoomNameProps> = {
  label: 'Room Name',
  fields: {
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: {},
  render: (props) => <RoomName {...props} />,
};
