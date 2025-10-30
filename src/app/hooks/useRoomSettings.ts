'use client'

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabaseClients/client';

export interface RoomSettings {
  room_id: string;
  room_type: 'collaborative' | 'presentation';
  environment_template: string;
  environment_category: '2d' | '3d' | 'mobile';
  enable_ai_prompt: boolean;
  enable_svg_editor: boolean;
  host_id: string;
  host_name: string;
  is_active: boolean;
}

export function useRoomSettings(roomId: string) {
  return useQuery<RoomSettings | null, Error>({
    queryKey: [`roomSettings_${roomId}`],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('w3s_rooms')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (error) {
        console.error(`Error fetching room settings for roomId "${roomId}":`, error.message);
        throw new Error(`Room not found: ${roomId}`);
      }

      return data;
    },
    staleTime: 60000, // Cache for 1 minute
    retry: 1
  });
}
