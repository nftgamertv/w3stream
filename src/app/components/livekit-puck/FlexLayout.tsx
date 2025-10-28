'use client';
import React from 'react';
import type { ComponentConfig } from '@measured/puck';

export interface FlexLayoutProps {
  direction?: 'row' | 'column';
  gap?: number;
  padding?: number;
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  minHeight?: number;
  children?: React.ReactNode;
}

export const FlexLayout: React.FC<FlexLayoutProps> = ({
  direction = 'row',
  gap = 16,
  padding = 16,
  justifyContent = 'start',
  alignItems = 'stretch',
  minHeight = 100,
  children,
}) => {
  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
  };

  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: `${gap}px`,
        padding: `${padding}px`,
        justifyContent: justifyMap[justifyContent],
        alignItems: alignMap[alignItems],
        minHeight: `${minHeight}px`,
        height: '100%',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export const FlexLayoutConfig: ComponentConfig<FlexLayoutProps> = {
  label: 'Flex Container',
  fields: {
    direction: {
      type: 'select',
      label: 'Direction',
      options: [
        { label: 'Row', value: 'row' },
        { label: 'Column', value: 'column' },
      ],
    },
    gap: {
      type: 'number',
      label: 'Gap (px)',
      min: 0,
      max: 64,
    },
    padding: {
      type: 'number',
      label: 'Padding (px)',
      min: 0,
      max: 64,
    },
    justifyContent: {
      type: 'select',
      label: 'Justify Content',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Space Between', value: 'between' },
        { label: 'Space Around', value: 'around' },
      ],
    },
    alignItems: {
      type: 'select',
      label: 'Align Items',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Stretch', value: 'stretch' },
      ],
    },
    minHeight: {
      type: 'number',
      label: 'Min Height (px)',
      min: 0,
      max: 1000,
    },
  },
  defaultProps: {
    direction: 'row',
    gap: 16,
    padding: 16,
    justifyContent: 'start',
    alignItems: 'stretch',
    minHeight: 100,
  },
  render: ({ puck, ...props }) => {
    const dropZone = puck.renderDropZone({ zone: 'content' });
    return (
      <FlexLayout {...props}>
        {dropZone as React.ReactNode}
      </FlexLayout>
    );
  },
};
