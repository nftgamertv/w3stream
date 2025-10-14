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
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useConnectedUsers, useNicknames } from "react-together";
import DualButtonSelect from "@/components/DualButtonSelect"; // ============================================================================
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
  orientation?: 'horizontal' | 'vertical';
}

// ============================================================================
// AUDIO LEVEL INDICATOR COMPONENT
// ============================================================================

function AudioLevelIndicator({ audioTrack, orientation = 'horizontal' }: AudioLevelProps) {
  const [level, setLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioTrack) {
      setLevel(0);
      return;
    }

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(
        new MediaStream([audioTrack])
      );

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalized = Math.min(100, (average / 255) * 150);

        setLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        microphone.disconnect();
        analyser.disconnect();
        audioContext.close();
      };
    } catch (error) {
      console.error("[AudioLevelIndicator] Failed to initialize:", error);
    }
  }, [audioTrack]);

  if (orientation === 'vertical') {
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
                minWidth: '8px',
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
  const [selectedAudioOutputDeviceId, setSelectedAudioOutputDeviceId] =
    useState("");
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
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    MediaDeviceInfo[]
  >([]);

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
        // Request permissions to access camera and microphone
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log("[PreJoin] Media permissions granted");

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

        setVideoDevices(videoInputs);
        setAudioInputDevices(audioInputs);
        setAudioOutputDevices(audioOutputs);

        if (videoInputs.length > 0)
          setSelectedVideoDeviceId(videoInputs[0].deviceId);
        if (audioInputs.length > 0)
          setSelectedAudioDeviceId(audioInputs[0].deviceId);
        if (audioOutputs.length > 0)
          setSelectedAudioOutputDeviceId(audioOutputs[0].deviceId);

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

  // Handle video preview - get stream for preview (like the working example)
  useEffect(() => {
    // Check if we're in the browser and mediaDevices API is available
    if (
      typeof window === "undefined" ||
      !navigator?.mediaDevices?.getUserMedia
    ) {
      return;
    }

    // If video is disabled or no device selected, clear the stream
    if (!videoEnabled || !selectedVideoDeviceId) {
      setVideoTrack(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    let mounted = true;
    let stream: MediaStream | null = null;

    const getStream = async () => {
      try {
        console.log(
          "[PreJoin] Getting video stream for device:",
          selectedVideoDeviceId
        );

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedVideoDeviceId },
          audio: false,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = mediaStream;
        const track = mediaStream.getVideoTracks()[0];
        setVideoTrack(track);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        console.log("[PreJoin] Video stream set successfully");
      } catch (error) {
        console.error("[PreJoin] Error getting video stream:", error);
        if (mounted) {
          setPermissionError(
            "Camera access denied. Please enable camera permissions."
          );
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
    };
  }, [videoEnabled, selectedVideoDeviceId]);

  // Handle audio preview for level indicator - separate effect for audio
  useEffect(() => {
    // Check if we're in the browser and mediaDevices API is available
    if (
      typeof window === "undefined" ||
      !navigator?.mediaDevices?.getUserMedia
    ) {
      return;
    }

    // If audio is disabled or no device selected, clear the track
    if (!audioEnabled || !selectedAudioDeviceId) {
      setAudioTrack(null);
      return;
    }

    let mounted = true;
    let stream: MediaStream | null = null;

    const getStream = async () => {
      try {
        console.log(
          "[PreJoin] Getting audio stream for device:",
          selectedAudioDeviceId
        );

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: selectedAudioDeviceId },
          video: false,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = mediaStream;
        const track = mediaStream.getAudioTracks()[0];
        setAudioTrack(track);

        console.log("[PreJoin] Audio stream set successfully");
      } catch (error) {
        console.error("[PreJoin] Error getting audio stream:", error);
        if (mounted) {
          setPermissionError(
            "Microphone access denied. Please enable microphone permissions."
          );
        }
      }
    };

    getStream();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setAudioTrack(null);
    };
  }, [audioEnabled, selectedAudioDeviceId]);

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
                  <AudioLevelIndicator audioTrack={audioTrack} orientation="vertical" />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={44}
                    height={44}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="red"
                  >
                    <path
                      fill="currentColor"
                      d="M3.5 3A2.5 2.5 0 001 5.5v5A2.5 2.5 0 003.5 13h5a2.5 2.5 0 002.5-2.5v-.127l2.035 1.405a1.25 1.25 0 001.96-1.028V5.252a1.25 1.25 0 00-1.96-1.028L11 5.629V5.5A2.5 2.5 0 008.5 3zM11 6.844l2.604-1.798a.25.25 0 01.392.206v5.498a.25.25 0 01-.392.205L11 9.158zM2 5.5A1.5 1.5 0 013.5 4h5A1.5 1.5 0 0110 5.5v5A1.5 1.5 0 018.5 12h-5A1.5 1.5 0 012 10.5z"
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
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={44}
                    height={44}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
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
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={44}
                    height={44}
                    viewBox="0 0 24 24"
                  >
                    <g fill="none" stroke="currentColor" strokeWidth={1.5}>
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
                    <g fill="none" stroke="red" strokeWidth={1.5}>
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
             <div className="flex-1"></div>
          </div>

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={!localNickname.trim() || isLoading}
            className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:shadow-none"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
