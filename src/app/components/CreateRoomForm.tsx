"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

type EnvironmentCategory = "2d" | "3d" | "mobile"
type EnvironmentTemplate =
  | "cyber-office"
  | "auditorium"
  | "creative-studio"
  | "modern-workspace"
  | "conference-hall"
  | "mobile-lounge"
  | "mobile-studio"

interface CreateRoomForm {
  environment: EnvironmentTemplate
  category: EnvironmentCategory
}

interface FormErrors {
  roomId?: string
  submit?: string
}

interface CreateRoomFormProps {
  onSuccess?: () => void
}

export default function CreateRoomForm({ onSuccess }: CreateRoomFormProps) {
  const router = useRouter()

  // Create Room State
  const [createForm, setCreateForm] = useState<CreateRoomForm>({
    environment: "cyber-office",
    category: "2d",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [createErrors, setCreateErrors] = useState<FormErrors>({})

  // Create Room Handler
  const handleCreateRoom = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateErrors({})

    setIsCreating(true)

    try {
      const response = await fetch("/api/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          environment: createForm.environment,
          category: createForm.category,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create room")
      }

      const data = await response.json()

      if (data.roomId) {
        // Redirect to prejoin page with host role
        router.push(`/prejoin/${data.roomId}?role=host`)
        onSuccess?.()
      } else {
        throw new Error("No room ID returned")
      }
    } catch (error) {
      setCreateErrors({
        submit: error instanceof Error ? error.message : "Failed to create room. Please try again.",
      })
      setIsCreating(false)
    }
  }

  const environments: Record<
    EnvironmentCategory,
    { value: EnvironmentTemplate; label: string; description: string }[]
  > = {
    "2d": [
      {
        value: "modern-workspace",
        label: "Modern Workspace",
        description: "Clean 2D interface for team collaboration",
      },
      { value: "conference-hall", label: "Conference Hall", description: "Professional meeting environment" },
    ],
    "3d": [
      { value: "cyber-office", label: "Cyber Office", description: "Modern workspace with neon aesthetics" },
      { value: "auditorium", label: "Auditorium", description: "Large venue for presentations" },
      { value: "creative-studio", label: "Creative Studio", description: "Collaborative creative space" },
    ],
    mobile: [
      { value: "mobile-lounge", label: "Mobile Lounge", description: "Optimized casual meeting space" },
      { value: "mobile-studio", label: "Mobile Studio", description: "Compact creative workspace" },
    ],
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#00aaff] flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-[#0a0a0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Room</h2>
          <p className="text-gray-400 text-sm mt-1">Start a new collaboration session and invite your team</p>
        </div>
      </div>

      <form onSubmit={handleCreateRoom} className="space-y-8">
        {/* Category Tabs */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">Environment Type</label>
          <div className="flex gap-2 p-1 bg-[#0a0a0f]/50 rounded-lg border border-[#00ffff]/20">
            {(["2d", "3d", "mobile"] as EnvironmentCategory[]).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setCreateForm({
                    category,
                    environment: environments[category][0].value,
                  })
                }}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                  createForm.category === category
                    ? "bg-gradient-to-r from-[#00ffff] to-[#00aaff] text-[#0a0a0f] shadow-lg shadow-[#00ffff]/20"
                    : "text-gray-400 hover:text-white hover:bg-[#0a0a0f]/30"
                }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Environment Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">Environment Template</label>
          <div className="space-y-3">
            {environments[createForm.category].map((env) => (
              <label
                key={env.value}
                className={`flex items-start p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  createForm.environment === env.value
                    ? "border-[#00ffff] bg-[#00ffff]/10 shadow-lg shadow-[#00ffff]/10"
                    : "border-[#00ffff]/20 hover:border-[#00ffff]/40 bg-[#0a0a0f]/30 hover:bg-[#0a0a0f]/50"
                } ${isCreating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="environment"
                  value={env.value}
                  checked={createForm.environment === env.value}
                  onChange={(e) => setCreateForm({ ...createForm, environment: e.target.value as EnvironmentTemplate })}
                  disabled={isCreating}
                  className="mt-1 h-4 w-4 text-[#00ffff] border-gray-300 focus:ring-[#00ffff] flex-shrink-0"
                />
                <div className="ml-4 flex-1">
                  <p className="font-medium text-white text-base">{env.label}</p>
                  <p className="text-sm text-gray-400 mt-1">{env.description}</p>
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
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
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
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
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
  )
}
