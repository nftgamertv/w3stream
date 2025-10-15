"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRoomContext } from "@livekit/components-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageCircle, Send } from "lucide-react"
import { RoomEvent } from "livekit-client"

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: number
  isHost: boolean
}

interface ChatPanelProps {
  participantName: string
  isHost: boolean
}

export function ChatPanel({ participantName, isHost }: ChatPanelProps) {
  const room = useRoomContext()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleDataReceived = (payload: Uint8Array) => {
      const decoder = new TextDecoder()
      const data = JSON.parse(decoder.decode(payload))

      if (data.type === "chat") {
        const newMessage: ChatMessage = {
          id: `${Date.now()}-${Math.random()}`,
          sender: data.sender,
          message: data.message,
          timestamp: Date.now(),
          isHost: data.isHost || false,
        }
        setMessages((prev) => [...prev, newMessage])

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1)
        }
      }
    }

    room.on(RoomEvent.DataReceived, handleDataReceived)

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived)
    }
  }, [room, isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const sendMessage = () => {
    if (!inputValue.trim()) return

    const encoder = new TextEncoder()
    const data = {
      type: "chat",
      sender: participantName,
      message: inputValue,
      isHost,
    }

    room.localParticipant.publishData(encoder.encode(JSON.stringify(data)), {
      reliable: true,
      destinationIdentities: [],
      topic: "chat",
    })

    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      sender: participantName,
      message: inputValue,
      timestamp: Date.now(),
      isHost,
    }
    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg z-50">
          <MessageCircle className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>Chat</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-3 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{msg.sender}</span>
                    {msg.isHost && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Host</span>
                    )}
                  </div>
                  <p className="text-sm bg-muted rounded-lg px-3 py-2 break-words">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} size="icon" disabled={!inputValue.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
