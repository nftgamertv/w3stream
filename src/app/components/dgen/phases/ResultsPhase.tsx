"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trophy } from "lucide-react"

interface ResultsPhaseProps {
  roomId: string
  sessionId: string
}

export function ResultsPhase({ roomId, sessionId }: ResultsPhaseProps) {
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      const supabase = createClient()

      const { data: players } = await supabase
        .from("players")
        .select("*")
        .eq("session_id", sessionId)
        .order("score", { ascending: false })

      if (players) {
        setResults(players)
      }
    }

    fetchResults()
  }, [sessionId])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
        <h1 className="text-4xl font-bold text-white">Game Over!</h1>
        <p className="mt-2 text-white/60">Final Scores</p>
      </div>

      <div className="w-full max-w-md space-y-2">
        {results.map((player, index) => (
          <div key={player.id} className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white/50">#{index + 1}</span>
              <span className="text-lg text-white">{player.name}</span>
            </div>
            <span className="text-xl font-bold text-blue-400">{player.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}
