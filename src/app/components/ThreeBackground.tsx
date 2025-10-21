"use client"

import { useRef, useEffect, useState } from "react"
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
  const [isClient, setIsClient] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [hasWebGL, setHasWebGL] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check for WebGL support first
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setHasWebGL(false)
        return
      }
    } catch (e) {
      setHasWebGL(false)
      return
    }

    // Wait for DOM to be ready
    const initDimensions = () => {
      if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerHeight > 0) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
        setIsClient(true)
        // Add a small delay to ensure everything is ready
        setTimeout(() => setIsReady(true), 100)
      }
    }

    // Try immediately
    initDimensions()

    // Fallback: try on next frame if not ready
    if (!isClient) {
      requestAnimationFrame(initDimensions)
    }

    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth > 0 && window.innerHeight > 0) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient])

  // Don't render until we have valid dimensions, WebGL support, and everything is ready
  if (!isClient || !hasWebGL || !isReady || dimensions.width === 0 || dimensions.height === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ width: '100vw', height: '100vh', zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl, size }) => {
          // Only set size if valid
          if (size.width > 0 && size.height > 0) {
            gl.setSize(size.width, size.height, false)
          }

          // Add WebGL context lost/restored handlers
          const canvas = gl.domElement
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('WebGL context lost')
          }, false)

          canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored')
          }, false)
        }}
      >
        <StreamingBackground />
      </Canvas>
    </div>
  )
}
