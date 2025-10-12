import { observable } from "@legendapp/state"

interface AppState {
  loginModal: {
    isOpen: boolean
  }
}

export const appState$ = observable<AppState>({
  loginModal: {
    isOpen: false,
  },
})

// Helper functions to control the login modal from anywhere
export const openLoginModal = () => {
  appState$.loginModal.isOpen.set(true)
  console.log("Login modal opened")
}

export const closeLoginModal = () => {
  appState$.loginModal.isOpen.set(false)
}

export const toggleLoginModal = () => {
  appState$.loginModal.isOpen.set(!appState$.loginModal.isOpen.get())
}
