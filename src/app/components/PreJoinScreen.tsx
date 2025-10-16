/**
 * PreJoin Component
 *
 * Pre-join screen for LiveKit room entry with device selection and settings.
 * Features:
 * - Audio/video/speaker device selection with live preview
 * - Camera preview with live video feed
 * - Audio level indicator for microphone
 * - Name input and media toggle settings
 * - Glassmorphic design with cyan accents
 * - Comprehensive error handling
 * - LocalStorage persistence for device selections
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useConnectedUsers, useNicknames } from "react-together";
import DualButtonSelect from "@/components/DualButtonSelect";

// ============================================================================
// TYPES
// ============================================================================

export interface PreJoinSettings {
  name: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  audioDeviceId: string;
  videoDeviceId: string;
  audioOutputDeviceId: string;
}

interface PreJoinProps {
  onJoin: (settings: PreJoinSettings) => void;
  initialName?: string;
}

interface AudioLevelProps {
  audioTrack: MediaStreamTrack | null;
  orientation?: "horizontal" | "vertical";
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const findDefaultDevice = (devices: MediaDeviceInfo[]): string => {
  if (devices.length === 0) {
    console.log("[findDefaultDevice] No devices provided");
    return '';
  }
  
  // Look for device with "Default" in the name (case-insensitive)
  const defaultDevice = devices.find(device => 
    device.label.toLowerCase().includes('default')
  );
  
  if (defaultDevice) {
    console.log("[findDefaultDevice] Found default device:", defaultDevice.label);
    return defaultDevice.deviceId;
  }
  
  console.log("[findDefaultDevice] No default found, using first device:", devices[0].label);
  return devices[0].deviceId;
};

// ============================================================================
// AUDIO LEVEL INDICATOR COMPONENT
// ============================================================================

function AudioLevelIndicator({
  audioTrack,
  orientation = "horizontal",
}: AudioLevelProps) {
  const [level, setLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioTrack) {
      setLevel(0);
      return;
    }

    let mounted = true;

    const initializeAudioAnalysis = async () => {
      try {
        // Reuse AudioContext if possible, or create a new one
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioContext();
        }

        const audioContext = audioContextRef.current;
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(
          new MediaStream([audioTrack])
        );

        // Optimize analyser settings for better performance
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 512; // Reduced from 1024 for better performance

        microphone.connect(analyser);
        analyserRef.current = analyser;
        microphoneRef.current = microphone;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          if (!mounted || !analyserRef.current) return;

          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalized = Math.min(100, (average / 255) * 150);

          setLevel(normalized);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (error) {
        console.error("[AudioLevelIndicator] Failed to initialize:", error);
      }
    };

    initializeAudioAnalysis();

    return () => {
      mounted = false;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
        microphoneRef.current = null;
      }

      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }

      // Close AudioContext to free resources
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setLevel(0);
    };
  }, [audioTrack]);

  if (orientation === "vertical") {
    return (
      <div className="flex flex-col-reverse items-center gap-1 h-full py-4">
        {[...Array(20)].map((_, i) => {
          const barThreshold = (i / 20) * 100;
          const isActive = level > barThreshold;

          return (
            <div
              key={i}
              className={`h-3 rounded-full transition-all duration-100 ${
                isActive
                  ? i < 12
                    ? "bg-cyan-400"
                    : i < 16
                    ? "bg-yellow-400"
                    : "bg-red-400"
                  : "bg-gray-700"
              }`}
              style={{
                width: `${Math.min(100, 30 + i * 3.5)}%`,
                minWidth: "8px",
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 h-2">
      {[...Array(20)].map((_, i) => {
        const barThreshold = (i / 20) * 100;
        const isActive = level > barThreshold;

        return (
          <div
            key={i}
            className={`w-1 h-full rounded-full transition-all duration-100 ${
              isActive
                ? i < 12
                  ? "bg-cyan-400"
                  : i < 16
                  ? "bg-yellow-400"
                  : "bg-red-400"
                : "bg-gray-700"
            }`}
            style={{
              height: `${Math.min(100, 30 + i * 3.5)}%`,
            }}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PreJoin({ onJoin, initialName = "" }: PreJoinProps) {
  // State
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState("");
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState("");
  const [selectedAudioOutputDeviceId, setSelectedAudioOutputDeviceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [nickname, setNickname, allNicknames] = useNicknames();
  const [localNickname, setLocalNickname] = useState(initialName);
  const connectedUsers = useConnectedUsers();

  // Device lists - using native browser APIs instead of LiveKit hooks
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Set mounted flag and check browser support (client-side only)
  useEffect(() => {
    setIsMounted(true);
    const isSupported =
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      "getUserMedia" in navigator.mediaDevices;
    setIsBrowserSupported(isSupported);
  }, []);

  useEffect(() => {
    if (initialName) {
      setLocalNickname(initialName);
      setNickname(initialName);
    }
  }, [initialName, setNickname]);

  // Initialize devices - request permissions first, then enumerate
  useEffect(() => {
    const initializeDevices = async () => {
      // Check if we're in the browser and mediaDevices API is available
      if (
        typeof window === "undefined" ||
        !navigator?.mediaDevices?.getUserMedia
      ) {
        console.error("[PreJoin] Media devices API not available");
        return;
      }

      try {
        console.log("[PreJoin] Requesting media permissions...");
        
        // Request permissions to access camera and microphone
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log("[PreJoin] Permissions granted, enumerating devices...");

        // Now enumerate devices - they will have proper labels
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const videoInputs = devices.filter(
          (device) => device.kind === "videoinput" && device.deviceId
        );
        const audioInputs = devices.filter(
          (device) => device.kind === "audioinput" && device.deviceId
        );
        const audioOutputs = devices.filter(
          (device) => device.kind === "audiooutput" && device.deviceId
        );

        console.log("[PreJoin] Found devices:", {
          video: videoInputs.length,
          audio: audioInputs.length,
          audioOutput: audioOutputs.length
        });

        // Log device names for debugging
        console.log("[PreJoin] Video devices:", videoInputs.map(d => d.label));
        console.log("[PreJoin] Audio input devices:", audioInputs.map(d => d.label));
        console.log("[PreJoin] Audio output devices:", audioOutputs.map(d => d.label));

        // Set device arrays first
        setVideoDevices(videoInputs);
        setAudioInputDevices(audioInputs);
        setAudioOutputDevices(audioOutputs);

        // Check localStorage
        const savedVideoId = localStorage.getItem('prejoin-video-device-id');
        const savedAudioId = localStorage.getItem('prejoin-audio-device-id');
        const savedAudioOutputId = localStorage.getItem('prejoin-audio-output-device-id');

        console.log("[PreJoin] localStorage values:", {
          video: savedVideoId,
          audio: savedAudioId,
          audioOutput: savedAudioOutputId
        });

        // Video device selection
        if (videoInputs.length > 0) {
          let selectedId = '';
          
          if (savedVideoId && videoInputs.find(d => d.deviceId === savedVideoId)) {
            selectedId = savedVideoId;
            console.log("[PreJoin] Using saved video device:", selectedId);
          } else {
            selectedId = findDefaultDevice(videoInputs);
            console.log("[PreJoin] Using default/first video device:", selectedId);
          }
          
          setSelectedVideoDeviceId(selectedId);
        }

        // Audio input device selection
        if (audioInputs.length > 0) {
          let selectedId = '';
          
          if (savedAudioId && audioInputs.find(d => d.deviceId === savedAudioId)) {
            selectedId = savedAudioId;
            console.log("[PreJoin] Using saved audio device:", selectedId);
          } else {
            selectedId = findDefaultDevice(audioInputs);
            console.log("[PreJoin] Using default/first audio device:", selectedId);
          }
          
          setSelectedAudioDeviceId(selectedId);
        }

        // Audio output device selection
        if (audioOutputs.length > 0) {
          let selectedId = '';
          
          if (savedAudioOutputId && audioOutputs.find(d => d.deviceId === savedAudioOutputId)) {
            selectedId = savedAudioOutputId;
            console.log("[PreJoin] Using saved audio output device:", selectedId);
          } else {
            selectedId = findDefaultDevice(audioOutputs);
            console.log("[PreJoin] Using default/first audio output device:", selectedId);
          }
          
          setSelectedAudioOutputDeviceId(selectedId);
        }

        // Stop the permission stream, we'll create a new one with the selected device
        permissionStream.getTracks().forEach((track) => track.stop());

        setIsLoading(false);
      } catch (error) {
        console.error("[PreJoin] Error initializing devices:", error);
        setIsLoading(false);

        // If permission denied, still try to enumerate (will show generic names)
        try {
          if (navigator?.mediaDevices?.enumerateDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(
              (device) => device.kind === "videoinput"
            );
            const audioInputs = devices.filter(
              (device) => device.kind === "audioinput"
            );
            const audioOutputs = devices.filter(
              (device) => device.kind === "audiooutput"
            );

            setVideoDevices(videoInputs);
            setAudioInputDevices(audioInputs);
            setAudioOutputDevices(audioOutputs);
          }
        } catch (enumError) {
          console.error("[PreJoin] Error enumerating devices:", enumError);
        }

        if (error instanceof Error) {
          if (
            error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError"
          ) {
            setPermissionError(
              "Camera and microphone access denied. Please allow access to continue."
            );
          } else if (error.name === "NotFoundError") {
            setPermissionError(
              "No camera or microphone found. Please connect a device."
            );
          } else {
            setPermissionError(`Media error: ${error.message}`);
          }
        }
      }
    };

    initializeDevices();
  }, []);

  // Save device selections to localStorage
  useEffect(() => {
    if (selectedAudioDeviceId) {
      console.log("[PreJoin] Saving audio device to localStorage:", selectedAudioDeviceId);
      localStorage.setItem('prejoin-audio-device-id', selectedAudioDeviceId);
    }
  }, [selectedAudioDeviceId]);

  useEffect(() => {
    if (selectedVideoDeviceId) {
      console.log("[PreJoin] Saving video device to localStorage:", selectedVideoDeviceId);
      localStorage.setItem('prejoin-video-device-id', selectedVideoDeviceId);
    }
  }, [selectedVideoDeviceId]);

  useEffect(() => {
    if (selectedAudioOutputDeviceId) {
      console.log("[PreJoin] Saving audio output device to localStorage:", selectedAudioOutputDeviceId);
      localStorage.setItem('prejoin-audio-output-device-id', selectedAudioOutputDeviceId);
    }
  }, [selectedAudioOutputDeviceId]);

  // Unified media stream handler - creates a single stream with both audio and video
  useEffect(() => {
    // Check if we're in the browser and mediaDevices API is available
    if (
      typeof window === "undefined" ||
      !navigator?.mediaDevices?.getUserMedia
    ) {
      return;
    }

    // If both are disabled or no devices selected, clear everything
    if (
      (!videoEnabled && !audioEnabled) ||
      (!selectedVideoDeviceId && !selectedAudioDeviceId)
    ) {
      setVideoTrack(null);
      setAudioTrack(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    let mounted = true;
    let stream: MediaStream | null = null;

    const getStream = async () => {
      try {
        // Create constraints based on what's enabled
        const constraints: MediaStreamConstraints = {
          video: videoEnabled && selectedVideoDeviceId
            ? { deviceId: selectedVideoDeviceId }
            : false,
          audio: audioEnabled && selectedAudioDeviceId
            ? { deviceId: selectedAudioDeviceId }
            : false,
        };

        // Request a single stream with both audio and video
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = mediaStream;

        // Extract and set video track
        if (videoEnabled && mediaStream.getVideoTracks().length > 0) {
          const vTrack = mediaStream.getVideoTracks()[0];
          setVideoTrack(vTrack);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else {
          setVideoTrack(null);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }

        // Extract and set audio track
        if (audioEnabled && mediaStream.getAudioTracks().length > 0) {
          const aTrack = mediaStream.getAudioTracks()[0];
          setAudioTrack(aTrack);
        } else {
          setAudioTrack(null);
        }
      } catch (error) {
        console.error("[PreJoin] Error getting media stream:", error);
        if (mounted) {
          if (error instanceof Error) {
            if (error.name === "NotAllowedError") {
              setPermissionError("Media access denied. Please enable permissions.");
            } else if (error.name === "NotFoundError") {
              setPermissionError("No camera or microphone found.");
            } else {
              setPermissionError(`Media error: ${error.message}`);
            }
          }
        }
      }
    };

    getStream();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setVideoTrack(null);
      setAudioTrack(null);
    };
  }, [videoEnabled, audioEnabled, selectedVideoDeviceId, selectedAudioDeviceId]);

  // Handle form submission
  const handleJoin = useCallback(() => {
    if (!localNickname.trim()) {
      setError("Please enter your name");
      return;
    }

    if (localNickname.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (localNickname.trim().length > 50) {
      setError("Name must be less than 50 characters");
      return;
    }

    const settings: PreJoinSettings = {
      name: localNickname.trim(),
      audioEnabled,
      videoEnabled,
      audioDeviceId: selectedAudioDeviceId,
      videoDeviceId: selectedVideoDeviceId,
      audioOutputDeviceId: selectedAudioOutputDeviceId,
    };

    onJoin(settings);
    setNickname(localNickname);
  }, [
    localNickname,
    audioEnabled,
    videoEnabled,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    selectedAudioOutputDeviceId,
    onJoin,
    setNickname,
  ]);

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleJoin();
    }
  };

  // Debug logging for selected devices
  useEffect(() => {
    console.log("[PreJoin] Selected devices:", {
      video: selectedVideoDeviceId,
      audio: selectedAudioDeviceId,
      audioOutput: selectedAudioOutputDeviceId
    });
  }, [selectedVideoDeviceId, selectedAudioDeviceId, selectedAudioOutputDeviceId]);

  // Fallback for unsupported browsers (only show after client-side mount to avoid hydration mismatch)
  if (isMounted && !isBrowserSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            className="stroke-red-400"
          >
            <path
              fill="currentColor"
              d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9 2 12t.788-3.9 2.137-3.175T8.1 2.788 12 2t3.9.788 3.175 2.137T21.213 8.1 22 12t-.788 3.9-2.137 3.175-3.175 2.138T12 22"
            />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-4">
            Browser Not Supported
          </h2>
          <p className="text-gray-300 mb-6">
            Your browser does not support the required media features. Please
            use a modern browser like Chrome, Firefox, Safari, or Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-2xl w-full bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/30 px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-2">Join Room</h1>
          <p className="text-gray-300">
            Configure your audio and video settings
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Error Messages */}
          {(error || permissionError) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                className="stroke-red-400"
              >
                <path
                  fill="currentColor"
                  d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9 2 12t.788-3.9 2.137-3.175T8.1 2.788 12 2t3.9.788 3.175 2.137T21.213 8.1 22 12t-.788 3.9-2.137 3.175-3.175 2.138T12 22"
                />
              </svg>
              <p className="text-red-300 text-sm">{error || permissionError}</p>
            </div>
          )}

          {/* Video Preview with Audio Level */}
          <div className="space-y-3">
            <div className="flex gap-4">
              {/* Video Preview */}
              <div className="relative flex-1 aspect-video bg-gray-950 rounded-2xl overflow-hidden border border-gray-700/50">
                {videoEnabled && !isLoading ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        className="w-16 h-16 text-gray-600 mx-auto mb-3"
                      >
                        <path
                          fill="currentColor"
                          d="M3.27 2L2 3.27 4.73 6H4a1 1 0 00-1 1v10a1 1 0 001 1h12c.2 0 .39-.08.54-.18L19.73 21 21 19.73M21 6.5l-4 4V7a1 1 0 00-1-1H9.82L21 17.18z"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm">
                        {isLoading ? "Loading camera..." : "Camera disabled"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Video overlay with name */}
                {videoEnabled && localNickname && (
                  <div className="absolute bottom-4 left-4 px-4 py-2 bg-gray-900/80 backdrop-blur-md rounded-lg border border-cyan-500/30">
                    <p className="text-white font-medium">{localNickname}</p>
                  </div>
                )}
              </div>

              {/* Audio Level Indicator - Vertical */}
              {audioEnabled && audioTrack && (
                <div className="flex items-center justify-center px-4 bg-gray-950 border border-gray-700 rounded-2xl">
                  <AudioLevelIndicator
                    audioTrack={audioTrack}
                    orientation="vertical"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-3 mt-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium p-2 text-gray-300"
            >
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={localNickname}
              onChange={(e) => {
                setLocalNickname(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              maxLength={50}
            />
          </div>

          {/* Device Selection */}
          <div className="flex gap-4 mt-4">
            {/* Camera Selection */}
            <div className="flex-1">
              <DualButtonSelect
                isToggled={!videoEnabled}
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={44}
                    height={44}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="cyan"
                  >
                    <path
                      fill="currentColor"
                      d="M3.5 3A2.5 2.5 0 001 5.5v5A2.5 2.5 0 003.5 13h5a2.5 2.5 0 002.5-2.5v-.127l2.035 1.405a1.25 1.25 0 001.96-1.028V5.252a1.25 1.25 0 00-1.96-1.028L11 5.629V5.5A2.5 2.5 0 008.5 3zM11 6.844l2.604-1.798a.25.25 0 01.392.206v5.498a.25.25 0 01-.392.205L11 9.158zM2 5.5A1.5 1.5 0 013.5 4h5A1.5 1.5 0 0110 5.5v5A1.5 1.5 0 018.5 12h-5A1.5 1.5 0 012 10.5z"
                    />
                  </svg>
                }
                leftIconToggled={
                  <svg width={44} height={44} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path
                      d="M15.65 4.79a1.891 1.891 0 00-2.64-.44l-1.55 1.11a3.15 3.15 0 00-.25-.75l2.3-2.03-.99-1.12-2.27 2c-.49-.35-1.09-.57-1.74-.57H3c-1.66 0-3 1.34-3 3v4c0 .75.29 1.43.74 1.96l-1.24 1.1.99 1.12 1.53-1.35c.31.11.63.18.97.18h5.5c1.45 0 2.69-1.04 2.95-2.46l1.55 1.11a1.893 1.893 0 002.99-1.54V5.9c0-.39-.12-.78-.35-1.1zM1.5 10V6c0-.83.67-1.5 1.5-1.5h5.5c.2 0 .38.04.56.11l-7.2 6.36c-.22-.26-.36-.6-.36-.97zm8.5 0c0 .83-.67 1.5-1.5 1.5H3.53l6.45-5.7c0 .07.02.13.02.2v4zm4.5.11c0 .08-.03.16-.07.23-.13.18-.37.22-.55.09l-2.38-1.7V7.27l2.38-1.7a.39.39 0 01.23-.07c.22 0 .39.18.39.39v4.21z"
                      fill="#cc003f"
                    />
                  </svg>
                }
                leftContent="Camera"
                options={videoDevices.map((device, index) => ({
                  label: device.label || `Camera ${index + 1}`,
                  value: device.deviceId,
                }))}
                value={selectedVideoDeviceId}
                onValueChange={setSelectedVideoDeviceId}
                onLeftClick={() => setVideoEnabled(!videoEnabled)}
                placeholder="Select camera"
              />
            </div>

            {/* Microphone Selection */}
            <div className="flex-1">
              <DualButtonSelect
                isToggled={!audioEnabled}
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={44}
                    height={44}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="cyan"
                    strokeWidth={2}
                  >
                    <path
                      d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72z"
                    />
                  </svg>
                }
                leftIconToggled={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={44}
                    height={44}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="red"
                      d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72z"
                    />
                  </svg>
                }
                leftContent="Microphone"
                options={audioInputDevices.map((device, index) => ({
                  label: device.label || `Microphone ${index + 1}`,
                  value: device.deviceId,
                }))}
                value={selectedAudioDeviceId}
                onValueChange={setSelectedAudioDeviceId}
                onLeftClick={() => setAudioEnabled(!audioEnabled)}
                placeholder="Select microphone"
              />
            </div>

            {/* Speakers Selection */}
            <div className="flex-1">
              <DualButtonSelect
                isToggled={!selectedAudioOutputDeviceId}
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={44}
                    height={44}
                    viewBox="0 0 24 24"
                  >
                    <g fill="none" stroke="cyan" strokeWidth={2}>
                      <path d="M1 13.857v-3.714a2 2 0 012-2h2.9a1 1 0 00.55-.165l6-3.956a1 1 0 011.55.835v14.286a1 1 0 01-1.55.835l-6-3.956a1 1 0 00-.55-.165H3a2 2 0 01-2-2z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.5 7.5S19 9 19 11.5s-1.5 4-1.5 4m3-11S23 7 23 11.5s-2.5 7-2.5 7"
                      />
                    </g>
                  </svg>
                }
                leftIconToggled={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={44}
                    height={44}
                    viewBox="0 0 24 24"
                  >
                    <g fill="none" stroke="red" strokeWidth={2}>
                      <path d="M1 13.857v-3.714a2 2 0 012-2h2.9a1 1 0 00.55-.165l6-3.956a1 1 0 011.55.835v14.286a1 1 0 01-1.55.835l-6-3.956a1 1 0 00-.55-.165H3a2 2 0 01-2-2z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.5 7.5S19 9 19 11.5s-1.5 4-1.5 4m3-11S23 7 23 11.5s-2.5 7-2.5 7"
                      />
                    </g>
                  </svg>
                }
                leftContent="Speakers"
                options={audioOutputDevices.map((device, index) => ({
                  label: device.label || `Speakers ${index + 1}`,
                  value: device.deviceId,
                }))}
                value={selectedAudioOutputDeviceId}
                onValueChange={setSelectedAudioOutputDeviceId}
                onLeftClick={() => setSelectedAudioOutputDeviceId("")}
                placeholder="Select speakers"
              />
            </div>
            <div className="flex items-center w-32 h-20 rounded-lg overflow-hidden shadow-lg bg-gray-950">
              <button className="flex-1 h-full flex items-center justify-center transition-all opacity-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={44}
                  height={44}
                  viewBox="0 0 24 24"
                  fill="cyan"
                  stroke="none"
                >
                  <path
                    d="M9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75 2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75 2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25 2.75 4.75-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95-2.75 4.75-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={!localNickname.trim() || isLoading}
            className="w-full cursor-pointer mt-4 btn-brand text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}