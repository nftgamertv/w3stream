"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"

interface PromptPhaseProps {
  roomId: string
  playerId: string
  round: number
  sessionId: string
}

export function PromptPhase({ roomId, playerId, round, sessionId }: PromptPhaseProps) {
  const [prompt, setPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submitPrompt = async () => {
    if (!prompt.trim()) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Submit prompt
      const { error } = await supabase.from("prompts").insert({
        session_id: sessionId,
        player_id: playerId,
        round,
        prompt_text: prompt,
      })

      if (error) throw error

      setSubmitted(true)
    } catch (error) {
      console.error("[v0] Error submitting prompt:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <Sparkles className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Prompt Submitted!</h2>
          <p className="mt-2 text-white/60">Waiting for other players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Round {round}: Create a Prompt</h1>
        <p className="mt-2 text-white/60">Describe an image you'd like AI to generate</p>
      </div>

      <div className="w-full max-w-lg space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A cat wearing sunglasses on a beach..."
          className="min-h-32 border-white/10 bg-white/5 text-white placeholder:text-white/40"
        />

        <Button
          onClick={submitPrompt}
          disabled={!prompt.trim() || isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600"
          size="lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Prompt"}
        </Button>
      </div>
    </div>
  )
}
