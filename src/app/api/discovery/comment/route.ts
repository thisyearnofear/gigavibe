import { NextRequest, NextResponse } from 'next/server';
import { FarcasterDataService } from '@/lib/farcaster/FarcasterDataService';

export async function POST(request: NextRequest) {
  try {
    const { performanceId, comment, signerUuid } = await request.json();
    
    if (!performanceId) {
      return NextResponse.json(
        { error: 'Performance ID is required' },
        { status: 400 }
      );
    }
    
    if (!comment || comment.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (!signerUuid) {
      return NextResponse.json(
        { error: 'Farcaster authentication required' },
        { status: 401 }
      );
    }
    
    // Use Farcaster API to post the comment as a reply cast
    try {
      // This will use Farcaster's reply API
      const response = await fetch('/api/farcaster/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentCastHash: performanceId,
          signerUuid,
          text: comment,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Farcaster API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Return success response with Farcaster data
      return NextResponse.json({
        success: true,
        commentHash: result.hash || result.castHash,
        farcasterData: result
      });
    } catch (farcasterError) {
      console.error('Farcaster API error:', farcasterError);
      return NextResponse.json(
        { error: 'Failed to post comment on Farcaster', details: farcasterError.message },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error processing comment request:', error);
    return NextResponse.json(
      { error: 'Failed to process comment request' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve comments for a performance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const performanceId = searchParams.get('performanceId');
    
    if (!performanceId) {
      return NextResponse.json(
        { error: 'Performance ID is required' },
        { status: 400 }
      );
    }
    
    // Use FarcasterDataService to fetch comments
    const farcasterService = FarcasterDataService.getInstance();
    
    try {
      // Fetch replies to the cast from Farcaster
      const response = await fetch(`/api/farcaster/replies?castHash=${performanceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Farcaster API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Format the comments from Farcaster replies
      const comments = result.replies.map(reply => ({
        id: reply.hash,
        performanceId,
        userId: reply.author.fid.toString(),
        username: reply.author.username,
        displayName: reply.author.displayName,
        pfpUrl: reply.author.pfpUrl,
        content: reply.text,
        timestamp: reply.timestamp || new Date(reply.createdAt).toISOString(),
        reactions: reply.reactions || { likes: 0, recasts: 0 }
      }));
      
      return NextResponse.json({
        comments,
        nextCursor: result.nextCursor || null
      });
    } catch (farcasterError) {
      console.error('Farcaster API error:', farcasterError);
      return NextResponse.json(
        { error: 'Failed to fetch comments from Farcaster', details: farcasterError.message },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error retrieving comments:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve comments' },
      { status: 500 }
    );
  }
}