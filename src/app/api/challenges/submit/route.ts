import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST - Submit a challenge result to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      challengeId,
      challengeTitle,
      audioUrl,
      selfRating,
      confidence,
      duration,
      userFid,
      castHash,
      accuracy,
      submissionId,
      userId
    } = body;

    // Validate required fields
    if (!challengeId || !challengeTitle || !audioUrl || !selfRating) {
      return NextResponse.json(
        { error: 'Missing required fields: challengeId, challengeTitle, audioUrl, selfRating' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (typeof selfRating !== 'number' || selfRating < 1 || selfRating > 10) {
      return NextResponse.json(
        { error: 'selfRating must be a number between 1 and 10' },
        { status: 400 }
      );
    }

    const finalSubmissionId = submissionId || uuidv4();

    // Store challenge result in database
    const { data: challengeResult, error: insertError } = await supabase
      .from('challenge_results')
      .insert({
        id: finalSubmissionId,
        challenge_id: challengeId,
        challenge_title: challengeTitle,
        audio_url: audioUrl,
        self_rating: selfRating,
        confidence: confidence,
        duration: duration,
        user_fid: userFid,
        cast_hash: castHash,
        accuracy: accuracy,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insertion error:', insertError);
      return NextResponse.json(
        { error: 'Failed to store challenge result in database' },
        { status: 500 }
      );
    }

    // Track analytics event
    await databaseService.trackEvent({
      event_type: 'challenge_submitted',
      user_id: userId,
      performance_id: finalSubmissionId,
      event_data: {
        challenge_id: challengeId,
        self_rating: selfRating,
        confidence: confidence,
        duration: duration,
        has_cast_hash: !!castHash,
        accuracy: accuracy
      }
    });

    // Initialize performance metrics for this submission
    await databaseService.updatePerformanceMetrics({
      performance_id: finalSubmissionId,
      likes_count: 0,
      replies_count: 0,
      recasts_count: 0,
      views_count: 0,
      shares_count: 0
    });

    console.log('✅ Challenge result stored in database:', {
      submissionId: finalSubmissionId,
      challengeId,
      userId,
      selfRating
    });

    return NextResponse.json({
      success: true,
      message: 'Challenge result submitted and stored successfully',
      submissionId: finalSubmissionId,
      challengeId,
      timestamp: new Date().toISOString(),
      // Real data from database
      communityRating: null, // Will be calculated as more ratings come in
      gap: null, // Will be calculated when community rating is available
      likes: 0,
      comments: 0,
      shares: 0,
      stored: true
    });

  } catch (error) {
    console.error('Challenge submission error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit challenge result',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}