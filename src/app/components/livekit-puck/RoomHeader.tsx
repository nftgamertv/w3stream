'use client';
import React, { useState } from 'react';
import type { ComponentConfig } from '@measured/puck';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid3x3, Sidebar, Maximize2, Copy, Check, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export interface RoomHeaderProps {
  roomId?: string;
  showLayoutControls?: boolean;
  showCopyLink?: boolean;
  showUserMenu?: boolean;
}

type LayoutType = "grid" | "sidebar" | "spotlight";

interface RoomHeaderRenderProps extends RoomHeaderProps {
  slots?: {
    actions?: React.ReactNode;
  };
}

export const RoomHeader: React.FC<RoomHeaderRenderProps> = ({
  roomId = "Room",
  showLayoutControls = true,
  showCopyLink = true,
  showUserMenu = true,
  slots,
}) => {
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState<LayoutType>("grid");

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const inviteUrl = `${window.location.origin}/room/${roomId}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('layout-changed', { detail: newLayout }));
    }
  };

  const layoutControls = showLayoutControls ? (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-1 py-1 text-sm shadow-inner backdrop-blur">
      <Button
        size="sm"
        variant={layout === "grid" ? "secondary" : "ghost"}
        onClick={() => handleLayoutChange("grid")}
        className="h-8 rounded-full px-3 text-xs"
        title="Grid layout"
      >
        <Grid3x3 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={layout === "sidebar" ? "secondary" : "ghost"}
        onClick={() => handleLayoutChange("sidebar")}
        className="h-8 rounded-full px-3 text-xs"
        title="Sidebar layout"
      >
        <Sidebar className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={layout === "spotlight" ? "secondary" : "ghost"}
        onClick={() => handleLayoutChange("spotlight")}
        className="h-8 rounded-full px-3 text-xs"
        title="Spotlight layout"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  ) : null;

  const rightControls = !showCopyLink && !slots?.actions ? null : (
    <div className="flex items-center gap-2">
      {slots?.actions}
      {showCopyLink && (
        <Button size="sm" variant="outline" onClick={handleCopyLink} className="h-9 gap-2 rounded-full border-white/20 bg-white/5 text-xs">
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>
      )}
    </div>
  );

  const leftContent = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-inner">
          <Users className="h-5 w-5 text-white/80" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-white/60">Live Room</p>
          <h1 className="text-sm font-semibold text-white truncate">{roomId}</h1>
        </div>
      </div>
      <Badge variant="secondary" className="rounded-full bg-emerald-500/20 text-emerald-200">
        Live
      </Badge>
    </div>
  );

  return (
    <Navbar
      leftContent={leftContent}
      centerContent={layoutControls}
      rightContent={rightControls}
      showUserMenu={showUserMenu}
      className="border-b border-white/10 bg-black/30"
    />
  );
};

type SlotConfig = {
  label: string;
  allow?: string[];
  disallow?: string[];
  single?: boolean;
};

const roomHeaderConfig: ComponentConfig<RoomHeaderProps> & {
  slots: { actions: SlotConfig };
} = {
  label: 'Room Header',
  fields: {
    roomId: { type: 'text', label: 'Room ID' },
    showLayoutControls: { type: 'radio', label: 'Show Layout Controls', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    showCopyLink: { type: 'radio', label: 'Show Copy Link', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    showUserMenu: { type: 'radio', label: 'Show User Menu', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
  },
  defaultProps: {
    showLayoutControls: true,
    showCopyLink: true,
    showUserMenu: true,
  },
  slots: {
    actions: {
      label: 'Right Actions',
    },
  },
  render: (props) => <RoomHeader {...props} />,
};

export const RoomHeaderConfig = roomHeaderConfig;
