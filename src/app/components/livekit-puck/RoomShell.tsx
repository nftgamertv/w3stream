'use client';

import React from 'react';
import type { ComponentConfig } from '@measured/puck';
import { cn } from '@/lib/utils';
import { Cursors } from 'react-together';

/* -------- Error Boundary for ReactTogether components -------- */
class ReactTogetherErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[RoomShell] ReactTogether context not available for Cursors:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return null; // Don't render cursors if context is missing
    }
    return this.props.children;
  }
}

export interface RoomShellProps {
  background?: 'nebula' | 'slate' | 'plain';
  withPadding?: boolean;
  showCursors?: boolean; // Enable collaborative cursors (only for collaborative rooms)
}

interface RoomShellSlots {
  topBar?: React.ReactNode;
  stage?: React.ReactNode;
  leftRail?: React.ReactNode;
  rightRail?: React.ReactNode;
  footer?: React.ReactNode;
  overlays?: React.ReactNode;
}

const backgroundClassMap: Record<NonNullable<RoomShellProps['background']>, string> = {
  nebula:
    'bg-slate-950 text-white [background-image:radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.18),transparent_60%)]',
  slate: 'bg-slate-950 text-white',
  plain: 'bg-background text-foreground',
};

export const RoomShell: React.FC<RoomShellProps & { slots?: RoomShellSlots }> = ({
  background = 'nebula',
  withPadding = false,
  showCursors = false,
  slots,
}) => {
  const stageContent = slots?.stage ?? (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-inner shadow-black/40" />
      <div className="min-h-[200px] rounded-3xl border border-dashed border-white/15 bg-black/20" />
    </div>
  );

  return (
    <div className={cn('relative flex min-h-screen flex-col overflow-hidden', backgroundClassMap[background])}>
      {slots?.topBar && <div className="flex-none">{slots.topBar}</div>}

      <div className={cn('relative flex flex-1 overflow-hidden', withPadding && 'px-6 pb-6')}>
        {slots?.leftRail && (
          <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col gap-4 border-r border-white/10 bg-black/40 px-4 py-6 backdrop-blur-xl">
            {slots.leftRail}
          </aside>
        )}

        <main className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div className="relative flex h-full w-full flex-col">
            <div className="relative flex-1 overflow-hidden">
              {stageContent}
            </div>
          </div>
          {/* Global collaborative cursors overlay - only show in collaborative rooms */}
          {showCursors ? (
            <div className="absolute inset-0 pointer-events-none">
              <ReactTogetherErrorBoundary>
                <Cursors />
              </ReactTogetherErrorBoundary>
            </div>
          ) : (
            console.log('[RoomShell] Cursors disabled - showCursors:', showCursors)
          )}
          {slots?.overlays && <div className="absolute inset-0">{slots.overlays}</div>}
        </main>

        {slots?.rightRail && (
          <aside className="hidden lg:flex w-80 flex-shrink-0 flex-col gap-4 border-l border-white/10 bg-black/40 px-4 py-6 backdrop-blur-xl">
            {slots.rightRail}
          </aside>
        )}
      </div>

      {slots?.footer && (
        <div className="flex-none border-t border-white/10 bg-black/60 px-4 py-4 backdrop-blur-xl">
          {slots.footer}
        </div>
      )}
    </div>
  );
};

type SlotConfig = {
  label: string;
  allow?: string[];
  disallow?: string[];
  single?: boolean;
};

const roomShellConfig: ComponentConfig<RoomShellProps> & {
  slots: Record<keyof RoomShellSlots, SlotConfig>;
} = {
  label: 'Room Shell',
  fields: {
    background: {
      type: 'select',
      label: 'Background',
      options: [
        { label: 'Nebula', value: 'nebula' },
        { label: 'Slate', value: 'slate' },
        { label: 'Plain', value: 'plain' },
      ],
    },
    withPadding: {
      type: 'radio',
      label: 'Stage Padding',
      options: [
        { label: 'Compact', value: false },
        { label: 'Spacious', value: true },
      ],
    },
    showCursors: {
      type: 'radio',
      label: 'Show Collaborative Cursors',
      options: [
        { label: 'Enabled', value: true },
        { label: 'Disabled', value: false },
      ],
    },
  },
  defaultProps: {
    background: 'nebula',
    withPadding: false,
    showCursors: false,
  },
  slots: {
    topBar: {
      label: 'Top Bar',
      allow: ['RoomHeader'],
    },
    stage: {
      label: 'Stage',
      allow: ['VideoConferenceLayout', 'GridLayout', 'SVGEditor'],
    },
    leftRail: {
      label: 'Left Rail',
      allow: ['BackroomPanel', 'Chat', 'ParticipantTile'],
    },
    rightRail: {
      label: 'Right Rail',
      allow: ['Chat', 'ChatDrawer'],
    },
    footer: {
      label: 'Footer',
      allow: ['ControlBar', 'DisconnectButton', 'TrackToggle'],
    },
    overlays: {
      label: 'Overlay Layer',
      allow: [ 'ChatDrawer', 'StageSubscriptionManager', 'RoomAudioRenderer'],
    },
  },
  render: (props) => <RoomShell {...props} />,
};

export const RoomShellConfig = roomShellConfig;

export default RoomShell;
