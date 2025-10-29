'use client';
import React from 'react';
import type { ComponentConfig } from '@measured/puck';
import { BackroomPanel as BackroomPanelComponent } from "@/components/BackroomPanel";

export interface BackroomPanelProps {
  enabled?: boolean;
  forceHost?: boolean | null;
}

export const BackroomPanel: React.FC<BackroomPanelProps> = ({ enabled = true, forceHost }) => {
  if (!enabled) return null;
  const override = forceHost === null ? undefined : forceHost;
  return <BackroomPanelComponent isHostOverride={override} />;
};

export const BackroomPanelConfig: ComponentConfig<BackroomPanelProps> = {
  label: 'Backroom Panel',
  fields: {
    enabled: {
      type: 'radio',
      label: 'Enabled',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    forceHost: {
      type: 'radio',
      label: 'Force Host View',
      options: [
        { label: 'Auto', value: null },
        { label: 'Show', value: true },
        { label: 'Hide', value: false },
      ],
    },
  },
  defaultProps: {
    enabled: true,
    forceHost: null,
  },
  render: (props) => <BackroomPanel {...props} />,
};
