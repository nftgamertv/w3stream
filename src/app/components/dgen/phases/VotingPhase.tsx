"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabaseClients/client"
import { Button } from "@/components/ui/button"

interface VotingPhaseProps {
  roomId: string
  playerId: string
  round: number
  sessionId: string
}

export function VotingPhase({ roomId, playerId, round, sessionId }: VotingPhaseProps) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [voted, setVoted] = useState(false)

  useEffect(() => {
    const fetchSubmissions = async () => {
      const supabase = createClient()

      const { data } = await supabase
        .from("submissions")
        .select("*, players(name)")
        .eq("session_id", sessionId)
        .eq("round", round)
        .neq("player_id", playerId)

      if (data) {
        setSubmissions(data)
      }
    }

    fetchSubmissions()
  }, [sessionId, playerId, round])

  const vote = async (submissionId: string) => {
    const supabase = createClient()

    await supabase.from("votes").insert({
      session_id: sessionId,
      voter_id: playerId,
      submission_id: submissionId,
      round,
    })

    setVoted(true)
  }

  if (voted) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Vote Submitted!</h2>
          <p className="mt-2 text-white/60">Waiting for other players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Round {round}: Vote!</h1>
        <p className="mt-2 text-white/60">Choose your favorite creation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {submissions.map((submission) => (
          <div key={submission.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div
              className="mb-4 aspect-square rounded-lg bg-white/10"
              dangerouslySetInnerHTML={{ __html: submission.svg_data }}
            />
            <Button onClick={() => vote(submission.id)} className="w-full bg-blue-500 hover:bg-blue-600">
              Vote
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
