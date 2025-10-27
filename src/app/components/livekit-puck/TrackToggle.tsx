'use client';
import React from 'react';
import { TrackToggle as LKTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { ComponentConfig } from '@measured/puck';

export interface TrackToggleProps {
  source: 'camera' | 'microphone' | 'screen_share';
  className?: string;
}

export const TrackToggle: React.FC<TrackToggleProps> = ({ source, className }) => {
  const trackSource = source === 'camera' ? Track.Source.Camera : source === 'microphone' ? Track.Source.Microphone : Track.Source.ScreenShare;
  return <LKTrackToggle source={trackSource} className={className} />;
};

export const TrackToggleConfig: ComponentConfig<TrackToggleProps> = {
  label: 'Track Toggle',
  fields: {
    source: { type: 'select', label: 'Track Source', options: [
      { label: 'Camera', value: 'camera' },
      { label: 'Microphone', value: 'microphone' },
      { label: 'Screen Share', value: 'screen_share' },
    ]},
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: { source: 'camera' },
  render: (props) => <TrackToggle {...props} />,
};
