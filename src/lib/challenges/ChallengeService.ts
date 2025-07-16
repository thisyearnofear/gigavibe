'use client';

/**
 * Service for managing vocal challenges
 * Handles challenge songs, difficulty levels, and user progress
 */

export interface ChallengeSong {
  id: string;
  title: string;
  artist: string;
  vocalUrl: string;      // Full song with vocals
  instrumentalUrl: string; // Backing track only
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  bpm?: number;
  key?: string;
  description?: string;
  ipfsHash?: string;
  uploadedAt?: string;
}

export class ChallengeService {
  private static instance: ChallengeService;
  private challenges: ChallengeSong[] = [];
  private isLoaded = false;

  static getInstance(): ChallengeService {
    if (!ChallengeService.instance) {
      ChallengeService.instance = new ChallengeService();
    }
    return ChallengeService.instance;
  }

  /**
   * Load challenges from configuration file
   */
  async loadChallenges(): Promise<ChallengeSong[]> {
    if (this.isLoaded && this.challenges.length > 0) {
      return this.challenges;
    }

    try {
      // Try to load from generated configuration
      const response = await fetch('/api/challenges/songs');
      if (response.ok) {
        const data = await response.json();
        this.challenges = data.challenges || [];
      } else {
        // Fallback to default challenge
        this.challenges = this.getDefaultChallenge();
      }
    } catch (error) {
      console.warn('Failed to load challenges, using default:', error);
      this.challenges = this.getDefaultChallenge();
    }

    this.isLoaded = true;
    return this.challenges;
  }

  /**
   * Get default challenge for testing (Español)
   */
  private getDefaultChallenge(): ChallengeSong[] {
    return [
      {
        id: 'espanol-challenge',
        title: 'Español',
        artist: 'GIGAVIBE',
        vocalUrl: '/audio/espanol.mp3',
        instrumentalUrl: '/audio/espanol-instrumental.mp3',
        difficulty: 'medium',
        duration: 180,
        bpm: 120,
        key: 'C Major',
        description: 'Vocal challenge with Spanish lyrics - perfect for testing your vocal skills!'
      }
    ];
  }

  /**
   * Get all available challenges
   */
  async getChallenges(): Promise<ChallengeSong[]> {
    return await this.loadChallenges();
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(id: string): Promise<ChallengeSong | null> {
    const challenges = await this.loadChallenges();
    return challenges.find(challenge => challenge.id === id) || null;
  }

  /**
   * Get challenges by difficulty
   */
  async getChallengesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<ChallengeSong[]> {
    const challenges = await this.loadChallenges();
    return challenges.filter(challenge => challenge.difficulty === difficulty);
  }

  /**
   * Get featured challenge (for now, just return the first one)
   */
  async getFeaturedChallenge(): Promise<ChallengeSong | null> {
    const challenges = await this.loadChallenges();
    return challenges[0] || null;
  }

  /**
   * Update challenges from uploaded data
   */
  updateChallenges(newChallenges: ChallengeSong[]): void {
    this.challenges = newChallenges;
    this.isLoaded = true;
  }

  /**
   * Get challenge stats
   */
  async getChallengeStats(): Promise<{
    total: number;
    byDifficulty: Record<string, number>;
    featured: ChallengeSong | null;
  }> {
    const challenges = await this.loadChallenges();
    const byDifficulty = challenges.reduce((acc, challenge) => {
      acc[challenge.difficulty] = (acc[challenge.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: challenges.length,
      byDifficulty,
      featured: await this.getFeaturedChallenge()
    };
  }
}

// Export singleton instance
export const challengeService = ChallengeService.getInstance();