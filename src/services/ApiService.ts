/**
 * Production API Service
 * Centralized service for all API calls with error handling and retries
 * NO MOCK DATA - All responses come from real database
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
   * Get featured challenges from database
   */
  async getFeaturedChallenges(limit: number = 10): Promise<Challenge[]> {
    const response = await this.fetchWithRetry<{ challenges: any[] }>(
      `/api/challenges/featured?limit=${limit}`
    );

    if (!response.success || !response.data) {
      console.warn('Failed to fetch featured challenges - database may be empty');
      return [];
    }

    return this.transformApiChallenges(response.data.challenges);
  }

  /**
   * Get all challenge songs from database
   */
  async getAllChallenges(): Promise<Challenge[]> {
    const response = await this.fetchWithRetry<{ challenges: any[] }>('/api/challenges/songs');

    if (!response.success || !response.data) {
      console.warn('Failed to fetch all challenges - database may be empty');
      return [];
    }

    // Handle both direct array and wrapped response formats
    const challengesData = response.data.challenges || response.data;
    
    // Ensure we have an array to transform
    if (Array.isArray(challengesData)) {
      return this.transformApiChallenges(challengesData);
    } else if (challengesData && Array.isArray(challengesData.challenges)) {
      return this.transformApiChallenges(challengesData.challenges);
    } else {
      console.warn('No valid challenges array found in response');
      return [];
    }
  }

  /**
   * Submit challenge result to database
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
   * Get discovery feed from database
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
      console.warn('Failed to fetch discovery feed - database may be empty');
      return [];
    }

    return this.transformApiPerformances(response.data.performances);
  }

  /**
   * Like a performance (updates database)
   */
  async likePerformance(performanceId: string): Promise<boolean> {
    const response = await this.fetchWithRetry('/api/discovery/like', {
      method: 'POST',
      body: JSON.stringify({ performanceId }),
    });

    return response.success;
  }

  /**
   * Rate a performance (updates database)
   */
  async ratePerformance(performanceId: string, rating: number): Promise<boolean> {
    const response = await this.fetchWithRetry('/api/discovery/rate', {
      method: 'POST',
      body: JSON.stringify({ performanceId, rating }),
    });

    return response.success;
  }

  /**
   * Share a performance (updates database)
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
    // Ensure we have an array to work with
    if (!Array.isArray(apiChallenges)) {
      console.warn('transformApiChallenges received non-array input:', apiChallenges);
      return [];
    }

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
      participants: challenge.participants || 0,
      trending: challenge.trending || false,
      recentPerformers: challenge.recentPerformers || [],
      coinValue: challenge.coinValue || 0.01,
      totalEarnings: challenge.totalEarnings || 0,
      tips: this.generateTips(challenge.title),
      type: challenge.type || 'featured',
      tags: challenge.tags?.split(',') || [],
      createdAt: new Date(challenge.uploadedAt || challenge.createdAt || Date.now())
    }));
  }

  /**
   * Transform API performances to unified format
   */
  private transformApiPerformances(apiPerformances: any[]): PerformanceData[] {
    if (!Array.isArray(apiPerformances)) {
      console.warn('transformApiPerformances received non-array input:', apiPerformances);
      return [];
    }

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
}

// Export singleton instance
export const apiService = ApiService.getInstance();
export default ApiService;