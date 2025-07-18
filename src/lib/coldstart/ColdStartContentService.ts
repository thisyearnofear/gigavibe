/**
 * Cold Start Content Service
 * 
 * Manages initial content for new users while transitioning to real user-generated content.
 * This service provides curated seed content that showcases the app's potential while
 * encouraging user participation.
 */

import { supabase } from '@/integrations/supabase/client';

export interface SeedPerformance {
  id: string;
  challengeId: string;
  challengeTitle: string;
  audioUrl: string;
  duration: number;
  selfRating: number;
  communityRating?: number;
  gap?: number;
  author: {
    id: string;
    username: string;
    displayName: string;
    pfpUrl: string;
    isVerified: boolean;
    isSeedAccount: boolean; // Mark as curated content
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: Date;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  featured: boolean;
  // Additional properties for compatibility
  isLiked?: boolean;
  realityRevealed?: boolean;
}

export interface ColdStartStrategy {
  showSeedContent: boolean;
  seedContentRatio: number; // 0-1, percentage of seed vs real content
  transitionThreshold: number; // Number of real performances before reducing seed content
  encouragementMessages: string[];
}

class ColdStartContentService {
  private strategy: ColdStartStrategy = {
    showSeedContent: true,
    seedContentRatio: 0.7, // Start with 70% seed content
    transitionThreshold: 50, // Reduce seed content after 50 real performances
    encouragementMessages: [
      "Be the first to take on this challenge! 🎤",
      "Show the community how it's done! ⭐",
      "Your voice could inspire others! 🌟",
      "Ready to set the bar? 🎯"
    ]
  };

  /**
   * High-quality seed performances that demonstrate app features
   */
  private seedPerformances: SeedPerformance[] = [
    {
      id: 'seed-performance-1',
      challengeId: 'challenge-1752707413941-grwlit',
      challengeTitle: 'Español',
      audioUrl: 'https://gateway.pinata.cloud/ipfs/bafybeicq27s6mkmllsxdaj3y2gdkmc4ddul5urxqn2zgs2al3wc6gmmbyy',
      duration: 15,
      selfRating: 4,
      communityRating: 5,
      gap: 1,
      author: {
        id: 'gigavibe-team-1',
        username: 'gigavibe_demo',
        displayName: 'GIGAVIBE Team',
        pfpUrl: '/images/team-avatar-1.png',
        isVerified: true,
        isSeedAccount: true
      },
      engagement: {
        likes: 127,
        comments: 23,
        shares: 8
      },
      timestamp: new Date('2025-01-15T10:00:00Z'),
      tags: ['spanish', 'demo', 'featured'],
      difficulty: 'medium',
      featured: true
    },
    {
      id: 'seed-performance-2',
      challengeId: 'challenge-1752707413942-ytjoi0',
      challengeTitle: 'Español (Instrumental)',
      audioUrl: 'https://gateway.pinata.cloud/ipfs/bafybeib3svxxqnjs4ex675xtpm6shpsy6md6ddxdu4ahh6r5avy3upak4u',
      duration: 12,
      selfRating: 3,
      communityRating: 4,
      gap: 1,
      author: {
        id: 'gigavibe-team-2',
        username: 'vocal_coach_maria',
        displayName: 'Maria Rodriguez',
        pfpUrl: '/images/team-avatar-2.png',
        isVerified: true,
        isSeedAccount: true
      },
      engagement: {
        likes: 89,
        comments: 15,
        shares: 5
      },
      timestamp: new Date('2025-01-14T15:30:00Z'),
      tags: ['instrumental', 'coaching', 'technique'],
      difficulty: 'easy',
      featured: false
    }
  ];

