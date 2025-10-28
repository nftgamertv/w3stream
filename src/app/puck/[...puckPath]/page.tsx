import '@measured/puck/puck.css'
import './puck.css'

import React from 'react'
import LivekitRoomWrapper from '@/providers/LivekitRoomWrapper'
import { Client } from './client'
import { getPage } from '@/lib/get-page'

export const dynamic = 'force-dynamic'

type RouteParams = { puckPath?: string[] }
type Search = { room_id?: string; participant_name?: string }

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<Search>
}) {
  // Await the dynamic APIs per Next 15 typing
  const { puckPath = [] } = await params
  const { room_id, participant_name } = await searchParams

  const path = `/${puckPath.join('/')}`
  const roomId = room_id ?? 'default-room'
  const participantName = participant_name ?? 'Guest'

  const data = await getPage(path)

  return (
    <LivekitRoomWrapper roomId={roomId} participantName={participantName}>
      <Client path={path} data={data ?? {}} />
    </LivekitRoomWrapper>
  )
}
