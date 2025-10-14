'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

type EnvironmentTemplate = 'cyber-office' | 'auditorium' | 'creative-studio';

interface CreateRoomForm {
  hostName: string;
  environment: EnvironmentTemplate;
}

interface FormErrors {
  hostName?: string;
  roomId?: string;
  submit?: string;
}
export default function CreateRoomForm() {
      const router = useRouter();

  // Create Room State
  const [createForm, setCreateForm] = useState<CreateRoomForm>({
    hostName: '',
    environment: 'cyber-office',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});

  // Join Room State
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Create Room Handler
  const handleCreateRoom = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateErrors({});

    // Validation
    if (!createForm.hostName.trim()) {
      setCreateErrors({ hostName: 'Host name is required' });
      return;
    }

    if (createForm.hostName.trim().length < 2) {
      setCreateErrors({ hostName: 'Host name must be at least 2 characters' });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostName: createForm.hostName.trim(),
          environment: createForm.environment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create room');
      }

      const data = await response.json();

      if (data.roomId) {
        // Pass the host name and role as query parameters to skip the prejoin screen
        router.push(`/room/${data.roomId}?name=${encodeURIComponent(createForm.hostName.trim())}&role=host`);
      } else {
        throw new Error('No room ID returned');
      }
    } catch (error) {
      setCreateErrors({
        submit: error instanceof Error ? error.message : 'Failed to create room. Please try again.',
      });
      setIsCreating(false);
    }
  };

  // Join Room Handler
  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setJoinError('');

    // Validation
    if (!roomId.trim()) {
      setJoinError('Room ID is required');
      return;
    }

    if (roomId.trim().length < 3) {
      setJoinError('Please enter a valid room ID');
      return;
    }

    setIsJoining(true);
    router.push(`/room/${roomId.trim()}`);
  };

  const environments: { value: EnvironmentTemplate; label: string; description: string }[] = [
    { value: 'cyber-office', label: 'Cyber Office', description: 'Modern workspace with neon aesthetics' },
    { value: 'auditorium', label: 'Auditorium', description: 'Large venue for presentations' },
    { value: 'creative-studio', label: 'Creative Studio', description: 'Collaborative creative space' },
  ];
  return (
    <div>
                  {/* Create Room Card */}
          <div className="group relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] rounded-2xl p-8 border border-[#00ffff]/20 shadow-2xl hover:shadow-[#00ffff]/20 transition-all duration-300">
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00ffff]/0 via-[#00ffff]/5 to-[#00ffff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#00aaff] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0a0a0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Create New Room</h2>
              </div>

              <p className="text-gray-400 mb-8">
                Start a new 3D collaboration session and invite your team.
              </p>

              <form onSubmit={handleCreateRoom} className="space-y-6">
                {/* Host Name Input */}
                <div>
                  <label htmlFor="hostName" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    id="hostName"
                    type="text"
                    value={createForm.hostName}
                    onChange={(e) => setCreateForm({ ...createForm, hostName: e.target.value })}
                    placeholder="Enter your name"
                    disabled={isCreating}
                    className={`w-full px-4 py-3 bg-[#0a0a0f]/50 border ${
                      createErrors.hostName ? 'border-red-500' : 'border-[#00ffff]/30'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ffff] focus:border-transparent text-white placeholder-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-invalid={!!createErrors.hostName}
                    aria-describedby={createErrors.hostName ? 'hostName-error' : undefined}
                  />
                  {createErrors.hostName && (
                    <p id="hostName-error" className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {createErrors.hostName}
                    </p>
                  )}
                </div>

                {/* Environment Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Environment Template
                  </label>
                  <div className="space-y-3">
                    {environments.map((env) => (
                      <label
                        key={env.value}
                        className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          createForm.environment === env.value
                            ? 'border-[#00ffff] bg-[#00ffff]/10'
                            : 'border-[#00ffff]/20 hover:border-[#00ffff]/40 bg-[#0a0a0f]/30'
                        } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name="environment"
                          value={env.value}
                          checked={createForm.environment === env.value}
                          onChange={(e) => setCreateForm({ ...createForm, environment: e.target.value as EnvironmentTemplate })}
                          disabled={isCreating}
                          className="mt-1 h-4 w-4 text-[#00ffff] border-gray-300 focus:ring-[#00ffff]"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-white">{env.label}</p>
                          <p className="text-sm text-gray-400">{env.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {createErrors.submit && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50">
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {createErrors.submit}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#00ffff] to-[#00aaff] hover:from-[#00aaff] hover:to-[#0088ff] text-[#0a0a0f] font-semibold rounded-lg shadow-lg hover:shadow-[#00ffff]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Room...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      Create Room
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
    </div>
  )
}