  /**
   * Get mixed content for discovery feed
   */
  async getDiscoveryFeedContent(limit: number = 10, offset: number = 0): Promise<{
    performances: SeedPerformance[];
    hasMore: boolean;
    strategy: ColdStartStrategy;
  }> {
    // Get real user performance count
    const realPerformanceCount = await this.getRealPerformanceCount();
    
    // Adjust strategy based on real content availability
    const adjustedStrategy = this.adjustStrategy(realPerformanceCount);
    
    // Get real performances
    const realPerformances = await this.getRealPerformances(limit, offset);
    
    // Mix with seed content if needed
    const mixedContent = this.mixContent(realPerformances, adjustedStrategy, limit);
    
    return {
      performances: mixedContent,
      hasMore: mixedContent.length === limit,
      strategy: adjustedStrategy
    };
  }

  /**
   * Get count of real user performances
   */
  private async getRealPerformanceCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('challenge_results')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error counting real performances:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getRealPerformanceCount:', error);
      return 0;
    }
  }

  /**
   * Get real user performances from database
   */
  private async getRealPerformances(limit: number, offset: number): Promise<SeedPerformance[]> {
    // For now, return empty array until database relations are properly set up
    // This will be implemented once the schema relationships are established
    console.log('Real performances not yet implemented - using seed content only');
    return [];
  }

  /**
   * Adjust strategy based on real content availability
   */
  private adjustStrategy(realPerformanceCount: number): ColdStartStrategy {
    const adjustedStrategy = { ...this.strategy };

    if (realPerformanceCount === 0) {
      // No real content - show mostly seed content with strong encouragement
      adjustedStrategy.seedContentRatio = 1.0;
      adjustedStrategy.showSeedContent = true;
    } else if (realPerformanceCount < this.strategy.transitionThreshold) {
      // Some real content - gradually reduce seed content
      const progress = realPerformanceCount / this.strategy.transitionThreshold;
      adjustedStrategy.seedContentRatio = Math.max(0.3, 0.7 - (progress * 0.4));
    } else {
      // Enough real content - minimal seed content for variety
      adjustedStrategy.seedContentRatio = 0.1;
    }

    return adjustedStrategy;
  }

  /**
   * Mix real and seed content strategically
   */
  private mixContent(
    realPerformances: SeedPerformance[], 
    strategy: ColdStartStrategy, 
    limit: number
  ): SeedPerformance[] {
    if (!strategy.showSeedContent) {
      return realPerformances.slice(0, limit);
    }

    const seedCount = Math.floor(limit * strategy.seedContentRatio);
    const realCount = limit - seedCount;

    // Get seed performances
    const seedContent = this.seedPerformances.slice(0, seedCount);
    
    // Get real performances
    const realContent = realPerformances.slice(0, realCount);

    // Interleave content for natural feel
    const mixed: SeedPerformance[] = [];
    const maxLength = Math.max(seedContent.length, realContent.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < realContent.length) mixed.push(realContent[i]);
      if (i < seedContent.length) mixed.push(seedContent[i]);
    }

    return mixed.slice(0, limit);
  }

  /**
   * Get encouragement message for empty states
   */
  getEncouragementMessage(): string {
    const messages = this.strategy.encouragementMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Check if we should show onboarding hints
   */
  shouldShowOnboardingHints(realPerformanceCount: number): boolean {
    return realPerformanceCount < 10;
  }

  /**
   * Get featured challenges for cold start
   */
  getFeaturedChallenges() {
    return [
      {
        id: 'challenge-1752707413941-grwlit',
        title: 'Español',
        description: 'Perfect starter challenge - show off your Spanish vocals!',
        difficulty: 'medium',
        estimatedDuration: 15,
        participantCount: 0,
        encouragement: "Be the first to master this beautiful Spanish song! 🎵"
      },
      {
        id: 'challenge-1752707413942-ytjoi0',
        title: 'Español (Instrumental)',
        description: 'Instrumental version - focus on your vocal technique',
        difficulty: 'easy',
        estimatedDuration: 12,
        participantCount: 0,
        encouragement: "Great for practicing without competing vocals! 🎤"
      }
    ];
  }
}

export const coldStartContentService = new ColdStartContentService();
export default coldStartContentService;