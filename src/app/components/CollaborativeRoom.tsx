"use client"
import { Cursors } from "react-together"
import { useEffect, useLayoutEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useNicknames } from "react-together"
import {
  LiveKitRoom,
  ControlBar,
  useRoomContext,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { LIVEKIT_CONFIG } from "@/lib/livekit-config"
import { RoomHeader } from "@/components/RoomHeader"
import { ChatDrawer } from "@/components/ChatDrawer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import SVGEditor from "./SvgEditor"
import  {AIPrompt} from "@/components/AIPrompt"
// TODO: This component will eventually be fully customizable via Puck
// The layout structure below is set up to be easily converted to Puck components

interface CollaborativeRoomProps {
  roomId: string
  participantName: string
  initialSettings: { video: boolean; audio: boolean }
  enableAIPrompt?: boolean
  svgEditorUrl?: string
}

function CollaborativeRoomContent({
  roomId,
  participantName,
  enableAIPrompt = false,
  svgEditorUrl
}: {
  roomId: string;
  participantName: string;
  enableAIPrompt?: boolean;
  svgEditorUrl?: string;
}) {
  const [, setNickname] = useNicknames()
  // Default SVG URL if none provided and AI prompt is disabled
  const defaultSvgUrl = "https://vgwzhgureposlvnxoiaj.supabase.co/storage/v1/object/public/svgs/generated/w3s.svg"
  const [svgUrl, setSvgUrl] = useState<string | null>(
    svgEditorUrl || (!enableAIPrompt ? defaultSvgUrl : null)
  )

  // Use useLayoutEffect to set nickname synchronously before paint
  // This ensures the nickname is set before Cursors component fully initializes
  useLayoutEffect(() => {
    if (participantName && participantName.trim()) {
      console.log("[CollaborativeRoom] Setting nickname to:", participantName)
      setNickname(participantName.trim())
    }
  }, [participantName, setNickname])

  // Handle SVG generation callback
  const handleSvgGenerated = useCallback((url: string) => {
    console.log("[CollaborativeRoom] SVG generated:", url)
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
      {/* TODO: Puck Component - HeaderSection */}
      <RoomHeader roomId={roomId} layout="grid" onLayoutChange={() => {}} />

      {/* TODO: Puck Component - CollaborativeWorkspace */}
      <div className="flex-1 overflow-hidden flex relative bg-gradient-to-br from-blue-950/20 to-purple-950/20">

        {/* Main collaborative area - for now, simple placeholder */}
        <div className="  max-h-1/2">
             {svgUrl && <SVGEditor svgurl={svgUrl} />}
          {/* <div className="text-center max-w-2xl p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Collaborative Workspace</h2>
            <p className="text-gray-400 text-lg mb-6">
              This is your collaborative room with shared cursors and real-time interaction.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-cyan-400 text-sm font-medium">Live collaboration enabled</span>
            </div>
          </div> */}
        </div>
      </div>

      {/* TODO: Puck Component - ControlBarSection */}
      <div className="border-t border-border/30 bg-background/95 backdrop-blur-sm">
        <div className="flex-1 flex items-center justify-center py-2">
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
        const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()
        const claimHost = sp.get("role") === "host" || sp.get("creator") === "1" || sp.get("host") === "1"

        // Generate a unique participant ID (stored in sessionStorage to persist across refreshes)
        let participantId = sessionStorage.getItem(`participant-id-${roomId}`)
        if (!participantId) {
          participantId = `${participantName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          sessionStorage.setItem(`participant-id-${roomId}`, participantId)
        }

        const tokenUrl = `${LIVEKIT_CONFIG.tokenEndpoint}?roomName=${encodeURIComponent(roomId)}&participantName=${encodeURIComponent(participantName)}&participantId=${encodeURIComponent(participantId)}${claimHost ? "&creator=1" : ""}`
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
                    {missingVars.map((v) => (<li key={v} className="font-mono text-sm">{v}</li>))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/")} className="w-full">Return Home</Button>
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
        <CollaborativeRoomContent
          roomId={roomId}
          participantName={participantName}
          enableAIPrompt={enableAIPrompt}
          svgEditorUrl={svgEditorUrl}
        />
      </LiveKitRoom>
    </div>
  )
}
