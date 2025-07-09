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
      // Fetch real market data from Zora API
      const performanceCoins = await this.fetchPerformanceCoins();
      
      if (performanceCoins.length === 0) {
        throw new Error('No performance coins available');
      }
      
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
      console.error('[MarketDataService] Failed to fetch market leaderboards:', error);
      throw new Error(`Unable to load market leaderboards: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.error('[MarketDataService] Failed to fetch trading metrics:', error);
      throw new Error(`Unable to load trading metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
   * Fetch all performance coins from Zora API
   */
  private async fetchPerformanceCoins(): Promise<PerformanceCoin[]> {
    try {
      return await this.zoraAPIService.fetchPerformanceCoins();
    } catch (error) {
      console.error('[MarketDataService] Failed to fetch performance coins:', error);
      throw error; // Propagate error upward
    }
  }

  /**
   * Fetch user's coins from Zora API
   */
  private async fetchUserCoins(userAddress: Address): Promise<PerformanceCoin[]> {
    try {
      return await this.zoraAPIService.fetchUserCoins(userAddress);
    } catch (error) {
      console.error('[MarketDataService] Failed to fetch user coins:', error);
      throw new Error(`Unable to load user's coin portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch recent trades from Zora API
   */
  private async fetchRecentTrades() {
    try {
      return await this.zoraAPIService.fetchRecentTrades(10);
    } catch (error) {
      console.error('[MarketDataService] Failed to fetch recent trades:', error);
      throw new Error(`Unable to load recent trading activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

}