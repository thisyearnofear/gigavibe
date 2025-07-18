/**
 * Challenge Submission API Route
 * Handles challenge result submissions with Supabase integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

interface ChallengeSubmissionData {
  challengeId: string;
  challengeTitle: string;
  audioUrl: string;
  selfRating: number;
  confidence: string;
  duration: number;
  userFid?: number;
  castHash?: string;
  accuracy?: number;
  submissionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ChallengeSubmissionData = await request.json();
    
    // Validate required fields
    if (!data.challengeId || !data.challengeTitle || !data.audioUrl || !data.selfRating) {
      return NextResponse.json(
        { error: 'Missing required fields: challengeId, challengeTitle, audioUrl, selfRating' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (data.selfRating < 1 || data.selfRating > 10) {
      return NextResponse.json(
        { error: 'Self rating must be between 1 and 10' },
        { status: 400 }
      );
    }

    // supabase is already imported and ready to use
    
    // Generate submission ID if not provided
    const submissionId = data.submissionId || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert challenge result into Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('challenge_results')
      .insert({
        id: submissionId,
        challenge_id: data.challengeId,
        challenge_title: data.challengeTitle,
        audio_url: data.audioUrl,
        self_rating: data.selfRating,
        confidence: data.confidence,
        duration: data.duration,
        user_fid: data.userFid,
        cast_hash: data.castHash,
        accuracy: data.accuracy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save challenge result' },
        { status: 500 }
      );
    }

    // Update challenge participation count
    const { error: updateError } = await supabase.rpc('increment_challenge_participants', {
      challenge_id: data.challengeId
    });

    if (updateError) {
      console.warn('Failed to update participation count:', updateError);
      // Don't fail the request for this
    }

    // Log successful submission
    console.log('✅ Challenge result submitted:', {
      submissionId,
      challengeId: data.challengeId,
      selfRating: data.selfRating,
      duration: data.duration
    });

    // Return success response with submission data
    return NextResponse.json({
      success: true,
      submissionId,
      data: insertData,
      message: 'Challenge result submitted successfully'
    });

  } catch (error) {
    console.error('❌ Challenge submission error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}