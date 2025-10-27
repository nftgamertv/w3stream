import { Data } from "@measured/puck";
import { createClient } from "../utils/supabaseClients/server";

export const getPage = async (path: string): Promise<Data | null> => {
  // Extract roomId from path - remove /test/room/ prefix to match savePage logic
  const room_id = path.toLowerCase().replace('/test/room/', '');

  console.log('getPage - original path:', path);
  console.log('getPage - extracted room_id:', room_id);

  const supabase = await createClient();
  const { data: page, error } = await supabase
    .from('w3s_pages')
    .select('data')
    .eq('room_id', room_id)
    .single();

  if (error) {
    console.log(`No page found for room_id: ${room_id}`, error.message);
    return null;
  }

  return page?.data || null;
};
