import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

/**
 * GET - Cast-related API endpoints
 * 
 * Supported actions:
 * - fetchReplies: Get replies to a cast
 * - searchCasts: Search for casts
 * - fetchChannel: Get casts in a channel
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    // Get replies to a cast
    if (action === 'fetchReplies') {
      const hash = searchParams.get('hash');
      if (!hash) return NextResponse.json({ error: 'Missing hash parameter' }, { status: 400 });
      
      // Use lookupCastByHashOrUrl to get the cast and its conversation
      const response = await client.lookupCastByHashOrUrl({
        identifier: hash,
        type: 'hash' as any
      });
      return NextResponse.json(response);
    }
    
    // Search for casts
    if (action === 'searchCasts') {
      const query = searchParams.get('query');
      if (!query) return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
      
      const response = await client.searchCasts({
        q: query,
        limit: 25,
      });
      
      return NextResponse.json(response);
    }
    
    // Get a specific cast by hash
    if (action === 'getCast') {
      const hash = searchParams.get('hash');
      if (!hash) return NextResponse.json({ error: 'Missing hash parameter' }, { status: 400 });

      const response = await client.lookupCastByHashOrUrl({
        identifier: hash,
        type: 'hash' as any
      });
      return NextResponse.json(response.cast);
    }

    // Get casts in a channel
    if (action === 'fetchChannel') {
      const channelId = searchParams.get('channelId');
      if (!channelId) return NextResponse.json({ error: 'Missing channelId parameter' }, { status: 400 });
      
      // Try using the fetchFeed method with the correct parameters
      try {
        const response = await client.fetchFeed({
          feedType: 'filter',
          filterType: 'channel_id',
          channelId: channelId,
          withRecasts: true,
        });
        
        return NextResponse.json(response);
      } catch (error) {
        console.warn('Channel lookup method not available:', error);
        return NextResponse.json({
          channel: { id: channelId },
          casts: []
        });
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Farcaster Cast API error:', error);
    return NextResponse.json({ error: 'Failed to fetch cast data from Farcaster' }, { status: 500 });
  }
}

/**
 * POST - Create or interact with casts
 * 
 * Supported actions:
 * - publishCast: Create a new cast
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    // Create a new cast
    if (action === 'publishCast') {
      const { signerUuid, text, embeds, channelId, parent } = body;
      
      if (!signerUuid || !text) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }
      
      const castParams: any = {
        signerUuid,
        text,
      };
      
      // Add optional parameters if provided
      if (embeds) castParams.embeds = embeds;
      if (channelId) castParams.channelId = channelId;
      if (parent) castParams.parent = parent;
      
      const response = await client.publishCast(castParams);
      
      return NextResponse.json(response);
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Farcaster Cast API error:', error);
    return NextResponse.json({ error: 'Failed to perform cast action on Farcaster' }, { status: 500 });
  }
}