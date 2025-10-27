'use server'
import { createClient } from '../utils/supabaseClients/server'

export const fetchRedirects = async (username: string): Promise<any> => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('redirects')
        .select('*')
        .eq('destination', username)
        .single();

    if (error || !data) return null;

    return data;
}