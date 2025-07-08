'use client';

import { useState, useEffect, useCallback } from 'react';
import { RealityCheckResult } from '@/lib/zora/types';
import { DiscoveryService } from '@/lib/discovery/DiscoveryService';
import { useCommunityOwnership } from './useCommunityOwnership';

export function useDiscoveryFeed(feedType: 'trending' | 'foryou' | 'recent' | 'viral' = 'foryou') {
  const [performances, setPerformances] = useState<RealityCheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const discoveryService = DiscoveryService.getInstance();
  const { recordVote, recordShare, getCommunityOwnership } = useCommunityOwnership();

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
      await discoveryService.likePerformance(performanceId);
      // Update UI state as needed
    } catch (err) {
      console.error('Failed to like performance:', err);
    }
  }, [discoveryService]);

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
    loadMore: () => loadFeed(false),
    getCommunityOwnership
  };
}