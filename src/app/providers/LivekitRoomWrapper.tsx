'use client'

import React, { useState, useEffect } from 'react'
import { RoomContext } from "@livekit/components-react"
import { Room } from "livekit-client"
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
  const [room] = useState(() => new Room({}))
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

  // Handle room connection lifecycle
  useEffect(() => {
    if (!token || error) return

    const connectRoom = async () => {
      try {
        await room.connect(LIVEKIT_CONFIG.wsUrl, token)
        console.log('Connected to LiveKit room:', roomId)
      } catch (err) {
        console.error('Error connecting to room:', err)
        setError(err instanceof Error ? err.message : 'Failed to connect to room')
      }
    }

    connectRoom()

    return () => {
      room.disconnect()
    }
  }, [room, token, error, roomId])

  // Always render RoomContext.Provider, even during loading/error states
  // This ensures RoomContext is available for Puck components
  return (
    <RoomContext.Provider value={room}>
      <div className="h-full w-full">
        {error && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">LiveKit Connection Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) }
  {children}
      </div>
    </RoomContext.Provider>
  )
}