import React from 'react'
<<<<<<< Updated upstream
import { ClientReactTogetherWrapper } from "@/providers/ClientReactTogetherWrapper"
import LivekitRoomWrapper from '@/providers/LivekitRoomWrapper'

export default async function RoomLayout({
=======
import { ClientReactTogetherWrapper } from '@/providers/ClientReactTogetherWrapper'

export default function RoomLayout({
>>>>>>> Stashed changes
  children,
  searchParams
}: {
  children: React.ReactNode
  searchParams: Promise<{ room_id?: string; participant_name?: string }>
}) {
  const params = await searchParams
  const roomId = params?.room_id || 'default-room'
  const participantName = params?.participant_name || 'Guest'

  console.log("RoomLayout rendered with roomId:", roomId, "participantName:", participantName)

  return (
    <div className="h-screen w-screen">
      <ClientReactTogetherWrapper>
        <LivekitRoomWrapper roomId={roomId} participantName={participantName}>
          {children}
        </LivekitRoomWrapper>
      </ClientReactTogetherWrapper>
    </div>
  )
}
