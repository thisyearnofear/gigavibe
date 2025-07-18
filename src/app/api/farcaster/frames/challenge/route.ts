import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { challengeData, options } = await request.json();
    
    if (!challengeData) {
      return NextResponse.json({ error: 'Challenge data is required' }, { status: 400 });
    }

    // Generate frame metadata
    const frameMetadata = {
      'fc:frame': 'vNext',
      'fc:frame:image': options?.imageUrl || generateChallengeImage(challengeData),
      'fc:frame:button:1': options?.buttons?.[0]?.label || '🎤 Accept Challenge',
      'fc:frame:button:1:action': options?.buttons?.[0]?.action || 'link',
      'fc:frame:button:1:target': options?.buttons?.[0]?.target || `/challenge/${challengeData.id}`,
      'fc:frame:button:2': options?.buttons?.[1]?.label || '👀 View Leaderboard',
      'fc:frame:button:2:action': options?.buttons?.[1]?.action || 'post',
      'fc:frame:button:2:target': options?.buttons?.[1]?.target || 'leaderboard',
      'fc:frame:button:3': options?.buttons?.[2]?.label || '🎵 Preview Song',
      'fc:frame:button:3:action': options?.buttons?.[2]?.action || 'post',
      'fc:frame:button:3:target': options?.buttons?.[2]?.target || 'preview',
      'fc:frame:post_url': `${process.env.NEXT_PUBLIC_BASE_URL}/api/farcaster/frames/challenge/action`,
      'og:title': options?.title || `New Challenge: ${challengeData.title}`,
      'og:description': options?.description || challengeData.description,
      'og:image': options?.imageUrl || generateChallengeImage(challengeData),
    };

    // Create frame URL with metadata
    const frameUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/frames/challenge/${challengeData.id}`;
    
    return NextResponse.json({ 
      frameUrl,
      metadata: frameMetadata
    });
  } catch (error) {
    console.error('Error generating challenge frame:', error);
    return NextResponse.json({ error: 'Failed to generate challenge frame' }, { status: 500 });
  }
}

function generateChallengeImage(challengeData: any): string {
  // Generate a dynamic image URL based on challenge data
  const params = new URLSearchParams({
    title: challengeData.title,
    description: challengeData.description || '',
    difficulty: challengeData.difficulty || '',
    participants: challengeData.participants?.toString() || '0',
    type: 'challenge'
  });
  
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api/og/challenge?${params.toString()}`;
}