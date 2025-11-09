"use client"

import { useState, useEffect } from "react"
import { useRoomContext } from "@livekit/components-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users } from "lucide-react"
import type { RemoteParticipant } from "livekit-client"

interface BackroomPanelProps {
  isHostOverride?: boolean
}

function isOnStage(participant: RemoteParticipant): boolean {
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
  return metadata.onStage === true
}

export function BackroomPanel({ isHostOverride }: BackroomPanelProps = {}) {
  const room = useRoomContext()
  const [backstageParticipants, setBackstageParticipants] = useState<RemoteParticipant[]>([])

  useEffect(() => {
    const updateBackstage = () => {
      const participants = Array.from(room.remoteParticipants.values()).filter((p) => !isOnStage(p))
      setBackstageParticipants(participants)
    }

    updateBackstage()

    const interval = setInterval(updateBackstage, 1000)
    return () => clearInterval(interval)
  }, [room])

  const localMetadata = room.localParticipant.metadata ? JSON.parse(room.localParticipant.metadata) : {}
  const computedIsHost = true
  const isHost = true

  if (!isHost) {
    return null
  }

  const addToStage = async (participant: RemoteParticipant) => {
    try {
      const currentMetadata = participant.metadata ? JSON.parse(participant.metadata) : {}
      const newMetadata = { ...currentMetadata, onStage: true }

      const response = await fetch("/api/participant/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: participant.identity,
          metadata: newMetadata,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add participant to stage")
      }
    } catch (error) {
      console.error("[v0] Error adding participant to stage:", error)
    }
  }

  if (backstageParticipants.length === 0) {
    return null
  }

  return (
    <div className="w-64 border-r border-border/30 bg-muted/20 flex flex-col">
      <div className="px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Backstage</h3>
          <Badge variant="secondary" className="ml-auto">
            {backstageParticipants.length}
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {backstageParticipants.map((participant) => (
            <div
              key={participant.identity}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/50 hover:bg-background transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{participant.name || participant.identity}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => addToStage(participant)}
                className="h-8 px-2 gap-1.5 flex-shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
