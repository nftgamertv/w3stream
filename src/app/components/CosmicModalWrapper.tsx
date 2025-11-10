"use client"

import { CosmicModal } from "./ui/cosmic-modal"
import ShimmerButton from "./ui/shimmer-button"

export function CosmicModalWrapper() {
  return (
    <CosmicModal
      trigger={
        <ShimmerButton
          color="#a855f7"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        />
      }
    />
  )
}
