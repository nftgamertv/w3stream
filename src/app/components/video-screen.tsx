"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Text } from "@react-three/drei"

interface VideoScreenProps {
  seat: number | "host"
  position: [number, number, number]
  rotation?: [number, number, number]
  videoReadyState: { [seat: number | string]: boolean }
}

export function VideoScreen({ seat, position, rotation, videoReadyState }: VideoScreenProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null)

  useEffect(() => {
    const videoId = seat === "host" ? "seat-video-host" : `seat-video-${seat}`

    const video = document.createElement("video")
    video.id = videoId
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.style.display = "none"
    document.body.appendChild(video)
    videoRef.current = video

    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    videoTexture.format = THREE.RGBAFormat
    setTexture(videoTexture)

    return () => {
      video.remove()
      videoTexture.dispose()
    }
  }, [seat])

  const hasVideo = videoReadyState[seat] || false

  useFrame(() => {
    if (texture && videoRef.current && videoRef.current.readyState >= 2) {
      texture.needsUpdate = true
    }
  })

  const getLabel = () => {
    if (seat === "host") {
      return hasVideo ? "Host - Active" : "Host - Waiting"
    }
    return hasVideo ? `Seat ${(seat as number) + 1} - Active` : `Seat ${(seat as number) + 1} - Waiting`
  }

  return (
    <group position={position} rotation={rotation}>
      {/* Screen border */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Video display */}
      <mesh ref={meshRef}>
        <planeGeometry args={[1.5, 1]} />
        {texture ? <meshBasicMaterial map={texture} toneMapped={false} /> : <meshStandardMaterial color="#1a1a1a" />}
      </mesh>

      {/* Status label */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.1}
        color={hasVideo ? "#00ff00" : "#666666"}
        anchorX="center"
        anchorY="middle"
      >
        {getLabel()}
      </Text>
    </group>
  )
}
