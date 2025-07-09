import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for fetching Farcaster replies (comments)
 * Uses Neynar API to get replies to a cast
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const castHash = searchParams.get('castHash');
    const cursor = searchParams.get('cursor');
    const limit = searchParams.get('limit') || '20'; // Default to 20 replies

    if (!castHash) {
      return NextResponse.json(
        { error: 'Cast hash is required' },
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

    // Build query parameters
    const queryParams = new URLSearchParams({
      limit
    });
    
    if (cursor) {
      queryParams.append('cursor', cursor);
    }

    // Call Neynar API to fetch replies
    const neynarEndpoint = `https://api.neynar.com/v2/farcaster/cast/${castHash}/replies?${queryParams}`;
    const response = await fetch(neynarEndpoint, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
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

    // Transform the result to a more standardized format
    const replies = result.casts || [];
    const nextCursor = result.next?.cursor || null;

    // Format the response with normalized author information
    const formattedReplies = replies.map((reply: any) => ({
      hash: reply.hash,
      text: reply.text,
      timestamp: reply.created_at || reply.timestamp,
      author: {
        fid: reply.author.fid,
        username: reply.author.username,
        displayName: reply.author.display_name,
        pfpUrl: reply.author.pfp_url
      },
      reactions: {
        likes: reply.reactions?.likes || reply.reactions?.likes_count || 0,
        recasts: reply.reactions?.recasts || reply.reactions?.recasts_count || 0
      }
    }));

    return NextResponse.json({
      replies: formattedReplies,
      nextCursor
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}