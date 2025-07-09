import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for Farcaster reactions (likes)
 * Uses Neynar API to add a reaction to a cast
 */
export async function POST(request: NextRequest) {
  try {
    const { castHash, signerUuid, reactionType } = await request.json();
    
    if (!castHash) {
      return NextResponse.json(
        { error: 'Cast hash is required' },
        { status: 400 }
      );
    }

    if (!signerUuid) {
      return NextResponse.json(
        { error: 'Signer UUID is required' },
        { status: 400 }
      );
    }

    if (!reactionType || !['like', 'recast'].includes(reactionType)) {
      return NextResponse.json(
        { error: 'Valid reaction type (like or recast) is required' },
        { status: 400 }
      );
    }

    // API key required for Neynar
    const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Neynar API key is not configured' },
        { status: 500 }
      );
    }

    // Call Neynar API to add reaction
    const neynarEndpoint = 'https://api.neynar.com/v2/farcaster/reaction';
    const response = await fetch(neynarEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey
      },
      body: JSON.stringify({
        signer_uuid: signerUuid,
        reaction_type: reactionType,
        target: castHash
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Neynar API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Neynar API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing reaction request:', error);
    return NextResponse.json(
      { error: 'Failed to process reaction request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}