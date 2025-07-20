/**
 * Unified Challenge Service
 * Consolidates all challenge-related operations following DRY principles
 */

import { 
  Challenge, 
  ChallengeFilters, 
  ChallengeServiceInterface,
  ChallengeResult 
} from '@/types/challenge.types';
import { apiService } from './ApiService';

class UnifiedChallengeService implements ChallengeServiceInterface {
  private static instance: UnifiedChallengeService;
  private challenges: Challenge[] = [];
  private isLoaded = false;

  static getInstance(): UnifiedChallengeService {
    if (!UnifiedChallengeService.instance) {
      UnifiedChallengeService.instance = new UnifiedChallengeService();
    }
    return UnifiedChallengeService.instance;
  }

  /**
   * Load challenges from API or fallback to default
   */
  async loadChallenges(): Promise<Challenge[]> {
    if (this.isLoaded && this.challenges.length > 0) {
      return this.challenges;
    }

    try {
      // Use ApiService for consistent error handling
      this.challenges = await apiService.getAllChallenges();
      
      if (this.challenges.length === 0) {
        this.challenges = this.getDefaultChallenges();
      }
    } catch (error) {
      console.warn('Failed to load challenges, using defaults:', error);
      this.challenges = this.getDefaultChallenges();
    }

    this.isLoaded = true;
    return this.challenges;
  }

  /**
   * Transform API challenges to unified format
   */
  private transformApiChallenges(apiChallenges: any[]): Challenge[] {
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
      previewUrl: challenge.originalAudio || challenge.audioUrl,
      instrumentalUrl: challenge.instrumentalAudio || challenge.audioUrl,
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
   * Normalize difficulty values from different sources
   */
  private normalizeDifficulty(difficulty: string): 'easy' | 'medium' | 'hard' {
    const normalized = difficulty?.toLowerCase();
    if (normalized === 'easy' || normalized === 'beginner') return 'easy';
    if (normalized === 'hard' || normalized === 'advanced') return 'hard';
    return 'medium';
  }

  /**
   * Generate default challenges for fallback
   */
  private getDefaultChallenges(): Challenge[] {
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
   * Get real performers from database
   */
  private async getRealPerformers(challengeId: string) {
    // TODO: Implement real database query to get recent performers
    // This will query the challenge_results table for recent participants
    return [];
  }

  /**
   * Generate contextual tips for challenges
   */
  private generateTips(title: string): string[] {
    const baseTips = [
      "Listen to the original first to get familiar",
      "Practice with the instrumental track",
      "Find a quiet space with good acoustics",
      "Sing with confidence and have fun!"
    ];

    // Add specific tips based on song title
    if (title.toLowerCase().includes('spanish') || title.toLowerCase().includes('español')) {
      baseTips.unshift("Don't worry about perfect pronunciation");
    }
    if (title.toLowerCase().includes('rock')) {
      baseTips.unshift("Put energy and attitude into your performance");
    }
    if (title.toLowerCase().includes('ballad') || title.toLowerCase().includes('slow')) {
      baseTips.unshift("Focus on emotion and breath control");
    }

    return baseTips;
  }

  /**
   * Get all challenges with optional filtering
   */
  async getChallenges(filters?: ChallengeFilters): Promise<Challenge[]> {
    const challenges = await this.loadChallenges();
    
    if (!filters) return challenges;

    return challenges.filter(challenge => {
      if (filters.difficulty && challenge.difficulty !== filters.difficulty) return false;
      if (filters.trending !== undefined && challenge.trending !== filters.trending) return false;
      if (filters.type && challenge.type !== filters.type) return false;
      if (filters.minParticipants && challenge.participants < filters.minParticipants) return false;
      if (filters.tags && !filters.tags.some(tag => challenge.tags?.includes(tag))) return false;
      return true;
    });
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(id: string): Promise<Challenge | null> {
    const challenges = await this.loadChallenges();
    return challenges.find(challenge => challenge.id === id) || null;
  }

  /**
   * Get featured challenges
   */
  async getFeaturedChallenges(limit = 10): Promise<Challenge[]> {
    try {
      // Use ApiService for featured challenges
      const featuredChallenges = await apiService.getFeaturedChallenges(limit);
      return featuredChallenges;
    } catch (error) {
      console.warn('Failed to get featured challenges, using fallback');
      const challenges = await this.getChallenges({ type: 'featured' });
      return challenges.slice(0, limit);
    }
  }

  /**
   * Get trending challenges
   */
  async getTrendingChallenges(limit = 10): Promise<Challenge[]> {
    const challenges = await this.getChallenges({ trending: true });
    return challenges
      .sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0))
      .slice(0, limit);
  }

  /**
   * Search challenges by title, artist, or tags
   */
  async searchChallenges(query: string): Promise<Challenge[]> {
    const challenges = await this.loadChallenges();
    const searchTerm = query.toLowerCase();
    
    return challenges.filter(challenge => 
      challenge.title.toLowerCase().includes(searchTerm) ||
      challenge.artist.toLowerCase().includes(searchTerm) ||
      challenge.description?.toLowerCase().includes(searchTerm) ||
      challenge.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Submit challenge result
   */
  async submitChallengeResult(result: ChallengeResult): Promise<void> {
    try {
      console.log('🚀 Submitting challenge result:', result);
      
      // Direct API call to challenge submission endpoint
      const response = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: result.challengeId,
          challengeTitle: result.challengeTitle,
          audioUrl: result.audioUrl,
          selfRating: result.selfRating,
          confidence: result.confidence,
          duration: result.duration,
          userFid: result.userFid,
          castHash: result.castHash,
          accuracy: result.accuracy,
          submissionId: result.submissionId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Submission failed: ${response.status} - ${errorData.error}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Challenge result submitted successfully:', responseData);
      
      // Update local challenge data with new participant
      const challengeIndex = this.challenges.findIndex(c => c.id === result.challengeId);
      if (challengeIndex !== -1) {
        this.challenges[challengeIndex].participants += 1;
      }
      
    } catch (error) {
      console.error('❌ Error submitting challenge result:', error);
      throw error;
    }
  }

  /**
   * Get challenge statistics
   */
  async getChallengeStats(challengeId?: string) {
    const challenges = challengeId 
      ? [await this.getChallengeById(challengeId)].filter(Boolean) as Challenge[]
      : await this.loadChallenges();

    return {
      total: challenges.length,
      byDifficulty: challenges.reduce((acc, challenge) => {
        acc[challenge.difficulty] = (acc[challenge.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalParticipants: challenges.reduce((sum, c) => sum + c.participants, 0),
      trending: challenges.filter(c => c.trending).length,
      avgCoinValue: challenges.reduce((sum, c) => sum + (c.coinValue || 0), 0) / challenges.length
    };
  }

  /**
   * Update challenges cache
   */
  updateChallenges(newChallenges: Challenge[]): void {
    this.challenges = newChallenges;
    this.isLoaded = true;
  }

  /**
   * Clear cache and force reload
   */
  clearCache(): void {
    this.challenges = [];
    this.isLoaded = false;
  }
}

// Export singleton instance
export const challengeService = UnifiedChallengeService.getInstance();
export default UnifiedChallengeService;