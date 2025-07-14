import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

// Target channels for discovery content
const DISCOVERY_CHANNELS = ['music', 'creators', 'content-creators'];
const GIGAVIBE_KEYWORD = 'gigavibe';

/**
 * GET - Discovery feed with Farcaster integration
 * 
 * Supported actions:
 * - fetchDiscoveryFeed: Get filtered content from music/creator channels
 * - searchGigavibe: Search for gigavibe mentions across channels
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    // Fetch discovery feed from multiple channels
    if (action === 'fetchDiscoveryFeed') {
      const feedType = searchParams.get('feedType') || 'foryou';
      const limit = parseInt(searchParams.get('limit') || '25');
      const cursor = searchParams.get('cursor');
      
      let allCasts: any[] = [];
      
      // Search for gigavibe mentions in each discovery channel
      for (const channelId of DISCOVERY_CHANNELS) {
        try {
          const query = `${GIGAVIBE_KEYWORD} channel:${channelId}`;
          const response = await client.searchCasts({
            q: query,
            limit: Math.ceil(limit / DISCOVERY_CHANNELS.length),
            cursor: cursor || undefined
          });
          
          if (response.result?.casts) {
            allCasts.push(...response.result.casts);
          }
        } catch (error) {
          console.error(`Error searching in channel ${channelId}:`, error);
        }
      }
      
      // Sort by engagement and recency
      allCasts.sort((a, b) => {
        const aEngagement = (a.reactions?.likes_count || 0) + (a.replies?.count || 0);
        const bEngagement = (b.reactions?.likes_count || 0) + (b.replies?.count || 0);
        
        if (feedType === 'trending') {
          return bEngagement - aEngagement;
        }
        
        // Default to chronological for 'foryou' and 'following'
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      return NextResponse.json({
        casts: allCasts.slice(0, limit),
        next: {
          cursor: allCasts.length > limit ? `${Date.now()}` : null
        }
      });
    }
    
    // Search specifically for gigavibe mentions
    if (action === 'searchGigavibe') {
      const query = `${GIGAVIBE_KEYWORD} channel:music OR channel:creators OR channel:content-creators`;
      const limit = parseInt(searchParams.get('limit') || '25');
      const cursor = searchParams.get('cursor');
      
      const response = await client.searchCasts({
        q: query,
        limit,
        cursor: cursor || undefined
      });
      
      return NextResponse.json(response);
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Farcaster Discovery API error:', error);
    return NextResponse.json({ error: 'Failed to fetch discovery data from Farcaster' }, { status: 500 });
  }
}
