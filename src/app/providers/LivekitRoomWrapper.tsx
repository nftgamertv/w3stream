'use client'

import React, { useState, useEffect } from 'react'
import { LiveKitRoom } from "@livekit/components-react"
import { LIVEKIT_CONFIG } from "@/lib/livekit-config"
import "@livekit/components-styles"

interface LivekitRoomWrapperProps {
  children: React.ReactNode
  roomId: string
  participantName?: string
}

export default function LivekitRoomWrapper({
  children,
  roomId,
  participantName = "User"
}: LivekitRoomWrapperProps) {
  const [token, setToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Fetch token from the API
        const response = await fetch('/api/livekit-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: roomId,
            participantName: participantName,
            role: 'guest',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch token')
        }

        const data = await response.json()
        setToken(data.token)
      } catch (err) {
        console.error('Error fetching LiveKit token:', err)
        setError(err instanceof Error ? err.message : 'Failed to connect to LiveKit')
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId) {
      fetchToken()
    }
  }, [roomId, participantName])

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Connecting to LiveKit...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">LiveKit Connection Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_CONFIG.wsUrl}
      connect={true}
      video={false}
      audio={false}
      className="h-full w-full"
      options={{
        // Room connection options can be configured here if needed
      }}
    >
      {children}
    </LiveKitRoom>
  )
}