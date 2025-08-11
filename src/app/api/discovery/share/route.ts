import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';

/**
 * POST - Share a performance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { performanceId, userId, platform } = body;

    if (!performanceId) {
      return NextResponse.json(
        { error: 'Performance ID is required' },
        { status: 400 }
      );
    }

    // Get current performance metrics
    const currentMetrics = await databaseService.getPerformanceMetrics(performanceId);
    const currentShares = currentMetrics?.shares_count || 0;

    // Update performance metrics with incremented share count
    await databaseService.updatePerformanceMetrics({
      performance_id: performanceId,
      shares_count: currentShares + 1
    });

    // Track analytics event
    await databaseService.trackEvent({
      event_type: 'performance_shared',
      user_id: userId,
      performance_id: performanceId,
      event_data: {
        platform: platform || 'unknown',
        previous_shares: currentShares,
        new_shares: currentShares + 1
      }
    });

    console.log(`✅ Performance ${performanceId} shared successfully. New count: ${currentShares + 1}`);

    return NextResponse.json({
      success: true,
      message: 'Performance shared successfully',
      performanceId,
      newShareCount: currentShares + 1,
      platform: platform || 'unknown',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Share performance error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to share performance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}