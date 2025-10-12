export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lobbies: {
        Row: {
          id: string
          created_at: string
          host_id: string
          max_players: number
          min_players: number
          status: 'waiting'| 'starting' |'in_progress' | 'completed'
          game_type: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          host_id: string
          max_players?: number
          min_players?: number
          status?: 'waiting' | 'starting' | 'in_progress' | 'completed'
          game_type: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          host_id?: string
          max_players?: number
          min_players?: number
          status?: 'waiting' | 'starting' | 'in_progress' | 'completed'
          game_type?: string
          updated_at?: string
        }
      }
      lobby_players: {
        Row: {
          id: string
          lobby_id: string
          user_id: string
          is_ready: boolean
          is_host: boolean
          joined_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lobby_id: string
          user_id: string
          is_ready?: boolean
          is_host?: boolean
          joined_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lobby_id?: string
          user_id?: string
          is_ready?: boolean
          is_host?: boolean
          joined_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}