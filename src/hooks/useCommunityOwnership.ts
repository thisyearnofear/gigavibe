'use client';

import { useState, useCallback } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { CommunityOwnershipService, CommunityContribution, CommunityOwnership } from '@/lib/community/CommunityOwnershipService';

export function useCommunityOwnership() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const communityService = CommunityOwnershipService.getInstance();

  /**
   * Record a vote/rating for a performance
   */
  const recordVote = useCallback(async (performanceId: string, rating: number) => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);

      const contribution: CommunityContribution = {
        userAddress: address,
        contributionType: 'voter',
        timestamp: new Date(),
        metadata: { rating }
      };

      await communityService.recordContribution(performanceId, contribution);
      console.log(`✅ Recorded vote: ${rating}⭐ for performance ${performanceId}`);
    } catch (err) {
      console.error('Failed to record vote:', err);
      setError('Failed to record vote');
    } finally {
      setLoading(false);
    }
  }, [address, communityService]);

  /**
   * Record a share action
   */
  const recordShare = useCallback(async (performanceId: string, shareCount: number = 1) => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);

      const contribution: CommunityContribution = {
        userAddress: address,
        contributionType: 'sharer',
        timestamp: new Date(),
        metadata: { shareCount }
      };

      await communityService.recordContribution(performanceId, contribution);
      console.log(`✅ Recorded share for performance ${performanceId}`);
    } catch (err) {
      console.error('Failed to record share:', err);
      setError('Failed to record share');
    } finally {
      setLoading(false);
    }
  }, [address, communityService]);

  /**
   * Record a cover/remix performance
   */
  const recordCover = useCallback(async (originalPerformanceId: string, coverPerformanceId: string) => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);

      const contribution: CommunityContribution = {
        userAddress: address,
        contributionType: 'cover_artist',
        timestamp: new Date(),
        metadata: { coverPerformanceId }
      };

      await communityService.recordContribution(originalPerformanceId, contribution);
      console.log(`✅ Recorded cover: ${coverPerformanceId} for original ${originalPerformanceId}`);
    } catch (err) {
      console.error('Failed to record cover:', err);
      setError('Failed to record cover');
    } finally {
      setLoading(false);
    }
  }, [address, communityService]);

  /**
   * Record original performance creation
   */
  const recordOriginalPerformance = useCallback(async (performanceId: string, performerAddress: Address) => {
    try {
      setLoading(true);
      setError(null);

      const contribution: CommunityContribution = {
        userAddress: performerAddress,
        contributionType: 'original_performer',
        timestamp: new Date()
      };

      await communityService.recordContribution(performanceId, contribution);
      console.log(`✅ Recorded original performance: ${performanceId}`);
    } catch (err) {
      console.error('Failed to record original performance:', err);
      setError('Failed to record original performance');
    } finally {
      setLoading(false);
    }
  }, [communityService]);

  /**
   * Get community ownership for a performance
   */
  const getCommunityOwnership = useCallback(async (performanceId: string): Promise<CommunityOwnership | null> => {
    return await communityService.getCommunityOwnership(performanceId);
  }, [communityService]);

  /**
   * Get user's contributions across all performances
   */
  const getUserContributions = useCallback(async () => {
    if (!address) return [];
    return await communityService.getUserContributions(address);
  }, [address, communityService]);

  /**
   * Get user's portfolio value from community-owned coins
   */
  const getUserPortfolioValue = useCallback(async () => {
    if (!address) return { totalValue: 0, ownedCoins: [] };
    return await communityService.getUserPortfolioValue(address);
  }, [address, communityService]);

  /**
   * Check if user has contributed to a performance
   */
  const hasUserContributed = useCallback(async (performanceId: string, contributionType?: string): Promise<boolean> => {
    if (!address) return false;
    
    const contributions = await communityService.getContributions(performanceId);
    return contributions.some(c =>
      c.userAddress === address &&
      (!contributionType || c.contributionType === contributionType)
    );
  }, [address, communityService]);

  /**
   * Get contribution stats for a performance
   */
  const getContributionStats = useCallback(async (performanceId: string) => {
    const contributions = await communityService.getContributions(performanceId);
    
    return {
      totalContributions: contributions.length,
      voters: contributions.filter(c => c.contributionType === 'voter').length,
      covers: contributions.filter(c => c.contributionType === 'cover_artist').length,
      sharers: contributions.filter(c => c.contributionType === 'sharer').length,
      totalShares: contributions
        .filter(c => c.contributionType === 'sharer')
        .reduce((sum, c) => sum + (c.metadata?.shareCount || 1), 0)
    };
  }, [communityService]);

  return {
    // Actions
    recordVote,
    recordShare,
    recordCover,
    recordOriginalPerformance,
    
    // Queries
    getCommunityOwnership,
    getUserContributions,
    getUserPortfolioValue,
    hasUserContributed,
    getContributionStats,
    
    // State
    loading,
    error
  };
}