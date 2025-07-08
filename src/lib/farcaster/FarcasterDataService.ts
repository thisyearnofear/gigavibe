'use client';

import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { Address } from 'viem';
import { RealityCheckResult } from '@/lib/zora/types';

/**
 * Farcaster Data Service using Neynar API
 * Replaces traditional backend with Farcaster protocol as social database
 */
export class FarcasterDataService {
  private static instance: FarcasterDataService;
  private client: NeynarAPIClient;
  private readonly GIGAVIBE_CHANNEL = 'gigavibe';

  constructor() {
    const config = new Configuration({
      apiKey: process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
    });
    
    this.client = new NeynarAPIClient(config);
    
    if (!process.env.NEXT_PUBLIC_NEYNAR_API_KEY) {
      console.warn('NEYNAR_API_KEY not found - some features may not work');
    }
  }

  static getInstance(): FarcasterDataService {
    if (!FarcasterDataService.instance) {
      FarcasterDataService.instance = new FarcasterDataService();
    }
    return FarcasterDataService.instance;
  }

  /**
   * Upload performance to Farcaster as a cast
   */
  async createPerformance(
    audioIPFS: string,
    metadata: {
      challengeTitle: string;
      selfRating: number;
      category: string;
      duration: number;
    },
    signerUuid?: string
  ): Promise<string | null> {
    try {
      const castText = `🎤 Reality Check: "${metadata.challengeTitle}"
I thought ${metadata.selfRating}⭐... let's see what you think! 

#GigaVibe #RealityCheck #${metadata.category}`;

      const embeds = [
        { url: audioIPFS }, // IPFS audio file
        { url: `https://gigavibe.app/performance/${Date.now()}` } // Deep link
      ];

      // If we have a signer, post to Farcaster
      if (signerUuid) {
        const cast = await this.client.publishCast({
          signerUuid,
          text: castText,
          embeds,
          channelId: this.GIGAVIBE_CHANNEL
        });
        
        console.log('✅ Performance posted to Farcaster:', cast.hash);
        return cast.hash;
      } else {
        // For now, just log what would be posted
        console.log('📝 Would post to Farcaster:', { castText, embeds });
        return `mock-cast-${Date.now()}`;
      }
    } catch (error) {
      console.error('Failed to create performance on Farcaster:', error);
      return null;
    }
  }

  /**
   * Get performances from Farcaster channel
   */
  async getPerformances(limit: number = 25, cursor?: string): Promise<RealityCheckResult[]> {
    try {
      const response = await this.client.fetchCastsInChannel({
        id: this.GIGAVIBE_CHANNEL,
        type: 'id',
        limit,
        cursor,
        hasEmbeds: true // Only get casts with audio/metadata
      });

      return response.casts.map(cast => this.transformCastToPerformance(cast));
    } catch (error) {
      console.error('Failed to fetch performances from Farcaster:', error);
      return this.getMockPerformances(limit);
    }
  }

  /**
   * Submit community vote as reply cast
   */
  async submitVote(
    performanceHash: string,
    rating: number,
    signerUuid?: string
  ): Promise<string | null> {
    try {
      const voteText = `Rating: ${rating}⭐ #GigaVibe`;

      if (signerUuid) {
        const cast = await this.client.publishCast({
          signerUuid,
          text: voteText,
          parent: performanceHash,
          channelId: this.GIGAVIBE_CHANNEL
        });
        
        console.log('✅ Vote submitted to Farcaster:', cast.hash);
        return cast.hash;
      } else {
        console.log('📝 Would submit vote:', { voteText, parent: performanceHash });
        return `mock-vote-${Date.now()}`;
      }
    } catch (error) {
      console.error('Failed to submit vote to Farcaster:', error);
      return null;
    }
  }

  /**
   * Get votes for a performance
   */
  async getVotes(performanceHash: string): Promise<Array<{
    rating: number;
    voter: { fid: number; username: string; pfp_url: string };
    timestamp: Date;
  }>> {
    try {
      const response = await this.client.fetchCastReplies({
        hash: performanceHash,
        limit: 100
      });

      return response.casts
        .filter(cast => cast.text.includes('Rating:') && cast.text.includes('⭐'))
        .map(cast => {
          const ratingMatch = cast.text.match(/Rating:\s*(\d+)⭐/);
          const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
          
          return {
            rating,
            voter: {
              fid: cast.author.fid,
              username: cast.author.username,
              pfp_url: cast.author.pfp_url
            },
            timestamp: new Date(cast.timestamp)
          };
        });
    } catch (error) {
      console.error('Failed to fetch votes from Farcaster:', error);
      return [];
    }
  }

