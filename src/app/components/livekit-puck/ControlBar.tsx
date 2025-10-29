'use client';
import React, { useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import type { ComponentConfig } from '@measured/puck';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Video, VideoOff, MonitorUp, MonitorPause, PhoneOff } from 'lucide-react';

export interface ControlBarProps {
  showLeaveButton?: boolean;
  showScreenShare?: boolean;
  className?: string;
}

interface MediaToggleProps {
  active: boolean;
  activeIcon: React.ComponentType<{ className?: string }>;
  inactiveIcon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => Promise<void> | void;
  disabled?: boolean;
}

const MediaToggle: React.FC<MediaToggleProps> = ({
  active,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
  label,
  onClick,
  disabled,
}) => {
  const IconComponent = active ? ActiveIcon : InactiveIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60',
        active
          ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100 shadow-lg shadow-emerald-500/20'
          : 'border-white/12 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 transition-all',
          active ? 'border-emerald-400/60 bg-emerald-400/20' : 'group-hover:border-white/40',
        )}
      >
        <IconComponent className="h-4 w-4" />
      </span>
      <span className="pr-1 text-xs uppercase tracking-wide">{label}</span>
    </button>
  );
};

export const ControlBar: React.FC<ControlBarProps> = ({
  showLeaveButton = true,
  showScreenShare = true,
  className,
}) => {
  let room;
  try {
    room = useRoomContext();
  } catch (error) {
    return (
      <div className={cn('rounded-2xl border border-dashed border-white/20 px-6 py-8 text-center text-sm text-white/60', className)}>
        Media controls will appear once the room is connected.
      </div>
    );
  }

  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant({ room });
  const [isScreenShareBusy, setIsScreenShareBusy] = useState(false);

  const toggleMicrophone = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (error) {
      console.error('Failed to toggle microphone', error);
    }
  };

  const toggleCamera = async () => {
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (error) {
      console.error('Failed to toggle camera', error);
    }
  };

  const toggleScreenShare = async () => {
    if (!showScreenShare) return;
    setIsScreenShareBusy(true);
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    } catch (error) {
      console.error('Failed to toggle screen share', error);
    } finally {
      setIsScreenShareBusy(false);
    }
  };

  const handleLeave = async () => {
    try {
      await room.disconnect(true);
    } catch (error) {
      console.error('Failed to leave the room', error);
    }
  };

  return (
    <div className={cn('mx-auto w-full max-w-5xl px-2', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/65 px-6 py-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <MediaToggle
            active={isMicrophoneEnabled}
            activeIcon={Mic}
            inactiveIcon={MicOff}
            label={isMicrophoneEnabled ? 'Mic On' : 'Mic Off'}
            onClick={toggleMicrophone}
          />
          <MediaToggle
            active={isCameraEnabled}
            activeIcon={Video}
            inactiveIcon={VideoOff}
            label={isCameraEnabled ? 'Camera On' : 'Camera Off'}
            onClick={toggleCamera}
          />
          {showScreenShare && (
            <MediaToggle
              active={isScreenShareEnabled}
              activeIcon={MonitorUp}
              inactiveIcon={MonitorPause}
              label={isScreenShareEnabled ? 'Sharing' : 'Share Screen'}
              onClick={toggleScreenShare}
              disabled={isScreenShareBusy}
            />
          )}
        </div>

        {showLeaveButton && (
          <Button
            size="lg"
            variant="destructive"
            onClick={handleLeave}
            className="h-11 rounded-full px-6 text-sm shadow-lg shadow-red-500/30"
          >
            <PhoneOff className="mr-2 h-4 w-4" />
            Leave Stage
          </Button>
        )}
      </div>
    </div>
  );
};

export const ControlBarConfig: ComponentConfig<ControlBarProps> = {
  label: 'Control Bar',
  fields: {
    showLeaveButton: {
      type: 'radio',
      label: 'Show Leave Button',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    showScreenShare: {
      type: 'radio',
      label: 'Show Screen Share',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    className: { type: 'text', label: 'CSS Class' },
  },
  defaultProps: {
    showLeaveButton: true,
    showScreenShare: true,
  },
  render: (props) => <ControlBar {...props} />,
};
