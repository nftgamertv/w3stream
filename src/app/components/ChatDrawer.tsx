"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import { Chat } from "react-together"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import "@/styles/chat-overrides.css"

interface ChatDrawerProps {
  participantName: string
  isHost?: boolean
}

export function ChatDrawer({ participantName, isHost = false }: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Listen for new messages when drawer is closed
  useEffect(() => {
    if (!isOpen) {
      const handleNewMessage = () => {
        setUnreadCount((prev) => prev + 1)
      }

      // Listen for new chat messages (react-together emits these events)
      window.addEventListener("react-together-chat-message", handleNewMessage)

      return () => {
        window.removeEventListener("react-together-chat-message", handleNewMessage)
      }
    } else {
      // Reset unread count when drawer is opened
      setUnreadCount(0)
    }
  }, [isOpen])

  return (
    <>
      {/* Chat Toggle Button with Badge */}
      <div className={cn("pointer-events-auto fixed bottom-28 z-[110]", isHost ? "right-[22rem]" : "right-6")}>
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg relative group hover:scale-110 transition-transform"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Chat Drawer */}
      <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent side="right" className="outline-none">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Room Chat
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden">
            <Chat rtKey="chat" chatName="Room Chat" />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
