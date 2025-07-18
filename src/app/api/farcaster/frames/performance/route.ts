import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { performanceData, options } = await request.json();
    
    if (!performanceData) {
      return NextResponse.json({ error: 'Performance data is required' }, { status: 400 });
    }

    // Generate frame metadata
    const frameMetadata = {
      'fc:frame': 'vNext',
      'fc:frame:image': options?.imageUrl || generatePerformanceImage(performanceData),
      'fc:frame:button:1': options?.buttons?.[0]?.label || '🎵 Listen',
      'fc:frame:button:1:action': options?.buttons?.[0]?.action || 'post',
      'fc:frame:button:1:target': options?.buttons?.[0]?.target || 'play',
      'fc:frame:button:2': options?.buttons?.[1]?.label || '⭐ Rate',
      'fc:frame:button:2:action': options?.buttons?.[1]?.action || 'post',
      'fc:frame:button:2:target': options?.buttons?.[1]?.target || 'rate',
      'fc:frame:button:3': options?.buttons?.[2]?.label || '🎤 Try Challenge',
      'fc:frame:button:3:action': options?.buttons?.[2]?.action || 'link',
      'fc:frame:button:3:target': options?.buttons?.[2]?.target || `/challenge/${performanceData.challengeId}`,
      'fc:frame:post_url': `${process.env.NEXT_PUBLIC_BASE_URL}/api/farcaster/frames/performance/action`,
      'og:title': options?.title || `${performanceData.challengeTitle} Performance`,
      'og:description': options?.description || `Vocal performance with ${performanceData.selfRating}/5 self-rating`,
      'og:image': options?.imageUrl || generatePerformanceImage(performanceData),
    };

    // Create frame URL with metadata
    const frameUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/frames/performance/${performanceData.id}`;
    
    // Store frame metadata for later retrieval
    // In a real implementation, you'd store this in a database
    
    return NextResponse.json({ 
      frameUrl,
      metadata: frameMetadata
    });
  } catch (error) {
    console.error('Error generating performance frame:', error);
    return NextResponse.json({ error: 'Failed to generate performance frame' }, { status: 500 });
  }
}

function generatePerformanceImage(performanceData: any): string {
  // Generate a dynamic image URL based on performance data
  const params = new URLSearchParams({
    title: performanceData.challengeTitle,
    selfRating: performanceData.selfRating.toString(),
    communityRating: performanceData.communityRating?.toString() || '',
    gap: performanceData.gap?.toString() || '',
    type: 'performance'
  });
  
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api/og/performance?${params.toString()}`;
}