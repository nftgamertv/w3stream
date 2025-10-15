import { Suspense } from "react"
import { MeetingRoom } from "@/components/meeting-room"

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const participantName = (typeof resolvedSearchParams.name === "string" ? resolvedSearchParams.name : null) || "Guest"
  const videoEnabled = resolvedSearchParams.video === "true"
  const audioEnabled = resolvedSearchParams.audio === "true"

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading room...</p>
          </div>
        </div>
      }
    >
      <MeetingRoom
        roomId={resolvedParams.roomId}
        participantName={participantName}
        initialSettings={{
          video: videoEnabled,
          audio: audioEnabled,
        }}
      />
    </Suspense>
  )
}
