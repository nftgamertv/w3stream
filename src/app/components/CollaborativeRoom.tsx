"use client"

import { Cursors, useNicknames } from "react-together"
import { useEffect, useLayoutEffect, useState, useCallback, createContext, useContext } from "react"
import { useRouter } from "next/navigation"

import {
  LiveKitRoom,
  ParticipantTile,
  useRoomContext, // now actually used, but only INSIDE LiveKitRoom
  useParticipants,
  useLocalParticipant,
  useTracks,
  AudioTrack,
} from "@livekit/components-react"
import "@livekit/components-styles"

import { LIVEKIT_CONFIG } from "@/lib/livekit-config"
import { RoomHeader } from "@/components/RoomHeader"
import { ChatDrawer } from "@/components/ChatDrawer"
import { BackroomPanel } from "@/components/BackroomPanel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Users, UserMinus } from "lucide-react"
import { RoomShell } from "@/components/livekit-puck/RoomShell"
import { ControlBar as MediaControlBar } from "@/components/livekit-puck/ControlBar"
import { SVGEditorComponent } from "@/components/livekit-puck/SVGEditor"
import { AIPrompt } from "@/components/AIPrompt"
import StageSubscriptionManager from "@/components/StageSubscriptionManager"
import { Track, type LocalParticipant, type RemoteParticipant, ParticipantEvent, RoomEvent, type RemoteTrackPublication } from "livekit-client"
import type { TrackReference } from "@livekit/components-react"

interface CollaborativeRoomProps {
  roomId: string
  participantName: string
  initialSettings: { video: boolean; audio: boolean }
  enableAIPrompt?: boolean
  enableSVGEditor?: boolean
  svgEditorUrl?: string
}

type LayoutType = "grid" | "sidebar" | "spotlight"

interface HostControlsContextType {
  isHost: boolean
  removeFromStage: (participant: RemoteParticipant) => Promise<void>
}

const HostControlsContext = createContext<HostControlsContextType | null>(null)

function useHostControls() {
  return useContext(HostControlsContext)
}

function isOnStage(participant: LocalParticipant | RemoteParticipant): boolean {
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
  return metadata.onStage === true
}

function hasScreenShare(participant: LocalParticipant | RemoteParticipant) {
  const publication = participant.getTrackPublication(Track.Source.ScreenShare) as RemoteTrackPublication | undefined
  return !!publication && publication.isSubscribed && publication.isEnabled
}

function hasCamera(participant: LocalParticipant | RemoteParticipant) {
  const publication = participant.getTrackPublication(Track.Source.Camera) as RemoteTrackPublication | undefined
  return !!publication && publication.isSubscribed && publication.isEnabled
}

function getPreferredTrackRef(participant: LocalParticipant | RemoteParticipant): TrackReference {
  const screen = participant.getTrackPublication(Track.Source.ScreenShare) as RemoteTrackPublication | undefined
  if (screen?.isSubscribed && screen?.track) {
    return { participant, source: Track.Source.ScreenShare, publication: screen }
  }
  const camera = participant.getTrackPublication(Track.Source.Camera) as RemoteTrackPublication | undefined
  return { participant, source: Track.Source.Camera, publication: camera }
}

function TileWithControls({ participant }: { participant: LocalParticipant | RemoteParticipant }) {
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
  const showRemoveButton = !!hostControls?.isHost && !isLocal
  const trackRef = getPreferredTrackRef(participant)

  return (
    <div className="group relative h-full w-full">
      <ParticipantTile className="h-full w-full" trackRef={trackRef} />
      {showRemoveButton && (
        <div className="absolute right-2 top-2 z-20 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemove}
            disabled={isRemoving}
            className="h-8 gap-1.5 rounded-full px-3 text-xs shadow-lg"
          >
            <UserMinus className="h-3.5 w-3.5" />
            {isRemoving ? "..." : "Remove"}
          </Button>
        </div>
      )}
    </div>
  )
}

function EmptyStageState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/70">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
        <Users className="h-8 w-8 text-white/60" />
      </div>
      <div className="text-lg font-semibold">{title}</div>
      <p className="max-w-sm text-sm text-white/50">{subtitle}</p>
    </div>
  )
}

