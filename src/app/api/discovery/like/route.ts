import { NextRequest, NextResponse } from 'next/server';
import { FarcasterDataService } from '@/lib/farcaster/FarcasterDataService';

export async function POST(request: NextRequest) {
  try {
    const { performanceId, signerUuid } = await request.json();
    
    if (!performanceId) {
      return NextResponse.json(
        { error: 'Performance ID is required' },
        { status: 400 }
      );
    }

    if (!signerUuid) {
      return NextResponse.json(
        { error: 'Farcaster authentication required' },
        { status: 401 }
      );
    }
    
    // Use FarcasterDataService to handle the like via Farcaster
    const farcasterService = FarcasterDataService.getInstance();
    
    try {
      // This will use Farcaster's reaction API
      const response = await fetch('/api/farcaster/reaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          castHash: performanceId,
          signerUuid,
          reactionType: 'like',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Farcaster API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Return success response with Farcaster data
      return NextResponse.json({
        success: true,
        reactionHash: result.hash || result.reactionHash,
        farcasterData: result
      });
    } catch (farcasterError) {
      console.error('Farcaster API error:', farcasterError);
      return NextResponse.json(
        { error: 'Failed to like post on Farcaster', details: farcasterError.message },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error processing like request:', error);
    return NextResponse.json(
      { error: 'Failed to process like request' },
      { status: 500 }
    );
  }
}