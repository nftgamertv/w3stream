import '@measured/puck/puck.css'
import './puck.css'

import React from 'react'
import type { Metadata } from 'next'

import LivekitRoomWrapper from '@/providers/LivekitRoomWrapper'
import { Client } from './client'
import { getPage } from '@/lib/get-page'

export const dynamic = 'force-dynamic'

// export async function generateMetadata(
//   // keep this a plain object — NOT a Promise
//   { params }: { params: { puckPath?: string[] } }
// ): Promise<Metadata> {
//   const path = `/${(params.puckPath ?? []).join('/')}`
//   return { title: `Puck: ${path}` }
// }

// TEMPORARY: use `any` to break the bad Promise inference coming from elsewhere.
export default async function Page(props: any) {
  const params = (props?.params ?? {}) as { puckPath?: string[] }
  const searchParams = (props?.searchParams ?? {}) as { room_id?: string; participant_name?: string }

  const path = `/${(params.puckPath ?? []).join('/')}`
  const roomId = searchParams.room_id ?? 'default-room'
  const participantName = searchParams.participant_name ?? 'Guest'

  const data = await getPage(path)

  return (
    <LivekitRoomWrapper roomId={roomId} participantName={participantName}>
      <Client path={path} data={data ?? {}} />
    </LivekitRoomWrapper>
  )
}
