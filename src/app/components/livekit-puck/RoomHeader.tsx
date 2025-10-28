'use client';
import React, { useState } from 'react';
import type { ComponentConfig } from '@measured/puck';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid3x3, Sidebar, Maximize2, Copy, Check, Users } from "lucide-react";

export interface RoomHeaderProps {
  roomId?: string;
  showLayoutControls?: boolean;
  showCopyLink?: boolean;
}

type LayoutType = "grid" | "sidebar" | "spotlight";

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId = "Room",
  showLayoutControls = true,
  showCopyLink = true
}) => {
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState<LayoutType>("grid");

  const handleCopyLink = async () => {
    const inviteUrl = `${window.location.origin}/room/${roomId}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('layout-changed', { detail: newLayout }));
  };

  return (
    <header className="border-b border-border/30 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">Room: {roomId}</h1>
          </div>
        </div>
        <Badge variant="secondary" className="flex-shrink-0">
          Live
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {showLayoutControls && (
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              size="sm"
              variant={layout === "grid" ? "secondary" : "ghost"}
              onClick={() => handleLayoutChange("grid")}
              className="h-8 px-3"
              title="Grid layout"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={layout === "sidebar" ? "secondary" : "ghost"}
              onClick={() => handleLayoutChange("sidebar")}
              className="h-8 px-3"
              title="Sidebar layout"
            >
              <Sidebar className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={layout === "spotlight" ? "secondary" : "ghost"}
              onClick={() => handleLayoutChange("spotlight")}
              className="h-8 px-3"
              title="Spotlight layout"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {showCopyLink && (
          <Button size="sm" variant="outline" onClick={handleCopyLink} className="h-9 gap-2 bg-transparent">
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </Button>
        )}
      </div>
    </header>
  );
};

export const RoomHeaderConfig: ComponentConfig<RoomHeaderProps> = {
  label: 'Room Header',
  fields: {
    roomId: { type: 'text', label: 'Room ID' },
    showLayoutControls: { type: 'radio', label: 'Show Layout Controls', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    showCopyLink: { type: 'radio', label: 'Show Copy Link', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
  },
  defaultProps: {
    showLayoutControls: true,
    showCopyLink: true,
  },
  render: (props) => <RoomHeader {...props} />,
};
