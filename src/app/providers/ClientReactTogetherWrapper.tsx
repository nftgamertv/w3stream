"use client"

import dynamic from "next/dynamic"
import type { ReactNode } from "react"

const ReactTogetherProvider = dynamic(
  () => import("@/providers/ReactTogetherProvider").then((mod) => mod.ReactTogetherProvider),
  { ssr: false },
)

export function ClientReactTogetherWrapper({ children }: { children: ReactNode }) {
  return <ReactTogetherProvider>{children}</ReactTogetherProvider>
}
