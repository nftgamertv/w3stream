import { Data } from "@measured/puck";
import { createClient } from "../utils/supabaseClients/server";

export const getPage = async (path: string): Promise<Data | null> => {
  const username = path.toLowerCase().replace('/user/', '');

  const supabase = await createClient();
  const { data: page, error } = await supabase
    .from('w3s_pages')
    .select('data')
    .eq('username', username)
    .single();

  if (error) {
    console.log(`No page found for ${username}`);
    return null;
  }

  return page?.data || null;
};
