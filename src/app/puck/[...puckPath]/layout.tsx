import React from 'react'
import dynamic from 'next/dynamic'

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
        {children}
      </ClientReactTogetherWrapper>
    </div>
  )
}
