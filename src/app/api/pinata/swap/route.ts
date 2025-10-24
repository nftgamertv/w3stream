import { NextRequest, NextResponse } from 'next/server';

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

export async function POST(request: NextRequest) {
  try {
    const { filename, CID: oldCID, data } = await request.json();

    if (!PINATA_JWT) {
      return NextResponse.json(
        { error: 'Pinata JWT not configured' },
        { status: 500 }
      );
    }

    // Step 1: Pin new data to IPFS
    const pinataData = {
      pinataContent: data,
      pinataMetadata: {
        name: filename,
      },
    };

    const pinResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify(pinataData),
    });

    if (!pinResponse.ok) {
      const errorText = await pinResponse.text();
      console.error('Pinata pin error:', errorText);
      return NextResponse.json(
        { error: `Failed to pin to IPFS: ${errorText}` },
        { status: pinResponse.status }
      );
    }

    const pinResult = await pinResponse.json();
    const newCID = pinResult.IpfsHash;

    // Step 2: Optionally unpin old CID if provided
    if (oldCID) {
      try {
        await fetch(`https://api.pinata.cloud/pinning/unpin/${oldCID}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${PINATA_JWT}`,
          },
        });
        console.log(`Unpinned old CID: ${oldCID}`);
      } catch (unpinError) {
        console.warn('Failed to unpin old CID (non-critical):', unpinError);
      }
    }

    return NextResponse.json({
      success: true,
      CID: newCID,
      ipfsUrl: `https://${PINATA_GATEWAY}/ipfs/${newCID}`,
    });
  } catch (error) {
    console.error('Swap API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
