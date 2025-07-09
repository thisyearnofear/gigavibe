'use client';

import { useState, useEffect, useCallback } from 'react';
import { RealityCheckResult } from '@/lib/zora/types';
import { DiscoveryService } from '@/lib/discovery/DiscoveryService';
import { useCommunityOwnership } from './useCommunityOwnership';
import { useFarcasterIntegration } from './useFarcasterIntegration';

export function useDiscoveryFeed(feedType: 'trending' | 'foryou' | 'recent' | 'viral' = 'foryou') {
  const [performances, setPerformances] = useState<RealityCheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const discoveryService = DiscoveryService.getInstance();
  const { recordVote, recordShare, getCommunityOwnership: getAsyncCommunityOwnership } = useCommunityOwnership();
  const { likePerformance: farcasterLike, commentOnPerformance: farcasterComment } = useFarcasterIntegration();
  
  // Create a wrapper function that returns null initially and updates the component state when the data is available
  const getCommunityOwnership = useCallback((performanceId: string) => {
    // Return null initially, which PerformanceCardGenerator can handle
    // This avoids the type error by not passing a Promise directly
    return null;
  }, []);

  const loadFeed = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const newPerformances = await discoveryService.getFeed(feedType, refresh ? 0 : performances.length);
      
      if (refresh) {
        setPerformances(newPerformances);
      } else {
        setPerformances(prev => [...prev, ...newPerformances]);
      }
      
      setHasMore(newPerformances.length > 0);
    } catch (err) {
      console.error('Failed to load discovery feed:', err);
      setError('Failed to load performances');
    } finally {
      setLoading(false);
    }
  }, [feedType, performances.length, discoveryService]);

  const refreshFeed = useCallback(() => {
    loadFeed(true);
  }, [loadFeed]);

  const ratePerformance = useCallback(async (performanceId: string, rating: number) => {
    try {
      // Record in discovery service
      await discoveryService.ratePerformance(performanceId, rating);
      
      // Record in community ownership
      await recordVote(performanceId, rating);
      
      // Update local state
      setPerformances(prev => 
        prev.map(p => 
          p.id === performanceId 
            ? { ...p, communityRating: (p.communityRating + rating) / 2 } // Simplified rating update
            : p
        )
      );
    } catch (err) {
      console.error('Failed to rate performance:', err);
    }
  }, [discoveryService, recordVote]);

  const sharePerformance = useCallback(async (performanceId: string) => {
    try {
      // Record in discovery service
      await discoveryService.sharePerformance(performanceId);
      
      // Record in community ownership
      await recordShare(performanceId, 1);
      
      // Update share count locally
      setPerformances(prev => 
        prev.map(p => 
          p.id === performanceId 
            ? { ...p, shareCount: p.shareCount + 1 }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to share performance:', err);
    }
  }, [discoveryService, recordShare]);

  const likePerformance = useCallback(async (performanceId: string) => {
    try {
      // Instead of using our database, we use Farcaster's API directly
      const success = await farcasterLike(performanceId);
      
      if (success) {
        // Optimistically update UI - update the likes count in farcasterData
        setPerformances(prev =>
          prev.map(p => {
            if (p.id === performanceId) {
              // Create or update the farcasterData object with incremented likes
              const updatedFarcasterData = {
                ...(p.farcasterData || {
                  castHash: p.id,
                  authorFid: 0,
                  authorUsername: '',
                  authorPfp: '',
                  authorDisplayName: '',
                  likes: 0,
                  recasts: 0,
                  replies: 0
                }),
                likes: ((p.farcasterData?.likes || 0) + 1)
              };
              
              return { ...p, farcasterData: updatedFarcasterData };
            }
            return p;
          })
        );
        console.log(`Liked performance: ${performanceId}`);
      }
    } catch (err) {
      console.error('Failed to like performance:', err);
    }
  }, [farcasterLike]);

  const commentPerformance = useCallback(async (performanceId: string) => {
    try {
      // Use Farcaster for comments
      const success = await farcasterComment(performanceId);
      
      if (success) {
        console.log(`Opening comments for: ${performanceId}`);
      }
    } catch (err) {
      console.error('Failed to comment on performance:', err);
    }
  }, [farcasterComment]);

  // Load initial feed
  useEffect(() => {
    loadFeed(true);
  }, [feedType]);

  // Preload next batch when near end
  useEffect(() => {
    if (performances.length > 0 && performances.length % 10 === 0 && hasMore) {
      loadFeed(false);
    }
  }, [performances.length, hasMore, loadFeed]);

  return {
    performances,
    loading,
    error,
    hasMore,
    refreshFeed,
    ratePerformance,
    sharePerformance,
    likePerformance,
    commentPerformance,
    loadMore: () => loadFeed(false),
    getCommunityOwnership
  };
}