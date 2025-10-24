'use server'
import { createClient } from "../utils/supabaseClients/server";

export default async function updateMutable({ params }) {
    const { path, ipfsHash, walletAddress } = params;
    console.log({ path, ipfsHash, walletAddress }, '{ path, ipfsHash, walletAddress }');

    const username = path.toLowerCase().replace('/user/', '');
    const supabase = await createClient();

    // Update the ipfs_hash in the redirects table
    const { data, error } = await supabase
        .from('redirects')
        .update({
            ipfs_hash: ipfsHash,
            updated_at: new Date().toISOString()
        })
        .eq('destination', username)
        .select();

    if (error) {
        console.error('Failed to update redirect:', error);
        throw new Error(`Failed to update page data! Status: ${error.message}`);
    }

    // If there's a Solana NFT mint associated, update its metadata
    if (data?.[0]?.nft_mint && walletAddress) {
        try {
            // Call Solana edge function to update NFT metadata
            const nftUpdateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-solana-nft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                    nft_mint: data[0].nft_mint,
                    wallet_address: walletAddress,
                    new_uri: ipfsHash,
                    metadata: {
                        name: username,
                        symbol: 'W3STREAM',
                        description: `W3Stream page for ${username}`,
                        image: `https://ipfs.io/ipfs/${ipfsHash}/preview.png`,
                        attributes: [
                            { trait_type: 'Platform', value: 'W3Stream' },
                            { trait_type: 'Username', value: username },
                        ]
                    }
                })
            });

            if (!nftUpdateResponse.ok) {
                console.warn('NFT metadata update failed, but database was updated:', await nftUpdateResponse.text());
            } else {
                const nftResult = await nftUpdateResponse.json();
                console.log('NFT metadata updated:', nftResult);
            }
        } catch (nftError) {
            console.warn('Error updating NFT metadata (database was still updated):', nftError);
        }
    }

    console.log(data, 'Updated redirect data');
    return data?.[0]?.id || true;
}