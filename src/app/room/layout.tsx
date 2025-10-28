'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import SideDrawer from '@/components/SideDrawer'

const ClientReactTogetherWrapper = dynamic(
  () => import('@/providers/ClientReactTogetherWrapper').then(mod => mod.ClientReactTogetherWrapper),
  { ssr: false }
)

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-screen">
      <ClientReactTogetherWrapper>
        <SideDrawer />
        {children}
      </ClientReactTogetherWrapper>
    </div>
  )
}
