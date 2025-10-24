import { NextRequest, NextResponse } from 'next/server';

const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

export async function POST(request: NextRequest) {
  try {
    const { CID } = await request.json();

    if (!CID) {
      return NextResponse.json(
        { error: 'CID is required' },
        { status: 400 }
      );
    }

    // Fetch data from IPFS via Pinata gateway
    const ipfsUrl = `https://${PINATA_GATEWAY}/ipfs/${CID}`;
    const response = await fetch(ipfsUrl, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to retrieve from IPFS: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Retrieve API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
