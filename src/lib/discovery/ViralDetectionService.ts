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

  // Viral thresholds for automatic coin creation
  private readonly VIRAL_THRESHOLDS = {
    SHARE_COUNT: 100,        // 100+ shares = viral moment
    PERFECT_SCORE: 4.8,      // 4.8+ rating = perfect performance
    REALITY_GAP: 2.5,        // 2.5+ gap = comedy gold
    ENGAGEMENT_RATE: 0.3,    // 30% engagement rate
    VELOCITY: 50,            // 50 shares in 1 hour = trending
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
      return null;
    }
  }

  /**
   * Process viral performance and create coin
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

      if (result) {
        console.log(`✅ Coin created for viral performance: ${result.address}`);
        
        // Notify about coin creation
        await this.notifyViralCoinCreation(eligibility, result.address);
        
        // Track viral event
        await this.trackViralEvent(eligibility);
        
        return true;
      } else {
        console.log('❌ Failed to create coin for viral performance');
        return false;
      }
    } catch (error) {
      console.error('Error processing viral performance:', error);
      return false;
    }
  }

  /**
   * Check all recent performances for viral eligibility
   */
  private async checkAllPerformances(): Promise<void> {
    try {
      // In production, this would query recent performances from database
      const recentPerformances = await this.getRecentPerformances();
      
      for (const performance of recentPerformances) {
        const eligibility = await this.checkPerformanceEligibility(performance);
        
        if (eligibility) {
          console.log(`🔥 Viral performance detected: ${eligibility.reason}`);
          
          // In production, this would queue for coin creation
          // For now, just log the detection
          await this.queueForCoinCreation(eligibility);
        }
      }
    } catch (error) {
      console.error('Error checking all performances:', error);
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
  private async calculateEngagementRate(performance: RealityCheckResult): Promise<number> {
    // In production, this would calculate based on actual view/interaction data
    // Mock calculation for now
    const estimatedViews = performance.shareCount * 10; // Rough estimate
    const interactions = performance.shareCount + (performance.communityRating * 20);
    return interactions / Math.max(estimatedViews, 1);
  }

  /**
   * Check if performance already has a coin
   */
  private async hasExistingCoin(performanceId: string): Promise<boolean> {
    // In production, this would check database for existing coins
    // For now, return false (no existing coins)
    return false;
  }

  /**
   * Get recent performances for monitoring
   */
  private async getRecentPerformances(): Promise<RealityCheckResult[]> {
    // In production, this would query database for performances from last 24 hours
    // For now, return empty array (no monitoring in development)
    return [];
  }

  /**
   * Queue performance for coin creation
   */
  private async queueForCoinCreation(eligibility: CoinEligibility): Promise<void> {
    // In production, this would add to a job queue for processing
    console.log(`📋 Queued for coin creation: ${eligibility.performance.challengeTitle}`);
    
    // Store in local storage for demo purposes
    const queue = JSON.parse(localStorage.getItem('viralQueue') || '[]');
    queue.push({
      ...eligibility,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem('viralQueue', JSON.stringify(queue));
  }

  /**
   * Notify about viral coin creation
   */
  private async notifyViralCoinCreation(eligibility: CoinEligibility, coinAddress: string): Promise<void> {
    // In production, this would send notifications to users, social media, etc.
    console.log(`🎉 VIRAL COIN CREATED: ${eligibility.performance.challengeTitle} → ${coinAddress}`);
    
    // Could trigger:
    // - Push notifications
    // - Social media posts
    // - Discord/Telegram announcements
    // - Email notifications to followers
  }

  /**
   * Track viral event for analytics
   */
  private async trackViralEvent(eligibility: CoinEligibility): Promise<void> {
    // In production, this would send to analytics service
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
    
    console.log('📊 Viral event tracked:', event);
  }

  /**
   * Get viral queue for admin dashboard
   */
  getViralQueue(): any[] {
    return JSON.parse(localStorage.getItem('viralQueue') || '[]');
  }

  /**
   * Clear viral queue
   */
  clearViralQueue(): void {
    localStorage.removeItem('viralQueue');
  }

  /**
   * Update viral thresholds (for admin configuration)
   */
  updateThresholds(newThresholds: Partial<typeof this.VIRAL_THRESHOLDS>): void {
    Object.assign(this.VIRAL_THRESHOLDS, newThresholds);
    console.log('🔧 Viral thresholds updated:', this.VIRAL_THRESHOLDS);
  }

  /**
   * Get current thresholds
   */
  getThresholds(): typeof this.VIRAL_THRESHOLDS {
    return { ...this.VIRAL_THRESHOLDS };
  }
}