/**
 * Zora Coins Integration Service
 * Production-ready service for creating and trading performance coins
 */

import {
  createCoin,
  setApiKey,
  DeployCurrency,
  ValidMetadataURI
} from '@zoralabs/coins-sdk';
import { Address, createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';
import { ChallengeResult } from '@/types/challenge.types';

interface PerformanceCoinData {
  coinAddress?: Address;
  creatorAddress: Address;
  challengeId: string;
  challengeTitle: string;
  performanceId: string;
  selfRating: number;
  communityRating?: number;
  viralScore?: number;
  metadataUri?: ValidMetadataURI;
  currentPrice?: number;
  marketCap?: number;
  holders?: number;
  priceChange24h?: number;
}

class ZoraCoinsService {
  private static instance: ZoraCoinsService;
  private publicClient: any;
  private isInitialized = false;

  static getInstance(): ZoraCoinsService {
    if (!ZoraCoinsService.instance) {
      ZoraCoinsService.instance = new ZoraCoinsService();
    }
    return ZoraCoinsService.instance;
  }

  /**
   * Initialize the service with API key and clients
   */
  async initialize(apiKey: string) {
    try {
      // Set Zora API key
      setApiKey(apiKey);

      // Initialize public client for Base
      this.publicClient = createPublicClient({
        chain: base,
        transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
      });

      this.isInitialized = true;
      console.log('✅ Zora Coins Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Zora Coins Service:', error);
      throw error;
    }
  }

  /**
   * Check if a performance qualifies for coin creation
   */
  shouldCreateCoin(result: ChallengeResult, communityRating?: number, viralScore?: number): boolean {
    // Criteria for coin creation:
    // 1. Community rating >= 8.5 OR
    // 2. Viral score >= 80 OR  
    // 3. Self-rating accuracy (gap < 1.0) AND rating >= 7.5
    
    if (communityRating && communityRating >= 8.5) return true;
    if (viralScore && viralScore >= 80) return true;
    
    if (communityRating && result.selfRating) {
      const gap = Math.abs(result.selfRating - communityRating);
      if (gap < 1.0 && communityRating >= 7.5) return true;
    }

    return false;
  }

  /**
   * Create metadata for performance coin using existing IPFS service
   */
  async createPerformanceMetadata(
    result: ChallengeResult,
    creatorAddress: Address,
    communityRating?: number,
    viralScore?: number
  ): Promise<{ metadataUri: ValidMetadataURI; coinSymbol: string }> {
    try {
      // Import existing IPFS service
      const { IPFSService } = await import('@/lib/storage/IPFSService');
      
      // Generate coin symbol from challenge title
      const coinSymbol = this.generateCoinSymbol(result.challengeTitle);
      
      // Generate coin image
      const coinImage = await this.generateCoinImage(result);
      const imageFilename = `coin-${result.challengeId}-${Date.now()}.png`;
      
      // Upload image to IPFS
      const imageHash = await IPFSService.uploadAudio(coinImage, imageFilename);
      const imageUrl = IPFSService.getAudioUrl(imageHash);
      
      // Create metadata object
      const metadata = {
        name: `${result.challengeTitle} Performance`,
        symbol: coinSymbol,
        description:
          `Performance coin for "${result.challengeTitle}" challenge. ` +
          `Self-rated: ${result.selfRating}/10` +
          (communityRating ? `, Community: ${communityRating}/10` : '') +
          (viralScore ? `, Viral Score: ${viralScore}%` : '') +
          `. Confidence: ${result.confidence}.`,
        image: imageUrl,
        attributes: [
          { trait_type: "Challenge", value: result.challengeTitle },
          { trait_type: "Self Rating", value: result.selfRating },
          { trait_type: "Confidence", value: result.confidence },
          ...(communityRating ? [{ trait_type: "Community Rating", value: communityRating }] : []),
          ...(viralScore ? [{ trait_type: "Viral Score", value: viralScore }] : [])
        ]
      };

      // Upload metadata to IPFS
      const metadataFilename = `metadata-${result.challengeId}-${Date.now()}.json`;
      const metadataHash = await IPFSService.uploadJSON(metadata, metadataFilename);
      const metadataUri = `ipfs://${metadataHash}` as ValidMetadataURI;

      return {
        metadataUri,
        coinSymbol
      };
    } catch (error) {
      console.error('Failed to create performance metadata:', error);
      throw error;
    }
  }

  /**
   * Create a performance coin
   */
  async createPerformanceCoin(
    result: ChallengeResult,
    creatorAddress: Address,
    walletClient: any,
    communityRating?: number,
    viralScore?: number
  ): Promise<PerformanceCoinData> {
    if (!this.isInitialized) {
      throw new Error('ZoraCoinsService not initialized');
    }

    try {
      // Create metadata
      const { metadataUri, coinSymbol } = await this.createPerformanceMetadata(
        result, 
        creatorAddress, 
        communityRating, 
        viralScore
      );

      // Determine initial purchase amount based on performance quality
      const initialPurchaseAmount = this.calculateInitialPurchase(result.selfRating, communityRating, viralScore);

      // Create coin parameters
      const coinParams = {
        name: `${result.challengeTitle} Performance`,
        symbol: coinSymbol,
        uri: metadataUri,
        payoutRecipient: creatorAddress,
        chainId: base.id,
        currency: DeployCurrency.ZORA,
        initialPurchase: initialPurchaseAmount > 0 ? {
          currency: 'ETH' as const,
          amount: parseEther(initialPurchaseAmount.toString()),
        } : undefined,
      };

      // Create the coin
      const coinResult = await createCoin(coinParams, walletClient, this.publicClient, {
        gasMultiplier: 120, // Add 20% gas buffer
      });

      console.log('🪙 Performance coin created:', coinResult.address);

      return {
        coinAddress: coinResult.address,
        creatorAddress,
        challengeId: result.challengeId,
        challengeTitle: result.challengeTitle,
        performanceId: result.submissionId || `perf-${Date.now()}`,
        selfRating: result.selfRating,
        communityRating,
        viralScore,
        metadataUri,
        currentPrice: 0.001, // Starting price
        marketCap: initialPurchaseAmount * 1000, // Estimate
        holders: 1,
        priceChange24h: 0
      };
    } catch (error) {
      console.error('Failed to create performance coin:', error);
      throw error;
    }
  }

  /**
   * Trade performance coins using existing Zora API service
   */
  async tradePerformanceCoin(
    coinAddress: Address,
    tradeType: 'buy' | 'sell',
    amountIn: bigint,
    userAddress: Address,
    walletClient: any,
    slippage: number = 0.05
  ): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('ZoraCoinsService not initialized');
    }

    try {
      // Use existing ZoraService for trading
      const { ZoraService } = await import('@/lib/zora/ZoraService');
      const zoraService = ZoraService.getInstance();
      
      const result = await zoraService.tradePerformanceCoin(
        coinAddress,
        tradeType,
        amountIn,
        userAddress,
        walletClient,
        slippage
      );

      console.log(`🔄 ${tradeType} trade completed`);
      return result;
    } catch (error) {
      console.error(`Failed to ${tradeType} performance coin:`, error);
      throw error;
    }
  }

  /**
   * Get coin price and market data using existing Zora API service
   */
  async getCoinMarketData(coinAddress: Address): Promise<Partial<PerformanceCoinData>> {
    try {
      // Use existing Zora API service for real market data
      const { ZoraAPIService } = await import('@/lib/zora/ZoraAPIService');
      const zoraAPI = ZoraAPIService.getInstance();
      
      // Fetch real market data from Zora
      const coins = await zoraAPI.fetchPerformanceCoins();
      const coin = coins.find(c => c.address.toLowerCase() === coinAddress.toLowerCase());
      
      if (coin) {
        return {
          currentPrice: coin.marketData.price,
          marketCap: coin.marketData.marketCap,
          holders: coin.marketData.holders,
          priceChange24h: coin.marketData.priceChangePercent24h,
        };
      }
      
      // If coin not found in performance coins, return empty data
      return {};
    } catch (error) {
      console.error('Failed to get coin market data:', error);
      return {};
    }
  }

  /**
   * Generate coin symbol from challenge title
   */
  private generateCoinSymbol(challengeTitle: string): string {
    // Create a symbol from the challenge title (max 6 chars)
    const cleaned = challengeTitle
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 6);
    
    return cleaned || 'PERF';
  }

  /**
   * Calculate initial purchase amount based on performance quality
   */
  private calculateInitialPurchase(
    selfRating: number, 
    communityRating?: number, 
    viralScore?: number
  ): number {
    let baseAmount = 0.001; // 0.001 ETH base

    // Boost based on community rating
    if (communityRating) {
      if (communityRating >= 9) baseAmount *= 3;
      else if (communityRating >= 8) baseAmount *= 2;
      else if (communityRating >= 7) baseAmount *= 1.5;
    }

    // Boost based on viral score
    if (viralScore) {
      if (viralScore >= 90) baseAmount *= 2;
      else if (viralScore >= 80) baseAmount *= 1.5;
    }

    return Math.min(baseAmount, 0.01); // Cap at 0.01 ETH
  }

  /**
   * Generate a simple coin image (placeholder)
   */
  private async generateCoinImage(result: ChallengeResult): Promise<Blob> {
    // In production, this could generate a waveform visualization or use AI
    // For now, create a simple colored circle
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 200, 200);

    // Circle with gradient based on rating
    const gradient = ctx.createRadialGradient(100, 100, 0, 100, 100, 80);
    const hue = (result.selfRating / 10) * 120; // Green for high ratings
    gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
    gradient.addColorStop(1, `hsl(${hue}, 70%, 30%)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(100, 100, 80, 0, 2 * Math.PI);
    ctx.fill();

    // Add rating text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(result.selfRating.toFixed(1), 100, 110);

    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob!), 'image/png');
    });
  }
}

// Export singleton instance
export const zoraCoinsService = ZoraCoinsService.getInstance();
export default ZoraCoinsService;