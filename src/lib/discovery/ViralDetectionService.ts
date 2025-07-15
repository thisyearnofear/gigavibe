'use client';

import { RealityCheckResult, CoinEligibility } from '@/lib/zora/types';
import { ZoraService } from '@/lib/zora/ZoraService';

/**
 * Viral Detection Service for automatic coin creation
 * Monitors performance metrics and triggers coin minting when viral thresholds are hit
 */
export class ViralDetectionService {
  private static instance: ViralDetectionService;
  private zoraService: ZoraService;
  private monitoringInterval: NodeJS.Timeout | null = null;

  // Viral thresholds for automatic coin creation (challenge-specific)
  private readonly VIRAL_THRESHOLDS = {
    SHARE_COUNT: 100,        // 100+ shares = viral moment
    PERFECT_SCORE: 4.8,      // 4.8+ rating = perfect performance
    REALITY_GAP: 2.5,        // 2.5+ gap = comedy gold
    ENGAGEMENT_RATE: 0.3,    // 30% engagement rate
    VELOCITY: 50,            // 50 shares in 1 hour = trending
    
    // Challenge-specific viral thresholds
    VIRAL_CHALLENGE: 75,     // Fun mode - lower threshold for accessibility
    STRUCTURED_CHALLENGE: 150, // Training mode - higher threshold for quality
    ADVANCED_CHALLENGE: 200,   // Show off mode - highest threshold for excellence
  };

  constructor() {
    this.zoraService = ZoraService.getInstance();
  }

  static getInstance(): ViralDetectionService {
    if (!ViralDetectionService.instance) {
      ViralDetectionService.instance = new ViralDetectionService();
    }
    return ViralDetectionService.instance;
  }

