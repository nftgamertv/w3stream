// src/app/utils/security.ts
import { createClient } from "@/utils/supabaseClients/server"
import { cookies } from 'next/headers'

export async function verifyPlayerEligibility(lobbyId: string, userId: string) {
  const supabase = await createClient()
  console.log(lobbyId, 'lobbyId')
  console.log(userId, 'userId') 

  // Check if user is a player in the lobby
  const { data: lobbyPlayer, error: lobbyPlayerError } = await supabase
    .from('lobby_players')
    .select('*')
    .eq('lobby_id', lobbyId)
    .eq('user_id', userId)
    .single()

  if (lobbyPlayerError || !lobbyPlayer) {
    throw new Error('User is not a player in this lobby')
  }

  // Check if lobby exists and is active
  const { data: lobby, error: lobbyError } = await supabase
    .from('games')   
    .select('status, current_round')
    .eq('id', lobbyId)
    .single()

  if (lobbyError || !lobby) {
    console.log(lobbyError, 'lobbyError') 
    throw new Error('Invalid lobby')
  }

  // if (lobby.status !== 'waiting') {
  //   throw new Error('Game is not in progress')
  // }

  // Check if player has already generated an image this round
  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('round', lobby.current_round)
    .eq('game_id', lobbyId)  // Changed from room_id to lobby_id

  if (predictionsError) {
    console.log(predictionsError, 'predictionsError')
    throw new Error('Failed to check prediction history')
  }

  if (predictions && predictions.length > 0) {
    throw new Error('Player has already generated an image this round')
  }

  return true
}