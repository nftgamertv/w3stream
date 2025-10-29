"use client"

import { useEffect, useMemo, useState } from "react"
import { useParticipants, useRoomContext, ParticipantTile as LKParticipantTile } from "@livekit/components-react"
import type { TrackReference } from "@livekit/components-react"
import { Track, type LocalParticipant, type RemoteParticipant, ParticipantEvent, RoomEvent } from "livekit-client"
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
    <div className="pointer-events-auto absolute bottom-24 left-10 z-[120] flex max-w-[34rem] flex-col gap-2 text-white">
      <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
          <Users className="h-4 w-4" />
        </span>
        <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur">
          Backstage
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80">
            {backstageParticipants.length}
          </span>
        </span>
      </div>

      {backstageParticipants.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-xs text-white/60 backdrop-blur-xl">
          <Users className="h-4 w-4 text-white/40" />
          <span>Backstage is clear.</span>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 pr-4">
          {backstageParticipants.map((participant) => {
            const trackRef = getPreferredTrackRef(participant)
            const isPending = updatingParticipants.has(participant.identity)

            return (
              <div
                key={participant.identity}
                className="group relative aspect-video w-40 flex-shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-white/5 shadow-xl shadow-black/50 backdrop-blur-xl"
              >
                {trackRef ? (
                  <LKParticipantTile className="h-full w-full" trackRef={trackRef} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black/60 text-[11px] text-white/60">
                    Waiting for video
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/65 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-2 text-[11px]">
                  <span className="max-w-[70%] truncate font-medium">
                    {participant.name || 'Guest'}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] uppercase tracking-wide">
                    Waiting
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => moveToStage(participant as RemoteParticipant)}
                  disabled={isPending}
                  className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-black transition-opacity duration-200"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[11px] font-semibold text-black shadow-lg shadow-white/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 disabled:opacity-90">
                    {isPending ? (
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
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