  /**
   * Start monitoring performances for viral thresholds
   */
  startMonitoring(): void {
    if (this.monitoringInterval) return;

    console.log('🔥 Starting viral detection monitoring...');
    
    // Check every 5 minutes for viral performances
    this.monitoringInterval = setInterval(() => {
      this.checkAllPerformances();
    }, 5 * 60 * 1000);

    // Initial check
    this.checkAllPerformances();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ Stopped viral detection monitoring');
    }
  }

  /**
   * Check a specific performance for viral eligibility
   * @throws Error if eligibility check fails
   */
  async checkPerformanceEligibility(performance: RealityCheckResult): Promise<CoinEligibility | null> {
    try {
      // Check if already has a coin
      if (await this.hasExistingCoin(performance.id)) {
        return null;
      }

      // Viral moment (high shares)
      if (performance.shareCount >= this.VIRAL_THRESHOLDS.SHARE_COUNT) {
        return {
          type: 'viral_moment',
          performance,
          reason: `🔥 VIRAL: ${performance.shareCount} shares!`,
          autoMint: true
        };
      }

      // Perfect score
      if (performance.communityRating >= this.VIRAL_THRESHOLDS.PERFECT_SCORE) {
        return {
          type: 'perfect_score',
          performance,
          reason: `⭐ PERFECT: ${performance.communityRating}/5 rating!`,
          autoMint: true
        };
      }

      // Reality gap (comedy gold)
      if (performance.gap >= this.VIRAL_THRESHOLDS.REALITY_GAP) {
        return {
          type: 'reality_gap',
          performance,
          reason: `😅 REALITY GAP: ${performance.gap.toFixed(1)} star difference!`,
          autoMint: true
        };
      }

      // Trending velocity (rapid shares)
      const velocity = await this.calculateShareVelocity(performance);
      if (velocity >= this.VIRAL_THRESHOLDS.VELOCITY) {
        return {
          type: 'viral_moment',
          performance,
          reason: `🚀 TRENDING: ${velocity} shares/hour!`,
          autoMint: true
        };
      }

      // Community nomination (high engagement rate)
      const engagementRate = await this.calculateEngagementRate(performance);
      if (engagementRate >= this.VIRAL_THRESHOLDS.ENGAGEMENT_RATE) {
        return {
          type: 'community_nominated',
          performance,
          reason: `👥 COMMUNITY FAVORITE: ${(engagementRate * 100).toFixed(1)}% engagement!`,
          autoMint: true
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking performance eligibility:', error);
      throw new Error(`Eligibility check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process viral performance and create coin
   */
  /**
   * Process viral performance and create coin
   * @throws Error if coin creation fails
   */
  async processViralPerformance(eligibility: CoinEligibility, walletClient?: any): Promise<boolean> {
    try {
      console.log(`🎯 Processing viral performance: ${eligibility.reason}`);

      if (!eligibility.autoMint) {
        console.log('⏸️ Auto-mint disabled for this performance');
        return false;
      }

      // Create performance coin
      const result = await this.zoraService.createPerformanceCoin(
        eligibility.performance,
        walletClient
      );

      console.log(`✅ Coin created for viral performance: ${result.address}`);
      
      // Notify about coin creation
      await this.notifyViralCoinCreation(eligibility, result.address);
      
      // Track viral event
      await this.trackViralEvent(eligibility);
      
      return true;
    } catch (error) {
      console.error('Error processing viral performance:', error);
      throw new Error(`Viral coin creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check all recent performances for viral eligibility
   */
  /**
   * Check all recent performances for viral eligibility
   * @throws Error if performance retrieval fails
   */
  private async checkAllPerformances(): Promise<void> {
    try {
      const recentPerformances = await this.getRecentPerformances();
      
      for (const performance of recentPerformances) {
        try {
          const eligibility = await this.checkPerformanceEligibility(performance);
          
          if (eligibility) {
            console.log(`🔥 Viral performance detected: ${eligibility.reason}`);
            await this.queueForCoinCreation(eligibility);
          }
        } catch (error) {
          // Log individual performance check errors but continue checking others
          console.error(`Error checking performance ${performance.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking all performances:', error);
      throw new Error(`Performance monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate share velocity (shares per hour)
   */
  private async calculateShareVelocity(performance: RealityCheckResult): Promise<number> {
    const hoursOld = (Date.now() - performance.timestamp.getTime()) / (1000 * 60 * 60);
    if (hoursOld < 1) return performance.shareCount; // Less than 1 hour old
    return performance.shareCount / hoursOld;
  }

  /**
   * Calculate engagement rate (interactions / views)
   */
  /**
   * Calculate engagement rate (interactions / views)
   * @throws Error if engagement data retrieval fails
   */
  private async calculateEngagementRate(performance: RealityCheckResult): Promise<number> {
    try {
      const response = await fetch(`/api/analytics/engagement/${performance.id}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.engagementRate || 0;
    } catch (error) {
      console.error('Failed to calculate engagement rate:', error);
      throw new Error(`Engagement rate calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if performance already has a coin
   * @throws Error if coin check fails
   */
  private async hasExistingCoin(performanceId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/zora/has-coin/${performanceId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.hasCoin || false;
    } catch (error) {
      console.error('Failed to check for existing coin:', error);
      throw new Error(`Coin existence check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recent performances for monitoring
   * @throws Error if performance retrieval fails
   */
  private async getRecentPerformances(): Promise<RealityCheckResult[]> {
    try {
      const response = await fetch('/api/performances/recent?hours=24');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.performances || [];
    } catch (error) {
      console.error('Failed to get recent performances:', error);
      throw new Error(`Recent performance retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Queue performance for coin creation
   * @throws Error if queuing fails
   */
  private async queueForCoinCreation(eligibility: CoinEligibility): Promise<void> {
    try {
      console.log(`📋 Queuing for coin creation: ${eligibility.performance.challengeTitle}`);
      
      const response = await fetch('/api/viral/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eligibility,
          queuedAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      console.log(`✅ Successfully queued for coin creation: ${eligibility.performance.challengeTitle}`);
    } catch (error) {
      console.error('Failed to queue for coin creation:', error);
      throw new Error(`Queuing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Notify about viral coin creation
   * @throws Error if notification fails
   */
  private async notifyViralCoinCreation(eligibility: CoinEligibility, coinAddress: string): Promise<void> {
    try {
      console.log(`🎉 VIRAL COIN CREATED: ${eligibility.performance.challengeTitle} → ${coinAddress}`);
      
      const response = await fetch('/api/notifications/viral-coin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId: eligibility.performance.id,
          coinAddress,
          viralType: eligibility.type,
          reason: eligibility.reason,
          challengeTitle: eligibility.performance.challengeTitle
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      console.log('✅ Viral coin notifications sent successfully');
    } catch (error) {
      console.error('Failed to send viral coin notifications:', error);
      throw new Error(`Notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Track viral event for analytics
   * @throws Error if tracking fails
   */
  private async trackViralEvent(eligibility: CoinEligibility): Promise<void> {
    try {
      const event = {
        type: 'viral_coin_created',
        performanceId: eligibility.performance.id,
        viralType: eligibility.type,
        reason: eligibility.reason,
        shareCount: eligibility.performance.shareCount,
        communityRating: eligibility.performance.communityRating,
        gap: eligibility.performance.gap,
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      console.log('📊 Viral event tracked successfully');
    } catch (error) {
      console.error('Failed to track viral event:', error);
      throw new Error(`Event tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get viral queue for admin dashboard
   * @throws Error if queue retrieval fails
   */
  async getViralQueue(): Promise<any[]> {
    try {
      const response = await fetch('/api/viral/queue');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.queue || [];
    } catch (error) {
      console.error('Failed to get viral queue:', error);
      throw new Error(`Queue retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear viral queue
   * @throws Error if queue clearing fails
   */
  async clearViralQueue(): Promise<void> {
    try {
      const response = await fetch('/api/viral/queue/clear', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      console.log('🧹 Viral queue cleared successfully');
    } catch (error) {
      console.error('Failed to clear viral queue:', error);
      throw new Error(`Queue clearing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update viral thresholds (for admin configuration)
   * @throws Error if threshold update fails
   */
  async updateThresholds(newThresholds: Partial<typeof this.VIRAL_THRESHOLDS>): Promise<void> {
    try {
      // First update local copy for immediate use
      Object.assign(this.VIRAL_THRESHOLDS, newThresholds);
      
      // Then persist to server
      const response = await fetch('/api/viral/thresholds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newThresholds),
      });
      
      if (!response.ok) {
        // Revert local changes if server update fails
        const currentThresholds = await this.getThresholds();
        Object.assign(this.VIRAL_THRESHOLDS, currentThresholds);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      console.log('🔧 Viral thresholds updated:', this.VIRAL_THRESHOLDS);
    } catch (error) {
      console.error('Failed to update thresholds:', error);
      throw new Error(`Threshold update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get challenge-specific viral threshold
   */
  getChallengeThreshold(challengeType: 'viral' | 'structured' | 'advanced'): number {
    switch (challengeType) {
      case 'viral':
        return this.VIRAL_THRESHOLDS.VIRAL_CHALLENGE;
      case 'structured':
        return this.VIRAL_THRESHOLDS.STRUCTURED_CHALLENGE;
      case 'advanced':
        return this.VIRAL_THRESHOLDS.ADVANCED_CHALLENGE;
      default:
        return this.VIRAL_THRESHOLDS.SHARE_COUNT; // fallback to default
    }
  }

  /**
   * Check if performance meets viral threshold for its challenge type
   */
  meetsViralThreshold(viralScore: number, challengeType: 'viral' | 'structured' | 'advanced'): boolean {
    const threshold = this.getChallengeThreshold(challengeType);
    return viralScore >= threshold;
  }

  /**
   * Get current thresholds from server
   * @throws Error if threshold retrieval fails
   */
  async getThresholds(): Promise<typeof this.VIRAL_THRESHOLDS> {
    try {
      const response = await fetch('/api/viral/thresholds');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update local copy to ensure sync with server
      Object.assign(this.VIRAL_THRESHOLDS, data.thresholds);
      
      return { ...this.VIRAL_THRESHOLDS };
    } catch (error) {
      console.error('Failed to get thresholds:', error);
      // Fall back to local copy if server retrieval fails
      console.log('Using local thresholds as fallback');
      return { ...this.VIRAL_THRESHOLDS };
    }
  }
}