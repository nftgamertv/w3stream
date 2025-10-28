'use client';
import React from 'react';
import type { ComponentConfig } from '@measured/puck';
import StageSubscriptionManagerComponent from "@/components/StageSubscriptionManager";

export interface StageSubscriptionManagerProps {
  enabled?: boolean;
}

export const StageSubscriptionManager: React.FC<StageSubscriptionManagerProps> = ({ enabled = true }) => {
  if (!enabled) return null;
  return <StageSubscriptionManagerComponent />;
};

export const StageSubscriptionManagerConfig: ComponentConfig<StageSubscriptionManagerProps> = {
  label: 'Stage Subscription Manager',
  fields: {
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
    enabled: true,
  },
  render: (props) => <StageSubscriptionManager {...props} />,
};
