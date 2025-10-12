'use client'
import React from 'react'
import { useMediaDeviceSelect } from '@livekit/components-react'
import { X } from 'lucide-react'

interface DeviceSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({ isOpen, onClose }) => {
  const audioDeviceSelect = useMediaDeviceSelect({
    kind: 'audioinput',
    requestPermissions: true,
  })

  const videoDeviceSelect = useMediaDeviceSelect({
    kind: 'videoinput',
    requestPermissions: true,
  })

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Device Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio Input
              </label>
              <select
                value={audioDeviceSelect.activeDeviceId || ''}
                onChange={(e) => audioDeviceSelect.setActiveMediaDevice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {audioDeviceSelect.devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Input
              </label>
              <select
                value={videoDeviceSelect.activeDeviceId || ''}
                onChange={(e) => videoDeviceSelect.setActiveMediaDevice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {videoDeviceSelect.devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  )
}