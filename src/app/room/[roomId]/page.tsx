"use client"

import { useParams, useSearchParams } from "next/navigation"
import { MeetingRoom } from "@/components/meeting-room"
import  { PreJoin } from "@/components/PreJoinScreen"
import { Suspense, useState, type ComponentType } from "react"
import type { PreJoinSettings } from "@/components/PreJoinScreen"
import { Cursors } from "react-together"
 
function RoomContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const initialName = searchParams.get("name") || "Guest"
  const [hasJoined, setHasJoined] = useState(false)
  const [joinSettings, setJoinSettings] = useState<PreJoinSettings>({
    videoEnabled: true,
    audioEnabled: true,
    name: initialName,
    audioDeviceId: "",
    videoDeviceId: "",
    audioOutputDeviceId: ""
  })

  const handleJoin = (settings: PreJoinSettings) => {
    setJoinSettings(settings)
    setHasJoined(true)
  }

  if (!hasJoined) {
    return <PreJoin onJoin={handleJoin} initialName={initialName} />
  }

  return (
    <MeetingRoom
      roomId={roomId}
      participantName={joinSettings.name}
      initialSettings={{ video: joinSettings.videoEnabled, audio: joinSettings.audioEnabled }}
    />
  )
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading meeting room...</p>
          </div>
        </div>
      }
    > 
      <RoomContent />
    </Suspense>
  )
}
