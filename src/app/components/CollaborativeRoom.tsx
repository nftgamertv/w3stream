"use client"

import { Cursors, useNicknames } from "react-together"
import { useEffect, useLayoutEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

import {
  LiveKitRoom,
  ControlBar,
  useRoomContext, // now actually used, but only INSIDE LiveKitRoom
} from "@livekit/components-react"
import "@livekit/components-styles"

import { LIVEKIT_CONFIG } from "@/lib/livekit-config"
import { RoomHeader } from "@/components/RoomHeader"
import { ChatDrawer } from "@/components/ChatDrawer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import SVGEditor from "./SvgEditor"
import { AIPrompt } from "@/components/AIPrompt"

interface CollaborativeRoomProps {
  roomId: string
  participantName: string
  initialSettings: { video: boolean; audio: boolean }
  enableAIPrompt?: boolean
  enableSVGEditor?: boolean
  svgEditorUrl?: string
}

/** Renders children only once the LiveKit Room context exists. */
function LiveKitReady({ children }: { children: React.ReactNode }) {
  const room = useRoomContext() // SAFE: this component is rendered as a child of <LiveKitRoom>
  // If you want to wait for connection state, you can gate on room?.state too.
  if (!room) return null
  return <>{children}</>
}

function CollaborativeRoomContent({
  roomId,
  participantName,
  enableAIPrompt = false,
  enableSVGEditor = false,
  svgEditorUrl
}: {
  roomId: string
  participantName: string
  enableAIPrompt?: boolean
  enableSVGEditor?: boolean
  svgEditorUrl?: string
}) {
  const [, setNickname] = useNicknames()

  // Default SVG URL when using the editor without AI prompt
  const defaultSvgUrl =
    "https://vgwzhgureposlvnxoiaj.supabase.co/storage/v1/object/public/svgs/generated/w3s.svg"

  const [svgUrl, setSvgUrl] = useState<string | null>(
    svgEditorUrl || (enableSVGEditor && !enableAIPrompt ? defaultSvgUrl : null)
  )

  useLayoutEffect(() => {
    if (participantName && participantName.trim()) {
      setNickname(participantName.trim())
    }
  }, [participantName, setNickname])

  const handleSvgGenerated = useCallback((url: string) => {
    setSvgUrl(url)
  }, [])

  return (
    <div className="flex flex-col h-full relative">
      <Cursors />

      {enableAIPrompt && (
        <AIPrompt
          user={participantName}
          promptCount={0}
          prompts={0}
          onSvgGenerated={handleSvgGenerated}
        />
      )}

      <RoomHeader roomId={roomId} layout="grid" onLayoutChange={() => {}} />

      <div className="flex-1 overflow-hidden flex relative bg-gradient-to-br from-blue-950/20 to-purple-950/20">
        <div className="max-h-1/2">
          {enableSVGEditor && svgUrl && <SVGEditor svgurl={svgUrl} />}
        </div>
      </div>

      <div className="border-t border-border/30 bg-background/95 backdrop-blur-sm">
        <div className="flex-1 flex items-center justify-center py-2">
          {/* ControlBar calls useRoomContext internally, so keep it under LiveKitReady */}
          <ControlBar variation="verbose" />
        </div>
      </div>

      <ChatDrawer participantName={participantName} isHost={false} />
    </div>
  )
}

export function CollaborativeRoom({
  roomId,
  participantName,
  initialSettings,
  enableAIPrompt = false,
  enableSVGEditor = false,
  svgEditorUrl
}: CollaborativeRoomProps) {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [missingVars, setMissingVars] = useState<string[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true)
        setError("")

        const sp =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams()
        const claimHost =
          sp.get("role") === "host" || sp.get("creator") === "1" || sp.get("host") === "1"

        // Stable participant id per-room across refreshes
        let participantId = sessionStorage.getItem(`participant-id-${roomId}`)
        if (!participantId) {
          participantId = `${participantName}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`
          sessionStorage.setItem(`participant-id-${roomId}`, participantId)
        }

        const tokenUrl = `${LIVEKIT_CONFIG.tokenEndpoint}?roomName=${encodeURIComponent(
          roomId
        )}&participantName=${encodeURIComponent(
          participantName
        )}&participantId=${encodeURIComponent(participantId)}${
          claimHost ? "&creator=1" : ""
        }`

        const r = await fetch(tokenUrl)
        if (!r.ok) {
          const e = await r.json().catch(() => ({}))
          if (e.missing) setMissingVars(e.missing)
          throw new Error(e.error || "Failed to get access token")
        }
        const { token } = await r.json()
        setToken(token)
      } catch (e: any) {
        console.error("[CollaborativeRoom] Error fetching token:", e)
        setError(e?.message ?? "Failed to connect to room")
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId && participantName) run()
  }, [roomId, participantName])

  const handleDisconnect = () => router.push("/")

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to collaborative room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Failed</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">{error}</p>
              {missingVars.length > 0 && (
                <div className="mt-4 p-3 bg-background/50 rounded-md">
                  <p className="font-semibold mb-2">Missing environment variables:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {missingVars.map((v) => (
                      <li key={v} className="font-mono text-sm">
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/")} className="w-full">
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  if (!token) return null

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <LiveKitRoom
        token={token}
        serverUrl={LIVEKIT_CONFIG.wsUrl}
        connect
        video={initialSettings.video}
        audio={initialSettings.audio}
        onDisconnected={handleDisconnect}
        className="flex-1 flex flex-col"
      >
        {/* Nothing that uses LiveKit hooks renders until context exists */}
        <LiveKitReady>
          <CollaborativeRoomContent
            roomId={roomId}
            participantName={participantName}
            enableAIPrompt={enableAIPrompt}
            enableSVGEditor={enableSVGEditor}
            svgEditorUrl={svgEditorUrl}
          />
        </LiveKitReady>
      </LiveKitRoom>
    </div>
  )
}
