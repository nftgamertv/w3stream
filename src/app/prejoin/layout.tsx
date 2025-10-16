import React from 'react'
import { ClientReactTogetherWrapper } from "@/providers/ClientReactTogetherWrapper"

export default function PreJoinLayout({children}: {children: React.ReactNode}) {
  return (
    <div>
      <ClientReactTogetherWrapper>
        {children}
      </ClientReactTogetherWrapper>
    </div>
  )
}
