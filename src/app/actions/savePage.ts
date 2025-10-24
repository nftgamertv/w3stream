'use server'
import { createClient } from "../utils/supabaseClients/server";

const HOST = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://nftg-v7-8-4d143.vercel.app';

export default async function savePage({params}){
    const { path, data } = params;
    const username = path.toLowerCase().replace('/user/', '');

    console.log(username, 'username');
    console.log(data, 'data being sent to IPFS');

    const supabase = await createClient();
    const { data: redirectsData, error } = await supabase
        .from('redirects')
        .select('*')
        .eq('destination', username)
        .single();

    console.log(redirectsData, 'redirectsData');

    if (error || !redirectsData) {
        console.error('Error fetching redirects data:', error);
        throw new Error('Failed to fetch redirect data');
    }

    try {
        // Pin new data to IPFS
        const pinToIpfsResponse = await fetch(`${HOST}/api/pinata/swap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: `${username}_page_${Date.now()}`,
                CID: redirectsData.ipfs_hash,
                data
            })
        });

        if (!pinToIpfsResponse.ok) {
            const errorText = await pinToIpfsResponse.text();
            console.error('Pinata swap API error:', errorText);
            throw new Error(`HTTP error! status: ${pinToIpfsResponse.status}. Details: ${errorText}`);
        }

        const pinToIpfsResult = await pinToIpfsResponse.json();
        console.log('IPFS pin result:', pinToIpfsResult);

        if (!pinToIpfsResult || !pinToIpfsResult.CID) {
            throw new Error('No CID returned from IPFS pinning');
        }

        return pinToIpfsResult.CID;
    } catch (error) {
        console.error('Error in savePage:', error);
        throw error;
    }
}