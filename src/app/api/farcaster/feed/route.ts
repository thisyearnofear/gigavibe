import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

/**
 * GET - Feed-related API endpoints
 * 
 * Supported actions:
 * - fetchFeed: Get a user's feed
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    // Get a user's feed
    if (action === 'fetchFeed') {
      const fid = searchParams.get('fid');
      if (!fid) return NextResponse.json({ error: 'Missing fid parameter' }, { status: 400 });
      
      // Using string literal instead of enum for better compatibility
      const response = await client.fetchFeed({
        fid: parseInt(fid),
        feedType: 'following',
        withRecasts: true,
        limit: parseInt(searchParams.get('limit') || '25'),
        cursor: searchParams.get('cursor') || undefined,
      });
      
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Farcaster Feed API error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed data from Farcaster' }, { status: 500 });
  }
}