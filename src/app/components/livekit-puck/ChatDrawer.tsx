'use client';
import React from 'react';
import type { ComponentConfig } from '@measured/puck';
import { ChatDrawer as ChatDrawerComponent } from "@/components/ChatDrawer";

export interface ChatDrawerProps {
  participantName?: string;
  enabled?: boolean;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  participantName = "Guest",
  enabled = true
}) => {
  if (!enabled) return null;
  return <ChatDrawerComponent participantName={participantName} />;
};

export const ChatDrawerConfig: ComponentConfig<ChatDrawerProps> = {
  label: 'Chat Drawer',
  fields: {
    participantName: { type: 'text', label: 'Participant Name' },
    enabled: {
      type: 'radio',
      label: 'Enabled',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    participantName: 'Guest',
    enabled: true,
  },
  render: (props) => <ChatDrawer {...props} />,
};
