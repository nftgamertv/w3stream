'use client';
import React from 'react';
import { Chat as LKChat } from '@livekit/components-react';
import type { ComponentConfig } from '@measured/puck';

export interface ChatProps {
  className?: string;
}

export const Chat: React.FC<ChatProps> = ({ className }) => {
  return <LKChat className={className} />;
};

export const ChatConfig: ComponentConfig<ChatProps> = {
  label: 'Chat',
  fields: {
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: {},
  render: (props) => <Chat {...props} />,
};
