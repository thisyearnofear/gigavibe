'use client';

import { RealityCheckResult } from '@/lib/zora/types';
import { Address } from 'viem';

/**
 * Discovery Service for algorithmic content curation
 * Implements TikTok-style feed algorithms for performance discovery
 */
export class DiscoveryService {
  private static instance: DiscoveryService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 60000; // 1 minute for fresh content

  constructor() {}

  static getInstance(): DiscoveryService {
    if (!DiscoveryService.instance) {
      DiscoveryService.instance = new DiscoveryService();
    }
    return DiscoveryService.instance;
  }

  /**
   * Get algorithmic feed based on type
   */
  /**
   * Get algorithmic feed based on type
   * @throws Error if feed data cannot be retrieved
   */
  async getFeed(
    feedType: 'trending' | 'foryou' | 'recent' | 'viral',
    offset: number = 0,
    limit: number = 20
  ): Promise<RealityCheckResult[]> {
    const cacheKey = `feed-${feedType}-${offset}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let performances: RealityCheckResult[];

      switch (feedType) {
        case 'trending':
          performances = await this.getTrendingFeed(offset, limit);
          break;
        case 'viral':
          performances = await this.getViralFeed(offset, limit);
          break;
        case 'recent':
          performances = await this.getRecentFeed(offset, limit);
          break;
        case 'foryou':
        default:
          performances = await this.getPersonalizedFeed(offset, limit);
          break;
      }

      this.setCache(cacheKey, performances);
      return performances;
    } catch (error) {
      console.error('Failed to get feed:', error);
      throw new Error(`Failed to retrieve ${feedType} feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trending performances (high engagement in last 24h)
   */
  /**
   * Get trending performances (high engagement in last 24h)
   * @throws Error if API request fails
   */
  private async getTrendingFeed(offset: number, limit: number): Promise<RealityCheckResult[]> {
    try {
      const response = await fetch(`/api/discovery/feed/trending?offset=${offset}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.performances;
    } catch (error) {
      console.error('Failed to fetch trending feed:', error);
      throw new Error(`Trending feed request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get viral performances (high share count)
   */
  /**
   * Get viral performances (high share count)
   * @throws Error if API request fails
   */
  private async getViralFeed(offset: number, limit: number): Promise<RealityCheckResult[]> {
    try {
      const response = await fetch(`/api/discovery/feed/viral?offset=${offset}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.performances;
    } catch (error) {
      console.error('Failed to fetch viral feed:', error);
      throw new Error(`Viral feed request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recent performances (chronological)
   * @throws Error if API request fails
   */
  private async getRecentFeed(offset: number, limit: number): Promise<RealityCheckResult[]> {
    try {
      const response = await fetch(`/api/discovery/feed/recent?offset=${offset}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.performances;
    } catch (error) {
      console.error('Failed to fetch recent feed:', error);
      throw new Error(`Recent feed request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get personalized "For You" feed
   * @throws Error if API request fails
   */
  private async getPersonalizedFeed(offset: number, limit: number): Promise<RealityCheckResult[]> {
    try {
      // Get user id for personalization (if available)
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      const response = await fetch(`/api/discovery/feed/foryou?userId=${userId}&offset=${offset}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.performances;
    } catch (error) {
      console.error('Failed to fetch personalized feed:', error);
      throw new Error(`Personalized feed request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rate a performance
   */
  /**
   * Rate a performance
   * @throws Error if rating submission fails
   */
  async ratePerformance(performanceId: string, rating: number): Promise<void> {
    try {
      const response = await fetch('/api/discovery/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId,
          rating
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Update local cache
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to rate performance:', error);
      throw new Error(`Rating submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Share a performance
   * @throws Error if share operation fails
   */
  async sharePerformance(performanceId: string): Promise<void> {
    try {
      const response = await fetch('/api/discovery/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Update local cache
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to share performance:', error);
      throw new Error(`Share operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Like a performance
   * @throws Error if like operation fails
   */
  async likePerformance(performanceId: string): Promise<void> {
    try {
      const response = await fetch('/api/discovery/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Update local cache
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to like performance:', error);
      throw new Error(`Like operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  private invalidateCache(): void {
    this.cache.clear();
  }

}