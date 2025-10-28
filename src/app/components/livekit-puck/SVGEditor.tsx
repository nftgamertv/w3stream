'use client';
import React from 'react';
import SVGEditor from '@/components/SvgEditor';
import type { ComponentConfig } from '@measured/puck';

export interface SVGEditorProps {
  svgUrl: string;
  width?: number;
  height?: number;
  collaborative?: boolean;
  className?: string;
}

export const SVGEditorComponent: React.FC<SVGEditorProps> = ({
  svgUrl,
  width = 800,
  height = 800,
  collaborative = false,
  className = '',
}) => {
  return (
    <div style={{ width: width || 800, height: height || 800 }}>
      <SVGEditor
        svgurl={svgUrl}
        className={className}
        collaborative={collaborative}
      />
    </div>
  );
};

export const SVGEditorConfig: ComponentConfig<SVGEditorProps> = {
  label: 'SVG Editor',
  fields: {
    svgUrl: {
      type: 'text',
      label: 'SVG URL',
    },
    width: {
      type: 'number',
      label: 'Canvas Width',
    },
    height: {
      type: 'number',
      label: 'Canvas Height',
    },
    collaborative: {
      type: 'radio',
      label: 'Enable Collaboration',
      options: [
        { label: 'Enabled', value: true },
        { label: 'Disabled', value: false },
      ],
    },
    className: {
      type: 'text',
      label: 'CSS Classes',
    },
  },
  defaultProps: {
    svgUrl: 'https://vgwzhgureposlvnxoiaj.supabase.co/storage/v1/object/public/svgs/generated/w3s.svg',
    width: 800,
    height: 800,
    collaborative: false,
    className: '',
  },
  render: (props) => <SVGEditorComponent {...props} />,
};
