'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const ClientReactTogetherWrapper = dynamic(
  () => import("@/providers/ClientReactTogetherWrapper").then(mod => mod.ClientReactTogetherWrapper),
  { ssr: false }
)

export default function PreJoinLayout({children}: {children: React.ReactNode}) {
  return (
    <div>
      <ClientReactTogetherWrapper>
        {children}
      </ClientReactTogetherWrapper>
    </div>
  )
}
