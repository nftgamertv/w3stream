"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Grid3x3, Sidebar, Maximize2, Copy, Check, Users } from "lucide-react"

type LayoutType = "grid" | "sidebar" | "spotlight"

interface RoomHeaderProps {
  roomId: string
  layout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
}

export function RoomHeader({ roomId, layout, onLayoutChange }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    const inviteUrl = `${window.location.origin}/room/${roomId}`
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="border-b border-border/30 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
      {/* Left: Room info */}
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

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Layout switcher */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            size="sm"
            variant={layout === "grid" ? "secondary" : "ghost"}
            onClick={() => onLayoutChange("grid")}
            className="h-8 px-3"
            title="Grid layout"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={layout === "sidebar" ? "secondary" : "ghost"}
            onClick={() => onLayoutChange("sidebar")}
            className="h-8 px-3"
            title="Sidebar layout"
          >
            <Sidebar className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={layout === "spotlight" ? "secondary" : "ghost"}
            onClick={() => onLayoutChange("spotlight")}
            className="h-8 px-3"
            title="Spotlight layout"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Copy invite link */}
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
      </div>
    </header>
  )
}
