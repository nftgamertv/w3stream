"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import {
  LiveKitRoom,
  ParticipantTile,
  ControlBar,
  useTracks,
  useLocalParticipant,
  useRoomContext,
  useParticipants,
  AudioTrack,
} from "@livekit/components-react"
import {
  Track,
  type LocalParticipant,
  type RemoteParticipant,
  RoomEvent,
  ParticipantEvent,
  type RemoteTrackPublication,
} from "livekit-client"
import type { TrackReference } from "@livekit/components-react"
import "@livekit/components-styles"
import { LIVEKIT_CONFIG } from "@/lib/livekit-config"
import { RoomHeader } from "@/components/ui/room-header"
import { BackroomPanel } from "@/components/ui/backroom-panel"
import { ChatPanel } from "@/components/ui/chat-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Users, UserMinus } from "lucide-react"
import StageSubscriptionManager from "@/components/StageSubscriptionManager"

interface MeetingRoomProps {
  roomId: string
  participantName: string
  initialSettings: { video: boolean; audio: boolean }
}

type LayoutType = "grid" | "sidebar" | "spotlight"

function isOnStage(participant: LocalParticipant | RemoteParticipant): boolean {
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
  return metadata.onStage === true
}

function isHost(participant: LocalParticipant | RemoteParticipant): boolean {
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
  return metadata.isHost === true
}

interface HostControlsContextType {
  isHost: boolean
  removeFromStage: (participant: RemoteParticipant) => Promise<void>
}

const HostControlsContext = createContext<HostControlsContextType | null>(null)

function useHostControls() {
  const context = useContext(HostControlsContext)
  return context
}

function hasScreenShare(p: LocalParticipant | RemoteParticipant) {
  const pub = p.getTrackPublication(Track.Source.ScreenShare) as RemoteTrackPublication | undefined
  return !!pub && pub.isEnabled && pub.isSubscribed
}

function hasCamera(p: LocalParticipant | RemoteParticipant) {
  const pub = p.getTrackPublication(Track.Source.Camera) as RemoteTrackPublication | undefined
  return !!pub && pub.isEnabled && pub.isSubscribed
}

function getPreferredTrackRef(p: LocalParticipant | RemoteParticipant): TrackReference {
  const scr = p.getTrackPublication(Track.Source.ScreenShare) as RemoteTrackPublication | undefined
  if (scr?.isSubscribed && scr?.track) {
    return { participant: p, source: Track.Source.ScreenShare, publication: scr }
  }
  const cam = p.getTrackPublication(Track.Source.Camera) as RemoteTrackPublication | undefined
  return { participant: p, source: Track.Source.Camera, publication: cam }
}

interface TileWithControlsProps {
  participant: LocalParticipant | RemoteParticipant
}

function TileWithControls({ participant }: TileWithControlsProps) {
  const hostControls = useHostControls()
  const room = useRoomContext()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    if (!hostControls || participant.identity === room.localParticipant.identity) return
    setIsRemoving(true)
    try {
      await hostControls.removeFromStage(participant as RemoteParticipant)
    } finally {
      setIsRemoving(false)
    }
  }

  const isLocal = participant.identity === room.localParticipant.identity
  const showRemoveButton = hostControls?.isHost && !isLocal

  const trackRef = getPreferredTrackRef(participant)

  return (
    <div className="relative w-full h-full group">
      <ParticipantTile trackRef={trackRef} />
      {showRemoveButton && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemove}
            disabled={isRemoving}
            className="h-8 px-3 gap-1.5 text-xs shadow-lg"
          >
            <UserMinus className="w-3.5 h-3.5" />
            {isRemoving ? "..." : "Remove"}
          </Button>
        </div>
      )}
    </div>
  )
}

