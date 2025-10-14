import React from 'react'
import { ClientReactTogetherWrapper } from "@/providers/ClientReactTogetherWrapper"
export default function RoomLayout({children}: {children: React.ReactNode}) {
  return (
    <div>
              <ClientReactTogetherWrapper>
        {children}
              </ClientReactTogetherWrapper>
    </div>
  )
}
