'use client';

import { 
  createCoin, 
  tradeCoin, 
  setApiKey, 
  DeployCurrency
} from '@zoralabs/coins-sdk';
import { Address, createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';
import { RealityCheckResult, PerformanceCoin, CoinEligibility } from './types';

export class ZoraService {
  private static instance: ZoraService;
  private publicClient;
  private platformReferrer: Address;

  constructor() {
    // Set up Zora API key
    const apiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
    if (apiKey) {
      setApiKey(apiKey);
    }

    // Set up viem clients
    this.publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });

    this.platformReferrer = (process.env.NEXT_PUBLIC_ZORA_PLATFORM_REFERRER as Address) || '0x0000000000000000000000000000000000000000';
  }

  static getInstance(): ZoraService {
    if (!ZoraService.instance) {
      ZoraService.instance = new ZoraService();
    }
    return ZoraService.instance;
  }

  /**
   * Check if a performance is eligible for coin creation
   */
  checkCoinEligibility(performance: RealityCheckResult): CoinEligibility | null {
    // Leaderboard winner (top 3 in any category)
    if (performance.category && this.isLeaderboardWinner(performance)) {
      return {
        type: 'leaderboard_winner',
        performance,
        reason: `Top 3 in ${performance.category} category`,
        autoMint: true
      };
    }

    // Viral moment (100+ shares)
    if (performance.shareCount >= 100) {
      return {
        type: 'viral_moment',
        performance,
        reason: `${performance.shareCount} shares - viral moment!`,
        autoMint: true
      };
    }

    // Perfect score (5.0 community rating)
    if (performance.communityRating >= 5.0) {
      return {
        type: 'perfect_score',
        performance,
        reason: 'Perfect 5⭐ community rating',
        autoMint: true
      };
    }

    // Reality gap (3+ star difference - hilarious fails)
    if (performance.gap >= 3) {
      return {
        type: 'reality_gap',
        performance,
        reason: `${performance.gap}⭐ reality gap - comedy gold!`,
        autoMint: true
      };
    }

    return null;
  }

  /**
   * Create a performance coin for eligible Reality Check results
   */
  async createPerformanceCoin(
    performance: RealityCheckResult,
    walletClient: any
  ): Promise<{ address: Address; hash: string } | null> {
    try {
      const eligibility = this.checkCoinEligibility(performance);
      if (!eligibility) {
        throw new Error('Performance not eligible for coin creation');
      }

      // Create metadata URI (fallback implementation for now)
      const metadataUri = await this.createFallbackMetadata(performance);

      // Create the coin
      const coinResult = await createCoin({
        name: `${performance.challengeTitle} - Reality Check`,
        symbol: `RC${performance.eventId.slice(-4).toUpperCase()}`,
        uri: metadataUri as any, // Temporary type assertion
        payoutRecipient: performance.userAddress,
        platformReferrer: this.platformReferrer,
        currency: DeployCurrency.ETH,
        chainId: base.id
      }, walletClient, this.publicClient);

      console.log('Performance coin created:', {
        address: coinResult.address,
        hash: coinResult.hash,
        performance: performance.id
      });

      return {
        address: coinResult.address,
        hash: coinResult.hash
      };

    } catch (error) {
      console.error('Failed to create performance coin:', error);
      return null;
    }
  }

  /**
   * Trade performance coins
   */
  async tradePerformanceCoin(
    coinAddress: Address,
    action: 'buy' | 'sell',
    amountIn: bigint,
    userAddress: Address,
    walletClient: any,
    slippage: number = 0.05
  ) {
    try {
      const tradeParameters = {
        sell: action === 'buy' 
          ? { type: 'eth' as const }
          : { type: 'erc20' as const, address: coinAddress },
        buy: action === 'buy'
          ? { type: 'erc20' as const, address: coinAddress }
          : { type: 'eth' as const },
        amountIn,
        slippage,
        sender: userAddress
      };

      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        account: walletClient.account,
        publicClient: this.publicClient
      });

      return receipt;
    } catch (error) {
      console.error('Trade failed:', error);
      throw error;
    }
  }

  /**
   * Generate coin description with viral elements
   */
  private generateCoinDescription(performance: RealityCheckResult): string {
    const gapEmoji = this.getGapEmoji(performance.gap);
    const categoryEmoji = this.getCategoryEmoji(performance.category);
    
    return `${categoryEmoji} "${performance.challengeTitle}" Reality Check

"I thought I was ${performance.selfRating}⭐... they said ${performance.communityRating}⭐" ${gapEmoji}

${performance.wittyCommentary}

🎭 Event: ${performance.eventId}
📊 Community Rating: ${performance.communityRating}/5
🔄 Shares: ${performance.shareCount}
📅 ${performance.timestamp.toLocaleDateString()}

Own a piece of this viral vocal moment! This coin represents a genuine community-judged performance from GIGAVIBE's Reality Check events.

#VocalRealityCheck #GIGAVIBE #PerformanceCoin`;
  }

  /**
   * Generate or fetch result image for the performance
   */
  private async generateResultImage(performance: RealityCheckResult): Promise<string> {
    // In a real implementation, this would generate a meme-style image
    // For now, return a placeholder
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${performance.id}&backgroundColor=8b5cf6,ec4899,06b6d4`;
  }

  /**
   * Create result image blob for metadata upload
   */
  private async createResultImageBlob(performance: RealityCheckResult): Promise<Blob> {
    try {
      // Generate a simple canvas-based result image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = 400;
      canvas.height = 400;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#ec4899');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);

      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Reality Check', 200, 100);
      
      ctx.font = '18px Arial';
      ctx.fillText(`"I thought ${performance.selfRating}⭐"`, 200, 180);
      ctx.fillText(`"They said ${performance.communityRating}⭐"`, 200, 220);
      
      ctx.font = 'bold 32px Arial';
      ctx.fillText(this.getGapEmoji(performance.gap), 200, 280);
      
      ctx.font = '16px Arial';
      ctx.fillText(performance.challengeTitle, 200, 320);

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob || new Blob());
        }, 'image/png');
      });
    } catch (error) {
      console.error('Failed to create result image blob:', error);
      // Return empty blob as fallback
      return new Blob();
    }
  }

  /**
   * Create real metadata using Zora's metadata builder
   */
  private async createRealMetadata(performance: RealityCheckResult): Promise<string> {
    try {
      // Create result image for the performance
      const resultImageBlob = await this.createResultImageBlob(performance);
      const imageFile = new File([resultImageBlob], `${performance.id}.png`, { type: 'image/png' });

      // Use Zora's metadata builder
      const { createMetadataParameters } = await createMetadataBuilder()
        .withName(`${performance.challengeTitle} - Reality Check`)
        .withSymbol(`RC${performance.eventId.slice(-4).toUpperCase()}`)
        .withDescription(this.generateCoinDescription(performance))
        .withImage(imageFile)
        .withAttributes([
          { trait_type: 'Category', value: performance.category },
          { trait_type: 'Self Rating', value: performance.selfRating.toString() },
          { trait_type: 'Community Rating', value: performance.communityRating.toString() },
          { trait_type: 'Reality Gap', value: performance.gap.toString() },
          { trait_type: 'Shares', value: performance.shareCount.toString() },
          { trait_type: 'Event ID', value: performance.eventId },
          { trait_type: 'Challenge ID', value: performance.challengeId }
        ])
        .upload(createZoraUploaderForCreator(performance.userAddress));

      return createMetadataParameters.uri;
    } catch (error) {
      console.error('Failed to create real metadata, using fallback:', error);
      return this.createFallbackMetadata(performance);
    }
  }

  /**
   * Create fallback metadata URI when real upload fails
   */
  private async createFallbackMetadata(performance: RealityCheckResult): Promise<string> {
    // Return a deterministic IPFS URI based on performance data
    const hash = this.generateMetadataHash(performance);
    return `ipfs://bafybei${hash}`;
  }

  /**
   * Generate deterministic hash for metadata
   */
  private generateMetadataHash(performance: RealityCheckResult): string {
    const data = `${performance.id}-${performance.challengeTitle}-${performance.selfRating}-${performance.communityRating}`;
    // Simple hash function for demo - in production use proper crypto hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).padStart(50, '0');
  }

  /**
   * Check if performance is a leaderboard winner (mock implementation)
   */
  private isLeaderboardWinner(performance: RealityCheckResult): boolean {
    // In real implementation, check against actual leaderboard data
    return performance.communityRating >= 4.5 || performance.shareCount >= 50;
  }

  /**
   * Get emoji for rating gap
   */
  private getGapEmoji(gap: number): string {
    if (gap >= 3) return '😅';
    if (gap >= 2) return '🤔';
    if (gap <= -2) return '😲';
    if (Math.abs(gap) <= 0.5) return '🎯';
    return '😐';
  }

  /**
   * Get emoji for category
   */
  private getCategoryEmoji(category: string): string {
    const emojis = {
      quality: '🎯',
      legendary: '🔥',
      comedy: '😂',
      diva: '👑',
      baritone: '🎭'
    };
    return emojis[category as keyof typeof emojis] || '🎤';
  }

  /**
   * Get mock market data for testing
   */
  getMockMarketData(): PerformanceCoin[] {
    return [
      {
        address: '0x1234567890123456789012345678901234567890' as Address,
        name: 'Viral Pop Challenge - Reality Check',
        symbol: 'RCVP01',
        creator: '0x1111111111111111111111111111111111111111' as Address,
        performance: {
          id: 'mock-1',
          eventId: 'truth-tuesday-001',
          challengeTitle: 'Viral Pop Challenge',
          challengeId: 'challenge-001',
          userAddress: '0x1111111111111111111111111111111111111111' as Address,
          selfRating: 5,
          communityRating: 2.3,
          gap: 2.7,
          wittyCommentary: "Someone's been practicing in the shower a bit too much",
          shareCount: 156,
          timestamp: new Date(),
          audioUrl: '/mock-audio.mp3',
          category: 'comedy'
        },
        marketData: {
          price: 0.025,
          volume24h: 2.4,
          marketCap: 12.5,
          holders: 47,
          priceChange24h: 0.008,
          priceChangePercent24h: 47.2
        },
        metadata: {
          description: 'Comedy gold performance coin',
          image: 'https://api.dicebear.com/7.x/shapes/svg?seed=mock1',
          attributes: [
            { trait_type: 'Category', value: 'Comedy' },
            { trait_type: 'Reality Gap', value: '2.7⭐' },
            { trait_type: 'Shares', value: 156 }
          ]
        }
      }
    ];
  }
}