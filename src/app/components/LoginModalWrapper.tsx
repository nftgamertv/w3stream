"use client"

import { observer } from "@legendapp/state/react"
import { appState$, closeLoginModal } from "@/store"
import { LoginModal } from "./LoginModal"

export const LoginModalWrapper = observer(function LoginModalWrapper() {
  const isOpen = appState$.loginModal.isOpen.get()

  return <LoginModal isOpen={isOpen} onClose={closeLoginModal} />
})
