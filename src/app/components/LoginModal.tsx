"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
 
import LoginForm  from "@/components/LoginForm"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleGmailLogin = () => {
    // Implement Gmail OAuth logic here
    console.log("Gmail OAuth initiated")
  }

  const handleDiscordLogin = () => {
    // Implement Discord OAuth logic here
    console.log("Discord OAuth initiated")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md">
       {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-magenta-500/20 rounded-2xl blur-xl -z-10" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-cyan-400/60 hover:text-cyan-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
    <LoginForm />
        </div>
      </div>
  
  )
}
