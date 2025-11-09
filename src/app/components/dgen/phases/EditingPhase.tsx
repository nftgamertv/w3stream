"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabaseClients/client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface EditingPhaseProps {
  roomId: string
  playerId: string
  round: number
  sessionId: string
}

export function EditingPhase({ roomId, playerId, round, sessionId }: EditingPhaseProps) {
  const [assignedPrompt, setAssignedPrompt] = useState<any>(null)
  const [assignedPhrase, setAssignedPhrase] = useState<any>(null)
  const [svgData, setSvgData] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchAssignments = async () => {
      const supabase = createClient()

      // Fetch all prompts and phrases for this round
      const { data: prompts } = await supabase
        .from("prompts")
        .select("*")
        .eq("session_id", sessionId)
        .eq("round", round)

      const { data: phrases } = await supabase
        .from("phrases")
        .select("*")
        .eq("session_id", sessionId)
        .eq("round", round)

      if (prompts && phrases) {
        // Simple assignment: rotate assignments
        const playerIndex = prompts.findIndex((p) => p.player_id === playerId)
        const promptIndex = (playerIndex + 1) % prompts.length
        const phraseIndex = (playerIndex + 2) % phrases.length

        setAssignedPrompt(prompts[promptIndex])
        setAssignedPhrase(phrases[phraseIndex])
      }
    }

    fetchAssignments()
  }, [sessionId, playerId, round])

  const submitSubmission = async () => {
    if (!svgData.trim() || !assignedPrompt || !assignedPhrase) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("submissions").insert({
        session_id: sessionId,
        player_id: playerId,
        prompt_id: assignedPrompt.id,
        phrase_id: assignedPhrase.id,
        round,
        svg_data: svgData,
      })

      if (error) throw error

      setSubmitted(true)
    } catch (error) {
      console.error("[v0] Error submitting:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!assignedPrompt || !assignedPhrase) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Submission Complete!</h2>
          <p className="mt-2 text-white/60">Waiting for other players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Round {round}: Edit & Create</h1>
        <p className="mt-2 text-white/60">Edit the image and pair it with your phrase</p>
      </div>

      <div className="grid flex-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-2 font-semibold text-white">Your Prompt:</h3>
          <p className="text-white/80">{assignedPrompt.prompt_text}</p>

          <h3 className="mb-2 mt-4 font-semibold text-white">Your Phrase:</h3>
          <p className="text-white/80">{assignedPhrase.phrase_text}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <textarea
            value={svgData}
            onChange={(e) => setSvgData(e.target.value)}
            placeholder="Paste your edited SVG here..."
            className="h-full w-full resize-none border-0 bg-transparent text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
      </div>

      <Button
        onClick={submitSubmission}
        disabled={!svgData.trim() || isSubmitting}
        className="bg-blue-500 hover:bg-blue-600"
        size="lg"
      >
        {isSubmitting ? "Submitting..." : "Submit Creation"}
      </Button>
    </div>
  )
}
