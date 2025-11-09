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
    error: "",
    tokenFetched: false
  })

  // Fetch token on mount
  useMount(() => {
    const fetchToken = async () => {
      // Prevent duplicate token fetches (React Strict Mode double-mount)
      if (state$.tokenFetched.peek()) {
        console.log('[LivekitRoomWrapper] Token already fetched, skipping')
        return
      }

      try {
        state$.isLoading.set(true)
        state$.error.set("")

        console.log('[LivekitRoomWrapper] Fetching token for roomId:', roomId, 'participantName:', participantName)

        // Generate stable participant ID for this browser session
        // Use a global participant ID that persists across all rooms
        let participantId = sessionStorage.getItem('participant-id')
        if (!participantId) {
          participantId = `${participantName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          sessionStorage.setItem('participant-id', participantId)
          console.log('[LivekitRoomWrapper] Created new participant ID:', participantId)
        } else {
          console.log('[LivekitRoomWrapper] Using existing participant ID:', participantId)
        }

        // Check if user should be host (from URL params)
        const urlParams = new URLSearchParams(window.location.search)
        const claimHost = urlParams.get("role") === "host" || urlParams.get("creator") === "1" || urlParams.get("host") === "1"

        console.log('[LivekitRoomWrapper] URL params:', Object.fromEntries(urlParams))
        console.log('[LivekitRoomWrapper] claimHost:', claimHost)
        console.log('[LivekitRoomWrapper] participantId:', participantId)

        // Fetch token from the API using the correct endpoint
        const tokenUrl = `/api/token?roomName=${encodeURIComponent(roomId)}&participantName=${encodeURIComponent(participantName)}&participantId=${encodeURIComponent(participantId)}${claimHost ? "&creator=1" : ""}`
        console.log('[LivekitRoomWrapper] Token URL:', tokenUrl)

        const response = await fetch(tokenUrl, {
          method: 'GET',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch token')
        }

        const data = await response.json()
        state$.token.set(data.token)
        state$.tokenFetched.set(true)
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

        // Check if already connected to prevent duplicate connections
        if (room.state === 'connected' || room.state === 'connecting') {
          console.log('[LivekitRoomWrapper] Already connected/connecting, skipping connection. State:', room.state)
          return
        }

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