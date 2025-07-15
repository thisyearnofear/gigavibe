'use client';

import { Address } from 'viem';
import { RealityCheckResult } from '@/lib/zora/types';

// Interfaces to match the API responses
interface NeynarAuthor {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  profile?: {
    bio: {
      text: string;
    };
  };
}

interface NeynarCast {
  hash: string;
  author: NeynarAuthor;
  text: string;
  timestamp: string;
  embeds?: Array<{url: string}>;
  reactions: {
    likes_count: number;
    recasts_count: number;
  };
  replies: {
    count: number;
  };
  channel?: {
    id: string;
  };
}

/**
 * Farcaster Data Service
 * Uses Next.js API routes to interact with Farcaster via Neynar API
 */
export class FarcasterDataService {
  private static instance: FarcasterDataService;
  private readonly GIGAVIBE_CHANNEL = 'gigavibe';

  constructor() {
    // No direct client initialization - we use API routes instead
  }

  static getInstance(): FarcasterDataService {
    if (!FarcasterDataService.instance) {
      FarcasterDataService.instance = new FarcasterDataService();
    }
    return FarcasterDataService.instance;
  }

  /**
   * Upload performance to Farcaster as a cast
   * @throws Error if cast creation fails or no signer provided
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
  ): Promise<string> {
    try {
      if (!signerUuid) {
        throw new Error('Signer UUID is required to create a Farcaster cast');
      }

      const castText = `🎤 Reality Check: "${metadata.challengeTitle}"
I thought ${metadata.selfRating}⭐... let's see what you think!

#GigaVibe #RealityCheck #${metadata.category}`;

      const embeds = [
        { url: audioIPFS }, // IPFS audio file
        { url: `https://gigavibe.app/performance/${Date.now()}` } // Deep link
      ];

      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publishCast',
          signerUuid,
          text: castText,
          embeds,
          channelId: this.GIGAVIBE_CHANNEL
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract cast ID from response
      const castId = data.cast?.hash || data.hash;
      
      if (!castId) {
        throw new Error('Failed to get cast hash from API response');
      }
      
      console.log('✅ Performance posted to Farcaster:', castId);
      return castId;
    } catch (error) {
      console.error('Failed to create performance on Farcaster:', error);
      throw new Error(`Farcaster cast creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performances from Farcaster channel
   * @throws Error if performance retrieval fails
   */
  async getPerformances(limit: number = 25, cursor?: string): Promise<RealityCheckResult[]> {
    try {
      const queryParams = new URLSearchParams({
        action: 'fetchChannel',
        channelId: this.GIGAVIBE_CHANNEL,
        limit: limit.toString(),
      });

      if (cursor) {
        queryParams.append('cursor', cursor);
      }

      const response = await fetch(`/api/farcaster/cast?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      // Handle response data based on actual API structure
      const casts = data.casts || [];
      if (!Array.isArray(casts)) {
        throw new Error('Invalid response format: casts is not an array');
      }
      
      return casts.map((cast: any) => this.transformCastToPerformance(cast));
    } catch (error) {
      console.error('Failed to fetch performances from Farcaster:', error);
      throw new Error(`Farcaster performance retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Submit community vote as reply cast
   * @throws Error if vote submission fails or no signer provided
   */
  async submitVote(
    performanceHash: string,
    rating: number,
    signerUuid?: string
  ): Promise<string> {
    try {
      if (!signerUuid) {
        throw new Error('Signer UUID is required to submit a vote');
      }

      if (!performanceHash) {
        throw new Error('Performance hash is required to submit a vote');
      }

      const voteText = `Rating: ${rating}⭐ #GigaVibe`;

      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publishCast',
          signerUuid,
          text: voteText,
          parent: performanceHash,
          channelId: this.GIGAVIBE_CHANNEL
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.hash) {
        throw new Error('Failed to get vote hash from API response');
      }
      
      console.log('✅ Vote submitted to Farcaster:', data.hash);
      return data.hash;
    } catch (error) {
      console.error('Failed to submit vote to Farcaster:', error);
      throw new Error(`Vote submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get votes for a performance
   * @throws Error if vote retrieval fails
   */
  async getVotes(performanceHash: string): Promise<Array<{
    rating: number;
    voter: { fid: number; username: string; pfp_url: string };
    timestamp: Date;
  }>> {
    try {
      if (!performanceHash) {
        throw new Error('Performance hash is required to fetch votes');
      }

      const queryParams = new URLSearchParams({
        action: 'fetchReplies',
        hash: performanceHash,
      });

      const response = await fetch(`/api/farcaster/cast?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      if (!data.casts || !Array.isArray(data.casts)) {
        throw new Error('Invalid response format: casts is not an array');
      }

      return data.casts
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
      throw new Error(`Vote retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user profile from Farcaster
   * @throws Error if profile retrieval fails
   */
  async getUserProfile(fid: number): Promise<{
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    bio: string;
    followerCount: number;
    followingCount: number;
  }> {
    try {
      if (!fid || fid <= 0) {
        throw new Error('Valid FID is required to fetch user profile');
      }

      const queryParams = new URLSearchParams({
        action: 'fetchUserProfile',
        fid: fid.toString()
      });

      const response = await fetch(`/api/farcaster/user?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const user = data.users?.[0];
      if (!user) {
        throw new Error(`User with FID ${fid} not found`);
      }

      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        bio: user.profile?.bio?.text || '',
        followerCount: user.follower_count || 0,
        followingCount: user.following_count || 0
      };
    } catch (error) {
      console.error('Failed to fetch user profile from Farcaster:', error);
      throw new Error(`Profile retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user profile by wallet address
   * @throws Error if profile retrieval fails
   */
  async getUserByAddress(address: Address): Promise<{
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  }> {
    try {
      if (!address) {
        throw new Error('Valid wallet address is required to fetch user profile');
      }

      const queryParams = new URLSearchParams({
        action: 'fetchUserByAddress',
        address: address.toString()
      });

      const response = await fetch(`/api/farcaster/user?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const userData = data[address];
      if (!userData || userData.length === 0) {
        throw new Error(`No Farcaster user found for address ${address}`);
      }

      const user = userData[0];
      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url
      };
    } catch (error) {
      console.error('Failed to fetch user by address from Farcaster:', error);
      throw new Error(`User lookup by address failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search performances by text
   * @throws Error if search fails
   */
  async searchPerformances(query: string): Promise<RealityCheckResult[]> {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query is required');
      }
      
      const queryParams = new URLSearchParams({
        action: 'searchCasts',
        query: `${query} #GigaVibe`
      });

      const response = await fetch(`/api/farcaster/cast?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      if (!data.casts || !Array.isArray(data.casts)) {
        throw new Error('Invalid response format: casts is not an array');
      }

      return data.casts
        .filter(cast => cast.channel?.id === this.GIGAVIBE_CHANNEL)
        .map(cast => this.transformCastToPerformance(cast));
    } catch (error) {
      console.error('Failed to search performances on Farcaster:', error);
      throw new Error(`Performance search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transform Farcaster cast to RealityCheckResult
   * @throws Error if cast data is invalid
   */
  private transformCastToPerformance(cast: any): RealityCheckResult {
    if (!cast || !cast.hash || !cast.author) {
      throw new Error('Invalid cast data for transformation');
    }

    // Extract self-rating from cast text
    const ratingMatch = cast.text.match(/I thought (\d+)⭐/);
    const selfRating = ratingMatch ? parseInt(ratingMatch[1]) : 3;

    // Extract challenge title
    const titleMatch = cast.text.match(/"([^"]+)"/);
    const challengeTitle = titleMatch ? titleMatch[1] : 'Untitled Performance';

    // Extract category from hashtags
    const categoryMatch = cast.text.match(/#(comedy|quality|legendary|diva|baritone)/i);
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'quality';

    // Find audio embed
    const audioEmbed = cast.embeds?.find((embed: any) =>
      embed.url && (embed.url.includes('ipfs://') || embed.url.includes('.mp3') || embed.url.includes('.wav'))
    );
    
    if (!audioEmbed || !audioEmbed.url) {
      throw new Error('No audio embed found in cast');
    }

    // Get or generate Ethereum address for this user
    // In a production environment, this would come from a mapping service
    const userAddress = cast.author.eth_address ||
                        `0x${cast.author.fid.toString().padStart(40, '0')}` as Address;

    return {
      id: cast.hash,
      eventId: 'farcaster-native',
      challengeTitle,
      challengeId: 'farcaster-challenge',
      userAddress,
      selfRating,
      communityRating: selfRating, // Initial value, will be updated by votes
      gap: 0, // Initial value, will be calculated from votes
      wittyCommentary: this.generateCommentary(selfRating),
      shareCount: cast.reactions.recasts_count || 0,
      timestamp: new Date(cast.timestamp),
      audioUrl: audioEmbed.url,
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
}