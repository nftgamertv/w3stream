"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { PreJoin, type PreJoinSettings } from "@/components/PreJoinScreen"
import { createClient } from "@/utils/supabaseClients/client"

export default function PreJoinPage({ params }: { params: Promise<{ roomId: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [roomId, setRoomId] = useState<string>("")
  const [initialName, setInitialName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params
      setRoomId(resolvedParams.roomId)

      // Get user from Supabase OAuth
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()

      if (!error && data?.user) {
        // Use full_name from user metadata (OAuth)
        const fullName = data.user.user_metadata?.full_name ||
                         data.user.user_metadata?.name ||
                         data.user.email?.split('@')[0] ||
                         ""
        setInitialName(fullName)
      }

      setIsLoading(false)
    }

    init()
  }, [params])

  const handleJoin = (settings: PreJoinSettings) => {
    // Check if user is the room creator (host)
    const isHost = true

    // Build query params for the room
    const queryParams = new URLSearchParams({
      name: settings.name,
      video: settings.videoEnabled.toString(),
      audio: settings.audioEnabled.toString(),
    })

    // Add device IDs to query params if they exist
    if (settings.audioDeviceId) {
      queryParams.set("audioDeviceId", settings.audioDeviceId)
    }
    if (settings.videoDeviceId) {
      queryParams.set("videoDeviceId", settings.videoDeviceId)
    }
    if (settings.audioOutputDeviceId) {
      queryParams.set("audioOutputDeviceId", settings.audioOutputDeviceId)
    }

    // Add role=host if this is the creator
    if (isHost) {
      queryParams.set("role", "host")
    }

    // Redirect to the room with settings
    router.push(`/room/${roomId}?${queryParams.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return <PreJoin onJoin={handleJoin} initialName={initialName} />
}
