import React from 'react'
import { ClientReactTogetherWrapper } from '@/providers/ClientReactTogetherWrapper'

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-screen">
      <ClientReactTogetherWrapper>
        {children}
      </ClientReactTogetherWrapper>
    </div>
  )
}
