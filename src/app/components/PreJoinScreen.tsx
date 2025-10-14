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

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
}

// ============================================================================
// AUDIO LEVEL INDICATOR COMPONENT
// ============================================================================

function AudioLevelIndicator({ audioTrack }: AudioLevelProps) {
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
      console.error('[AudioLevelIndicator] Failed to initialize:', error);
    }
  }, [audioTrack]);

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
                  ? 'bg-cyan-400'
                  : i < 16
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
                : 'bg-gray-700'
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

export function PreJoin({ onJoin, initialName = '' }: PreJoinProps) {
  // State
  const [name, setName] = useState(initialName);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState('');
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState('');
  const [selectedAudioOutputDeviceId, setSelectedAudioOutputDeviceId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);

  // Device lists - using native browser APIs instead of LiveKit hooks
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Set mounted flag and check browser support (client-side only)
  useEffect(() => {
    setIsMounted(true);
    const isSupported =
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      'getUserMedia' in navigator.mediaDevices;
    setIsBrowserSupported(isSupported);
  }, []);

  // Initialize devices - request permissions first, then enumerate
  useEffect(() => {
    const initializeDevices = async () => {
      // Check if we're in the browser and mediaDevices API is available
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        console.error('[PreJoin] Media devices API not available');
        return;
      }

      try {
        // Request permissions to access camera and microphone
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log('[PreJoin] Media permissions granted');

        // Now enumerate devices - they will have proper labels
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === 'videoinput' && device.deviceId);
        const audioInputs = devices.filter((device) => device.kind === 'audioinput' && device.deviceId);
        const audioOutputs = devices.filter((device) => device.kind === 'audiooutput' && device.deviceId);

        setVideoDevices(videoInputs);
        setAudioInputDevices(audioInputs);
        setAudioOutputDevices(audioOutputs);

        if (videoInputs.length > 0) setSelectedVideoDeviceId(videoInputs[0].deviceId);
        if (audioInputs.length > 0) setSelectedAudioDeviceId(audioInputs[0].deviceId);
        if (audioOutputs.length > 0) setSelectedAudioOutputDeviceId(audioOutputs[0].deviceId);

        // Stop the permission stream, we'll create a new one with the selected device
        permissionStream.getTracks().forEach((track) => track.stop());

        setIsLoading(false);
      } catch (error) {
        console.error('[PreJoin] Error initializing devices:', error);
        setIsLoading(false);

        // If permission denied, still try to enumerate (will show generic names)
        try {
          if (navigator?.mediaDevices?.enumerateDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter((device) => device.kind === 'videoinput');
            const audioInputs = devices.filter((device) => device.kind === 'audioinput');
            const audioOutputs = devices.filter((device) => device.kind === 'audiooutput');

            setVideoDevices(videoInputs);
            setAudioInputDevices(audioInputs);
            setAudioOutputDevices(audioOutputs);
          }
        } catch (enumError) {
          console.error('[PreJoin] Error enumerating devices:', enumError);
        }

        if (error instanceof Error) {
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            setPermissionError(
              'Camera and microphone access denied. Please allow access to continue.'
            );
          } else if (error.name === 'NotFoundError') {
            setPermissionError('No camera or microphone found. Please connect a device.');
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
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
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
        console.log('[PreJoin] Getting video stream for device:', selectedVideoDeviceId);

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

        console.log('[PreJoin] Video stream set successfully');
      } catch (error) {
        console.error('[PreJoin] Error getting video stream:', error);
        if (mounted) {
          setPermissionError('Camera access denied. Please enable camera permissions.');
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
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
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
        console.log('[PreJoin] Getting audio stream for device:', selectedAudioDeviceId);

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

        console.log('[PreJoin] Audio stream set successfully');
      } catch (error) {
        console.error('[PreJoin] Error getting audio stream:', error);
        if (mounted) {
          setPermissionError('Microphone access denied. Please enable microphone permissions.');
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
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (name.trim().length > 50) {
      setError('Name must be less than 50 characters');
      return;
    }

    const settings: PreJoinSettings = {
      name: name.trim(),
      audioEnabled,
      videoEnabled,
      audioDeviceId: selectedAudioDeviceId,
      videoDeviceId: selectedVideoDeviceId,
      audioOutputDeviceId: selectedAudioOutputDeviceId,
    };

    onJoin(settings);
  }, [
    name,
    audioEnabled,
    videoEnabled,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    selectedAudioOutputDeviceId,
    onJoin,
  ]);

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleJoin();
    }
  };

  // Fallback for unsupported browsers (only show after client-side mount to avoid hydration mismatch)
  if (isMounted && !isBrowserSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 text-center">
          <ErrorIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Browser Not Supported</h2>
          <p className="text-gray-300 mb-6">
            Your browser does not support the required media features. Please use a modern browser
            like Chrome, Firefox, Safari, or Edge.
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
          <p className="text-gray-300">Configure your audio and video settings</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Error Messages */}
          {(error || permissionError) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <ErrorIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error || permissionError}</p>
            </div>
          )}

          {/* Video Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Video Preview</label>
            <div className="relative aspect-video bg-gray-950 rounded-2xl overflow-hidden border border-gray-700/50">
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
                    <CameraOffIcon className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {isLoading ? 'Loading camera...' : 'Camera disabled'}
                    </p>
                  </div>
                </div>
              )}

              {/* Video overlay with name */}
              {videoEnabled && name && (
                <div className="absolute bottom-4 left-4 px-4 py-2 bg-gray-900/80 backdrop-blur-md rounded-lg border border-cyan-500/30">
                  <p className="text-white font-medium">{name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              maxLength={50}
            />
          </div>

          {/* Device Selection */}
          <div className="grid grid-cols-1 gap-4">
            {/* Camera Selection */}
            <div className="space-y-3"><svg
      xmlns="http://www.w3.org/2000/svg"
      width={56}
      height={56}
      viewBox="0 0 56 56"
   
    >
      <path
        fill="currentColor"
        d="M48.16 48.934c.717.484 1.665.29 2.227-.503C53.929 43.359 56 36.836 56 29.926S53.91 16.472 50.386 11.4c-.56-.794-1.51-.987-2.226-.484-.735.503-.851 1.471-.29 2.284 3.116 4.588 5.052 10.472 5.052 16.725 0 6.252-1.877 12.214-5.052 16.724-.561.794-.445 1.761.29 2.284M21.642 47.6c1.317 0 2.265-.968 2.265-2.265V14.459c0-1.297-.948-2.38-2.303-2.38-.949 0-1.588.425-2.614 1.393l-8.536 8.072a.76.76 0 01-.503.174H4.2c-2.729 0-4.2 1.49-4.2 4.394v7.51c0 2.904 1.471 4.395 4.2 4.395h5.75a.76.76 0 01.503.174l8.536 8.15c.93.87 1.704 1.258 2.652 1.258m18.719-3.95c.754.504 1.684.31 2.226-.464 2.555-3.562 4.026-8.304 4.026-13.26 0-4.974-1.452-9.717-4.026-13.278-.562-.755-1.472-.949-2.227-.446-.735.504-.851 1.452-.27 2.284 2.11 3.098 3.406 7.163 3.406 11.44 0 4.278-1.258 8.382-3.426 11.44-.542.833-.445 1.781.29 2.285m-7.724-5.226c.658.465 1.607.31 2.168-.445 1.51-2.032 2.42-5.013 2.42-8.053 0-3.038-.93-6-2.42-8.071-.561-.755-1.49-.91-2.168-.446-.852.562-.949 1.549-.33 2.4 1.124 1.51 1.801 3.814 1.801 6.118 0 2.303-.716 4.607-1.82 6.136-.58.832-.483 1.78.349 2.361"
      />
    </svg>
              <label htmlFor="camera" className="block text-sm fon
              00">
                Camera
              </label>
              <div className="relative">
                <CameraIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
                <select
                  id="camera"
                  value={selectedVideoDeviceId}
                  onChange={(e) => setSelectedVideoDeviceId(e.target.value)}
                  disabled={!videoDevices || videoDevices.length === 0}
                  className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {videoDevices && videoDevices.length > 0 ? (
                    videoDevices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${index + 1}`}
                      </option>
                    ))
                  ) : (
                    <option>No cameras found</option>
                  )}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Microphone Selection */}
            <div className="space-y-3">
              <label htmlFor="microphone" className="block text-sm font-medium text-gray-300">
                Microphone
              </label>
              <div className="relative">
                <MicrophoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
                <select
                  id="microphone"
                  value={selectedAudioDeviceId}
                  onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
                  disabled={!audioInputDevices || audioInputDevices.length === 0}
                  className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {audioInputDevices && audioInputDevices.length > 0 ? (
                    audioInputDevices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${index + 1}`}
                      </option>
                    ))
                  ) : (
                    <option>No microphones found</option>
                  )}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Audio Level Indicator */}
              {audioEnabled && audioTrack && (
                <div className="px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl">
                  <AudioLevelIndicator audioTrack={audioTrack} />
                </div>
              )}
            </div>

            {/* Speakers Selection */}
            <div className="space-y-3">
              <label htmlFor="speakers" className="block text-sm font-medium text-gray-300">
                Speakers
              </label>
              <div className="relative">
                <SpeakerIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
                <select
                  id="speakers"
                  value={selectedAudioOutputDeviceId}
                  onChange={(e) => setSelectedAudioOutputDeviceId(e.target.value)}
                  disabled={!audioOutputDevices || audioOutputDevices.length === 0}
                  className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {audioOutputDevices && audioOutputDevices.length > 0 ? (
                    audioOutputDevices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${index + 1}`}
                      </option>
                    ))
                  ) : (
                    <option>Default speakers</option>
                  )}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-3 pt-2">
            {/* Audio Toggle */}
            <label className="flex items-center justify-between p-4 bg-gray-950 border border-gray-700 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-all group">
              <div className="flex items-center gap-3">
                <MicrophoneIcon className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-medium">Start with audio enabled</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={audioEnabled}
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  audioEnabled ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    audioEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            {/* Video Toggle */}
            <label className="flex items-center justify-between p-4 bg-gray-950 border border-gray-700 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-all group">
              <div className="flex items-center gap-3">
                <CameraIcon className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-medium">Start with video enabled</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={videoEnabled}
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  videoEnabled ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    videoEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={!name.trim() || isLoading}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:shadow-none"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CameraOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 8v8m-8-5v.01M8 3h8a2 2 0 012 2v8.5m-1.5 1.5A2.002 2.002 0 0114.5 15H5a2 2 0 01-2-2V5a2 2 0 012-2l8 8m5.5 5.5L3 3"
      />
    </svg>
  );
}

function MicrophoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
