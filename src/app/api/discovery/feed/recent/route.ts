import { NextRequest, NextResponse } from 'next/server';
import { RealityCheckResult } from '@/lib/zora/types';

// Sample data for the "Recent" feed - sorted by timestamp (newest first)
const mockPerformances: RealityCheckResult[] = [
  {
    id: 'perf-001',
    eventId: 'event-001',
    challengeTitle: 'Summer Hits Challenge',
    challengeId: 'challenge-001',
    userAddress: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    selfRating: 9.5,
    communityRating: 8.7,
    gap: 0.8,
    wittyCommentary: "You're more confident than your audience! Keep that energy.",
    shareCount: 156,
    timestamp: new Date('2025-08-30T10:30:00Z'), // Most recent
    audioUrl: 'https://storage.googleapis.com/gigavibe/performances/sample1.mp3',
    resultImageUrl: 'https://storage.googleapis.com/gigavibe/images/performance1.jpg',
    category: 'quality',
    farcasterData: {
      castHash: '0xabcdef1234567890',
      authorFid: 12345,
      authorUsername: 'musiclover',
      authorPfp: 'https://storage.googleapis.com/gigavibe/profiles/user1.jpg',
      authorDisplayName: 'Music Lover',
      likes: 89,
      recasts: 24,
      replies: 15
    }
  },
  {
    id: 'perf-002',
    eventId: 'event-002',
    challengeTitle: 'Rock Classics Challenge',
    challengeId: 'challenge-002',
    userAddress: '0x2345678901234567890123456789012345678901' as `0x${string}`,
    selfRating: 7.8,
    communityRating: 9.2,
    gap: -1.4,
    wittyCommentary: "The crowd loves you more than you love yourself! Embrace it!",
    shareCount: 243,
    timestamp: new Date('2025-08-29T15:45:00Z'), // Second most recent
    audioUrl: 'https://storage.googleapis.com/gigavibe/performances/sample2.mp3',
    resultImageUrl: 'https://storage.googleapis.com/gigavibe/images/performance2.jpg',
    category: 'legendary',
    farcasterData: {
      castHash: '0xbcdef1234567890a',
      authorFid: 23456,
      authorUsername: 'rockstar',
      authorPfp: 'https://storage.googleapis.com/gigavibe/profiles/user2.jpg',
      authorDisplayName: 'Rock Star',
      likes: 145,
      recasts: 67,
      replies: 32
    }
  },
  {
    id: 'perf-003',
    eventId: 'event-003',
    challengeTitle: 'Pop Diva Challenge',
    challengeId: 'challenge-003',
    userAddress: '0x3456789012345678901234567890123456789012' as `0x${string}`,
    selfRating: 8.9,
    communityRating: 8.5,
    gap: 0.4,
    wittyCommentary: "Almost in perfect sync with your audience!",
    shareCount: 178,
    timestamp: new Date('2025-08-28T20:15:00Z'), // Third most recent
    audioUrl: 'https://storage.googleapis.com/gigavibe/performances/sample3.mp3',
    resultImageUrl: 'https://storage.googleapis.com/gigavibe/images/performance3.jpg',
    category: 'diva',
    farcasterData: {
      castHash: '0xcdef1234567890ab',
      authorFid: 34567,
      authorUsername: 'popqueen',
      authorPfp: 'https://storage.googleapis.com/gigavibe/profiles/user3.jpg',
      authorDisplayName: 'Pop Queen',
      likes: 112,
      recasts: 38,
      replies: 27
    }
  },
  {
    id: 'perf-004',
    eventId: 'event-004',
    challengeTitle: 'Comedy Karaoke',
    challengeId: 'challenge-004',
    userAddress: '0x4567890123456789012345678901234567890123' as `0x${string}`,
    selfRating: 6.5,
    communityRating: 9.7,
    gap: -3.2,
    wittyCommentary: "You're hilarious! The crowd can't get enough of you!",
    shareCount: 312,
    timestamp: new Date('2025-08-27T18:30:00Z'), // Fourth most recent
    audioUrl: 'https://storage.googleapis.com/gigavibe/performances/sample4.mp3',
    resultImageUrl: 'https://storage.googleapis.com/gigavibe/images/performance4.jpg',
    category: 'comedy',
    farcasterData: {
      castHash: '0xdef1234567890abc',
      authorFid: 45678,
      authorUsername: 'funnyguy',
      authorPfp: 'https://storage.googleapis.com/gigavibe/profiles/user4.jpg',
      authorDisplayName: 'Funny Guy',
      likes: 203,
      recasts: 89,
      replies: 54
    }
  },
  {
    id: 'perf-005',
    eventId: 'event-005',
    challengeTitle: 'Baritone Battle',
    challengeId: 'challenge-005',
    userAddress: '0x5678901234567890123456789012345678901234' as `0x${string}`,
    selfRating: 9.1,
    communityRating: 8.9,
    gap: 0.2,
    wittyCommentary: "Deep voice, deep connection with your audience!",
    shareCount: 145,
    timestamp: new Date('2025-08-26T14:00:00Z'), // Oldest
    audioUrl: 'https://storage.googleapis.com/gigavibe/performances/sample5.mp3',
    resultImageUrl: 'https://storage.googleapis.com/gigavibe/images/performance5.jpg',
    category: 'baritone',
    farcasterData: {
      castHash: '0xef1234567890abcd',
      authorFid: 56789,
      authorUsername: 'deepvoice',
      authorPfp: 'https://storage.googleapis.com/gigavibe/profiles/user5.jpg',
      authorDisplayName: 'Deep Voice',
      likes: 98,
      recasts: 31,
      replies: 19
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // In a real implementation, you would:
    // 1. Fetch performances from a database
    // 2. Order by timestamp (newest first)
    // 3. Apply pagination (offset/limit)
    
    // For now, we'll use mock data with simple pagination
    // Note: Our mock data is already sorted by timestamp (newest first)
    const paginatedPerformances = mockPerformances.slice(offset, offset + limit);
    
    // Return the performances
    return NextResponse.json({ 
      performances: paginatedPerformances,
      pagination: {
        total: mockPerformances.length,
        offset,
        limit,
        hasMore: offset + limit < mockPerformances.length
      }
    });
  } catch (error) {
    console.error('Error in recent feed API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve recent feed' },
      { status: 500 }
    );
  }
}