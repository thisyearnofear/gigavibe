import { NextRequest, NextResponse } from 'next/server';
import { RealityCheckResult } from '@/lib/zora/types';
import { databaseService, Performance } from '@/lib/database/DatabaseService';
import { Address } from 'viem';

/**
 * API route to get recent performances
 * GET /api/performances/recent?hours=24&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (isNaN(hours) || hours <= 0) {
      return NextResponse.json(
        { error: 'Hours parameter must be a positive number' },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit parameter must be a positive number between 1 and 100' },
        { status: 400 }
      );
    }

    // Get recent performances from database
    let performances = await databaseService.getRecentPerformances(limit);
    
    // If hours filter is applied, filter further by timestamp
    if (hours < 24 * 7) { // Only apply time filter if it's less than a week
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      performances = performances.filter(
        performance => new Date(performance.created_at) >= cutoffTime
      );
    }
    
    // Transform database performance objects to RealityCheckResult format
    const transformedPerformances = await transformPerformances(performances);
    
    return NextResponse.json({
      performances: transformedPerformances,
      hours,
      limit,
      count: transformedPerformances.length
    });
  } catch (error) {
    console.error('Error fetching recent performances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent performances' },
      { status: 500 }
    );
  }
}

/**
 * Transform database performance objects to RealityCheckResult format
 */
async function transformPerformances(performances: Performance[]): Promise<RealityCheckResult[]> {
  const results: RealityCheckResult[] = [];
  
  for (const performance of performances) {
    try {
      // Get metrics for this performance if available
      const metrics = await databaseService.getPerformanceMetrics(performance.id);
      
      // Get user data
      let user = null;
      if (performance.user_id) {
        user = await databaseService.getUserByWallet(performance.user_id);
      }
      
      // Default values if metrics or user not found
      const likes = metrics?.likes_count || 0;
      const recasts = metrics?.recasts_count || 0;
      const replies = metrics?.replies_count || 0;
      
      // Transform to RealityCheckResult format
      const result: RealityCheckResult = {
        id: performance.id,
        eventId: performance.id, // Using same ID for compatibility
        challengeTitle: performance.title || 'Untitled Performance',
        challengeId: performance.farcaster_cast_id,
        userAddress: (performance.user_id || '0x0') as Address,
        selfRating: 0, // Not stored in our new schema
        communityRating: 0, // Could calculate from metrics
        gap: 0, // Not applicable in new schema
        wittyCommentary: performance.content || '',
        shareCount: metrics?.shares_count || 0,
        timestamp: new Date(performance.created_at),
        audioUrl: performance.audio_url || '',
        category: 'quality', // Default category
        farcasterData: {
          castHash: performance.farcaster_cast_id,
          authorFid: user?.farcaster_fid || 0,
          authorUsername: user?.display_name || 'unknown',
          authorPfp: user?.pfp_url || '',
          authorDisplayName: user?.display_name || 'Unknown User',
          likes,
          recasts,
          replies
        }
      };
      
      results.push(result);
    } catch (error) {
      console.error(`Error transforming performance ${performance.id}:`, error);
      // Skip this performance if transformation fails
    }
  }
  
  return results;
}