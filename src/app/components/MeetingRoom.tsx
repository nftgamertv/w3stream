"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { useNicknames } from "react-together"
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
import { RoomHeader } from "@/components/RoomHeader"
import { BackroomPanel } from "@/components/BackroomPanel"
import { ChatDrawer } from "@/components/ChatDrawer"
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

function isOnStage(p: LocalParticipant | RemoteParticipant): boolean {
  const md = p.metadata ? JSON.parse(p.metadata) : {}
  return md.onStage === true
}

interface HostControlsContextType {
  isHost: boolean
  removeFromStage: (participant: RemoteParticipant) => Promise<void>
}
const HostControlsContext = createContext<HostControlsContextType | null>(null)
function useHostControls() { return useContext(HostControlsContext) }

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
  if (scr?.isSubscribed && scr?.track) return { participant: p, source: Track.Source.ScreenShare, publication: scr }
  const cam = p.getTrackPublication(Track.Source.Camera) as RemoteTrackPublication | undefined
  return { participant: p, source: Track.Source.Camera, publication: cam }
}

function TileWithControls({ participant }: { participant: LocalParticipant | RemoteParticipant }) {
  const hostControls = useHostControls()
  const room = useRoomContext()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    if (!hostControls || participant.identity === room.localParticipant.identity) return
    setIsRemoving(true)
    try { await hostControls.removeFromStage(participant as RemoteParticipant) } finally { setIsRemoving(false) }
  }

  const isLocal = participant.identity === room.localParticipant.identity
  const showRemoveButton = !!hostControls?.isHost && !isLocal
  const trackRef = getPreferredTrackRef(participant)

  return (
    <div className="relative w-full h-full group z-10">
      <ParticipantTile className="h-full w-full" trackRef={trackRef} />
      {showRemoveButton && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Button size="sm" variant="destructive" onClick={handleRemove} disabled={isRemoving} className="h-8 px-3 gap-1.5 text-xs shadow-lg">
            <UserMinus className="w-3.5 h-3.5" />
            {isRemoving ? "..." : "Remove"}
          </Button>
        </div>
      )}
    </div>
  )
}

