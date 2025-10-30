"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Users, Play } from "lucide-react"

interface WaitingPhaseProps {
  roomId: string
  playerId: string
  playerName: string
  livekitParticipants?: Array<{ identity: string; name: string }>
}

export function WaitingPhase({ roomId, playerId, playerName, livekitParticipants = [] }: WaitingPhaseProps) {
  const [players, setPlayers] = useState<any[]>([])
  const [isHost, setIsHost] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const initializeGame = async () => {
      // Get or create session
      let { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("room_id", roomId)
        .single()

      if (!session) {
        const { data: newSession, error: createError } = await supabase
          .from("game_sessions")
          .insert({ room_id: roomId, phase: "waiting" })
          .select()
          .single()

        if (createError) {
          console.error("[v0] Error creating session:", createError)
          return
        }
        session = newSession
      }

      setSessionId(session.id)

      if (livekitParticipants.length > 0) {
        for (const participant of livekitParticipants) {
          const { data: existingPlayer } = await supabase
            .from("players")
            .select("*")
            .eq("session_id", session.id)
            .eq("name", participant.name)
            .single()

          if (!existingPlayer) {
            // Check if this is the first player (host)
            const { data: allPlayers } = await supabase.from("players").select("*").eq("session_id", session.id)

            const isFirstPlayer = !allPlayers || allPlayers.length === 0

            // Add player
            await supabase.from("players").insert({
              session_id: session.id,
              name: participant.name,
              is_host: isFirstPlayer,
            })

            if (participant.identity === playerId) {
              setIsHost(isFirstPlayer)
            }
          } else if (participant.identity === playerId) {
            setIsHost(existingPlayer.is_host)
          }
        }
      }

      // Fetch all players
      fetchPlayers(session.id)
    }

    const fetchPlayers = async (sessionId: string) => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("session_id", sessionId)
        .order("joined_at", { ascending: true })

      if (data) {
        setPlayers(data)
      }
    }

    initializeGame()

    // Subscribe to player changes
    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        () => {
          if (sessionId) fetchPlayers(sessionId)
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [roomId, playerId, playerName, sessionId, livekitParticipants])

  const startGame = async () => {
    if (!sessionId) return

    const supabase = createClient()
    await supabase.from("game_sessions").update({ phase: "prompt", round: 1 }).eq("id", sessionId)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">Waiting for Players</h1>
        <p className="mt-2 text-white/60">Get ready for a creative challenge!</p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Users className="h-5 w-5" />
          <span className="font-semibold">Players ({players.length})</span>
        </div>

        <div className="space-y-2">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
              <span className="text-white">{player.name}</span>
              {player.is_host && (
                <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400">Host</span>
              )}
            </div>
          ))}
        </div>

        {isHost && players.length >= 2 && (
          <Button onClick={startGame} className="mt-6 w-full bg-green-500 hover:bg-green-600" size="lg">
            <Play className="mr-2 h-5 w-5" />
            Start Game
          </Button>
        )}

        {isHost && players.length < 2 && (
          <p className="mt-4 text-center text-sm text-white/50">Waiting for at least 2 players to start...</p>
        )}
      </div>
    </div>
  )
}
