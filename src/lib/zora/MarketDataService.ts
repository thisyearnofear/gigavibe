'use client';

import { Address } from 'viem';
import { PerformanceCoin, MarketLeaderboards, TradingMetrics } from './types';
import { ZoraService } from './ZoraService';
import { ZoraAPIService } from './ZoraAPIService';

export class MarketDataService {
  private static instance: MarketDataService;
  private zoraService: ZoraService;
  private zoraAPIService: ZoraAPIService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 30000; // 30 seconds

  constructor() {
    this.zoraService = ZoraService.getInstance();
    this.zoraAPIService = ZoraAPIService.getInstance();
  }

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  /**
   * Get market-based leaderboards
   */
  async getMarketLeaderboards(): Promise<MarketLeaderboards> {
    const cacheKey = 'market-leaderboards';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // In production, fetch real market data from Zora API
      const performanceCoins = await this.fetchPerformanceCoins();
      
      const leaderboards: MarketLeaderboards = {
        byPrice: [...performanceCoins].sort((a, b) => b.marketData.price - a.marketData.price),
        byVolume: [...performanceCoins].sort((a, b) => b.marketData.volume24h - a.marketData.volume24h),
        byHolders: [...performanceCoins].sort((a, b) => b.marketData.holders - a.marketData.holders),
        byPriceChange: [...performanceCoins].sort((a, b) => b.marketData.priceChangePercent24h - a.marketData.priceChangePercent24h),
        byMarketCap: [...performanceCoins].sort((a, b) => b.marketData.marketCap - a.marketData.marketCap)
      };

      this.setCache(cacheKey, leaderboards);
      return leaderboards;
    } catch (error) {
      console.error('Failed to fetch market leaderboards:', error);
      // Return mock data for development
      return this.getMockLeaderboards();
    }
  }

  /**
   * Get trading metrics overview
   */
  async getTradingMetrics(): Promise<TradingMetrics> {
    const cacheKey = 'trading-metrics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      return await this.zoraAPIService.getTradingMetrics();
    } catch (error) {
      console.error('Failed to fetch trading metrics from API:', error);
      return this.getMockTradingMetrics();
    }
  }

  /**
   * Get user's coin portfolio
   */
  async getUserPortfolio(userAddress: Address): Promise<{
    coins: PerformanceCoin[];
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
  }> {
    try {
      // In production, fetch user's actual coin holdings
      const userCoins = await this.fetchUserCoins(userAddress);
      
      const totalValue = userCoins.reduce((sum, coin) => sum + coin.marketData.price, 0);
      const totalGainLoss = userCoins.reduce((sum, coin) => sum + coin.marketData.priceChange24h, 0);
      const totalGainLossPercent = totalGainLoss / (totalValue - totalGainLoss) * 100;

      return {
        coins: userCoins,
        totalValue,
        totalGainLoss,
        totalGainLossPercent
      };
    } catch (error) {
      console.error('Failed to fetch user portfolio:', error);
      return {
        coins: [],
        totalValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0
      };
    }
  }

  /**
   * Search for performance coins
   */
  async searchPerformanceCoins(query: string): Promise<PerformanceCoin[]> {
    try {
      return await this.zoraAPIService.searchCoins(query);
    } catch (error) {
      console.error('Failed to search performance coins from API:', error);
      // Fallback to local search
      const allCoins = await this.fetchPerformanceCoins();
      return allCoins.filter(coin => 
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.performance.challengeTitle.toLowerCase().includes(query.toLowerCase()) ||
        coin.performance.wittyCommentary.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  /**
   * Fetch all performance coins from real Zora API
   */
  private async fetchPerformanceCoins(): Promise<PerformanceCoin[]> {
    try {
      return await this.zoraAPIService.fetchPerformanceCoins();
    } catch (error) {
      console.error('Failed to fetch performance coins from API, using fallback:', error);
      return this.zoraService.getMockMarketData();
    }
  }

  /**
   * Fetch user's coins from real Zora API
   */
  private async fetchUserCoins(userAddress: Address): Promise<PerformanceCoin[]> {
    try {
      return await this.zoraAPIService.fetchUserCoins(userAddress);
    } catch (error) {
      console.error('Failed to fetch user coins from API:', error);
      return [];
    }
  }

  /**
   * Fetch recent trades from real Zora API
   */
  private async fetchRecentTrades() {
    try {
      const trades = await this.zoraAPIService.fetchRecentTrades(10);
      return trades;
    } catch (error) {
      console.error('Failed to fetch recent trades from API:', error);
      return [];
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Mock data for development
   */
  private getMockLeaderboards(): MarketLeaderboards {
    const mockCoins = this.generateMockCoins();
    
    return {
      byPrice: [...mockCoins].sort((a, b) => b.marketData.price - a.marketData.price),
      byVolume: [...mockCoins].sort((a, b) => b.marketData.volume24h - a.marketData.volume24h),
      byHolders: [...mockCoins].sort((a, b) => b.marketData.holders - a.marketData.holders),
      byPriceChange: [...mockCoins].sort((a, b) => b.marketData.priceChangePercent24h - a.marketData.priceChangePercent24h),
      byMarketCap: [...mockCoins].sort((a, b) => b.marketData.marketCap - a.marketData.marketCap)
    };
  }

  private getMockTradingMetrics(): TradingMetrics {
    const mockCoins = this.generateMockCoins();
    
    return {
      totalVolume: 15.7,
      totalCoins: mockCoins.length,
      topPerformer: mockCoins[0],
      trendingCoins: mockCoins.slice(0, 3),
      recentTrades: [
        {
          coinAddress: mockCoins[0].address,
          type: 'buy',
          amount: 0.01,
          price: 0.025,
          timestamp: new Date(),
          trader: '0x2222222222222222222222222222222222222222' as Address
        }
      ]
    };
  }

  private generateMockCoins(): PerformanceCoin[] {
    return [
      {
        address: '0x1111111111111111111111111111111111111111' as Address,
        name: 'Shower Singer Reality Check',
        symbol: 'RCSS01',
        creator: '0xaaaa' as Address,
        performance: {
          id: 'mock-1',
          eventId: 'truth-tuesday-001',
          challengeTitle: 'Pop Diva Challenge',
          challengeId: 'challenge-001',
          userAddress: '0xaaaa' as Address,
          selfRating: 5,
          communityRating: 2.1,
          gap: 2.9,
          wittyCommentary: "Someone's been practicing in the shower a bit too much",
          shareCount: 234,
          timestamp: new Date(),
          audioUrl: '/mock-audio.mp3',
          category: 'comedy'
        },
        marketData: {
          price: 0.045,
          volume24h: 3.2,
          marketCap: 18.7,
          holders: 67,
          priceChange24h: 0.012,
          priceChangePercent24h: 36.4
        },
        metadata: {
          description: 'Legendary reality check moment',
          image: 'https://api.dicebear.com/7.x/shapes/svg?seed=mock1',
          attributes: []
        }
      },
      {
        address: '0x2222222222222222222222222222222222222222' as Address,
        name: 'Perfect Pitch Legend',
        symbol: 'RCPP02',
        creator: '0xbbbb' as Address,
        performance: {
          id: 'mock-2',
          eventId: 'saturday-showdown-001',
          challengeTitle: 'Rock Anthem Challenge',
          challengeId: 'challenge-002',
          userAddress: '0xbbbb' as Address,
          selfRating: 4,
          communityRating: 4.9,
          gap: -0.9,
          wittyCommentary: "You're way too hard on yourself!",
          shareCount: 89,
          timestamp: new Date(),
          audioUrl: '/mock-audio-2.mp3',
          category: 'quality'
        },
        marketData: {
          price: 0.078,
          volume24h: 5.1,
          marketCap: 31.2,
          holders: 94,
          priceChange24h: 0.008,
          priceChangePercent24h: 11.4
        },
        metadata: {
          description: 'Underrated talent discovered',
          image: 'https://api.dicebear.com/7.x/shapes/svg?seed=mock2',
          attributes: []
        }
      }
    ];
  }
}