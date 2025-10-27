'use client';
import React from 'react';
import { DisconnectButton as LKDisconnectButton } from '@livekit/components-react';
import type { ComponentConfig } from '@measured/puck';

export interface DisconnectButtonProps {
  className?: string;
}

export const DisconnectButton: React.FC<DisconnectButtonProps> = ({ className }) => {
  return <LKDisconnectButton className={className}>Disconnect</LKDisconnectButton>;
};

export const DisconnectButtonConfig: ComponentConfig<DisconnectButtonProps> = {
  label: 'Disconnect Button',
  fields: {
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: {},
  render: (props) => <DisconnectButton {...props} />,
};
