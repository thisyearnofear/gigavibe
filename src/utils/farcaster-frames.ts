import { FarcasterCast } from '@/hooks/useFarcasterDiscovery';

export interface FrameMetadata {
  version: string;
  image: string;
  buttons: FrameButton[];
  input?: {
    text: string;
  };
  state?: string;
  postUrl?: string;
}

export interface FrameButton {
  label: string;
  action: 'post' | 'link' | 'post_redirect';
  target?: string;
}

export interface FrameActionRequest {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
    castId?: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
}

/**
 * Generate frame metadata for a Farcaster cast with music content
 */
export function generateMusicFrame(cast: FarcasterCast, baseUrl: string): FrameMetadata {
  const musicEmbeds = cast.embeds?.filter(embed => 
    embed.metadata?.description?.toLowerCase().includes('music') ||
    embed.metadata?.description?.toLowerCase().includes('audio') ||
    embed.url?.includes('spotify') ||
    embed.url?.includes('soundcloud') ||
    embed.url?.includes('youtube')
  ) || [];

  const hasMusic = musicEmbeds.length > 0;
  const isGigavibe = cast.text.toLowerCase().includes('gigavibe');

  return {
    version: 'vNext',
    image: `${baseUrl}/api/frames/cast/${cast.hash}/image`,
    buttons: [
      {
        label: hasMusic ? '🎤 Try This Song' : '🎵 Discover Music',
        action: 'link',
        target: hasMusic 
          ? `${baseUrl}/challenge/create?source=${encodeURIComponent(musicEmbeds[0].url || '')}`
          : `${baseUrl}/challenges`
      },
      {
        label: '👏 Rate',
        action: 'post',
        target: `${baseUrl}/api/frames/rate`
      },
      {
        label: '💬 Comment',
        action: 'post',
        target: `${baseUrl}/api/frames/comment`
      },
      {
        label: '🔗 View Cast',
        action: 'link',
        target: `https://warpcast.com/${cast.author.username}/${cast.hash}`
      }
    ],
    input: {
      text: 'Share your thoughts...'
    },
    postUrl: `${baseUrl}/api/frames/action`,
    state: JSON.stringify({
      castHash: cast.hash,
      authorFid: cast.author.fid,
      hasMusic,
      isGigavibe
    })
  };
}

/**
 * Generate frame metadata for a vocal challenge
 */
export function generateChallengeFrame(
  challengeId: string,
  challengeTitle: string,
  baseUrl: string
): FrameMetadata {
  return {
    version: 'vNext',
    image: `${baseUrl}/api/frames/challenge/${challengeId}/image`,
    buttons: [
      {
        label: '🎤 Accept Challenge',
        action: 'link',
        target: `${baseUrl}/challenge/${challengeId}`
      },
      {
        label: '🏆 View Leaderboard',
        action: 'post',
        target: `${baseUrl}/api/frames/leaderboard`
      },
      {
        label: '📊 My Stats',
        action: 'post',
        target: `${baseUrl}/api/frames/stats`
      }
    ],
    input: {
      text: 'Why are you accepting this challenge?'
    },
    postUrl: `${baseUrl}/api/frames/challenge-action`,
    state: JSON.stringify({
      challengeId,
      challengeTitle
    })
  };
}

/**
 * Generate frame metadata for performance results
 */
export function generateResultsFrame(
  performanceId: string,
  selfRating: number,
  communityRating: number,
  baseUrl: string
): FrameMetadata {
  const dunningKrugerDiff = Math.abs(selfRating - communityRating);
  const isOverconfident = selfRating > communityRating;
  const isAccurate = dunningKrugerDiff <= 1;

  return {
    version: 'vNext',
    image: `${baseUrl}/api/frames/results/${performanceId}/image`,
    buttons: [
      {
        label: '🎯 View Analysis',
        action: 'link',
        target: `${baseUrl}/performance/${performanceId}/analysis`
      },
      {
        label: '🔄 Try Again',
        action: 'link',
        target: `${baseUrl}/challenges`
      },
      {
        label: '📤 Share Result',
        action: 'post',
        target: `${baseUrl}/api/frames/share-result`
      }
    ],
    postUrl: `${baseUrl}/api/frames/results-action`,
    state: JSON.stringify({
      performanceId,
      selfRating,
      communityRating,
      dunningKrugerDiff,
      isOverconfident,
      isAccurate
    })
  };
}

/**
 * Convert frame metadata to HTML meta tags
 */
export function frameToMetaTags(frame: FrameMetadata): string {
  let metaTags = `
    <meta property="fc:frame" content="${frame.version}" />
    <meta property="fc:frame:image" content="${frame.image}" />
    <meta property="fc:frame:post_url" content="${frame.postUrl}" />
  `;

  if (frame.input) {
    metaTags += `<meta property="fc:frame:input:text" content="${frame.input.text}" />`;
  }

  if (frame.state) {
    metaTags += `<meta property="fc:frame:state" content="${frame.state}" />`;
  }

  frame.buttons.forEach((button, index) => {
    const buttonIndex = index + 1;
    metaTags += `
      <meta property="fc:frame:button:${buttonIndex}" content="${button.label}" />
      <meta property="fc:frame:button:${buttonIndex}:action" content="${button.action}" />
    `;
    
    if (button.target) {
      metaTags += `<meta property="fc:frame:button:${buttonIndex}:target" content="${button.target}" />`;
    }
  });

  return metaTags;
}

/**
 * Validate frame action request
 */
export function validateFrameAction(actionRequest: FrameActionRequest): boolean {
  const { untrustedData, trustedData } = actionRequest;
  
  // Basic validation
  if (!untrustedData || !trustedData) return false;
  if (!untrustedData.fid || !untrustedData.messageHash) return false;
  if (!trustedData.messageBytes) return false;
  
  // Button index should be between 1 and 4
  if (untrustedData.buttonIndex < 1 || untrustedData.buttonIndex > 4) return false;
  
  return true;
}

/**
 * Extract frame state from action request
 */
export function extractFrameState<T = any>(actionRequest: FrameActionRequest): T | null {
  try {
    // In a real implementation, you'd extract state from the original frame
    // For now, we'll return null as state extraction requires frame context
    return null;
  } catch (error) {
    console.error('Failed to extract frame state:', error);
    return null;
  }
}

/**
 * Generate dynamic frame image URL
 */
export function generateFrameImageUrl(
  type: 'cast' | 'challenge' | 'results',
  id: string,
  baseUrl: string,
  params?: Record<string, string>
): string {
  const searchParams = new URLSearchParams(params);
  const queryString = searchParams.toString();
  
  return `${baseUrl}/api/frames/${type}/${id}/image${queryString ? `?${queryString}` : ''}`;
}
