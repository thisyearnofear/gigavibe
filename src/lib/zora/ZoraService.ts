'use client';

import {
  createCoin,
  tradeCoin,
  setApiKey,
  DeployCurrency
} from '@zoralabs/coins-sdk';
import { fetcher } from '@/lib/utils/fetcher';
// Define a TradeParams type that matches the SDK's expected structure
type TradeParams = {
  direction: 'buy' | 'sell';
  target: Address;
  amountIn: bigint;
  slippage: number;
  sender: Address;
  args: {
    recipient: Address;
    orderSize: bigint;
    minAmountOut?: bigint;
    sqrtPriceLimitX96?: bigint;
    tradeReferrer?: Address;
  };
};
import { Account, Address, createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';
import { RealityCheckResult, PerformanceCoin, CoinEligibility } from './types';

export class ZoraService {
  private static instance: ZoraService;
  private publicClient;
  private platformReferrer: Address;

  constructor() {
    // Note: API key is handled server-side for security
    // Client-side operations use proxy endpoints

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
   * @throws Error if leaderboard data cannot be retrieved
   */
  async checkCoinEligibility(performance: RealityCheckResult): Promise<CoinEligibility | null> {
    try {
      // Leaderboard winner (top 3 in any category)
      if (performance.category && await this.isLeaderboardWinner(performance)) {
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
    } catch (error) {
      console.error('Failed to check coin eligibility:', error);
      throw new Error(`Eligibility check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a coin using server-side API validation
   * Final coin creation still requires wallet signature
   */
  async createCoin(
    name: string,
    symbol: string,
    uri: string,
    payoutRecipient: Address,
    metadataJson?: any
  ) {
    try {
      // Validate and prepare parameters using the API
      const createResponse = await fetcher('/api/zora/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          symbol,
          uri,
          payoutRecipient,
          metadataJson
        }),
      });

      if (!createResponse.success) {
        throw new Error(createResponse.error || 'Coin creation validation failed');
      }

      return createResponse.parameters;
    } catch (error) {
      console.error('Failed to prepare coin creation:', error);
      throw error;
    }
  }

  /**
   * Create a performance coin for eligible Reality Check results
   * Using the server-side API for validation
   *
   * @throws Error if performance is not eligible or coin creation fails
   */
  async createPerformanceCoin(
    performance: RealityCheckResult,
    walletClient: any
  ): Promise<{ address: Address; hash: string }> {
    try {
      const eligibility = await this.checkCoinEligibility(performance);
      if (!eligibility) {
        throw new Error('Performance not eligible for coin creation');
      }

      // Use the metadata service to create proper metadata
      const metadataUri = await this.createMetadata(performance);

      // Validate and prepare coin parameters
      const createParams = await this.createCoin(
        `${performance.challengeTitle} - Reality Check`,
        `RC${performance.eventId.slice(-4).toUpperCase()}`,
        metadataUri,
        performance.userAddress
      );

      // For actual creation, we would then use the SDK with the wallet
      // This part would remain client-side since it needs the wallet signature
      const coinResult = await createCoin(
        createParams,
        walletClient,
        this.publicClient
      );

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
      throw new Error(`Coin creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Trade performance coins using server-side API
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
      // Get trade parameters from the API
      const tradeResponse = await fetcher('/api/zora/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          coinAddress,
          userAddress,
          amountIn: amountIn.toString(), // Convert BigInt to string for JSON
          slippage,
        }),
      });

      if (!tradeResponse.success) {
        throw new Error(tradeResponse.error || 'Trade validation failed');
      }

      // For actual execution, we'd pass these parameters to the SDK
      // This could be done directly from a client component where the wallet is available
      // or we could add logic here to use the provided walletClient
      const tradeParameters = tradeResponse.parameters;
      
      // The actual trade execution would still need the wallet client
      // and could be implemented here by calling the SDK directly
      // But for now, we're keeping SDK usage on the server side only
      
      console.log('Trade parameters prepared:', tradeParameters);
      return tradeParameters;
    } catch (error) {
      console.error('Trade failed:', error);
      throw error;
    }
  }

  /**
   * Get coin information using server-side API
   */
  async getCoinInfo(coinAddress: Address) {
    try {
      return await fetcher(`/api/zora/info?address=${coinAddress}`);
    } catch (error) {
      console.error('Failed to get coin info:', error);
      throw error;
    }
  }

  /**
   * Get user balance for a coin using server-side API
   */
  async getUserBalance(userAddress: Address, coinAddress: Address) {
    try {
      return await fetcher(
        `/api/zora/balance?userAddress=${userAddress}&coinAddress=${coinAddress}`
      );
    } catch (error) {
      console.error('Failed to get user balance:', error);
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

  // Image generation and manipulation methods removed
  // Now handled by the metadata service API

  // Removed createRealMetadata method - now using createMetadata instead

  /**
   * Create metadata URI via API service
   * @throws Error if metadata service fails
   */
  private async createMetadata(performance: RealityCheckResult): Promise<string> {
    try {
      // Call the metadata service API
      const response = await fetch('/api/zora/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performance,
          description: this.generateCoinDescription(performance)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Metadata service failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!data.metadataUri) {
        throw new Error('No metadata URI returned from service');
      }
      
      return data.metadataUri;
    } catch (error) {
      console.error('Failed to create metadata:', error);
      throw new Error(`Metadata creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // generateMetadataHash method removed - now handled by metadata service

  /**
   * Check if performance is a leaderboard winner based on actual leaderboard data
   * @throws Error if leaderboard data cannot be retrieved
   */
  private async isLeaderboardWinner(performance: RealityCheckResult): Promise<boolean> {
    try {
      // Fetch leaderboard data from API
      const response = await fetch(`/api/leaderboard/category/${performance.category}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }
      
      const leaderboard = await response.json();
      
      // Check if this performance is in the top 3
      const topPerformances = leaderboard.performances || [];
      return topPerformances.some((p: any) => p.id === performance.id && p.rank <= 3);
    } catch (error) {
      console.error('Failed to check leaderboard status:', error);
      throw new Error(`Leaderboard check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

}