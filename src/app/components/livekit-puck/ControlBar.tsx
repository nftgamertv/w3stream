'use client';
import React from 'react';
import { ControlBar as LKControlBar } from '@livekit/components-react';
import type { ComponentConfig } from '@measured/puck';

export interface ControlBarProps {
  variation?: 'minimal' | 'verbose' | 'textOnly';
  className?: string;
}

export const ControlBar: React.FC<ControlBarProps> = ({ variation = 'verbose', className }) => {
  return <LKControlBar variation={variation} className={className} />;
};

export const ControlBarConfig: ComponentConfig<ControlBarProps> = {
  label: 'Control Bar',
  fields: {
    variation: { type: 'select', label: 'Variation', options: [
      { label: 'Minimal', value: 'minimal' },
      { label: 'Verbose', value: 'verbose' },
      { label: 'Text Only', value: 'textOnly' },
    ]},
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: { variation: 'verbose' },
  render: (props) => <ControlBar {...props} />,
};
