"use client"

import { useEffect, useMemo, useState } from "react"
import { useParticipants, useRoomContext, ParticipantTile as LKParticipantTile } from "@livekit/components-react"
import type { TrackReference } from "@livekit/components-react"
import { Track, type LocalParticipant, type RemoteParticipant, ParticipantEvent, RoomEvent } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Loader2 } from "lucide-react"

function isOnStage(participant: LocalParticipant | RemoteParticipant): boolean {
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
  return metadata.onStage === true
}

function getPreferredTrackRef(participant: LocalParticipant | RemoteParticipant): TrackReference | undefined {
  const screenPublication = participant.getTrackPublication(Track.Source.ScreenShare)
  if (screenPublication?.isSubscribed && screenPublication?.track) {
    return { participant, source: Track.Source.ScreenShare, publication: screenPublication }
  }
  const cameraPublication = participant.getTrackPublication(Track.Source.Camera)
  if (cameraPublication?.isSubscribed && cameraPublication?.track) {
    return { participant, source: Track.Source.Camera, publication: cameraPublication }
  }
  return undefined
}

export function BackroomPanel() {
  let room
  try {
    room = useRoomContext()
  } catch (error) {
    return null
  }

  const participants = useParticipants()
  const [metadataTick, setMetadataTick] = useState(0)
  const [updatingParticipants, setUpdatingParticipants] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleMetadataChanged = () => setMetadataTick((prev) => prev + 1)

    const registerParticipant = (participant: RemoteParticipant) => {
      participant.on(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
    }

    room.remoteParticipants.forEach(registerParticipant)
    room.on(RoomEvent.ParticipantConnected, registerParticipant)

    return () => {
      room.remoteParticipants.forEach((participant) => {
        participant.off(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
      })
      room.off(RoomEvent.ParticipantConnected, registerParticipant)
    }
  }, [room])

  const localMetadata = room.localParticipant.metadata ? JSON.parse(room.localParticipant.metadata) : {}
  const isHost = Boolean(localMetadata?.isHost ?? localMetadata?.role === "host")

  const backstageParticipants = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.identity !== room.localParticipant.identity &&
          !isOnStage(participant),
      ),
    [participants, room.localParticipant.identity, metadataTick],
  )

  if (!isHost) {
    return null
  }

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
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to promote participant", errorData)
        throw new Error("Failed to update participant metadata")
      }

      await response.json()
    } catch (error) {
      console.error("Error moving participant to stage", error)
    } finally {
      setUpdatingParticipants((prev) => {
        const next = new Set(prev)
        next.delete(participant.identity)
        return next
      })
    }
  }

  return (
    <div className="pointer-events-auto absolute bottom-[9rem] left-8 z-[120] flex max-w-[32rem] flex-col gap-3">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/70 backdrop-blur">
        <Users className="h-3.5 w-3.5" />
        Backstage
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80">
          {backstageParticipants.length}
        </span>
      </div>

      {backstageParticipants.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-sm text-white/60 backdrop-blur-xl">
          <Users className="h-5 w-5 text-white/40" />
          <span>No participants waiting backstage.</span>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 pr-2">
          {backstageParticipants.map((participant) => {
            const trackRef = getPreferredTrackRef(participant)
            return (
              <div
                key={participant.identity}
                className="group relative aspect-video w-48 flex-shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-white/5 shadow-xl shadow-black/40 backdrop-blur-xl"
              >
                {trackRef ? (
                  <LKParticipantTile className="h-full w-full" trackRef={trackRef} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black/50 text-xs text-white/50">
                    Waiting for video
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-4 py-3 text-xs text-white">
                  <span className="truncate font-medium">
                    {participant.name || "Guest"}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    Waiting
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center px-4 py-4">
                  <Button
                    size="sm"
                    onClick={() => moveToStage(participant as RemoteParticipant)}
                    disabled={updatingParticipants.has(participant.identity)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white/90 text-xs font-semibold text-black shadow-lg shadow-white/30 hover:bg-white"
                  >
                    {updatingParticipants.has(participant.identity) ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        Add to stage
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
