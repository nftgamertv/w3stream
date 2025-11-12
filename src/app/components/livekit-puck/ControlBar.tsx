'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import type { ComponentConfig } from '@measured/puck';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Monitor, MonitorOff, Gamepad2 } from "lucide-react"
import { createPortal } from 'react-dom';
 
import ShimmerButton from '../ui/shimmer-button';
import { MultiPageModal } from '../ui/multi-page-modal';
export interface ControlBarProps {
  showLeaveButton?: boolean;
  showScreenShare?: boolean;
  className?: string;
  onToggleChat: () => void
  isChatOpen: boolean
  onToggleGame?: () => void
  isGameOpen?: boolean
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
 


export function ControlBar({ onToggleChat, isChatOpen, onToggleGame, isGameOpen }: ControlBarProps) {
  const { localParticipant } = useLocalParticipant()
  const room = useRoomContext()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false) 
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
 
 
  const toggleMicrophone = async () => {
    if (localParticipant) {
      const enabled = !isMicEnabled
      await localParticipant.setMicrophoneEnabled(enabled)
      setIsMicEnabled(enabled)
    }
  }

  const toggleCamera = async () => {
    if (localParticipant) {
      const enabled = !isCameraEnabled
      await localParticipant.setCameraEnabled(enabled)
      setIsCameraEnabled(enabled)
    }
  }

  const toggleScreenShare = async () => {
    if (localParticipant) {
      if (isScreenSharing) {
        await localParticipant.setScreenShareEnabled(false)
        setIsScreenSharing(false)
      } else {
        await localParticipant.setScreenShareEnabled(true)
        setIsScreenSharing(true)
      }
    }
  }

  const leaveRoom = () => {
    room.disconnect()
    router.push("/")
  }

  return (
    <div className="relative z-50 border-t border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 p-4">
        <MultiPageModal />
  {/* Microphone Toggle */}
        <Button
          onClick={toggleMicrophone}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full transition-all",
            isMicEnabled ? "bg-white/10 hover:bg-white/20" : "bg-red-500 hover:bg-red-600",
          )}
        >
          {isMicEnabled ? <Mic className="h-6 w-6 text-white" /> : <MicOff className="h-6 w-6 text-white" />}
        </Button>

        {/* Camera Toggle */}
        <Button
          onClick={toggleCamera}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full transition-all",
            isCameraEnabled ? "bg-white/10 hover:bg-white/20" : "bg-red-500 hover:bg-red-600",
          )}
        >
          {isCameraEnabled ? <Video className="h-6 w-6 text-white" /> : <VideoOff className="h-6 w-6 text-white" />}
        </Button>

        {/* Screen Share Toggle */}
        <Button
          onClick={toggleScreenShare}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full transition-all",
            isScreenSharing ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/20",
          )}
        >
          {isScreenSharing ? <MonitorOff className="h-6 w-6 text-white" /> : <Monitor className="h-6 w-6 text-white" />}
        </Button>

        {onToggleGame && (
          <Button
            onClick={onToggleGame}
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full transition-all",
              isGameOpen ? "bg-purple-500 hover:bg-purple-600" : "bg-white/10 hover:bg-white/20",
            )}
          >
            <Gamepad2 className="h-6 w-6 text-white" />
          </Button>
        )}

        {/* Chat Toggle */}
        <Button
          onClick={onToggleChat}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full transition-all",
            isChatOpen ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/20",
          )}
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>

        {/* Leave Button */}
        <Button
          onClick={leaveRoom}
          size="lg"
          className="h-14 w-14 rounded-full bg-red-500 transition-all hover:bg-red-600"
        >
          <PhoneOff className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  )
}
 
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
    onToggleChat: { 
      type: 'custom',
      render: () => null
    },
    isChatOpen: {
      type: 'radio',
      label: 'Chat Open',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    onToggleGame: { 
      type: 'custom',
      render: () => null
    },
    isGameOpen: {
      type: 'radio',
      label: 'Game Open',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    showLeaveButton: true,
    showScreenShare: true,
    onToggleChat: () => {},
    isChatOpen: false,
  },
  render: (props) => <ControlBar {...props} />,
};
