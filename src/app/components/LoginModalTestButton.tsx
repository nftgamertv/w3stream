"use client"

import { openLoginModal } from "@/store"
import { Button } from "@/components/ui/button"

export function LoginModalTestButton() {
  return (
    <Button
      onClick={() => {openLoginModal(); console.log("Login modal opened")}}
      className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
    >
      🚀 Open Login Modal
    </Button>
  )
}
