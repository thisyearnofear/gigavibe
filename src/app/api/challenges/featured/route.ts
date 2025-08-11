import { NextRequest, NextResponse } from "next/server";
import { databaseService } from '@/lib/database/DatabaseService';
import { ViralChallenge } from "@/lib/audio/SunoService";

export async function GET(request: NextRequest) {
  try {
    // Get limit query parameter, default to 10
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    
    // Try to get featured challenges from database
    try {
      const challengeResults = await databaseService.getChallengeResults(undefined, limit * 2, 0);
      
      if (challengeResults.length > 0) {
        // Transform database results to featured challenge format
        const featuredChallenges: ViralChallenge[] = challengeResults
          .slice(0, limit)
          .map(result => ({
            id: result.challenge_id || result.id,
            title: result.challenge_title,
            difficulty: result.self_rating >= 8 ? "Hard" : result.self_rating >= 6 ? "Medium" : "Easy",
            duration: Math.min(result.duration_seconds || 180, 30), // Limit to 30 seconds for featured
            originalAudio: result.audio_url,
            instrumentalAudio: result.audio_url, // In a real system, you'd have separate tracks
            vocalsOnlyAudio: result.audio_url,
            prompt: `Community challenge: ${result.challenge_title}`,
            tags: `community, vocal, ${result.confidence_level || 'medium'}`,
            userFid: result.user_fid,
            selfRating: result.self_rating,
            createdAt: result.created_at
          }));

        return NextResponse.json({ 
          challenges: featuredChallenges,
          total: featuredChallenges.length,
          source: 'database',
          timestamp: new Date().toISOString()
        });
      }
    } catch (dbError) {
      console.warn('Database query failed for featured challenges:', dbError);
    }

    // Fallback to default challenge if database is empty
    const defaultChallenge: ViralChallenge = {
      id: "espanol-challenge-1",
      title: "Spanish Vocals Challenge",
      difficulty: "Medium",
      duration: 15,
      originalAudio: "/audio/espanol.mp3",
      instrumentalAudio: "/audio/espanol-instrumental.mp3",
      vocalsOnlyAudio: "/audio/espanol.mp3",
      prompt: "Spanish vocals with a rhythmic background",
      tags: "spanish, vocals, beginner",
    };
    
    return NextResponse.json({ 
      challenges: [defaultChallenge],
      total: 1,
      source: 'default',
      note: 'Using default challenge. Submit performances to create featured challenges.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error loading featured challenges:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load featured challenges',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}