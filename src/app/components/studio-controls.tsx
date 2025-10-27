"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useLiveKit } from "@/hooks/use-livekit"
import { Video, VideoOff, Mic, MicOff, Download, Copy, Check, Plus } from "lucide-react"

interface StudioControlsProps {
  initialRoomId?: string | null
}

export function StudioControls({ initialRoomId }: StudioControlsProps) {
  const [roomName, setRoomName] = useState("")
  const [userName, setUserName] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [isRoomCreator, setIsRoomCreator] = useState(false)

  const { connect, disconnect, toggleCamera, toggleMicrophone, participantCount, localSeat } = useLiveKit()

  useEffect(() => {
    if (initialRoomId) {
      setRoomName(initialRoomId)
      setIsRoomCreator(false)
    }
  }, [initialRoomId])

  const generateRoomId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let id = ""
    for (let i = 0; i < 8; i++) {
      id += chars[Math.floor(Math.random() * chars.length)]
    }
    setRoomName(id)
    setIsRoomCreator(true)
    return id
  }

  const handleConnect = async () => {
    if (!userName.trim()) {
      alert("Please enter your name")
      return
    }

    if (!roomName.trim()) {
      alert("Please enter a room name or create a new room")
      return
    }

    try {
      await connect(roomName, userName, isRoomCreator)
      setIsConnected(true)
      setIsCameraOn(true)
      setIsMicOn(true)
      setCurrentRoomId(roomName)

      window.history.pushState({}, "", `?room=${roomName}`)
    } catch (error) {
      console.error("Failed to connect:", error)
      alert("Failed to connect to room")
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsConnected(false)
    setIsCameraOn(false)
    setIsMicOn(false)
    setCurrentRoomId(null)
    setIsRoomCreator(false)

    window.history.pushState({}, "", "/")
  }

  const handleToggleCamera = async () => {
    await toggleCamera()
    setIsCameraOn(!isCameraOn)
  }

  const handleToggleMic = async () => {
    await toggleMicrophone()
    setIsMicOn(!isMicOn)
  }

  const handleCopyInviteLink = async () => {
    if (!currentRoomId) return

    const inviteLink = `${window.location.origin}?room=${currentRoomId}`
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartRecording = () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return

    const stream = canvas.captureStream(30)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    })

    const chunks: Blob[] = []
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `studio-recording-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }

    mediaRecorder.start()
    setIsRecording(true)

    setTimeout(
      () => {
        mediaRecorder.stop()
        setIsRecording(false)
      },
      5 * 60 * 1000,
    )
  }

  return (
    <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 bg-black/80 border-gray-700">
      <div className="flex items-center gap-4">
        {!isConnected ? (
          <>
            <Button onClick={generateRoomId} variant="outline" size="icon" className="bg-gray-900 border-gray-700">
              <Plus className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Room ID"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-40 bg-gray-900 border-gray-700 text-white"
            />
            <Input
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-40 bg-gray-900 border-gray-700 text-white"
            />
            <Button onClick={handleConnect} className="bg-green-600 hover:bg-green-700">
              Join Studio
            </Button>
          </>
        ) : (
          <>
            <div className="text-white text-sm flex flex-col gap-1">
              <div className="font-semibold">Room: {currentRoomId}</div>
              <div className="text-gray-400">
                {isRoomCreator ? "Role: Host" : `Role: Guest (Seat ${(localSeat as number) + 1})`} • Participants:{" "}
                {participantCount}
              </div>
            </div>
            <Button
              onClick={handleCopyInviteLink}
              variant="outline"
              size="icon"
              className="bg-gray-900 border-gray-700"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button onClick={handleToggleCamera} variant={isCameraOn ? "default" : "destructive"} size="icon">
              {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button onClick={handleToggleMic} variant={isMicOn ? "default" : "destructive"} size="icon">
              {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button onClick={handleStartRecording} disabled={isRecording} variant="secondary" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button onClick={handleDisconnect} variant="destructive">
              Leave Studio
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