function ConstrainedGridLayout() {
  const participants = useParticipants()
  const stagePeople = participants.filter((p) => isOnStage(p))

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {stagePeople.map((p) => (
            <div key={p.identity} className="aspect-video max-h-[400px]">
              <TileWithControls participant={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SidebarLayoutView() {
  const participants = useParticipants()
  const stagePeople = participants.filter((p) => isOnStage(p))
  const screenSharer = stagePeople.find((p) => hasScreenShare(p))
  const cameraPeople = stagePeople.filter((p) => hasCamera(p))

  if (screenSharer) {
    return (
      <div className="flex h-full gap-4 p-4">
        <div className="w-64 flex flex-col gap-3 overflow-y-auto">
          {cameraPeople
            .filter((p) => p.identity !== screenSharer.identity)
            .map((p) => (
              <div key={p.identity} className="aspect-video flex-shrink-0">
                <TileWithControls participant={p} />
              </div>
            ))}
        </div>
        <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
          <div className="w-full h-full">
            <TileWithControls participant={screenSharer} />
          </div>
        </div>
      </div>
    )
  }

  const main = cameraPeople[0]
  const sidebar = cameraPeople.slice(1)

  return (
    <div className="flex h-full gap-4 p-4">
      {sidebar.length > 0 && (
        <div className="w-64 flex flex-col gap-3 overflow-y-auto">
          {sidebar.map((p) => (
            <div key={p.identity} className="aspect-video flex-shrink-0">
              <TileWithControls participant={p} />
            </div>
          ))}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center">
        {main && (
          <div className="w-full h-full max-w-5xl max-h-[800px]">
            <TileWithControls participant={main} />
          </div>
        )}
      </div>
    </div>
  )
}

function SpotlightLayoutView() {
  const participants = useParticipants()
  const stagePeople = participants.filter((p) => isOnStage(p))

  const screenSharer = stagePeople.find((p) => hasScreenShare(p))
  const cameraPeople = stagePeople.filter((p) => hasCamera(p))

  const main = screenSharer ?? cameraPeople[0]
  const carousel = screenSharer ? cameraPeople : cameraPeople.slice(1)

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
        {main && (
          <div className="w-full h-full">
            <TileWithControls participant={main} />
          </div>
        )}
      </div>
      {carousel.length > 0 && (
        <div className="h-32 flex gap-4 overflow-x-auto pb-2">
          {carousel.map((p) => (
            <div key={p.identity} className="w-48 flex-shrink-0">
              <TileWithControls participant={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VideoConferenceLayout({
  layout,
  onLayoutChange,
}: { layout: LayoutType; onLayoutChange: (layout: LayoutType) => void }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )
  const hasScreenShare = tracks.some((t) => t.source === Track.Source.ScreenShare)

  useEffect(() => {
    if (hasScreenShare && layout === "grid") {
      onLayoutChange("sidebar")
    }
  }, [hasScreenShare, layout, onLayoutChange])

  switch (layout) {
    case "grid":
      return <ConstrainedGridLayout />
    case "sidebar":
      return <SidebarLayoutView />
    case "spotlight":
      return <SpotlightLayoutView />
    default:
      return <ConstrainedGridLayout />
  }
}

function SelectiveAudioRenderer() {
  const tracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }], { onlySubscribed: false })
  const { localParticipant } = useLocalParticipant()

  return (
    <>
      {tracks
        .filter((trackRef): trackRef is TrackReference => "publication" in trackRef && !!trackRef.publication)
        .map((trackRef) => {
          const participant = trackRef.participant
          const isLocalParticipant = participant.identity === localParticipant.identity
          const participantOnStage = isOnStage(participant as LocalParticipant | RemoteParticipant)
          const shouldPlayAudio = participantOnStage
          if (!shouldPlayAudio) return null
          return (
            <AudioTrack key={trackRef.participant.identity} trackRef={trackRef} muted={!shouldPlayAudio} volume={1.0} />
          )
        })}
    </>
  )
}

function MetadataListener() {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()

  useEffect(() => {
    const handleMetadataChanged = (metadata: string | undefined, participant: RemoteParticipant | LocalParticipant) => {
      if (participant.identity === localParticipant.identity) {
        const parsedMetadata = metadata ? JSON.parse(metadata) : {}
        if (parsedMetadata.onStage) {
          window.dispatchEvent(new CustomEvent("stage-status-changed", { detail: { onStage: true } }))
        } else if (parsedMetadata.onStage === false) {
          window.dispatchEvent(new CustomEvent("stage-status-changed", { detail: { onStage: false } }))
        }
      }
    }

    room.remoteParticipants.forEach((participant) => {
      participant.on(ParticipantEvent.ParticipantMetadataChanged, (metadata) => {
        handleMetadataChanged(metadata, participant)
      })
    })

    localParticipant.on(ParticipantEvent.ParticipantMetadataChanged, (metadata) => {
      handleMetadataChanged(metadata, localParticipant)
    })

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      participant.on(ParticipantEvent.ParticipantMetadataChanged, (metadata) => {
        handleMetadataChanged(metadata, participant)
      })
    })

    return () => {
      room.remoteParticipants.forEach((participant) => {
        participant.off(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
      })
      localParticipant.off(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
      room.off(RoomEvent.ParticipantConnected, () => {})
    }
  }, [room, localParticipant])

  return null
}

interface RoomContentProps {
  roomId: string
  participantName: string
  layout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  isUserHost: boolean
}

function RoomContent({ roomId, participantName, layout, onLayoutChange, isUserHost }: RoomContentProps) {
  const room = useRoomContext()

  const removeFromStage = async (participant: RemoteParticipant) => {
    try {
      const currentMetadata = participant.metadata ? JSON.parse(participant.metadata) : {}
      const newMetadata = { ...currentMetadata, onStage: false }

      const response = await fetch("/api/participant/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: participant.identity,
          metadata: newMetadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update participant metadata")
      }
    } catch (error) {
      console.error("[v0] Error removing participant from stage:", error)
    }
  }

  const hostControlsValue: HostControlsContextType = {
    isHost: isUserHost,
    removeFromStage,
  }

  return (
    <HostControlsContext.Provider value={hostControlsValue}>
      <RoomHeader roomId={roomId} layout={layout} onLayoutChange={onLayoutChange} />
      <div className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 relative z-0 pointer-events-auto">
          <VideoConferenceLayout layout={layout} onLayoutChange={onLayoutChange} />
          {!isUserHost && <WaitingRoomOverlay />}
        </div>
      </div>
      <div className="border-t border-border/30 bg-background/95 backdrop-blur-sm relative z-40 pointer-events-auto flex items-stretch">
        {isUserHost && <BackroomPanel />}
        <div className="flex-1 flex items-center justify-center">
          <ControlBar variation="verbose" />
        </div>
      </div>
      <StageSubscriptionManager />
      <SelectiveAudioRenderer />
      <MetadataListener />
      <ChatPanel participantName={participantName} isHost={isUserHost} />
    </HostControlsContext.Provider>
  )
}

function WaitingRoomOverlay() {
  const { localParticipant } = useLocalParticipant()
  const [isWaiting, setIsWaiting] = useState(false)

  useEffect(() => {
    const checkStageStatus = () => {
      const metadata = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
      const onStage = metadata.onStage === true
      setIsWaiting(!onStage)
    }

    checkStageStatus()

    const handleMetadataChanged = () => {
      checkStageStatus()
    }

    localParticipant.on(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)

    return () => {
      localParticipant.off(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
    }
  }, [localParticipant])

  if (!isWaiting) {
    return null
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 pointer-events-none">
      <div className="bg-background border-2 border-primary/50 rounded-lg p-8 max-w-md text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Waiting to Join</h3>
        <p className="text-muted-foreground mb-4">
          You're in the backstage area. The host will add you to the stage shortly.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Waiting for host...</span>
        </div>
      </div>
    </div>
  )
}

export function MeetingRoom({ roomId, participantName, initialSettings }: MeetingRoomProps) {
  const router = useRouter()
  const [token, setToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [layout, setLayout] = useState<LayoutType>("grid")
  const [isUserHost, setIsUserHost] = useState(false)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true)
        setError("")

        const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()
        const claimHost = sp.get("role") === "host" || sp.get("creator") === "1" || sp.get("host") === "1"

        if (!claimHost) {
          const checkHostResponse = await fetch(
            `${LIVEKIT_CONFIG.tokenEndpoint}?roomName=${encodeURIComponent(
              roomId,
            )}&participantName=${encodeURIComponent(participantName)}&checkHost=true`,
          )
          const hostData = await checkHostResponse.json()
          setIsUserHost(hostData.isHost || false)
        } else {
          setIsUserHost(true)
        }

        const tokenUrl = `${LIVEKIT_CONFIG.tokenEndpoint}?roomName=${encodeURIComponent(
          roomId,
        )}&participantName=${encodeURIComponent(participantName)}${claimHost ? "&creator=1" : ""}`

        const response = await fetch(tokenUrl)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (errorData.missing) setMissingVars(errorData.missing)
          throw new Error(errorData.error || "Failed to get access token")
        }

        const data = await response.json()
        setToken(data.token)
      } catch (err) {
        console.error("[v0] Error fetching token:", err)
        setError(err instanceof Error ? err.message : "Failed to connect to room")
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId && participantName) fetchToken()
  }, [roomId, participantName])

  const handleDisconnect = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to room...</p>
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
                    {missingVars.map((varName) => (
                      <li key={varName} className="font-mono text-sm">
                        {varName}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm">Please add these environment variables in your project settings:</p>
                  <div className="mt-2 p-2 bg-background rounded text-xs font-mono">
                    <div>LIVEKIT_API_KEY=your_api_key</div>
                    <div>LIVEKIT_API_SECRET=your_api_secret</div>
                    <div>NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud</div>
                  </div>
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

  if (!token) {
    return null
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <LiveKitRoom
        token={token}
        serverUrl={LIVEKIT_CONFIG.wsUrl}
        connect={true}
        video={initialSettings.video}
        audio={initialSettings.audio}
        onDisconnected={handleDisconnect}
        className="flex-1 flex flex-col"
      >
        <RoomContent
          roomId={roomId}
          participantName={participantName}
          layout={layout}
          onLayoutChange={setLayout}
          isUserHost={isUserHost}
        />
      </LiveKitRoom>
    </div>
  )
}
