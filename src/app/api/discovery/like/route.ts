import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';

/**
 * POST - Like a performance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { performanceId, userId } = body;

    if (!performanceId) {
      return NextResponse.json(
        { error: 'Performance ID is required' },
        { status: 400 }
      );
    }

    // Get current performance metrics
    const currentMetrics = await databaseService.getPerformanceMetrics(performanceId);
    const currentLikes = currentMetrics?.likes_count || 0;

    // Update performance metrics with incremented like count
    await databaseService.updatePerformanceMetrics({
      performance_id: performanceId,
      likes_count: currentLikes + 1
    });

    // Track analytics event
    await databaseService.trackEvent({
      event_type: 'performance_liked',
      user_id: userId,
      performance_id: performanceId,
      event_data: {
        previous_likes: currentLikes,
        new_likes: currentLikes + 1
      }
    });

    console.log(`✅ Performance ${performanceId} liked successfully. New count: ${currentLikes + 1}`);

    return NextResponse.json({
      success: true,
      message: 'Performance liked successfully',
      performanceId,
      newLikeCount: currentLikes + 1,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Like performance error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to like performance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}