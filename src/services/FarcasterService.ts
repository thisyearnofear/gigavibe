/**
 * Farcaster Service
 * Centralized service for all Farcaster API interactions
 * Following DRY, CLEAN, ORGANIZED, MODULAR principles
 */

import { ChallengeResult } from '@/types/challenge.types';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  isVerified?: boolean;
}

interface CastData {
  text: string;
  embeds?: Array<{
    url?: string;
    castId?: {
      fid: number;
      hash: string;
    };
  }>;
  channelId?: string;
  parentCastId?: {
    fid: number;
    hash: string;
  };
}

interface FrameData {
  version: string;
  image: string;
  buttons?: Array<{
    label: string;
    action: 'post' | 'post_redirect' | 'link';
    target?: string;
  }>;
  inputText?: string;
  postUrl?: string;
  aspectRatio?: '1.91:1' | '1:1';
}

class FarcasterService {
  private static instance: FarcasterService;
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_FARCASTER_API_URL || 'https://api.neynar.com/v2';
    this.apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
  }

  static getInstance(): FarcasterService {
    if (!FarcasterService.instance) {
      FarcasterService.instance = new FarcasterService();
    }
    return FarcasterService.instance;
  }

  /**
   * Get user information by FID
   */
  async getUserByFid(fid: number): Promise<FarcasterUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/farcaster/user?fid=${fid}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformUserData(data.result?.user);
    } catch (error) {
      console.error('Error fetching Farcaster user:', error);
      return null;
    }
  }

  /**
   * Get user information by username
   */
  async getUserByUsername(username: string): Promise<FarcasterUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/farcaster/user-by-username?username=${username}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformUserData(data.result?.user);
    } catch (error) {
      console.error('Error fetching Farcaster user by username:', error);
      return null;
    }
  }

  /**
   * Create a cast
   */
  async createCast(castData: CastData, signerUuid: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/farcaster/cast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signer_uuid: signerUuid,
          text: castData.text,
          embeds: castData.embeds,
          channel_id: castData.channelId,
          parent: castData.parentCastId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create cast: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result?.cast?.hash || null;
    } catch (error) {
      console.error('Error creating cast:', error);
      return null;
    }
  }

  /**
   * Generate performance cast text
   */
  generatePerformanceCastText(result: ChallengeResult, communityRating?: number): string {
    const gapEmoji = this.getRealityGapEmoji(result.selfRating, communityRating);
    const qualityEmoji = this.getQualityEmoji(communityRating || result.selfRating);
    
    let castText = `Just crushed the "${result.challengeTitle}" challenge! 🎤${qualityEmoji}\n\n`;
    
    castText += `Self-rated: ${result.selfRating}/10`;
    
    if (communityRating) {
      const gap = result.selfRating - communityRating;
      castText += ` | Community: ${communityRating}/10\n`;
      castText += `Reality gap: ${gap > 0 ? '+' : ''}${gap.toFixed(1)} ${gapEmoji}\n\n`;
    } else {
      castText += ` | Feeling ${result.confidence} ${this.getConfidenceEmoji(result.confidence)}\n\n`;
    }
    
    castText += `Try the challenge yourself! 👇`;
    
    return castText;
  }

  /**
   * Generate frame metadata for HTML
   */
  generateFrameMetadata(frameData: FrameData): Record<string, string> {
    const metadata: Record<string, string> = {
      'fc:frame': frameData.version,
      'fc:frame:image': frameData.image,
    };

    if (frameData.aspectRatio) {
      metadata['fc:frame:image:aspect_ratio'] = frameData.aspectRatio;
    }

    if (frameData.inputText) {
      metadata['fc:frame:input:text'] = frameData.inputText;
    }

    if (frameData.postUrl) {
      metadata['fc:frame:post_url'] = frameData.postUrl;
    }

    if (frameData.buttons) {
      frameData.buttons.forEach((button, index) => {
        const buttonIndex = index + 1;
        metadata[`fc:frame:button:${buttonIndex}`] = button.label;
        metadata[`fc:frame:button:${buttonIndex}:action`] = button.action;
        
        if (button.target) {
          metadata[`fc:frame:button:${buttonIndex}:target`] = button.target;
        }
      });
    }

    return metadata;
  }

  /**
   * Create performance sharing URL
   */
  createPerformanceShareUrl(performanceId: string, challengeId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gigavibe.app';
    return `${baseUrl}/performance/${performanceId}?challenge=${challengeId}&ref=farcaster`;
  }

  /**
   * Create challenge invitation URL
   */
  createChallengeInviteUrl(challengeId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gigavibe.app';
    return `${baseUrl}/challenge/${challengeId}?ref=farcaster`;
  }

  /**
   * Generate frame image URL for performance
   */
  generatePerformanceFrameImageUrl(
    performanceId: string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gigavibe.app';
    const params = new URLSearchParams({
      width: (options.width || 1200).toString(),
      height: (options.height || 630).toString(),
      quality: (options.quality || 85).toString(),
    });
    
    return `${baseUrl}/api/frames/performance/${performanceId}/image?${params}`;
  }

  /**
   * Generate frame image URL for challenge
   */
  generateChallengeFrameImageUrl(
    challengeId: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gigavibe.app';
    const params = new URLSearchParams({
      width: (options.width || 1200).toString(),
      height: (options.height || 630).toString(),
      quality: (options.quality || 85).toString(),
    });
    
    return `${baseUrl}/api/frames/challenge/${challengeId}/image?${params}`;
  }

  /**
   * Check if current context is Farcaster
   */
  isInFarcasterContext(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for Farcaster user agent or referrer
    const userAgent = navigator.userAgent.toLowerCase();
    const referrer = document.referrer.toLowerCase();
    
    return (
      userAgent.includes('farcaster') ||
      referrer.includes('warpcast') ||
      referrer.includes('farcaster') ||
      window.location.search.includes('ref=farcaster')
    );
  }

  /**
   * Get mini app context
   */
  getMiniAppContext(): {
    isMiniApp: boolean;
    parentUrl?: string;
    userFid?: number;
  } {
    if (typeof window === 'undefined') {
      return { isMiniApp: false };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isMiniApp = this.isInFarcasterContext();
    
    return {
      isMiniApp,
      parentUrl: urlParams.get('parent_url') || undefined,
      userFid: urlParams.get('fid') ? parseInt(urlParams.get('fid')!) : undefined,
    };
  }

  /**
   * Private helper methods
   */
  private transformUserData(userData: any): FarcasterUser | null {
    if (!userData) return null;
    
    return {
      fid: userData.fid,
      username: userData.username,
      displayName: userData.display_name || userData.username,
      pfpUrl: userData.pfp_url || '',
      isVerified: userData.power_badge || false,
    };
  }

  private getRealityGapEmoji(selfRating: number, communityRating?: number): string {
    if (!communityRating) return '🎤';
    
    const gap = selfRating - communityRating;
    if (gap > 2) return '🤔';
    if (gap > 0.5) return '😅';
    if (gap > -0.5) return '🎯';
    return '🌟';
  }

  private getQualityEmoji(rating: number): string {
    if (rating >= 9.5) return '👑';
    if (rating >= 8.5) return '⭐';
    if (rating >= 7.5) return '🎯';
    if (rating >= 6.5) return '🎵';
    return '🎤';
  }

  private getConfidenceEmoji(confidence: string): string {
    switch (confidence) {
      case 'very confident': return '🔥';
      case 'confident': return '😊';
      case 'nervous': return '😅';
      default: return '🎤';
    }
  }
}

// Export singleton instance
export const farcasterService = FarcasterService.getInstance();
export default FarcasterService;