/* -------- Layouts (tiles are now guaranteed to sit above footers) -------- */
function ConstrainedGridLayout() {
  const participants = useParticipants()
  const stagePeople = participants.filter(isOnStage)
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {stagePeople.map((p) => (
            <div key={p.identity} className="aspect-video max-h-[480px] overflow-hidden rounded-lg bg-black/20">
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
  const stagePeople = participants.filter(isOnStage)
  const screenSharer = stagePeople.find(hasScreenShare)
  const cameraPeople = stagePeople.filter(hasCamera)

  if (screenSharer) {
    return (
      <div className="flex h-full gap-4 p-4">
        <div className="w-64 flex flex-col gap-3 overflow-y-auto">
          {cameraPeople.filter((p) => p.identity !== screenSharer.identity).map((p) => (
            <div key={p.identity} className="aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-black/20">
              <TileWithControls participant={p} />
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden">
          <div className="w-full h-full"><TileWithControls participant={screenSharer} /></div>
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
            <div key={p.identity} className="aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-black/20">
              <TileWithControls participant={p} />
            </div>
          ))}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center">
        {main && <div className="w-full h-full max-w-5xl max-h-[800px] overflow-hidden rounded-lg bg-black/20">
          <TileWithControls participant={main} />
        </div>}
      </div>
    </div>
  )
}

function SpotlightLayoutView() {
  const participants = useParticipants()
  const stagePeople = participants.filter(isOnStage)
  const screenSharer = stagePeople.find(hasScreenShare)
  const cameraPeople = stagePeople.filter(hasCamera)
  const main = screenSharer ?? cameraPeople[0]
  const carousel = screenSharer ? cameraPeople : cameraPeople.slice(1)

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden">
        {main && <div className="w-full h-full"><TileWithControls participant={main} /></div>}
      </div>
      {carousel.length > 0 && (
        <div className="h-32 flex gap-4 overflow-x-auto pb-2">
          {carousel.map((p) => (
            <div key={p.identity} className="w-48 flex-shrink-0 overflow-hidden rounded-lg bg-black/20">
              <TileWithControls participant={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VideoConferenceLayout({ layout, onLayoutChange }: { layout: LayoutType; onLayoutChange: (l: LayoutType) => void }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }, { source: Track.Source.ScreenShare, withPlaceholder: false }], { onlySubscribed: false })
  const hasScreenShare = tracks.some((t) => t.source === Track.Source.ScreenShare)

  useEffect(() => { if (hasScreenShare && layout === "grid") onLayoutChange("sidebar") }, [hasScreenShare, layout, onLayoutChange])

  switch (layout) {
    case "grid": return <ConstrainedGridLayout />
    case "sidebar": return <SidebarLayoutView />
    case "spotlight": return <SpotlightLayoutView />
    default: return <ConstrainedGridLayout />
  }
}

/* -------- Audio from on-stage only -------- */
function SelectiveAudioRenderer() {
  const tracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }], { onlySubscribed: false })
  return (
    <>
      {tracks
        .filter((tr): tr is TrackReference => "publication" in tr && !!tr.publication)
        .map((tr) => (isOnStage(tr.participant as LocalParticipant | RemoteParticipant)
          ? <AudioTrack key={tr.participant.identity} trackRef={tr} muted={false} volume={1.0} />
          : null))}
    </>
  )
}

/* -------- Nickname initializer -------- */
function NicknameInitializer({ participantName }: { participantName: string }) {
  const [, setNickname] = useNicknames()

  useEffect(() => {
    if (participantName && participantName.trim()) {
      console.log("[NicknameInitializer] Setting nickname to:", participantName)
      setNickname(participantName.trim())
    }
  }, [participantName, setNickname])

  return null
}

/* -------- Metadata change pings -------- */
function MetadataListener() {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  useEffect(() => {
    const handle = (metadata: string | undefined, who: RemoteParticipant | LocalParticipant) => {
      if (who.identity !== localParticipant.identity) return
      const md = metadata ? JSON.parse(metadata) : {}
      window.dispatchEvent(new CustomEvent("stage-status-changed", { detail: { onStage: md.onStage === true } }))
    }
    room.remoteParticipants.forEach((p) => p.on(ParticipantEvent.ParticipantMetadataChanged, (m) => handle(m, p)))
    localParticipant.on(ParticipantEvent.ParticipantMetadataChanged, (m) => handle(m, localParticipant))
    room.on(RoomEvent.ParticipantConnected, (p) => p.on(ParticipantEvent.ParticipantMetadataChanged, (m) => handle(m, p)))
    return () => {
      room.remoteParticipants.forEach((p) => p.off(ParticipantEvent.ParticipantMetadataChanged, handle as any))
      localParticipant.off(ParticipantEvent.ParticipantMetadataChanged, handle as any)
      room.off(RoomEvent.ParticipantConnected, () => {})
    }
  }, [room, localParticipant])
  return null
}

/* -------- Host self-toggle (uses context.isHost; not metadata) -------- */
function SelfStageToggle() {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const hostControls = useHostControls()
  const [pending, setPending] = useState(false)

  if (!hostControls?.isHost) return null

  const md = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
  const onStage = md.onStage === true

  const setSelfStage = async (nextOnStage: boolean) => {
    try {
      setPending(true)
      const newMetadata = { ...md, onStage: nextOnStage }
      await fetch("/api/participant/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: room.name, participantIdentity: localParticipant.identity, metadata: newMetadata }),
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="px-3 py-2">
      {onStage ? (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setSelfStage(false)}>Leave stage</Button>
      ) : (
        <Button size="sm" disabled={pending} onClick={() => setSelfStage(true)}>Go on stage</Button>
      )}
    </div>
  )
}

/* -------- Room shell -------- */
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
      const md = participant.metadata ? JSON.parse(participant.metadata) : {}
      const newMetadata = { ...md, onStage: false }
      const res = await fetch("/api/participant/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: room.name, participantIdentity: participant.identity, metadata: newMetadata }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update participant metadata")
    } catch (e) { console.error("[v0] Error removing participant from stage:", e) }
  }

  const hostControlsValue: HostControlsContextType = { isHost: isUserHost, removeFromStage }

  return (
    <HostControlsContext.Provider value={hostControlsValue}>
      <NicknameInitializer participantName={participantName} />
      <RoomHeader roomId={roomId} layout={layout} onLayoutChange={onLayoutChange} />
      <div className="flex-1 overflow-hidden flex relative">
        {/* Put stage area on a higher layer than footers just in case */}
        <div className="flex-1 relative z-10 pointer-events-auto">
          <VideoConferenceLayout layout={layout} onLayoutChange={onLayoutChange} />
          {/* Guests see overlay while backstage. Host stays clean so tiles aren't masked. */}
          {!isUserHost && <WaitingRoomOverlay />}
        </div>
      </div>
      <div className="border-t border-border/30 bg-background/95 backdrop-blur-sm relative z-20 pointer-events-auto flex items-stretch">
        {isUserHost && <BackroomPanel />}
        <div className="flex items-center gap-2"><SelfStageToggle /></div>
        <div className="flex-1 flex items-center justify-center"><ControlBar variation="verbose" /></div>
      </div>
      <StageSubscriptionManager />
      <SelectiveAudioRenderer />
      <MetadataListener />
      <ChatDrawer participantName={participantName} isHost={isUserHost} />
    </HostControlsContext.Provider>
  )
}

function WaitingRoomOverlay() {
  const { localParticipant } = useLocalParticipant()
  const [isWaiting, setIsWaiting] = useState(false)

  useEffect(() => {
    const check = () => {
      const md = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {}
      setIsWaiting(md.onStage !== true)
    }
    check()
    const h = () => check()
    localParticipant.on(ParticipantEvent.ParticipantMetadataChanged, h)
    return () => { localParticipant.off(ParticipantEvent.ParticipantMetadataChanged, h) }
  }, [localParticipant])

  if (!isWaiting) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-30 pointer-events-none">
      <div className="bg-background border-2 border-primary/50 rounded-lg p-8 max-w-md text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Waiting to Join</h3>
        <p className="text-muted-foreground mb-4">You're in the backstage area. The host will add you to the stage shortly.</p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Waiting for host...</span>
        </div>
      </div>
    </div>
  )
}

/* -------- Entry component -------- */
export function MeetingRoom({ roomId, participantName, initialSettings }: MeetingRoomProps) {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [layout, setLayout] = useState<LayoutType>("grid")
  const [isUserHost, setIsUserHost] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true); setError("")
        const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()
        const claimHost = sp.get("role") === "host" || sp.get("creator") === "1" || sp.get("host") === "1"

        if (!claimHost) {
          const resp = await fetch(`${LIVEKIT_CONFIG.tokenEndpoint}?roomName=${encodeURIComponent(roomId)}&participantName=${encodeURIComponent(participantName)}&checkHost=true`)
          const data = await resp.json()
          setIsUserHost(!!data.isHost)
        } else {
          setIsUserHost(true)
        }

        // Host starts BACKSTAGE. Server should set { isHost:true, onStage:false } in token metadata.
        const tokenUrl =
          `${LIVEKIT_CONFIG.tokenEndpoint}?roomName=${encodeURIComponent(roomId)}&participantName=${encodeURIComponent(participantName)}${claimHost ? "&creator=1" : ""}`
        const r = await fetch(tokenUrl)
        if (!r.ok) {
          const e = await r.json().catch(() => ({}))
          if (e.missing) setMissingVars(e.missing)
          throw new Error(e.error || "Failed to get access token")
        }
        const { token } = await r.json()
        setToken(token)
      } catch (e: any) {
        console.error("[v0] Error fetching token:", e)
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
                    {missingVars.map((v) => (<li key={v} className="font-mono text-sm">{v}</li>))}
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
