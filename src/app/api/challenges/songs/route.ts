import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';
import fs from 'fs';
import path from 'path';

/**
 * API endpoint for challenge songs
 * Returns available vocal challenges from database or configuration
 */
export async function GET(request: NextRequest) {
  try {
    // First, try to get challenges from database
    try {
      const challengeResults = await databaseService.getChallengeResults(undefined, 50, 0);
      
      if (challengeResults.length > 0) {
        // Transform database results to challenge format
        const challenges = challengeResults.map(result => ({
          id: result.challenge_id,
          title: result.challenge_title,
          artist: 'Community',
          vocalUrl: result.audio_url,
          instrumentalUrl: result.audio_url, // In a real system, you'd have separate instrumental tracks
          difficulty: 'medium', // Could be calculated from ratings
          duration: result.duration_seconds || 180,
          bpm: 120, // Default, could be stored in database
          key: 'Unknown', // Could be analyzed and stored
          description: `Community challenge: ${result.challenge_title}`,
          uploadedAt: result.created_at,
          selfRating: result.self_rating,
          confidence: result.confidence_level,
          userFid: result.user_fid
        }));

        // Remove duplicates by challenge_id
        const uniqueChallenges = challenges.reduce((acc, current) => {
          const existing = acc.find(item => item.id === current.id);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, [] as any[]);

        return NextResponse.json({
          success: true,
          challenges: uniqueChallenges,
          source: 'database',
          count: uniqueChallenges.length
        });
      }
    } catch (dbError) {
      console.warn('Database query failed, falling back to file system:', dbError);
    }

    // Fallback to file system configuration
    const configPath = path.join(process.cwd(), 'src', 'data', 'challenge-songs.json');
    
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const challenges = JSON.parse(configData);
      
      return NextResponse.json({
        success: true,
        challenges,
        source: 'file',
        count: challenges.length
      });
    }
    
    // Final fallback to default challenge
    const defaultChallenge = {
      id: 'espanol-challenge',
      title: 'Español',
      artist: 'GIGAVIBE',
      vocalUrl: '/audio/espanol.mp3',
      instrumentalUrl: '/audio/espanol-instrumental.mp3',
      difficulty: 'medium',
      duration: 180,
      bpm: 120,
      key: 'C Major',
      description: 'Vocal challenge with Spanish lyrics - perfect for testing your vocal skills!',
      uploadedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      challenges: [defaultChallenge],
      source: 'default',
      count: 1,
      note: 'Using default challenge. Submit performances to create more challenges.'
    });
    
  } catch (error) {
    console.error('Error loading challenge songs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load challenge songs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to update challenges (after IPFS upload)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challenges } = body;
    
    if (!challenges || !Array.isArray(challenges)) {
      return NextResponse.json(
        { error: 'Invalid challenges data' },
        { status: 400 }
      );
    }
    
    // Save to configuration file
    const configPath = path.join(process.cwd(), 'src', 'data', 'challenge-songs.json');
    const configDir = path.dirname(configPath);
    
    // Ensure directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Write configuration
    fs.writeFileSync(configPath, JSON.stringify(challenges, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Challenges updated successfully',
      count: challenges.length,
      configPath
    });
    
  } catch (error) {
    console.error('Error updating challenge songs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update challenge songs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}