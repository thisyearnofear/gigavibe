import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';
import { transformDiscoveryFeedToRealityCheck } from '@/lib/database/transformers';

/**
 * GET - Discovery feed endpoint
 * Returns performance data for different feed types from database
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ feedType: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const { feedType } = await params;

    // Validate feed type
    const validFeedTypes = ['foryou', 'trending', 'viral', 'recent'];
    if (!validFeedTypes.includes(feedType)) {
      return NextResponse.json(
        { error: 'Invalid feed type' },
        { status: 400 }
      );
    }

    let feedData: any[] = [];

    // Get data from database based on feed type
    try {
      switch (feedType) {
        case 'recent':
          feedData = await databaseService.getDiscoveryFeedRecent(limit, offset);
          break;
        case 'trending':
          feedData = await databaseService.getDiscoveryFeedTrending(limit, offset);
          break;
        case 'viral':
          feedData = await databaseService.getDiscoveryFeedViral(limit, offset);
          break;
        case 'foryou':
          feedData = await databaseService.getDiscoveryFeedForYou(limit, offset);
          break;
        default:
          feedData = await databaseService.getDiscoveryFeedRecent(limit, offset);
      }

      // Transform database results to API format
      const performances = feedData.map(transformDiscoveryFeedToRealityCheck);

      return NextResponse.json({
        success: true,
        performances,
        pagination: {
          offset,
          limit,
          total: feedData.length,
          hasMore: feedData.length === limit // Assume more if we got a full page
        },
        feedType,
        source: 'database',
        timestamp: new Date().toISOString()
      });

    } catch (dbError) {
      console.warn(`Database query failed for ${feedType} feed:`, dbError);
      
      // Return empty results instead of mock data
      return NextResponse.json({
        success: true,
        performances: [],
        pagination: {
          offset,
          limit,
          total: 0,
          hasMore: false
        },
        feedType,
        source: 'empty',
        message: 'No performances found. Database may be empty or unavailable.',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Discovery feed error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch discovery feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
