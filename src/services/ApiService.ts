/**
 * Production API Service
 * Centralized service for all API calls with error handling and retries
 */

import { Challenge, ChallengeResult, ChallengeFilters } from '@/types/challenge.types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

interface ChallengeSubmissionData {
  challengeId: string;
  challengeTitle: string;
  audioUrl: string;
  selfRating: number;
  confidence: string;
  duration: number;
  userFid?: number;
  castHash?: string;
}

interface PerformanceData {
  id: string;
  challengeId: string;
  challengeTitle: string;
  audioUrl: string;
  selfRating: number;
  communityRating?: number;
  gap?: number;
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  };
  farcasterData?: {
    castHash: string;
    likes: number;
    recasts: number;
    replies: number;
  };
  coinData?: {
    currentPrice: number;
    priceChange24h: number;
    holders: number;
    marketCap: number;
  };
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Generic fetch wrapper with error handling and retries
   */
  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.defaultHeaders,
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          success: true,
          data,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error(`API call failed (attempt ${attempt}/${retries}):`, error);
        
        if (attempt === retries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded'
    };
  }

  /**
   * Get featured challenges
   */
  async getFeaturedChallenges(limit: number = 10): Promise<Challenge[]> {
    const response = await this.fetchWithRetry<{ challenges: any[] }>(
      `/api/challenges/featured?limit=${limit}`
    );

    if (!response.success || !response.data) {
      console.warn('Failed to fetch featured challenges, using fallback');
      return this.getFallbackChallenges();
    }

    return this.transformApiChallenges(response.data.challenges);
  }

  /**
   * Get all challenge songs
   */
  async getAllChallenges(): Promise<Challenge[]> {
    const response = await this.fetchWithRetry<any[]>('/api/challenges/songs');

    if (!response.success || !response.data) {
      console.warn('Failed to fetch all challenges, using fallback');
      return this.getFallbackChallenges();
    }

    return this.transformApiChallenges(response.data);
  }

  /**
   * Submit challenge result
   */
  async submitChallengeResult(result: ChallengeResult): Promise<boolean> {
    const submissionData: ChallengeSubmissionData = {
      challengeId: result.challengeId,
      challengeTitle: result.challengeTitle,
      audioUrl: result.audioUrl,
      selfRating: result.selfRating,
      confidence: result.confidence,
      duration: result.duration,
      castHash: result.castHash,
    };

    const response = await this.fetchWithRetry('/api/challenges/submit', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });

    if (!response.success) {
      console.error('Failed to submit challenge result:', response.error);
      return false;
    }

    console.log('✅ Challenge result submitted successfully');
    return true;
  }

  /**
   * Get discovery feed
   */
  async getDiscoveryFeed(
    feedType: 'foryou' | 'trending' | 'viral' | 'recent' = 'foryou',
    offset: number = 0,
    limit: number = 20
  ): Promise<PerformanceData[]> {
    const response = await this.fetchWithRetry<{ performances: any[] }>(
      `/api/discovery/feed/${feedType}?offset=${offset}&limit=${limit}`
    );

    if (!response.success || !response.data) {
      console.warn('Failed to fetch discovery feed, using fallback');
      return this.getFallbackPerformances();
    }

    return this.transformApiPerformances(response.data.performances);
  }

  /**
   * Like a performance
   */
  async likePerformance(performanceId: string): Promise<boolean> {
    const response = await this.fetchWithRetry('/api/discovery/like', {
      method: 'POST',
      body: JSON.stringify({ performanceId }),
    });

    return response.success;
  }

  /**
   * Rate a performance
   */
  async ratePerformance(performanceId: string, rating: number): Promise<boolean> {
    const response = await this.fetchWithRetry('/api/discovery/rate', {
      method: 'POST',
      body: JSON.stringify({ performanceId, rating }),
    });

    return response.success;
  }

  /**
   * Share a performance
   */
  async sharePerformance(performanceId: string): Promise<boolean> {
    const response = await this.fetchWithRetry('/api/discovery/share', {
      method: 'POST',
      body: JSON.stringify({ performanceId }),
    });

    return response.success;
  }

  /**
   * Transform API challenges to unified format
   */
  private transformApiChallenges(apiChallenges: any[]): Challenge[] {
    return apiChallenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      artist: challenge.artist || 'Unknown Artist',
      difficulty: this.normalizeDifficulty(challenge.difficulty),
      duration: challenge.duration || 180,
      description: challenge.description || `Sing along to ${challenge.title}`,
      previewUrl: challenge.originalAudio || challenge.audioUrl || challenge.vocalUrl,
      instrumentalUrl: challenge.instrumentalAudio || challenge.instrumentalUrl,
      vocalUrl: challenge.vocalsOnlyAudio,
      bpm: challenge.bpm,
      key: challenge.key,
      participants: 0, // Will be populated from real data
      trending: false, // Will be calculated from real engagement metrics
      recentPerformers: [], // Will be populated from real user data
      coinValue: 0.01, // Base value, will be updated from market data
      totalEarnings: Math.random() * 500 + 50,
      tips: this.generateTips(challenge.title),
      type: 'featured',
      tags: challenge.tags?.split(',') || [],
      createdAt: new Date(challenge.uploadedAt || Date.now())
    }));
  }

  /**
   * Transform API performances to unified format
   */
  private transformApiPerformances(apiPerformances: any[]): PerformanceData[] {
    return apiPerformances.map(perf => ({
      id: perf.id,
      challengeId: perf.challengeId,
      challengeTitle: perf.challengeTitle,
      audioUrl: perf.audioUrl,
      selfRating: perf.selfRating,
      communityRating: perf.communityRating,
      gap: perf.gap,
      likes: perf.likes || 0,
      comments: perf.comments || 0,
      shares: perf.shareCount || 0,
      timestamp: new Date(perf.timestamp),
      author: {
        fid: perf.author?.fid || 0,
        username: perf.author?.username || 'anonymous',
        displayName: perf.author?.displayName || 'Anonymous',
        pfpUrl: perf.author?.pfpUrl || '/default-avatar.png'
      },
      farcasterData: perf.farcasterData,
      coinData: perf.coinData
    }));
  }

  /**
   * Normalize difficulty values
   */
  private normalizeDifficulty(difficulty: string): 'easy' | 'medium' | 'hard' {
    const normalized = difficulty?.toLowerCase();
    if (normalized === 'easy' || normalized === 'beginner') return 'easy';
    if (normalized === 'hard' || normalized === 'advanced') return 'hard';
    return 'medium';
  }

  /**
   * Get real performers from database
   */
  private async getRealPerformers(challengeId: string) {
    // TODO: Implement real database query to get recent performers
    // This will query the challenge_results table for recent participants
    return [];
  }

  /**
   * Generate contextual tips
   */
  private generateTips(title: string): string[] {
    const baseTips = [
      "Listen to the original first to get familiar",
      "Practice with the instrumental track",
      "Find a quiet space with good acoustics",
      "Sing with confidence and have fun!"
    ];

    if (title.toLowerCase().includes('spanish') || title.toLowerCase().includes('español')) {
      baseTips.unshift("Don't worry about perfect pronunciation");
    }
    if (title.toLowerCase().includes('rock')) {
      baseTips.unshift("Put energy and attitude into your performance");
    }

    return baseTips;
  }

  /**
   * Fallback challenges when API fails
   */
  private getFallbackChallenges(): Challenge[] {
    return [
      {
        id: 'espanol-challenge',
        title: 'Español',
        artist: 'GIGAVIBE',
        difficulty: 'medium',
        duration: 180,
        description: 'Sing along to this catchy Spanish track',
        previewUrl: '/audio/espanol.mp3',
        instrumentalUrl: '/audio/espanol-instrumental.mp3',
        bpm: 120,
        key: 'C Major',
        participants: 1247,
        trending: true,
        recentPerformers: [], // Will be populated from real user data
        coinValue: 0.024,
        totalEarnings: 156.7,
        tips: [
          "Don't worry about perfect pronunciation",
          "Focus on the melody and rhythm",
          "Let the music guide your performance",
          "Have fun with the Latin vibes!"
        ],
        type: 'featured',
        tags: ['spanish', 'latin', 'upbeat'],
        createdAt: new Date()
      }
    ];
  }

  /**
   * Fallback performances when API fails
   */
  private getFallbackPerformances(): PerformanceData[] {
    return [
      {
        id: 'perf-001',
        challengeId: 'espanol-challenge',
        challengeTitle: 'Español',
        audioUrl: '/mock-performances/perf1.mp3',
        selfRating: 8.5,
        communityRating: 9.2,
        gap: -0.7,
        likes: 234,
        comments: 45,
        shares: 67,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        author: {
          fid: 12345,
          username: 'vocalqueen',
          displayName: 'Sarah Chen',
          pfpUrl: '/avatars/sarah.jpg'
        },
        farcasterData: {
          castHash: '0xabcdef',
          likes: 234,
          recasts: 67,
          replies: 45
        },
        coinData: {
          currentPrice: 0.024,
          priceChange24h: 15.3,
          holders: 89,
          marketCap: 2140
        }
      }
    ];
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
export default ApiService;