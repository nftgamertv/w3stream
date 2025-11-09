"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabaseClients/client"
import { WaitingPhase } from "./phases/WaitingPhase"
import { PromptPhase } from "./phases/PromptPhase"
import { PhrasePhase } from "./phases/PhrasePhase"
import { EditingPhase } from "./phases/EditingPhase"
import { VideoPhase } from "./phases/VideoPhase"
import { VotingPhase } from "./phases/VotingPhase"
import { ResultsPhase } from "./phases/ResultsPhase"

interface GameRoomProps {
  roomId: string
  playerId: string
  playerName: string
  livekitParticipants?: Array<{ identity: string; name: string }>
}

export function GameRoom({ roomId, playerId, playerName, livekitParticipants = [] }: GameRoomProps) {
  const [session, setSession] = useState<any>(null)
  const [phase, setPhase] = useState<string>("waiting")
  const [round, setRound] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`game:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("[v0] Game session updated:", payload)
          if (payload.new && typeof payload.new === 'object' && 'phase' in payload.new && 'round' in payload.new) {
            setSession(payload.new)
            setPhase(payload.new.phase)
            setRound(payload.new.round)
            setError(null)
          }
        },
      )
      .subscribe()

    const fetchOrCreateSession = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("game_sessions")
          .select("*")
          .eq("room_id", roomId)
          .single()

        if (data) {
          console.log("[v0] Found existing session:", data)
          setSession(data)
          setPhase(data.phase)
          setRound(data.round)
          setError(null)
        } else if (fetchError) {
          console.log("[v0] Session fetch error:", fetchError)

          if (
            fetchError.code === "42P01" ||
            fetchError.message?.includes("relation") ||
            fetchError.message?.includes("does not exist")
          ) {
            setError("Database tables not set up. Please run the SQL script from the scripts folder.")
            return
          }

          if (fetchError.code === "PGRST116") {
            console.log("[v0] Creating new session for room:", roomId)
            const { data: newSession, error: createError } = await supabase
              .from("game_sessions")
              .insert({
                room_id: roomId,
                phase: "waiting",
                round: 1,
                max_rounds: 3,
              })
              .select()
              .single()

            if (newSession) {
              console.log("[v0] Created new session:", newSession)
              setSession(newSession)
              setPhase(newSession.phase)
              setRound(newSession.round)
              setError(null)
            } else if (createError) {
              console.error("[v0] Error creating session:", createError)
              setError(`Failed to create game session: ${createError.message}`)
            }
          } else {
            setError(`Database error: ${fetchError.message}`)
          }
        }
      } catch (err) {
        console.error("[v0] Unexpected error:", err)
        setError("An unexpected error occurred. Check console for details.")
      }
    }

    fetchOrCreateSession()

    return () => {
      channel.unsubscribe()
    }
  }, [roomId])

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-red-400">Database Setup Required</h3>
          <p className="mb-4 text-sm text-red-300">{error}</p>
          <div className="rounded bg-black/30 p-4 text-left text-xs text-gray-300">
            <p className="mb-2 font-semibold">To fix this:</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Go to the Scripts section in the sidebar</li>
              <li>Run the SQL script: 001_create_game_tables.sql</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  const renderPhase = () => {
    switch (phase) {
      case "waiting":
        return (
          <WaitingPhase
            roomId={roomId}
            playerId={playerId}
            playerName={playerName}
            livekitParticipants={livekitParticipants}
          />
        )
      case "prompt":
        return <PromptPhase roomId={roomId} playerId={playerId} round={round} sessionId={session?.id} />
      case "phrase":
        return <PhrasePhase roomId={roomId} playerId={playerId} round={round} sessionId={session?.id} />
      case "editing":
        return <EditingPhase roomId={roomId} playerId={playerId} round={round} sessionId={session?.id} />
      case "video":
        return <VideoPhase roomId={roomId} playerId={playerId} round={round} sessionId={session?.id} />
      case "voting":
        return <VotingPhase roomId={roomId} playerId={playerId} round={round} sessionId={session?.id} />
      case "results":
        return <ResultsPhase roomId={roomId} sessionId={session?.id} />
      default:
        return <div className="text-white">Unknown phase: {phase}</div>
    }
  }

  return <div className="h-full w-full overflow-auto">{renderPhase()}</div>
}
