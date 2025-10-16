"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MeetingRoom } from "@/components/MeetingRoom"

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [roomId, setRoomId] = useState<string>("")
  const [isValidated, setIsValidated] = useState(false)

  useEffect(() => {
    const validateAndRedirect = async () => {
      const resolvedParams = await params
      const currentRoomId = resolvedParams.roomId
      setRoomId(currentRoomId)

      // Check if user has gone through prejoin (required params: name, video, audio)
      const name = searchParams.get("name")
      const video = searchParams.get("video")
      const audio = searchParams.get("audio")

      // If any required param is missing, redirect to prejoin
      if (!name || !video || !audio) {
        // Preserve role param if it exists (for hosts)
        const role = searchParams.get("role")
        const prejoinUrl = role
          ? `/prejoin/${currentRoomId}?role=${role}`
          : `/prejoin/${currentRoomId}`

        router.replace(prejoinUrl)
        return
      }

      // All required params present, allow access to room
      setIsValidated(true)
    }

    validateAndRedirect()
  }, [params, searchParams, router])

  // Show loading while validating
  if (!isValidated || !roomId) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    )
  }

  const participantName = searchParams.get("name") || "Guest"
  const videoEnabled = searchParams.get("video") === "true"
  const audioEnabled = searchParams.get("audio") === "true"

  return (
    <MeetingRoom
      roomId={roomId}
      participantName={participantName}
      initialSettings={{
        video: videoEnabled,
        audio: audioEnabled,
      }}
    />
  )
}
