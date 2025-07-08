import { ChallengeResult, LeaderboardEntry, UserVocalProfile, VocalChallenge } from '@/types';

export class SocialService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_URL || '';
  }

  async shareToFarcaster(result: ChallengeResult, challenge: VocalChallenge): Promise<void> {
    try {
      const shareText = this.generateShareText(result, challenge);
      
      // This would use MiniKit's sharing capabilities
      // For now, we'll log the share text and prepare the data structure
      console.log('Sharing to Farcaster:', shareText);
      
      // TODO: Implement actual Farcaster sharing via MiniKit
      // This would involve:
      // 1. Creating a frame with the challenge result
      // 2. Using MiniKit's share functionality
      // 3. Posting to Farcaster with the frame metadata
      
      const frameData = {
        version: "next",
        imageUrl: await this.generateResultImage(result, challenge),
        button: {
          title: "Try this challenge!",
          action: {
            type: "launch_frame",
            name: "GIGAVIBE",
            url: `${this.baseUrl}/challenge/${challenge.id}`,
          },
        },
      };

      // Store the share event
      await this.recordShareEvent(result, challenge);
      
    } catch (error) {
      console.error('Failed to share to Farcaster:', error);
      throw error;
    }
  }

  async getLeaderboard(challengeId?: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      // This would fetch from FilCDN or a decentralized leaderboard
      // For now, return mock data
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          fid: "12345",
          username: "VocalMaster",
          score: 95,
          accuracy: 98,
          challengesCompleted: 25,
          rank: 1,
        },
        {
          fid: "67890",
          username: "PitchPerfect",
          score: 92,
          accuracy: 94,
          challengesCompleted: 18,
          rank: 2,
        },
        {
          fid: "11111",
          username: "SingingStar",
          score: 88,
          accuracy: 91,
          challengesCompleted: 22,
          rank: 3,
        },
      ];

      return mockLeaderboard.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  async getUserProfile(fid: string): Promise<UserVocalProfile | null> {
    try {
      // This would fetch from FilCDN or user's decentralized profile
      // For now, return mock data
      const mockProfile: UserVocalProfile = {
        fid,
        username: `User${fid}`,
        lowestNote: 'C3',
        highestNote: 'C5',
        averageAccuracy: 85,
        completedChallenges: 15,
        preferredDifficulty: 'intermediate',
        weakAreas: ['high_notes', 'intervals'],
        strongAreas: ['scales', 'rhythm'],
        totalPracticeTime: 3600000, // 1 hour in ms
        lastActive: Date.now() - 86400000, // 1 day ago
        achievements: ['first_challenge', 'perfect_scale', 'week_streak'],
      };

      return mockProfile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  async updateUserProfile(fid: string, updates: Partial<UserVocalProfile>): Promise<void> {
    try {
      // This would update the user's profile on FilCDN
      console.log('Updating user profile:', fid, updates);
      
      // TODO: Implement actual profile update to FilCDN
      // This would involve:
      // 1. Fetching current profile
      // 2. Merging updates
      // 3. Storing updated profile on FilCDN
      
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async createSocialChallenge(challenge: VocalChallenge, creatorFid: string): Promise<string> {
    try {
      // Create a social challenge that others can participate in
      const socialChallengeData = {
        ...challenge,
        createdBy: creatorFid,
        participants: [creatorFid],
        leaderboard: [],
        isActive: true,
        endTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      };

      // Store on FilCDN and return challenge ID
      console.log('Creating social challenge:', socialChallengeData);
      
      // TODO: Store on FilCDN and return actual CID
      return `social_${challenge.id}_${Date.now()}`;
      
    } catch (error) {
      console.error('Failed to create social challenge:', error);
      throw error;
    }
  }

  async joinSocialChallenge(challengeId: string, userFid: string): Promise<void> {
    try {
      // Add user to social challenge participants
      console.log('Joining social challenge:', challengeId, userFid);
      
      // TODO: Update challenge data on FilCDN
      
    } catch (error) {
      console.error('Failed to join social challenge:', error);
      throw error;
    }
  }

  private generateShareText(result: ChallengeResult, challenge: VocalChallenge): string {
    const accuracy = Math.round(result.accuracy);
    const score = Math.round(result.score);
    
    const messages = [
      `🎵 Just crushed a ${challenge.type} challenge on GIGAVIBE!`,
      `📊 Score: ${score}/100 | Accuracy: ${accuracy}%`,
      `🎯 Challenge: ${challenge.title}`,
      ``,
      `Think you can beat my score? Try it yourself! 🔥`,
      `#GIGAVIBE #VocalTraining #Web3Music`,
    ];

    return messages.join('\n');
  }

  private async generateResultImage(result: ChallengeResult, challenge: VocalChallenge): Promise<string> {
    // This would generate a dynamic image showing the challenge result
    // For now, return a placeholder
    return `${this.baseUrl}/api/og/challenge-result?score=${result.score}&accuracy=${result.accuracy}&challenge=${encodeURIComponent(challenge.title)}`;
  }

  private async recordShareEvent(result: ChallengeResult, challenge: VocalChallenge): Promise<void> {
    try {
      const shareEvent = {
        type: 'challenge_shared',
        challengeId: challenge.id,
        resultId: result.challengeId,
        userFid: result.userFid,
        timestamp: Date.now(),
        platform: 'farcaster',
      };

      // Store share event on FilCDN for analytics
      console.log('Recording share event:', shareEvent);
      
      // TODO: Store on FilCDN
      
    } catch (error) {
      console.error('Failed to record share event:', error);
    }
  }

  // Utility methods for social features
  static formatScore(score: number): string {
    return `${Math.round(score)}/100`;
  }

  static formatAccuracy(accuracy: number): string {
    return `${Math.round(accuracy)}%`;
  }

  static formatDuration(ms: number): string {
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  static getDifficultyEmoji(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  }

  static getChallengeTypeEmoji(type: string): string {
    switch (type) {
      case 'scale': return '🎼';
      case 'interval': return '🎯';
      case 'rhythm': return '🥁';
      case 'range': return '📈';
      case 'harmony': return '🎵';
      default: return '🎤';
    }
  }
}
