import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';
import { supabase } from '@/integrations/supabase/client';

/**
 * POST - Rate a performance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { performanceId, rating, userId } = body;

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

    // Note: In a full implementation, you'd want to store individual ratings
    // and calculate averages. For now, we'll track the event and update metrics.
    
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

    // For now, we'll store ratings in analytics events and return a simple response
    // In the future, we can add rating fields to the performances table or create a separate ratings table
    
    // Check if performance exists
    const currentPerformance = await databaseService.getPerformanceById(performanceId);
    
    if (!currentPerformance) {
      return NextResponse.json(
        { error: 'Performance not found' },
        { status: 404 }
      );
    }
    
    // For now, we'll calculate a simple average from recent ratings in analytics events
    // This is a temporary solution until we add proper rating fields to the schema
    const { data: recentRatings } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_type', 'performance_rated')
      .eq('performance_id', performanceId)
      .order('server_timestamp', { ascending: false })
      .limit(100); // Get last 100 ratings
    
    const ratings = recentRatings?.map(event => {
      const eventData = event.event_data as any;
      return eventData?.rating;
    }).filter(r => typeof r === 'number') || [];
    const currentCount = ratings.length;
    const currentAverage = currentCount > 0 ? ratings.reduce((sum, r) => sum + r, 0) / currentCount : 0;
    const newAverage = currentCount > 0 ? ((currentAverage * currentCount) + rating) / (currentCount + 1) : rating;

    console.log(`✅ Performance ${performanceId} rated ${rating}/10. New average: ${newAverage.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      message: 'Performance rated successfully',
      performanceId,
      rating,
      newAverage: Math.round(newAverage * 100) / 100, // Round to 2 decimal places
      totalRatings: currentCount + 1,
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