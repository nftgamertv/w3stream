"use client"

import { useState } from "react"
import { StudioCanvas } from "@/components/studio-canvas"
import { StudioControls } from "@/components/studio-controls"
import { CameraViewSwitcher } from "@/components/camera-view-switcher"
import { useLiveKit } from "@/hooks/use-livekit"

export function StudioContent({ initialRoomId }: { initialRoomId: string | null }) {
  const { videoReadyState, localSeat, globalDefaultSeatView, isConnected } = useLiveKit()
  const [manualCameraView, setManualCameraView] = useState<"host" | number | null>(null)

  const effectiveCameraView =
    manualCameraView !== null
      ? manualCameraView
      : localSeat !== null
        ? localSeat
        : globalDefaultSeatView !== null
          ? globalDefaultSeatView
          : "host"

  console.log(
    "[v0] StudioContent - localSeat:",
    localSeat,
    "globalDefaultSeatView:",
    globalDefaultSeatView,
    "effectiveCameraView:",
    effectiveCameraView,
    "isConnected:",
    isConnected,
  )

  return (
    <main className="flex h-screen w-full flex-col bg-black">
      <div className="flex-1 relative">
        <StudioCanvas videoReadyState={videoReadyState} localSeat={effectiveCameraView} />
        <CameraViewSwitcher currentView={effectiveCameraView} onViewChange={setManualCameraView} />
      </div>
      <StudioControls initialRoomId={initialRoomId} />
    </main>
  )
}
