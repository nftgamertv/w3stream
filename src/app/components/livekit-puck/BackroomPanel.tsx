"use client"

import React, { useState, useEffect, useMemo } from "react"
import type { ComponentConfig } from "@measured/puck"
import { useParticipants, useRoomContext } from "@livekit/components-react"
import type { LocalParticipant, RemoteParticipant } from "livekit-client"
import { ParticipantEvent, RoomEvent } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, UserMinus } from "lucide-react"

function isOnStage(participant: LocalParticipant | RemoteParticipant): boolean {
  try {
    const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
    return metadata.onStage === true
  } catch {
    return false
  }
}

export interface BackroomPanelProps {
  width?: number
  showOnStage?: boolean
  position?: "left" | "right"
}

const BackroomPanelInner: React.FC<BackroomPanelProps> = ({
  width = 320,
  showOnStage = true,
  position = "left",
}) => {
  const participants = useParticipants()
  const room = useRoomContext()
  const [updatingParticipants, setUpdatingParticipants] = useState<Set<string>>(new Set())
  const [metadataUpdateCounter, setMetadataUpdateCounter] = useState(0)

  useEffect(() => {
    const handleMetadataChanged = () => {
      setMetadataUpdateCounter((prev) => prev + 1)
    }

    // Listen for metadata changes on all remote participants
    room.remoteParticipants.forEach((participant) => {
      participant.on(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
    })

    room.localParticipant.on(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)

    // Listen for new participants joining
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      participant.on(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
    }

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected)

    return () => {
      room.remoteParticipants.forEach((participant) => {
        participant.off(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
      })
      room.localParticipant.off(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected)
    }
  }, [room])

  // Filter participants in backroom (not on stage) and on stage - memoized to prevent infinite loops
  const { backstage, onStage } = useMemo(() => {
    const backstage = participants.filter(
      (p) => !isOnStage(p) && p.identity !== room.localParticipant.identity
    )
    const onStage = participants.filter(
      (p) => isOnStage(p) && p.identity !== room.localParticipant.identity
    )
    return { backstage, onStage }
  }, [participants, metadataUpdateCounter, room.localParticipant.identity])

  const moveToStage = async (participant: RemoteParticipant) => {
    setUpdatingParticipants((prev) => new Set(prev).add(participant.identity))
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
        throw new Error("Failed to update participant metadata")
      }
    } catch (error) {
      console.error("Error moving participant to stage:", error)
    } finally {
      setUpdatingParticipants((prev) => {
        const next = new Set(prev)
        next.delete(participant.identity)
        return next
      })
    }
  }

  const removeFromStage = async (participant: RemoteParticipant) => {
    setUpdatingParticipants((prev) => new Set(prev).add(participant.identity))
    try {
      const currentMetadata = participant.metadata ? JSON.parse(participant.metadata) : {}
      const newMetadata = { ...currentMetadata, onStage: false }

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
        throw new Error("Failed to update participant metadata")
      }
    } catch (error) {
      console.error("Error removing participant from stage:", error)
    } finally {
      setUpdatingParticipants((prev) => {
        const next = new Set(prev)
        next.delete(participant.identity)
        return next
      })
    }
  }

  return (
    <div
      className="border-border/30 bg-background/95 backdrop-blur-sm flex flex-col h-full overflow-hidden"
      style={{
        width,
        borderRight: position === "left" ? "1px solid" : "none",
        borderLeft: position === "right" ? "1px solid" : "none",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Backstage</h3>
          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full ml-auto">{backstage.length}</span>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* On Stage Section */}
        {showOnStage && onStage.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">On Stage</h4>
            <div className="space-y-2">
              {onStage.map((participant) => (
                <div
                  key={participant.identity}
                  className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold">
                        {participant.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{participant.name || "Guest"}</p>
                      <p className="text-xs text-muted-foreground">Live on stage</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFromStage(participant as RemoteParticipant)}
                    disabled={updatingParticipants.has(participant.identity)}
                    className="gap-2 flex-shrink-0"
                  >
                    <UserMinus className="w-4 h-4" />
                    {updatingParticipants.has(participant.identity) ? "..." : "Remove"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backstage Section */}
        {backstage.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Waiting</h4>
            <div className="space-y-2">
              {backstage.map((participant) => (
                <div
                  key={participant.identity}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/20"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold">
                        {participant.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{participant.name || "Guest"}</p>
                      <p className="text-xs text-muted-foreground">Waiting to join</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => moveToStage(participant as RemoteParticipant)}
                    disabled={updatingParticipants.has(participant.identity)}
                    className="gap-2 flex-shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    {updatingParticipants.has(participant.identity) ? "..." : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {backstage.length === 0 && (!showOnStage || onStage.length === 0) && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No participants waiting</p>
          </div>
        )}
      </div>
    </div>
  )
}

export const BackroomPanel: React.FC<BackroomPanelProps> = (props) => {
  let room
  try {
    room = useRoomContext()
  } catch {
    return (
      <div
        className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center"
        style={{ width: props.width || 320 }}
      >
        <p className="text-sm text-gray-500">Backroom Panel</p>
        <p className="text-xs text-gray-400">Connect to a room to manage participants</p>
      </div>
    )
  }
  return <BackroomPanelInner {...props} />
}

export const BackroomPanelConfig: ComponentConfig<BackroomPanelProps> = {
  label: "Backroom Panel",
  fields: {
    width: {
      type: "number",
      label: "Width (px)",
      min: 250,
      max: 500,
    },
    showOnStage: {
      type: "radio",
      label: "Show On-Stage Participants",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    position: {
      type: "select",
      label: "Position",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
  },
  defaultProps: {
    width: 320,
    showOnStage: true,
    position: "left",
  },
  render: (props) => <BackroomPanel {...props} />,
}