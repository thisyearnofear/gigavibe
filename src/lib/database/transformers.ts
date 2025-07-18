import { RealityCheckResult } from '@/lib/zora/types';
import { Address } from 'viem';
import { SeedPerformance } from '@/lib/coldstart/ColdStartContentService';

/**
 * Transform database discovery feed results to RealityCheckResult format
 */
export function transformDiscoveryFeedToRealityCheck(feedItem: any): RealityCheckResult {
  return {
    id: feedItem.id,
    eventId: feedItem.id,
    challengeTitle: feedItem.challenge_title || 'Untitled Challenge',
    challengeId: feedItem.challenge_id,
    userAddress: (feedItem.user_fid?.toString() || '0x0') as Address,
    selfRating: feedItem.self_rating || 0,
    communityRating: feedItem.community_rating || 0,
    gap: feedItem.gap || 0,
    wittyCommentary: generateWittyCommentary(feedItem.self_rating, feedItem.community_rating, feedItem.gap),
    shareCount: feedItem.shares_count || 0,
    timestamp: new Date(feedItem.created_at),
    audioUrl: feedItem.audio_url || '',
    resultImageUrl: generateResultImageUrl(feedItem.id),
    category: categorizePerformance(feedItem.self_rating, feedItem.community_rating, feedItem.gap),
    farcasterData: {
      castHash: feedItem.cast_hash || '',
      authorFid: feedItem.user_fid || 0,
      authorUsername: `user${feedItem.user_fid || 0}`,
      authorPfp: generateProfilePicture(feedItem.user_fid),
      authorDisplayName: `User ${feedItem.user_fid || 0}`,
      likes: feedItem.likes_count || 0,
      recasts: feedItem.comments_count || 0, // Using comments as recasts for now
      replies: feedItem.comments_count || 0
    }
  };
}

/**
 * Transform challenge results to RealityCheckResult format
 */
export function transformChallengeResultToRealityCheck(result: any): RealityCheckResult {
  return {
    id: result.id,
    eventId: result.id,
    challengeTitle: result.challenge_title,
    challengeId: result.challenge_id,
    userAddress: (result.user_fid?.toString() || '0x0') as Address,
    selfRating: result.self_rating,
    communityRating: result.community_rating || 0,
    gap: result.gap || 0,
    wittyCommentary: generateWittyCommentary(result.self_rating, result.community_rating, result.gap),
    shareCount: result.shares_count,
    timestamp: new Date(result.created_at),
    audioUrl: result.audio_url,
    resultImageUrl: generateResultImageUrl(result.id),
    category: categorizePerformance(result.self_rating, result.community_rating, result.gap),
    farcasterData: {
      castHash: result.cast_hash || '',
      authorFid: result.user_fid || 0,
      authorUsername: `user${result.user_fid || 0}`,
      authorPfp: generateProfilePicture(result.user_fid),
      authorDisplayName: `User ${result.user_fid || 0}`,
      likes: result.likes_count,
      recasts: result.comments_count,
      replies: result.comments_count
    }
  };
}

/**
 * Transform SeedPerformance to RealityCheckResult format
 */
export function transformSeedPerformanceToRealityCheck(seedPerf: SeedPerformance): RealityCheckResult {
  return {
    id: seedPerf.id,
    eventId: seedPerf.id,
    challengeTitle: seedPerf.challengeTitle,
    challengeId: seedPerf.challengeId,
    userAddress: (seedPerf.author.id) as Address,
    selfRating: seedPerf.selfRating,
    communityRating: seedPerf.communityRating || 0,
    gap: seedPerf.gap || 0,
    wittyCommentary: generateWittyCommentary(seedPerf.selfRating, seedPerf.communityRating || 0, seedPerf.gap || 0),
    shareCount: seedPerf.engagement.shares,
    timestamp: seedPerf.timestamp,
    audioUrl: seedPerf.audioUrl,
    resultImageUrl: generateResultImageUrl(seedPerf.id),
    category: categorizePerformance(seedPerf.selfRating, seedPerf.communityRating || 0, seedPerf.gap || 0),
    farcasterData: {
      castHash: `seed-${seedPerf.id}`,
      authorFid: parseInt(seedPerf.author.id.replace(/\D/g, '')) || 0,
      authorUsername: seedPerf.author.username,
      authorPfp: seedPerf.author.pfpUrl,
      authorDisplayName: seedPerf.author.displayName,
      likes: seedPerf.engagement.likes,
      recasts: seedPerf.engagement.shares,
      replies: seedPerf.engagement.comments
    }
  };
}

/**
 * Generate witty commentary based on ratings and gap
 */
function generateWittyCommentary(selfRating: number, communityRating: number, gap: number): string {
  if (!selfRating || !communityRating) {
    return "Fresh performance! Let's see how the community responds.";
  }

  const absGap = Math.abs(gap);
  
  if (absGap < 0.5) {
    return "Perfect sync with your audience! You know your worth.";
  } else if (gap > 2) {
    return "You're more confident than your audience! Keep that energy.";
  } else if (gap > 1) {
    return "Confidence is key! Your audience is catching up to your vibe.";
  } else if (gap < -2) {
    return "The crowd loves you more than you love yourself! Embrace it!";
  } else if (gap < -1) {
    return "Your audience sees something special! Trust their judgment.";
  } else {
    return "Almost in perfect sync with your audience!";
  }
}

/**
 * Categorize performance based on ratings
 */
function categorizePerformance(selfRating: number, communityRating: number, gap: number): 'quality' | 'legendary' | 'comedy' | 'diva' | 'baritone' {
  const avgRating = (selfRating + (communityRating || selfRating)) / 2;
  
  if (avgRating >= 9) return 'legendary';
  if (avgRating >= 8) return 'quality';
  if (avgRating >= 7) return 'diva';
  if (Math.abs(gap) > 2) return 'comedy';
  if (avgRating >= 6) return 'baritone';
  return 'quality';
}

/**
 * Generate result image URL (placeholder for now)
 */
function generateResultImageUrl(performanceId: string): string {
  return `https://storage.googleapis.com/gigavibe/images/performance-${performanceId}.jpg`;
}

/**
 * Generate profile picture URL (placeholder for now)
 */
function generateProfilePicture(userFid?: number): string {
  if (!userFid) return 'https://storage.googleapis.com/gigavibe/profiles/default.jpg';
  return `https://storage.googleapis.com/gigavibe/profiles/user${userFid}.jpg`;
}