# Puck Editor Publish Button Setup

## Overview

The Puck editor's Publish button has been wired up to save pages to IPFS via Pinata and update Solana NFT metadata.

## What Was Changed

### 1. Updated Puck Client (`src/app/puck/[...puckPath]/client.tsx`)

The `onPublish` handler now:
- Saves page data to IPFS using Pinata
- Updates the database with the new IPFS hash
- Updates Solana NFT metadata if an NFT mint exists
- Provides user feedback on success/failure
- Prevents duplicate publish operations

### 2. Created Pinata API Endpoints

**`/api/pinata/swap` - Pin new content and unpin old**
- Accepts: `{ filename, CID (old), data }`
- Pins new data to IPFS
- Unpins old CID (if provided)
- Returns new IPFS CID

**`/api/pinata/retrieve` - Fetch content from IPFS**
- Accepts: `{ CID }`
- Retrieves data from IPFS via Pinata gateway
- Returns the JSON data

### 3. Publish Flow

When the user clicks Publish:

1. **Save to IPFS** (`savePage` action)
   - Fetches user's current IPFS hash from database
   - Calls `/api/pinata/swap` to pin new data
   - Returns new CID

2. **Update Database & Solana** (`updateMutable` action)
   - Updates `redirects` table with new IPFS hash
   - If NFT mint exists, calls Supabase Edge Function to update NFT metadata
   - Updates metadata with:
     - New IPFS URI
     - Page preview image
     - Username and platform attributes

## Required Configuration

### Pinata Setup

1. Go to [Pinata](https://app.pinata.cloud/developers/api-keys)
2. Create a new API key with the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `unpin`
3. Copy the JWT token
4. Add to `.env.local`:

```env
PINATA_JWT=your_actual_jwt_token_here
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

### Solana Edge Function (Optional)

For Solana NFT metadata updates to work, ensure you have a Supabase Edge Function at:
- `${SUPABASE_URL}/functions/v1/update-solana-nft`

This function should:
- Accept: `{ nft_mint, wallet_address, new_uri, metadata }`
- Update the NFT's metadata URI on Solana
- Return success/failure status

If this function doesn't exist, the publish will still work (saving to IPFS and database), but NFT metadata won't be updated.

### Wallet Address

The wallet address is retrieved from cookies (`wallet_address`). Ensure your authentication flow sets this cookie when users connect their wallet.

## Testing

1. Start the dev server: `npm run dev`
2. Navigate to a Puck editor page (e.g., `/puck/user/[username]`)
3. Make changes to the page
4. Click the "Publish" button
5. Check the browser console for:
   - "Publishing to IPFS and Solana..."
   - "IPFS Hash: [CID]"
   - "Published successfully!"

## Error Handling

The publish button will show alerts for:
- Publishing already in progress
- IPFS pinning failures
- Database update failures
- Solana NFT update failures (warning only)

All errors are logged to the console for debugging.

## Database Schema

The `redirects` table should have:
- `destination` (username)
- `ipfs_hash` (current CID)
- `updated_at` (timestamp)
- `nft_mint` (optional Solana NFT mint address)

## Next Steps

1. Add your Pinata JWT to `.env.local`
2. Restart your dev server
3. Test the Publish functionality
4. Optionally set up the Solana Edge Function for NFT metadata updates
