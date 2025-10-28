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
  // In Next 15 App Router, these can be Promises in some dynamic cases.
  params: Promise<RouteParams> | RouteParams
  searchParams: Promise<Search> | Search
}) {
  // Normalize to objects (support both promised and plain cases)
  const resolvedParams: RouteParams =
    typeof (params as any)?.then === 'function' ? await (params as Promise<RouteParams>) : (params as RouteParams)

  const resolvedSearch: Search =
    typeof (searchParams as any)?.then === 'function'
      ? await (searchParams as Promise<Search>)
      : (searchParams as Search)

  const puckPath = resolvedParams.puckPath ?? []
  const path = `/${puckPath.join('/')}`

  const roomId = resolvedSearch.room_id ?? 'default-room'
  const participantName = resolvedSearch.participant_name ?? 'Guest'

  const data = await getPage(path)

  return (
    <LivekitRoomWrapper roomId={roomId} participantName={participantName}>
      <Client path={path} data={data ?? {}} />
    </LivekitRoomWrapper>
  )
}
