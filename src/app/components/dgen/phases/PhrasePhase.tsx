"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare } from "lucide-react"

interface PhrasePhaseProps {
  roomId: string
  playerId: string
  round: number
  sessionId: string
}

export function PhrasePhase({ roomId, playerId, round, sessionId }: PhrasePhaseProps) {
  const [phrase, setPhrase] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submitPhrase = async () => {
    if (!phrase.trim()) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("phrases").insert({
        session_id: sessionId,
        player_id: playerId,
        round,
        phrase_text: phrase,
      })

      if (error) throw error

      setSubmitted(true)
    } catch (error) {
      console.error("[v0] Error submitting phrase:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <MessageSquare className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Phrase Submitted!</h2>
          <p className="mt-2 text-white/60">Waiting for other players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Round {round}: Submit a Phrase</h1>
        <p className="mt-2 text-white/60">Write something funny or creative</p>
      </div>

      <div className="w-full max-w-lg space-y-4">
        <Input
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && submitPhrase()}
          placeholder="e.g., When you realize it's Monday..."
          className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
        />

        <Button
          onClick={submitPhrase}
          disabled={!phrase.trim() || isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600"
          size="lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Phrase"}
        </Button>
      </div>
    </div>
  )
}
