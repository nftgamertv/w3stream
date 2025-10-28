import { Data } from "@measured/puck";
import { createClient } from "../utils/supabaseClients/server";
import { defaultRoomData } from "@/config/defaultRoomData";

export const getPage = async (path: string): Promise<Data | null> => {
  // Extract room_id from path - handle various formats
  let roomId = path.replace(/^\//, ''); // Remove leading slash
  roomId = roomId.replace(/^(test\/room\/|user\/|room\/)/, ''); // Remove common prefixes

  const supabase = await createClient();
  const { data: page, error } = await supabase
    .from('w3s_pages')
    .select('data')
    .eq('room_id', roomId)
    .single();

  if (error) {
    console.log(`No page found for room_id: ${roomId}, using defaults`);
    return defaultRoomData;
  }

  return page?.data || defaultRoomData;
};
