"use client"

import { Canvas } from "@react-three/fiber"
import { PerspectiveCamera, OrbitControls } from "@react-three/drei"
import { Suspense, useRef, useEffect } from "react"
import { StudioScene } from "./studio-scene"
import type * as THREE from "three"

interface StudioCanvasProps {
  videoReadyState: { [seat: number]: boolean }
  localSeat: number | "host" | null
}

export function StudioCanvas({ videoReadyState, localSeat }: StudioCanvasProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const controlsRef = useRef<any>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    console.log("[v0] StudioCanvas - Camera update triggered, localSeat:", localSeat)
    console.log("[v0] StudioCanvas - cameraRef.current exists:", !!cameraRef.current)
    console.log("[v0] StudioCanvas - controlsRef.current exists:", !!controlsRef.current)

    if (!cameraRef.current || !controlsRef.current || localSeat === null) {
      console.log("[v0] StudioCanvas - Waiting for refs and localSeat to be ready")
      return
    }

    if (!initializedRef.current || localSeat !== null) {
      const position = getCameraPosition()
      const target = getCameraTarget()

      console.log("[v0] StudioCanvas - Setting camera position:", position)
      console.log("[v0] StudioCanvas - Setting camera target:", target)

      cameraRef.current.position.set(...position)
      controlsRef.current.target.set(...target)
      controlsRef.current.update()

      initializedRef.current = true

      console.log("[v0] StudioCanvas - Camera position after set:", [
        cameraRef.current.position.x,
        cameraRef.current.position.y,
        cameraRef.current.position.z,
      ])
    }
  }, [localSeat])

  const getCameraPosition = (): [number, number, number] => {
    if (localSeat === "host") {
      return [0, 2, 6]
    } else if (typeof localSeat === "number") {
      const seatPositions: { [key: number]: [number, number, number] } = {
        0: [-3, 1.5, 0.5],
        1: [-1, 1.5, 0.5],
        2: [1, 1.5, 0.5],
        3: [3, 1.5, 0.5],
      }
      return seatPositions[localSeat] || [0, 2, 6]
    }
    return [0, 2, 6]
  }

  const getCameraTarget = (): [number, number, number] => {
    if (localSeat === "host") {
      return [0, 1, 0]
    } else if (typeof localSeat === "number") {
      return [0, 1.5, 3]
    }
    return [0, 1, 0]
  }

  return (
    <Canvas className="w-full h-full" gl={{ preserveDrawingBuffer: true }}>
      <PerspectiveCamera ref={cameraRef} makeDefault position={getCameraPosition()} fov={75} />
      <OrbitControls
        ref={controlsRef}
        target={getCameraTarget()}
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      <Suspense fallback={null}>
        <StudioScene videoReadyState={videoReadyState} localSeat={localSeat} />
      </Suspense>
    </Canvas>
  )
}
