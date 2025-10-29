"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ReactTogether } from "react-together"
import { usePathname } from "next/navigation"

// Global singleton to prevent duplicate connections across remounts
const globalConnectionTracker = {
  activeSession: null as string | null,
  mountCount: 0
}

export function ReactTogetherProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)

  // Extract room ID from pathname if we're in a room
  const roomMatch = pathname.match(/\/room\/([^/]+)/)
  const sessionId = roomMatch ? roomMatch[1] : "lobby"

  const appId = process.env.NEXT_PUBLIC_MULTISYNQ_APP_ID
  const apiKey = process.env.NEXT_PUBLIC_MULTISYNQ_API_KEY

  useEffect(() => {
    globalConnectionTracker.mountCount++
    const currentMount = globalConnectionTracker.mountCount

    console.log('[ReactTogether] Mount attempt', currentMount, 'for session:', sessionId)

    // Only allow first mount to render ReactTogether
    if (globalConnectionTracker.activeSession === sessionId) {
      console.log('[ReactTogether] Session already active, skipping duplicate mount')
      setShouldRender(false)
      return
    }

    globalConnectionTracker.activeSession = sessionId
    setShouldRender(true)
    console.log('[ReactTogether] Activating session:', sessionId)

    return () => {
      console.log('[ReactTogether] Unmount for session:', sessionId)
      // Only clear if this was the active session
      if (globalConnectionTracker.activeSession === sessionId) {
        globalConnectionTracker.activeSession = null
      }
    }
  }, [sessionId])

  if (!appId || !apiKey) {
    console.error("[v0] ReactTogether: Missing required environment variables!", {
      hasAppId: !!appId,
      hasApiKey: !!apiKey,
    })
    return <>{children}</>
  }

  // Don't render ReactTogether for duplicate mounts
  if (!shouldRender) {
    return <>{children}</>
  }

  return (
    <ReactTogether
      sessionIgnoresUrl={true}
      sessionParams={{
        apiKey: apiKey,
        appId: appId,
        name: sessionId,
        password: sessionId,

      }}
    >
      {children}
    </ReactTogether>
  )
}
