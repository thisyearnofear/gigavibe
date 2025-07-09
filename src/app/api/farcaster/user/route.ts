import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

/**
 * GET - User-related API endpoints
 * 
 * Supported actions:
 * - fetchUserProfile: Get user profile by FID
 * - fetchUserByAddress: Get user profile by ETH address
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    // Get user profile by FID
    if (action === 'fetchUserProfile') {
      const fid = searchParams.get('fid');
      if (!fid) return NextResponse.json({ error: 'Missing fid parameter' }, { status: 400 });
      
      const response = await client.fetchBulkUsers({
        fids: [parseInt(fid)],
      });
      
      return NextResponse.json(response);
    }
    
    // Get user by ETH address
    if (action === 'fetchUserByAddress') {
      const address = searchParams.get('address');
      if (!address) return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
      
      const response = await client.fetchBulkUsersByEthOrSolAddress({
        addresses: [address],
      });
      
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Farcaster User API error:', error);
    return NextResponse.json({ error: 'Failed to fetch user data from Farcaster' }, { status: 500 });
  }
}