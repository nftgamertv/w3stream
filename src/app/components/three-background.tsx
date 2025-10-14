"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import * as THREE from "three"

function StreamingWaves() {
  const groupRef = useRef<THREE.Group>(null)
  const waveRefs = useRef<THREE.Mesh[]>([])

  // Create broadcasting wave rings
  const waves = Array.from({ length: 8 }, (_, i) => ({
    radius: 2 + i * 1.5,
    speed: 0.5 + i * 0.1,
    opacity: 0.8 - i * 0.08,
  }))

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }

    waveRefs.current.forEach((wave, i) => {
      if (wave) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * waves[i].speed) * 0.3
        wave.scale.setScalar(scale)
        const material = wave.material as THREE.MeshBasicMaterial
        material.opacity = waves[i].opacity * (0.5 + Math.sin(state.clock.elapsedTime * waves[i].speed) * 0.5)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {waves.map((wave, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) waveRefs.current[i] = el
          }}
          position={[0, 0, 0]}
        >
          <ringGeometry args={[wave.radius, wave.radius + 0.1, 32]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#06b6d4" : "#8b5cf6"}
            transparent
            opacity={wave.opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function DataStreams() {
  const streamRefs = useRef<THREE.Group[]>([])

  // Create data packet streams
  const streams = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    radius: 8 + Math.random() * 4,
    speed: 0.5 + Math.random() * 0.5,
  }))

  useFrame((state) => {
    streamRefs.current.forEach((stream, i) => {
      if (stream) {
        const angle = streams[i].angle + state.clock.elapsedTime * streams[i].speed
        stream.position.x = Math.cos(angle) * streams[i].radius
        stream.position.z = Math.sin(angle) * streams[i].radius
        stream.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 2
      }
    })
  })

  return (
    <>
      {streams.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) streamRefs.current[i] = el
          }}
        >
          <Sphere args={[0.05]}>
            <meshBasicMaterial color={i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#8b5cf6" : "#10b981"} />
          </Sphere>
        </group>
      ))}
    </>
  )
}

function AudioWaveform() {
  const waveformRef = useRef<THREE.Group>(null)
  const barsRef = useRef<THREE.Mesh[]>([])

  const bars = Array.from({ length: 20 }, (_, i) => ({
    x: (i - 10) * 0.3,
    baseHeight: 0.2 + Math.random() * 0.3,
    frequency: 1 + Math.random() * 2,
  }))

  useFrame((state) => {
    if (waveformRef.current) {
      waveformRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 2
    }

    barsRef.current.forEach((bar, i) => {
      if (bar) {
        const height = bars[i].baseHeight + Math.sin(state.clock.elapsedTime * bars[i].frequency * 3) * 0.4
        bar.scale.y = Math.max(0.1, height)
        const material = bar.material as THREE.MeshBasicMaterial
        material.opacity = 0.3 + height * 0.4
      }
    })
  })

  return (
    <group ref={waveformRef} position={[0, -3, -8]}>
      {bars.map((bar, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) barsRef.current[i] = el
          }}
          position={[bar.x, 0, 0]}
        >
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function BroadcastSignals() {
  const signalRefs = useRef<THREE.Mesh[]>([])

  // Create six broadcasting signal planes
  const signals = Array.from({ length: 6 })

  useFrame((state) => {
    // Rotate the whole ring slowly
    signalRefs.current.forEach((mesh, i) => {
      if (mesh) {
        // Continuous radial rotation
        mesh.rotation.z = state.clock.elapsedTime * 0.2 + (i / 6) * Math.PI * 2

        // Subtle pulsing opacity
        const material = mesh.material as THREE.MeshBasicMaterial
        material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.05
      }
    })
  })

  return (
    <group position={[0, 0, -10]}>
      {signals.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) signalRefs.current[i] = el
          }}
          position={[0, 0, 0]}
          rotation={[0, 0, (i / 6) * Math.PI * 2]}
        >
          <planeGeometry args={[0.02, 8]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#06b6d4" : "#8b5cf6"}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function StreamingBackground() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <StreamingWaves />
      <DataStreams />
      <AudioWaveform />
      <BroadcastSignals />
    </>
  )
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{
          alpha: true,
          antialias: false, // Disable antialiasing for better performance
          powerPreference: "high-performance"
        }}
        dpr={[1, 1.5]} // Limit pixel ratio for better performance
        frameloop="demand" // Only render when needed instead of continuously
      >
        <StreamingBackground />
      </Canvas>
    </div>
  )
}
