"use client"

import { useEffect } from "react"
import { useRoomContext } from "@livekit/components-react"
import {
  RoomEvent,
  ParticipantEvent,
  RemoteParticipant,
  TrackPublication,
  Track,
} from "livekit-client"

function shouldControl(pub?: TrackPublication | null) {
  if (!pub) return false
  // Only manage VIDEO (camera + screen share) by subscription.
  return pub.kind === Track.Kind.Video &&
    (pub.source === Track.Source.Camera || pub.source === Track.Source.ScreenShare)
}

async function setSubsForParticipant(p: RemoteParticipant, onStage: boolean) {
  // Camera
  const cam = p.getTrackPublication(Track.Source.Camera)
  if (shouldControl(cam)) cam!.setSubscribed(onStage)

  // Screen share
  const scr = p.getTrackPublication(Track.Source.ScreenShare)
  if (shouldControl(scr)) scr!.setSubscribed(onStage)
}

export default function StageSubscriptionManager() {
  const room = useRoomContext()

  useEffect(() => {
    const applyMeta = async (rp: RemoteParticipant) => {
      if (!rp || rp.isLocal) return
      let meta: any = {}
      try { meta = rp.metadata ? JSON.parse(rp.metadata) : {} } catch {}
      await setSubsForParticipant(rp, meta.onStage === true)
    }

    const handleMeta = async (_?: string, who?: any) => {
      const rp = who as RemoteParticipant
      await applyMeta(rp)
    }

    const initForAll = async () => {
      for (const [, rp] of room.remoteParticipants) {
        await applyMeta(rp)
        rp.on(ParticipantEvent.ParticipantMetadataChanged, handleMeta)
      }
    }

    const onJoin = async (rp: RemoteParticipant) => {
      await applyMeta(rp)
      rp.on(ParticipantEvent.ParticipantMetadataChanged, handleMeta)
    }

    const onLeave = (rp: RemoteParticipant) => {
      rp.off(ParticipantEvent.ParticipantMetadataChanged, handleMeta)
    }

    initForAll()
    room.on(RoomEvent.ParticipantConnected, onJoin)
    room.on(RoomEvent.ParticipantDisconnected, onLeave)

    return () => {
      for (const [, rp] of room.remoteParticipants) {
        rp.off(ParticipantEvent.ParticipantMetadataChanged, handleMeta)
      }
      room.off(RoomEvent.ParticipantConnected, onJoin)
      room.off(RoomEvent.ParticipantDisconnected, onLeave)
    }
  }, [room])

  return null
}
