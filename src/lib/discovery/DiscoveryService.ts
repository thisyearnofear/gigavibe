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
      return this.getMockFeed(feedType, offset, limit);
    }
  }

  /**
   * Get trending performances (high engagement in last 24h)
   */
  private async getTrendingFeed(offset: number, limit: number): Promise<RealityCheckResult[]> {
    // In production, this would query for performances with high recent engagement
    const mockData = this.getMockFeed('trending', offset, limit);
    
    // Sort by trending score (combination of recent shares, ratings, and time)
    return mockData.sort((a, b) => {
      const scoreA = this.calculateTrendingScore(a);
      const scoreB = this.calculateTrendingScore(b);
      return scoreB - scoreA;
    });
  }

  /**
   * Get viral performances (high share count)
   */
  private async getViralFeed(offset: number, limit: number): Promise<RealityCheckResult[]> {
    const mockData = this.getMockFeed('viral', offset, limit);
    
    // Sort by viral metrics (shares, extreme gaps, perfect scores)
    return mockData
      .filter(p => p.shareCount >= 50 || p.gap >= 2.5 || p.communityRating >= 4.5)
      .sort((a, b) => b.shareCount - a.shareCount);
  }

  /**
   * Get recent performances (chronological)
   */
  private async getRecentFeed(offset: number, limit: number): Promise<RealityCheckResult[]> {
    const mockData = this.getMockFeed('recent', offset, limit);
    
    // Sort by timestamp (newest first)
    return mockData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get personalized "For You" feed
   */
  private async getPersonalizedFeed(offset: number, limit: number): Promise<RealityCheckResult[]> {
    // In production, this would use ML algorithms based on user behavior
    const mockData = this.getMockFeed('foryou', offset, limit);
    
    // Mix of trending, viral, and diverse content
    const trending = await this.getTrendingFeed(0, 5);
    const viral = await this.getViralFeed(0, 3);
    const recent = await this.getRecentFeed(0, 12);
    
    // Interleave different types for variety
    const mixed = this.interleaveArrays([trending, viral, recent]);
    return mixed.slice(offset, offset + limit);
  }

  /**
   * Rate a performance
   */
  async ratePerformance(performanceId: string, rating: number): Promise<void> {
    try {
      // In production, this would submit rating to backend
      console.log(`Rating performance ${performanceId}: ${rating} stars`);
      
      // Update local cache if needed
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to rate performance:', error);
      throw error;
    }
  }

  /**
   * Share a performance
   */
  async sharePerformance(performanceId: string): Promise<void> {
    try {
      // In production, this would increment share count and trigger viral detection
      console.log(`Sharing performance ${performanceId}`);
      
      // Check if this share pushes the performance over viral threshold
      await this.checkViralThreshold(performanceId);
      
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to share performance:', error);
      throw error;
    }
  }

  /**
   * Like a performance
   */
  async likePerformance(performanceId: string): Promise<void> {
    try {
      // In production, this would update like count
      console.log(`Liking performance ${performanceId}`);
    } catch (error) {
      console.error('Failed to like performance:', error);
      throw error;
    }
  }

  /**
   * Check if performance hits viral threshold for coin creation
   */
  private async checkViralThreshold(performanceId: string): Promise<void> {
    // In production, this would check against viral thresholds and trigger coin creation
    console.log(`Checking viral threshold for performance ${performanceId}`);
    
    // Mock viral threshold logic
    // If shares > 100 OR perfect score OR reality gap > 3, create coin
  }

  /**
   * Calculate trending score for algorithmic ranking
   */
  private calculateTrendingScore(performance: RealityCheckResult): number {
    const hoursSinceCreated = (Date.now() - performance.timestamp.getTime()) / (1000 * 60 * 60);
    const recencyBoost = Math.max(0, 24 - hoursSinceCreated) / 24; // Boost recent content
    
    const engagementScore = performance.shareCount * 2 + performance.communityRating * 10;
    const viralityBonus = performance.gap >= 2 ? 50 : 0; // Bonus for reality gaps
    
    return engagementScore * (1 + recencyBoost) + viralityBonus;
  }

  /**
   * Interleave multiple arrays for content variety
   */
  private interleaveArrays<T>(arrays: T[][]): T[] {
    const result: T[] = [];
    const maxLength = Math.max(...arrays.map(arr => arr.length));
    
    for (let i = 0; i < maxLength; i++) {
      for (const array of arrays) {
        if (i < array.length) {
          result.push(array[i]);
        }
      }
    }
    
    return result;
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

  /**
   * Generate mock feed data for development
   */
  private getMockFeed(feedType: string, offset: number, limit: number): RealityCheckResult[] {
    const mockPerformances: RealityCheckResult[] = [
      {
        id: `mock-${feedType}-${offset}-1`,
        eventId: 'continuous-flow-001',
        challengeTitle: 'Pop Diva Challenge',
        challengeId: 'challenge-001',
        userAddress: '0x1111111111111111111111111111111111111111' as Address,
        selfRating: 5,
        communityRating: 2.1,
        gap: 2.9,
        wittyCommentary: "Someone's been practicing in the shower a bit too much",
        shareCount: 234,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        audioUrl: '/mock-audio.mp3',
        category: 'comedy'
      },
      {
        id: `mock-${feedType}-${offset}-2`,
        eventId: 'continuous-flow-002',
        challengeTitle: 'Rock Anthem Challenge',
        challengeId: 'challenge-002',
        userAddress: '0x2222222222222222222222222222222222222222' as Address,
        selfRating: 3,
        communityRating: 4.8,
        gap: -1.8,
        wittyCommentary: "You're way too hard on yourself!",
        shareCount: 89,
        timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
        audioUrl: '/mock-audio-2.mp3',
        category: 'quality'
      },
      {
        id: `mock-${feedType}-${offset}-3`,
        eventId: 'continuous-flow-003',
        challengeTitle: 'Ballad Masterpiece',
        challengeId: 'challenge-003',
        userAddress: '0x3333333333333333333333333333333333333333' as Address,
        selfRating: 4,
        communityRating: 5.0,
        gap: -1.0,
        wittyCommentary: "Absolutely legendary performance!",
        shareCount: 567,
        timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000),
        audioUrl: '/mock-audio-3.mp3',
        category: 'legendary'
      },
      {
        id: `mock-${feedType}-${offset}-4`,
        eventId: 'continuous-flow-004',
        challengeTitle: 'Comedy Gold Attempt',
        challengeId: 'challenge-004',
        userAddress: '0x4444444444444444444444444444444444444444' as Address,
        selfRating: 4.5,
        communityRating: 1.2,
        gap: 3.3,
        wittyCommentary: "This is why we can't have nice things",
        shareCount: 1205,
        timestamp: new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000),
        audioUrl: '/mock-audio-4.mp3',
        category: 'comedy'
      }
    ];

    // Generate more mock data based on offset and limit
    const extendedMock = [];
    for (let i = 0; i < limit; i++) {
      const baseIndex = i % mockPerformances.length;
      const performance = { ...mockPerformances[baseIndex] };
      performance.id = `mock-${feedType}-${offset + i}`;
      performance.shareCount = Math.floor(Math.random() * 1000) + 10;
      performance.communityRating = Math.random() * 5;
      performance.selfRating = Math.random() * 5;
      performance.gap = performance.selfRating - performance.communityRating;
      performance.timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      extendedMock.push(performance);
    }

    return extendedMock;
  }
}