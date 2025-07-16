import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API endpoint for challenge songs
 * Returns available vocal challenges from configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Try to load from generated configuration file
    const configPath = path.join(process.cwd(), 'src', 'data', 'challenge-songs.json');
    
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const challenges = JSON.parse(configData);
      
      return NextResponse.json({
        success: true,
        challenges,
        source: 'uploaded',
        count: challenges.length
      });
    }
    
    // Fallback to default challenge
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
      note: 'Using default challenge. Upload songs to IPFS to get more challenges.'
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