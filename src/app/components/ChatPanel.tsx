"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Chat, useNicknames } from "react-together"
import "@/styles/chat-overrides.css"

interface ChatPanelProps {
  participantName: string
  isHost?: boolean
}

export function ChatPanel({ participantName,  isHost = true }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Chat Toggle Button */}
      <div className={cn("fixed bottom-24 z-[110]", isHost ? "right-[22rem]" : "right-6")}>
        <Button onClick={() => setIsOpen(!isOpen)} size="lg" className="h-14 w-14 rounded-full shadow-lg relative">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat Panel - keep mounted but control visibility */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 z-[110] w-96 h-[500px] bg-card border border-border rounded-lg shadow-2xl flex flex-col",
            isHost ? "right-[22rem]" : "right-6"
          )}
        >
          <Chat rtKey="chat" chatName="Room Chat" />
        </div>
      )}
    </>
  )
}
