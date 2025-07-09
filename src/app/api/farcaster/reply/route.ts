import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for Farcaster replies (comments)
 * Uses Neynar API to add a reply to a cast
 */
export async function POST(request: NextRequest) {
  try {
    const { parentCastHash, signerUuid, text } = await request.json();
    
    if (!parentCastHash) {
      return NextResponse.json(
        { error: 'Parent cast hash is required' },
        { status: 400 }
      );
    }

    if (!signerUuid) {
      return NextResponse.json(
        { error: 'Signer UUID is required' },
        { status: 400 }
      );
    }

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Reply text is required' },
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

    // Call Neynar API to publish reply cast
    const neynarEndpoint = 'https://api.neynar.com/v2/farcaster/cast';
    const response = await fetch(neynarEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey
      },
      body: JSON.stringify({
        signer_uuid: signerUuid,
        text: text,
        parent: parentCastHash,
        channel_id: 'gigavibe' // Use the GigaVibe channel for all interactions
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
    console.error('Error processing reply request:', error);
    return NextResponse.json(
      { error: 'Failed to process reply request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}