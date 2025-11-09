// app/components/RoomHeader.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ComponentConfig } from '@measured/puck';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid3x3, Sidebar, Maximize2, Copy, Check, Users, Edit3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const getRoomIdFromPath = (pathname: string): string | null => {
  const m = pathname.match(/\/room\/([^/]+)(?:\/edit)?/);
  return m ? m[1] : null;
};

const createEditLinkFromLocation = (roomId?: string) => {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  const id = roomId || getRoomIdFromPath(url.pathname);
  if (!id) return '';
  url.pathname = `/room/${id}/edit`;
  return url.toString();
};

export interface RoomHeaderProps {
  roomId?: string;
  showLayoutControls?: boolean;
  showCopyLink?: boolean;
  showUserMenu?: boolean;
}

type LayoutType = "grid" | "sidebar" | "spotlight";

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId = "Room",
  showLayoutControls = true,
  showCopyLink = true,
  showUserMenu = true,
}) => {
  const [layout, setLayout] = useState<LayoutType>("grid");
  const [copied, setCopied] = useState(false);
  const [editLink, setEditLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = roomId === "Room" ? getRoomIdFromPath(window.location.pathname) ?? roomId : roomId;
      setEditLink(createEditLinkFromLocation(id));
    }
  }, [roomId]);

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
      {["grid", "sidebar", "spotlight"].map((type) => (
        <Button
          key={type}
          size="sm"
          variant={layout === type ? "secondary" : "ghost"}
          onClick={() => handleLayoutChange(type as LayoutType)}
          className="h-8 rounded-full px-3 text-xs capitalize"
          title={`${type} layout`}
        >
          {type === "grid" && <Grid3x3 className="h-4 w-4" />}
          {type === "sidebar" && <Sidebar className="h-4 w-4" />}
          {type === "spotlight" && <Maximize2 className="h-4 w-4" />}
        </Button>
      ))}
    </div>
  ) : null;

  const rightControls = (
    <div className="flex items-center gap-2">
      {showCopyLink && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyLink}
          className="h-9 gap-2 rounded-full border-white/20 bg-white/5 text-xs"
        >
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
      {editLink && (
        <Link href={editLink} >
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-2 rounded-full border-white/20 bg-white/5 text-xs"
          >
            <Edit3 className="h-4 w-4" />
            Edit Page
          </Button>
        </Link>
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

export const RoomHeaderConfig: ComponentConfig<RoomHeaderProps> = {
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
  render: (props) => <RoomHeader {...props} />,
};
