'use server'
import { createClient } from "../utils/supabaseClients/server";

export default async function savePage({params}){
    const { path, data } = params;

    // Extract room_id from path - handle various formats
    let room_id = path.replace(/^\//, ''); // Remove leading slash
    room_id = room_id.replace(/^(test\/room\/|user\/|room\/)/, ''); // Remove common prefixes

    console.log(room_id, 'room_id (cleaned)');
    console.log(data, 'page data');

    const supabase = await createClient();

    try {
        // Use upsert to insert or update in one operation
        const { data: savedPage, error } = await supabase
            .from('w3s_pages')
            .upsert(
                {
                    room_id,
                    data
                },
                {
                    onConflict: 'room_id',
                    ignoreDuplicates: false
                }
            )
            .select()
            .single();

        if (error) {
            console.error('Error saving page:', error);
            throw new Error('Failed to save page');
        }

        console.log('Page saved successfully:', savedPage.id);
        return { success: true, id: savedPage.id };
    } catch (error) {
        console.error('Error in savePage:', error);
        throw error;
    }
}