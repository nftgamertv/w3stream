"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CollaborativeRoom } from "@/components/CollaborativeRoom"
import { PresentationRoom } from "@/components/PresentationRoom"
import { ClientReactTogetherWrapper } from "@/providers/ClientReactTogetherWrapper"
import { createClient } from "@/utils/supabaseClients/client"

type RoomType = "collaborative" | "presentation"

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [roomId, setRoomId] = useState<string>("")
  const [isValidated, setIsValidated] = useState(false)
  const [roomType, setRoomType] = useState<RoomType | null>(null)

  useEffect(() => {
    const validateAndRedirect = async () => {
      const resolvedParams = await params
      const currentRoomId = resolvedParams.roomId
      setRoomId(currentRoomId)

      // Fetch room type from Supabase
      const supabase = createClient()
      const { data: roomData, error } = await supabase
        .from('w3s_rooms')
        .select('room_type')
        .eq('room_id', currentRoomId)
        .single()

      if (error) {
        console.error('Error fetching room type:', error)
        // Default to collaborative if we can't fetch
        setRoomType('collaborative')
      } else {
        setRoomType(roomData.room_type as RoomType)
      }

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
  if (!isValidated || !roomId || !roomType) {
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

  const initialSettings = {
    video: videoEnabled,
    audio: audioEnabled,
  }

  // Render different room components based on room type
  // Both wrapped with ReactTogether for shared state (needed for chat and cursors)
  return (
    <ClientReactTogetherWrapper>
      {roomType === "collaborative" ? (
        <CollaborativeRoom
          roomId={roomId}
          participantName={participantName}
          initialSettings={initialSettings}
        />
      ) : (
        <PresentationRoom
          roomId={roomId}
          participantName={participantName}
          initialSettings={initialSettings}
        />
      )}
    </ClientReactTogetherWrapper>
  )
}
