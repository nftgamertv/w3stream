'use client';
import React from 'react';
import type { ComponentConfig } from '@measured/puck';
import { BackroomPanel as BackroomPanelComponent } from "@/components/BackroomPanel";

export interface BackroomPanelProps {
  enabled?: boolean;
}

export const BackroomPanel: React.FC<BackroomPanelProps> = ({ enabled = true }) => {
  if (!enabled) return null;
  return <BackroomPanelComponent />;
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
  },
  defaultProps: {
    enabled: true,
  },
  render: (props) => <BackroomPanel {...props} />,
};
