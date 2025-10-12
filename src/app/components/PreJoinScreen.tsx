'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMediaDeviceSelect, usePersistentUserChoices } from '@livekit/components-react'
import { createLocalVideoTrack, createLocalAudioTrack, Track } from 'livekit-client'
import { Camera, CameraOff, Mic, MicOff, Settings } from 'lucide-react'
import { DeviceSettingsModal } from './DeviceSettingsModal'

export const PreJoinScreen: React.FC = () => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoTrack, setVideoTrack] = useState<any>(null)
  const [audioTrack, setAudioTrack] = useState<any>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)

  const { saveAudioInputEnabled, saveVideoInputEnabled, saveUsername } = usePersistentUserChoices()

  const audioDeviceSelect = useMediaDeviceSelect({
    kind: 'audioinput',
    requestPermissions: true,
  })

  const videoDeviceSelect = useMediaDeviceSelect({
    kind: 'videoinput',
    requestPermissions: true,
  })

  useEffect(() => {
    return () => {
      videoTrack?.stop()
      audioTrack?.stop()
    }
  }, [videoTrack, audioTrack])

  const toggleVideo = async () => {
    if (videoEnabled) {
      videoTrack?.stop()
      setVideoTrack(null)
      setVideoEnabled(false)
    } else {
      setVideoLoading(true)
      try {
        let track = null
        let attempts = 0
        const maxAttempts = 3
        
        while (!track && attempts < maxAttempts) {
          try {
            const constraints: any = {
              deviceId: videoDeviceSelect.activeDeviceId,
            }
            
            // Add specific handling for virtual cameras
            if (attempts > 0) {
              // Try with relaxed constraints on retry
              constraints.resolution = { width: 1280, height: 720 }
              constraints.frameRate = 30
            }
            
            track = await createLocalVideoTrack(constraints)
            break
          } catch (innerError: any) {
            attempts++
            console.warn(`Camera access attempt ${attempts} failed:`, innerError)
            
            if (innerError.name === 'NotReadableError' && attempts < maxAttempts) {
              // Wait a bit before retrying for NotReadableError
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Try to enumerate devices again to refresh the list
              await navigator.mediaDevices.enumerateDevices()
            } else {
              throw innerError
            }
          }
        }
        
        if (track) {
          setVideoTrack(track)
          setVideoEnabled(true)
        } else {
          throw new Error('Failed to access camera after multiple attempts')
        }
      } catch (error: any) {
        console.error('Failed to access camera:', error)
        
        // Provide user-friendly error messages
        let errorMessage = 'Unable to access your camera. '
        
        if (error.name === 'NotReadableError') {
          errorMessage += 'The camera may be in use by another application (like OBS). Please ensure the virtual camera is properly configured and not in use elsewhere.'
        } else if (error.name === 'NotAllowedError') {
          errorMessage += 'Camera access was denied. Please allow camera permissions.'
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera device was found.'
        } else {
          errorMessage += error.message || 'Please check your camera settings.'
        }
        
        alert(errorMessage)
      } finally {
        setVideoLoading(false)
      }
    }
  }

  const toggleAudio = async () => {
    if (audioEnabled) {
      audioTrack?.stop()
      setAudioTrack(null)
      setAudioEnabled(false)
    } else {
      try {
        const track = await createLocalAudioTrack({
          deviceId: audioDeviceSelect.activeDeviceId,
        })
        setAudioTrack(track)
        setAudioEnabled(true)
      } catch (error) {
        console.error('Failed to access microphone:', error)
      }
    }
  }

  const handleJoin = async () => {
    if (!username.trim()) {
      alert('Please enter your name')
      return
    }

    setIsJoining(true)
    
    saveUsername(username)
    saveAudioInputEnabled(audioEnabled)
    saveVideoInputEnabled(videoEnabled)

    try {
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username }),
      })
      const { token, roomName } = await res.json()

      router.push(
        `/room/${roomName}?token=${encodeURIComponent(token)}` +
          `&camDeviceId=${videoDeviceSelect.activeDeviceId || ''}` +
          `&micDeviceId=${audioDeviceSelect.activeDeviceId || ''}`,
      )
    } catch (error) {
      console.error('Failed to join:', error)
      setIsJoining(false)
    }
  }

  useEffect(() => {
    if (videoEnabled && videoTrack) {
      const videoElement = document.getElementById('video-preview') as HTMLVideoElement
      if (videoElement) {
        videoTrack.attach(videoElement)
      }
    }
  }, [videoTrack, videoEnabled])

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-semibold mb-2">Let's set up your studio</h1>
      <p className="text-sm mb-6 text-gray-400">
        Entering the studio will not automatically start the broadcast.
      </p>

      <div className="w-full max-w-md space-y-4">
        <div className="relative bg-gray-800 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
          {videoEnabled ? (
            <video
              id="video-preview"
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="text-gray-500">
              <CameraOff size={48} />
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              audioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            disabled={videoLoading}
            className={`p-3 rounded-full transition-colors ${
              videoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            } ${videoLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {videoLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : videoEnabled ? (
              <Camera size={20} />
            ) : (
              <CameraOff size={20} />
            )}
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Display name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="Your name in the room"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={isJoining || !username.trim()}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>

      <DeviceSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}