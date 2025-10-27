"use client"

import { useRef } from "react"
import { VideoScreen } from "./video-screen"
import type * as THREE from "three"

interface StudioSceneProps {
  videoReadyState: { [seat: number]: boolean }
  localSeat: number | "host" | null
}

export function StudioScene({ videoReadyState, localSeat }: StudioSceneProps) {
  const floorRef = useRef<THREE.Mesh>(null)

  return (
    <>
      {/* Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -3]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      <VideoScreen seat="host" position={[0, 1, 3]} rotation={[0, Math.PI, 0]} videoReadyState={videoReadyState} />

      <VideoScreen seat={0} position={[-3, 1, 0]} videoReadyState={videoReadyState} />
      <VideoScreen seat={1} position={[-1, 1, 0]} videoReadyState={videoReadyState} />
      <VideoScreen seat={2} position={[1, 1, 0]} videoReadyState={videoReadyState} />
      <VideoScreen seat={3} position={[3, 1, 0]} videoReadyState={videoReadyState} />
    </>
  )
}
