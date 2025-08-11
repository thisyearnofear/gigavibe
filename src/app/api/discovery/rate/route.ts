import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';
import { RatingService } from '@/lib/services/RatingService';

/**
 * POST - Rate a performance
 * Clean, modular implementation following DRY principles
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { performanceId, rating, userId } = body;

    // Input validation
    if (!performanceId) {
      return NextResponse.json(
        { error: 'Performance ID is required' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 10' },
        { status: 400 }
      );
    }

    // Validate performance exists
    const currentPerformance = await databaseService.getPerformanceById(performanceId);
    if (!currentPerformance) {
      return NextResponse.json(
        { error: 'Performance not found' },
        { status: 404 }
      );
    }

    // Track the rating event
    await databaseService.trackEvent({
      event_type: 'performance_rated',
      user_id: userId,
      performance_id: performanceId,
      event_data: {
        rating: rating,
        rating_scale: '1-10'
      }
    });

    // Use dedicated rating service for clean, performant calculations
    const ratingService = RatingService.getInstance();
    const ratingData = await ratingService.calculateNewRating(performanceId, rating);

    console.log(`Performance ${performanceId} rated ${rating}/10. New average: ${ratingData.newAverage}`);

    return NextResponse.json({
      success: true,
      message: 'Performance rated successfully',
      performanceId,
      rating,
      newAverage: ratingData.newAverage,
      totalRatings: ratingData.totalRatings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Rate performance error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to rate performance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}