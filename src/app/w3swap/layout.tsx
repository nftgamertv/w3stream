import type React from "react"
import type { Metadata } from "next"
import Navbar from "@/components/w3swap/Navbar"

export const metadata: Metadata = {
  title: "w3Swap - Token Migration Service",
  description: "Secure, transparent token migration solutions for Web3 projects",
}

export default function W3SwapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {children}
    </div>
  )
}


