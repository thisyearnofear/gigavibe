import { ChallengeResult, LeaderboardEntry, UserVocalProfile, VocalChallenge } from '@/types';

export class SocialService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_URL || '';
  }

  async shareToFarcaster(result: ChallengeResult, challenge: VocalChallenge): Promise<void> {
    try {
      const shareText = this.generateShareText(result, challenge);
      const imageUrl = await this.generateResultImage(result, challenge);
      
      // Generate frame metadata
      const frameData = {
        version: "vNext",
        imageUrl,
        button: {
          title: "Try this challenge!",
          action: {
            type: "launch_frame",
            name: "GIGAVIBE",
            url: `${this.baseUrl}/challenge/${challenge.id}`,
          },
        },
      };
      
      // Share to Farcaster using our API route
      const response = await fetch('/api/farcaster/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: shareText,
          frameData,
          challengeId: challenge.id,
          resultId: result.challengeId,
          userFid: result.userFid
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Farcaster share failed: ${errorText}`);
      }
      
      // Store the share event
      await this.recordShareEvent(result, challenge);
    } catch (error) {
      console.error('Failed to share to Farcaster:', error);
      throw error;
    }
  }

  async getLeaderboard(challengeId?: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      // Build URL with query parameters
      let url = '/api/leaderboard';
      const params = new URLSearchParams();
      
      if (challengeId) {
        params.append('challengeId', challengeId);
      }
      
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // Fetch leaderboard from API
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Leaderboard fetch failed: ${errorText}`);
      }
      
      const data = await response.json();
      return data.entries as LeaderboardEntry[];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  }

  async getUserProfile(fid: string): Promise<UserVocalProfile | null> {
    try {
      const response = await fetch(`/api/profile/${fid}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // User profile not found - this is a valid scenario
          return null;
        }
        
        const errorText = await response.text();
        throw new Error(`Profile fetch failed: ${errorText}`);
      }
      
      const data = await response.json();
      return data.profile as UserVocalProfile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(fid: string, updates: Partial<UserVocalProfile>): Promise<void> {
    try {
      const response = await fetch(`/api/profile/${fid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Profile update failed: ${errorText}`);
      }
      
      // Success - no need to return anything
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async createSocialChallenge(challenge: VocalChallenge, creatorFid: string): Promise<string> {
    try {
      const socialChallengeData = {
        ...challenge,
        createdBy: creatorFid,
        participants: [creatorFid],
        isActive: true,
        endTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      };
      
      const response = await fetch('/api/challenges/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(socialChallengeData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Challenge creation failed: ${errorText}`);
      }
      
      const result = await response.json();
      return result.challengeId;
    } catch (error) {
      console.error('Failed to create social challenge:', error);
      throw error;
    }
  }

  async joinSocialChallenge(challengeId: string, userFid: string): Promise<void> {
    try {
      const response = await fetch(`/api/challenges/social/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userFid }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to join challenge: ${errorText}`);
      }
      
      // Success - no need to return anything
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
    // Use a real OG image generation endpoint
    try {
      // First check if the OG image API is available
      const testResponse = await fetch(`${this.baseUrl}/api/og/status`, {
        method: 'HEAD'
      });
      
      if (!testResponse.ok) {
        throw new Error('OG image generation API is not available');
      }
      
      // Construct the actual URL for the OG image with proper parameters
      return `${this.baseUrl}/api/og/challenge-result?score=${result.score}&accuracy=${result.accuracy}&challenge=${encodeURIComponent(challenge.title)}&userFid=${result.userFid || ''}&timestamp=${Date.now()}`;
    } catch (error) {
      console.error('Failed to generate result image:', error);
      // Fallback to a static image if the dynamic generation fails
      return `${this.baseUrl}/images/default-challenge-card.png`;
    }
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

      // Track the share event via analytics API
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'share',
          properties: shareEvent
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to record share event: ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to record share event:', error);
      // Don't throw here - this is non-critical functionality
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
