// fetchPageData.ts
'use server';
import { createClient } from '../utils/supabaseClients/server';

export const fetchPageData = async (roomId: string) => {
  const cleanRoomId = roomId?.toLowerCase().replace(/^\//, '');

  const supabase = await createClient();
  const { data: page, error } = await supabase
    .from('w3s_pages')
    .select('data')
    .eq('room_id', cleanRoomId)
    .single();

  if (error) {
    console.error(`Error fetching page data for roomId "${cleanRoomId}":`, error.message);
    throw new Error(`No page found in database for roomId: ${cleanRoomId}. Please create a page first or check the roomId.`);
  }

  if (!page?.data) {
    throw new Error(`Page exists for roomId "${cleanRoomId}" but has no data.`);
  }

  console.log(`Successfully fetched page data for roomId: ${cleanRoomId}`);
  return page.data;
};