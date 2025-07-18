import { NextRequest, NextResponse } from 'next/server';
import { RealityCheckResult } from '@/lib/zora/types';
import { databaseService } from '@/lib/database/DatabaseService';
import { transformDiscoveryFeedToRealityCheck, transformSeedPerformanceToRealityCheck } from '@/lib/database/transformers';
import { coldStartContentService } from '@/lib/coldstart/ColdStartContentService';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate parameters
    if (offset < 0 || limit <= 0 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    let performances: RealityCheckResult[] = [];
    let total = 0;

    try {
      // Try to get recent performances from database using discovery_feed view
      const feedData = await databaseService.getDiscoveryFeedRecent(limit, offset);
      
      // Transform database results to RealityCheckResult format
      performances = feedData.map(transformDiscoveryFeedToRealityCheck);
      total = feedData.length; // This is approximate since we're using pagination
      
    } catch (dbError) {
      console.warn('Database query failed, falling back to cold start content:', dbError);
      
      // Fallback to cold start content if database is empty or fails
      const coldStartData = await coldStartContentService.getDiscoveryFeedContent(limit, offset);
      performances = coldStartData.performances.map(transformSeedPerformanceToRealityCheck);
      total = coldStartData.performances.length;
    }

    // If we still have no data, provide empty response
    if (performances.length === 0 && offset === 0) {
      console.log('No recent performances found, returning empty feed');
    }
    
    // Return the performances
    return NextResponse.json({
      performances,
      pagination: {
        total,
        offset,
        limit,
        hasMore: performances.length === limit // Approximate check
      },
      source: performances.length > 0 ? 'database' : 'empty'
    });
  } catch (error) {
    console.error('Error in recent feed API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve recent feed' },
      { status: 500 }
    );
  }
}