function CollaborativeStageLayout({ layout }: { layout: LayoutType }) {
  const participants = useParticipants()
  const stagePeople = participants.filter(isOnStage)
  const screenSharer = stagePeople.find(hasScreenShare)
  const cameraPeople = stagePeople.filter(hasCamera)
  const main = screenSharer ?? cameraPeople[0]
  const others = stagePeople.filter((p) => p.identity !== (main?.identity ?? ""))

  if (layout === "grid") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="grid w-full max-w-6xl auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stagePeople.length === 0 ? (
            <div className="col-span-full h-full min-h-[240px] rounded-3xl border border-dashed border-white/15 bg-black/30">
              <EmptyStageState
                title="Nobody on stage"
                subtitle="Promote participants from the backstage rail to bring them into the collaborative session."
              />
            </div>
          ) : (
            stagePeople.map((participant) => (
              <div
                key={participant.identity}
                className="aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-xl shadow-black/40"
              >
                <TileWithControls participant={participant} />
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  if (layout === "sidebar") {
    return (
      <div className="flex h-full gap-4 p-6">
        <div className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/35 shadow-2xl shadow-black/40">
          {main ? (
            <TileWithControls participant={main} />
          ) : (
            <EmptyStageState
              title="Stage is empty"
              subtitle="Add a participant from backstage to start collaborating."
            />
          )}
        </div>
        <div className="hidden w-64 flex-shrink-0 flex-col gap-3 overflow-y-auto rounded-3xl border border-white/10 bg-black/25 p-3 backdrop-blur-xl lg:flex">
          {others.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-white/50">
              No additional presenters
            </div>
          ) : (
            others.map((participant) => (
              <div
                key={participant.identity}
                className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/40"
              >
                <TileWithControls participant={participant} />
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // Spotlight layout
  const carousel = screenSharer ? cameraPeople : cameraPeople.slice(1)

  return (
    <div className="flex h-full flex-col gap-4 bg-gradient-to-br from-blue-950/30 to-purple-950/25 p-6">
      <div className="flex-1 overflow-hidden rounded-3xl border border-white/12 bg-black/35 shadow-2xl shadow-black/50">
        {main ? (
          <TileWithControls participant={main} />
        ) : (
          <EmptyStageState
            title="Waiting for presenters"
            subtitle="Promote someone from backstage or go on stage yourself to kick things off."
          />
        )}
      </div>
      {carousel.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {carousel.map((participant) => (
            <div
              key={participant.identity}
              className="w-48 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40"
            >
              <TileWithControls participant={participant} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SelectiveAudioRenderer() {
  const tracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }], { onlySubscribed: false })
  return (
    <>
      {tracks
        .filter((track): track is TrackReference => "publication" in track && !!track.publication)
        .map((track) =>
          isOnStage(track.participant as LocalParticipant | RemoteParticipant) ? (
            <AudioTrack key={track.participant.identity} trackRef={track} muted={false} volume={1} />
          ) : null,
        )}
    </>
  )
}

function NicknameInitializer({ participantName }: { participantName: string }) {
  const [, setNickname] = useNicknames()

  useLayoutEffect(() => {
    if (participantName && participantName.trim()) {
      setNickname(participantName.trim())
    }
  }, [participantName, setNickname])

  return null
}

function MetadataListener() {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()

  useEffect(() => {
    const handle = (metadata: string | undefined, who: RemoteParticipant | LocalParticipant) => {
      if (who.identity !== localParticipant.identity) return
      const md = metadata ? JSON.parse(metadata) : {}
      window.dispatchEvent(new CustomEvent("stage-status-changed", { detail: { onStage: md.onStage === true } }))
    }

    room.remoteParticipants.forEach((participant) =>
      participant.on(ParticipantEvent.ParticipantMetadataChanged, (md) => handle(md, participant)),
    )
    localParticipant.on(ParticipantEvent.ParticipantMetadataChanged, (md) => handle(md, localParticipant))
    room.on(RoomEvent.ParticipantConnected, (participant) =>
      participant.on(ParticipantEvent.ParticipantMetadataChanged, (md) => handle(md, participant)),
    )

    return () => {
      room.remoteParticipants.forEach((participant) =>
        participant.off(ParticipantEvent.ParticipantMetadataChanged, handle as any),
      )
      localParticipant.off(ParticipantEvent.ParticipantMetadataChanged, handle as any)
      room.off(RoomEvent.ParticipantConnected, () => {})
    }
  }, [room, localParticipant])

  return null
}

function SelfStageToggle() {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const hostControls = useHostControls()
  const [pending, setPending] = useState(false)

  if (!hostControls?.isHost) return null

  const metadata = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
  const onStage = metadata.onStage === true

  const setSelfStage = async (nextOnStage: boolean) => {
    try {
      setPending(true)
      const newMetadata = { ...metadata, onStage: nextOnStage }
      await fetch("/api/participant/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: localParticipant.identity,
          metadata: newMetadata,
        }),
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {onStage ? (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setSelfStage(false)}>
          Leave stage
        </Button>
      ) : (
        <Button size="sm" disabled={pending} onClick={() => setSelfStage(true)}>
          Go on stage
        </Button>
      )}
    </div>
  )
}

function WaitingRoomOverlay() {
  const { localParticipant } = useLocalParticipant()
  const [isWaiting, setIsWaiting] = useState(false)

  useEffect(() => {
    const check = () => {
      const metadata = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
      setIsWaiting(metadata.onStage !== true)
    }
    check()
    const handle = () => check()
    localParticipant.on(ParticipantEvent.ParticipantMetadataChanged, handle)
    return () => {
      localParticipant.off(ParticipantEvent.ParticipantMetadataChanged, handle)
    }
  }, [localParticipant])

  if (!isWaiting) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/85 backdrop-blur">
      <div className="rounded-3xl border border-white/15 bg-black/70 px-10 py-8 text-center text-white/80 shadow-2xl shadow-black/60">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
          <Users className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold">Waiting to join the stage</h3>
        <p className="mt-2 text-sm text-white/60">
          The host will add you when it&apos;s your turn. Sit tight and get ready.
        </p>
      </div>
    </div>
  )
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
  layout,
  onLayoutChange,
  isUserHost,
  enableAIPrompt = false,
  enableSVGEditor = false,
  svgEditorUrl,
}: {
  roomId: string
  participantName: string
  layout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  isUserHost: boolean
  enableAIPrompt?: boolean
  enableSVGEditor?: boolean
  svgEditorUrl?: string
}) {
  const room = useRoomContext()

  const defaultSvgUrl =
    "https://vgwzhgureposlvnxoiaj.supabase.co/storage/v1/object/public/svgs/generated/w3s.svg"

  const [svgUrl, setSvgUrl] = useState<string | null>(
    svgEditorUrl || (enableSVGEditor && !enableAIPrompt ? defaultSvgUrl : null),
  )

  const handleSvgGenerated = useCallback((url: string) => {
    setSvgUrl(url)
  }, [])

  const removeFromStage = useCallback(
    async (participant: RemoteParticipant) => {
      try {
        const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
        const newMetadata = { ...metadata, onStage: false }
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
          throw new Error((await response.json()).error || "Failed to update participant metadata")
        }
      } catch (error) {
        console.error("[CollaborativeRoom] Error removing participant from stage:", error)
      }
    },
    [room],
  )

  const hostControlsValue: HostControlsContextType = { isHost: isUserHost, removeFromStage }

  return (
    <HostControlsContext.Provider value={hostControlsValue}>
      <Cursors />
      <NicknameInitializer participantName={participantName} />

      {enableAIPrompt && (
        <AIPrompt
          user={participantName}
          promptCount={0}
          prompts={0}
          onSvgGenerated={handleSvgGenerated}
        />
      )}

      <RoomShell
        background="nebula"
        slots={{
          topBar: <RoomHeader roomId={roomId} layout={layout} onLayoutChange={onLayoutChange} />,
          stage: (
            <div className="relative flex h-full w-full flex-col gap-6">
              <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/12 bg-black/35 shadow-2xl shadow-black/60">
                <CollaborativeStageLayout layout={layout} />
                {!isUserHost && <WaitingRoomOverlay />}
              </div>
              {enableSVGEditor && svgUrl && (
                <div className="relative flex min-h-[360px] flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl shadow-black/60 backdrop-blur-xl">
                  <SVGEditorComponent svgUrl={svgUrl} collaborative className="h-full w-full" />
                </div>
              )}
            </div>
          ),
          footer: (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <SelfStageToggle />
              <MediaControlBar />
            </div>
          ),
          overlays: (
            <>
              {isUserHost && <BackroomPanel />}
              <ChatDrawer participantName={participantName} isHost={isUserHost} />
            </>
          ),
        }}
      />

      <StageSubscriptionManager />
      <SelectiveAudioRenderer />
      <MetadataListener />
    </HostControlsContext.Provider>
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
  const [layout, setLayout] = useState<LayoutType>("spotlight")
  const [isUserHost, setIsUserHost] = useState(false)

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

        if (!claimHost) {
          const hostCheckUrl = `${LIVEKIT_CONFIG.tokenEndpoint}?roomName=${encodeURIComponent(
            roomId,
          )}&participantName=${encodeURIComponent(participantName)}&participantId=${encodeURIComponent(
            participantId,
          )}&checkHost=true`
          const hostResponse = await fetch(hostCheckUrl)
          const hostData = await hostResponse.json().catch(() => ({}))
          setIsUserHost(!!hostData.isHost)
        } else {
          setIsUserHost(true)
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
        setIsUserHost(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId && participantName) run()
  }, [roomId, participantName])

  const handleDisconnect = () => router.push("/")

  const handleLayoutChange = useCallback((next: LayoutType) => {
    setLayout(next)
    window.dispatchEvent(new CustomEvent("layout-changed", { detail: next }))
  }, [])

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
            layout={layout}
            onLayoutChange={handleLayoutChange}
            isUserHost={isUserHost}
            enableAIPrompt={enableAIPrompt}
            enableSVGEditor={enableSVGEditor}
            svgEditorUrl={svgEditorUrl}
          />
        </LiveKitReady>
      </LiveKitRoom>
    </div>
  )
}
