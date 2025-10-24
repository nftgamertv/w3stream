'use server'
import { createClient } from '../utils/supabaseClients/server'
import { Connection, PublicKey } from '@solana/web3.js';

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

export const fetchRedirects = async (username: string): Promise<any> => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('redirects')
        .select('*')
        .eq('destination', username)
        .single();

    if (error || !data) return null;

    // If there's a Solana NFT mint address, fetch metadata from the blockchain
    if (data.nft_mint) {
        try {
            const connection = new Connection(SOLANA_RPC);
            const mintPubkey = new PublicKey(data.nft_mint);

            // Get token metadata account
            const metadataPDA = await getMetadataPDA(mintPubkey);
            const accountInfo = await connection.getAccountInfo(metadataPDA);

            if (accountInfo) {
                // Parse metadata to get the URI
                const metadata = parseMetadata(accountInfo.data);

                // Fetch JSON from URI
                if (metadata?.uri) {
                    const response = await fetch(metadata.uri);
                    const json = await response.json();

                    // Return the IPFS hash from NFT metadata
                    return json.data || json.ipfs_hash || data.ipfs_hash;
                }
            }
        } catch (error) {
            console.error('Error fetching Solana NFT metadata:', error);
        }
    }

    // Fallback to database IPFS hash
    return data.ipfs_hash;
};

// Helper function to derive metadata PDA
async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
    const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const [pda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata'),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        METADATA_PROGRAM_ID
    );
    return pda;
}

// Simple metadata parser (you might want to use @metaplex-foundation/mpl-token-metadata for full parsing)
function parseMetadata(data: Buffer): { uri?: string } | null {
    try {
        // This is a simplified parser - for production use Metaplex SDK
        const nameLength = data.readUInt32LE(0);
        let offset = 4 + nameLength;

        const symbolLength = data.readUInt32LE(offset);
        offset += 4 + symbolLength;

        const uriLength = data.readUInt32LE(offset);
        offset += 4;

        const uri = data.slice(offset, offset + uriLength).toString('utf8').replace(/\0/g, '');

        return { uri };
    } catch (error) {
        console.error('Error parsing metadata:', error);
        return null;
    }
}