  /**
   * Get user profile from Farcaster
   */
  async getUserProfile(fid: number): Promise<{
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    bio: string;
    followerCount: number;
    followingCount: number;
  } | null> {
    try {
      const response = await this.client.fetchBulkUsers({
        fids: [fid]
      });

      const user = response.users[0];
      if (!user) return null;

      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        bio: user.profile.bio.text,
        followerCount: user.follower_count,
        followingCount: user.following_count
      };
    } catch (error) {
      console.error('Failed to fetch user profile from Farcaster:', error);
      return null;
    }
  }

  /**
   * Get user profile by wallet address
   */
  async getUserByAddress(address: Address): Promise<{
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  } | null> {
    try {
      const response = await this.client.fetchBulkUsersByEthOrSolAddress({
        addresses: [address]
      });

      const userData = response[address.toLowerCase()];
      if (!userData || userData.length === 0) return null;

      const user = userData[0];
      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url
      };
    } catch (error) {
      console.error('Failed to fetch user by address from Farcaster:', error);
      return null;
    }
  }

  /**
   * Search performances by text
   */
  async searchPerformances(query: string): Promise<RealityCheckResult[]> {
    try {
      const response = await this.client.searchCasts({
        q: `${query} #GigaVibe`,
        limit: 25
      });

      return response.casts
        .filter(cast => cast.channel?.id === this.GIGAVIBE_CHANNEL)
        .map(cast => this.transformCastToPerformance(cast));
    } catch (error) {
      console.error('Failed to search performances on Farcaster:', error);
      return [];
    }
  }

  /**
   * Transform Farcaster cast to RealityCheckResult
   */
  private transformCastToPerformance(cast: any): RealityCheckResult {
    // Extract self-rating from cast text
    const ratingMatch = cast.text.match(/I thought (\d+)⭐/);
    const selfRating = ratingMatch ? parseInt(ratingMatch[1]) : 3;

    // Extract challenge title
    const titleMatch = cast.text.match(/"([^"]+)"/);
    const challengeTitle = titleMatch ? titleMatch[1] : 'Farcaster Performance';

    // Extract category from hashtags
    const categoryMatch = cast.text.match(/#(comedy|quality|legendary|diva|baritone)/i);
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'quality';

    // Find audio embed
    const audioEmbed = cast.embeds?.find((embed: any) => 
      embed.url && (embed.url.includes('ipfs://') || embed.url.includes('.mp3') || embed.url.includes('.wav'))
    );

    return {
      id: cast.hash,
      eventId: 'farcaster-native',
      challengeTitle,
      challengeId: 'farcaster-challenge',
      userAddress: `0x${cast.author.fid.toString().padStart(40, '0')}` as Address, // Mock address from FID
      selfRating,
      communityRating: selfRating, // Will be updated by votes
      gap: 0, // Will be calculated from votes
      wittyCommentary: this.generateCommentary(selfRating),
      shareCount: cast.reactions.recasts_count || 0,
      timestamp: new Date(cast.timestamp),
      audioUrl: audioEmbed?.url || '/mock-audio.mp3',
      category: category as any,
      farcasterData: {
        castHash: cast.hash,
        authorFid: cast.author.fid,
        authorUsername: cast.author.username,
        authorPfp: cast.author.pfp_url,
        authorDisplayName: cast.author.display_name,
        likes: cast.reactions.likes_count || 0,
        recasts: cast.reactions.recasts_count || 0,
        replies: cast.replies.count || 0
      }
    };
  }

  /**
   * Generate witty commentary based on rating
   */
  private generateCommentary(selfRating: number): string {
    const commentaries = {
      5: "Confidence level: Beyoncé at the Super Bowl",
      4: "Pretty sure I nailed it... right?",
      3: "Solid middle ground performance",
      2: "Well, at least I tried",
      1: "That was... an experience"
    };
    
    return commentaries[selfRating as keyof typeof commentaries] || "Let's see what happens!";
  }

  /**
   * Get mock performances for fallback
   */
  private getMockPerformances(limit: number): RealityCheckResult[] {
    const mockPerformances: RealityCheckResult[] = [];
    
    for (let i = 0; i < limit; i++) {
      mockPerformances.push({
        id: `mock-farcaster-${i}`,
        eventId: 'farcaster-native',
        challengeTitle: `Farcaster Performance ${i + 1}`,
        challengeId: 'farcaster-challenge',
        userAddress: `0x${i.toString().padStart(40, '0')}` as Address,
        selfRating: Math.floor(Math.random() * 5) + 1,
        communityRating: Math.floor(Math.random() * 5) + 1,
        gap: Math.random() * 4 - 2,
        wittyCommentary: "Farcaster-native performance!",
        shareCount: Math.floor(Math.random() * 100),
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        audioUrl: '/mock-audio.mp3',
        category: 'quality',
        farcasterData: {
          castHash: `0x${i.toString().padStart(64, '0')}`,
          authorFid: 1000 + i,
          authorUsername: `user${i}`,
          authorPfp: `https://api.dicebear.com/7.x/shapes/svg?seed=${i}`,
          authorDisplayName: `User ${i}`,
          likes: Math.floor(Math.random() * 50),
          recasts: Math.floor(Math.random() * 20),
          replies: Math.floor(Math.random() * 10)
        }
      });
    }
    
    return mockPerformances;
  }
}