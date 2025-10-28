'use client'

import React, { useState } from 'react'
import { RoomContext } from "@livekit/components-react"
import { Room } from "livekit-client"
import { LIVEKIT_CONFIG } from "@/lib/livekit-config"
import "@livekit/components-styles"
import { observable } from "@legendapp/state"
import { useObservable, useSelector, useMount, useObserve } from "@legendapp/state/react"

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
  const state$ = useObservable({
    token: "",
    isLoading: true,
    error: ""
  })

  // Fetch token on mount
  useMount(() => {
    const fetchToken = async () => {
      try {
        state$.isLoading.set(true)
        state$.error.set("")

        console.log('[LivekitRoomWrapper] Fetching token for roomId:', roomId, 'participantName:', participantName)

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
        state$.token.set(data.token)
      } catch (err) {
        console.error('Error fetching LiveKit token:', err)
        state$.error.set(err instanceof Error ? err.message : 'Failed to connect to LiveKit')
      } finally {
        state$.isLoading.set(false)
      }
    }

    if (roomId) {
      fetchToken()
    }
  })

  // Handle room connection lifecycle - observe token changes
  useObserve(() => {
    const token = state$.token.get()
    const error = state$.error.get()

    console.log('[LivekitRoomWrapper] Connection observer running. Token:', !!token, 'Error:', error)

    if (!token || error) {
      console.log('[LivekitRoomWrapper] Skipping connection - no token or has error')
      return
    }

    let isSubscribed = true

    const connectRoom = async () => {
      try {
        if (!isSubscribed) return
        console.log('[LivekitRoomWrapper] Attempting to connect to LiveKit...')
        await room.connect(LIVEKIT_CONFIG.wsUrl, token)
        if (!isSubscribed) return
        console.log('[LivekitRoomWrapper] Connected to LiveKit room:', roomId)
        console.log('[LivekitRoomWrapper] Room.name after connect:', room.name)
        console.log('[LivekitRoomWrapper] Room.state:', room.state)
      } catch (err) {
        console.error('[LivekitRoomWrapper] Error connecting to room:', err)
        if (isSubscribed) {
          state$.error.set(err instanceof Error ? err.message : 'Failed to connect to room')
        }
      }
    }

    connectRoom()

    return () => {
      isSubscribed = false
      console.log('[LivekitRoomWrapper] Disconnecting from room')
      room.disconnect()
    }
  })

  // Get reactive error value for rendering
  const errorMessage = useSelector(() => state$.error.get())

  // Always render RoomContext.Provider, even during loading/error states
  // This ensures RoomContext is available for Puck components
  return (
    <RoomContext.Provider value={room}>
      <div className="h-full w-full">
        {errorMessage && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">LiveKit Connection Error</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          </div>
        ) }
  {children}
      </div>
    </RoomContext.Provider>
  )
}