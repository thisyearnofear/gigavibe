'use client';

import { useState, useEffect, useCallback } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { FarcasterDataService } from '@/lib/farcaster/FarcasterDataService';
import { RealityCheckResult } from '@/lib/zora/types';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
}

export function useFarcasterData() {
  const { address } = useAccount();
  const { user: authUser, signerUuid, isAuthenticated, canPost } = useFarcasterAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const farcasterService = FarcasterDataService.getInstance();

  /**
   * Load user's Farcaster profile by address (fallback when not authenticated)
   */
  const loadUserByAddress = useCallback(async () => {
    if (!address || isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const user = await farcasterService.getUserByAddress(address);
      // Note: This doesn't set currentUser since we use authUser from context
      console.log('Found Farcaster profile for address:', user);
    } catch (err) {
      console.error('Failed to load Farcaster user by address:', err);
      setError('Failed to load Farcaster profile');
    } finally {
      setLoading(false);
    }
  }, [address, isAuthenticated, farcasterService]);

  /**
   * Upload performance to Farcaster
   */
  const uploadPerformance = useCallback(async (
    audioIPFS: string,
    metadata: {
      challengeTitle: string;
      selfRating: number;
      category: string;
      duration: number;
    }
  ): Promise<string | null> => {
    if (!canPost || !signerUuid) {
      setError('Not authenticated with Farcaster');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const castHash = await farcasterService.createPerformance(
        audioIPFS,
        metadata,
        signerUuid
      );
      
      return castHash;
    } catch (err) {
      console.error('Failed to upload performance:', err);
      setError('Failed to upload performance to Farcaster');
      return null;
    } finally {
      setLoading(false);
    }
  }, [farcasterService, canPost, signerUuid]);

  /**
   * Get performances from Farcaster
   */
  const getPerformances = useCallback(async (
    limit: number = 25,
    cursor?: string
  ): Promise<RealityCheckResult[]> => {
    try {
      setLoading(true);
      setError(null);
      
      return await farcasterService.getPerformances(limit, cursor);
    } catch (err) {
      console.error('Failed to get performances:', err);
      setError('Failed to load performances from Farcaster');
      return [];
    } finally {
      setLoading(false);
    }
  }, [farcasterService]);

  /**
   * Submit vote to Farcaster
   */
  const submitVote = useCallback(async (
    performanceHash: string,
    rating: number
  ): Promise<boolean> => {
    if (!canPost || !signerUuid) {
      setError('Not authenticated with Farcaster');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const voteHash = await farcasterService.submitVote(
        performanceHash,
        rating,
        signerUuid
      );
      
      return !!voteHash;
    } catch (err) {
      console.error('Failed to submit vote:', err);
      setError('Failed to submit vote to Farcaster');
      return false;
    } finally {
      setLoading(false);
    }
  }, [farcasterService, canPost, signerUuid]);

  /**
   * Get votes for a performance
   */
  const getVotes = useCallback(async (performanceHash: string) => {
    try {
      return await farcasterService.getVotes(performanceHash);
    } catch (err) {
      console.error('Failed to get votes:', err);
      return [];
    }
  }, [farcasterService]);

  /**
   * Search performances
   */
  const searchPerformances = useCallback(async (query: string): Promise<RealityCheckResult[]> => {
    try {
      setLoading(true);
      setError(null);
      
      return await farcasterService.searchPerformances(query);
    } catch (err) {
      console.error('Failed to search performances:', err);
      setError('Failed to search performances');
      return [];
    } finally {
      setLoading(false);
    }
  }, [farcasterService]);

  /**
   * Get user profile by FID
   */
  const getUserProfile = useCallback(async (fid: number) => {
    try {
      return await farcasterService.getUserProfile(fid);
    } catch (err) {
      console.error('Failed to get user profile:', err);
      return null;
    }
  }, [farcasterService]);

  // Load user by address when not authenticated
  useEffect(() => {
    if (address && !isAuthenticated) {
      loadUserByAddress();
    }
  }, [address, isAuthenticated, loadUserByAddress]);

  return {
    // State
    loading,
    error,
    currentUser: authUser, // Use authenticated user from context
    
    // Actions
    uploadPerformance,
    getPerformances,
    submitVote,
    getVotes,
    searchPerformances,
    getUserProfile,
    loadUserByAddress,
    
    // Computed
    isConnected: isAuthenticated,
    canPost,
    hasValidSigner: !!signerUuid,
    hasNeynarKey: !!process.env.NEXT_PUBLIC_NEYNAR_API_KEY
  };
}