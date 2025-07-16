'use client';

import { useState, useEffect, useCallback } from 'react';
import { farcasterProfileService, FarcasterProfile } from '@/lib/profile/FarcasterProfileService';

interface UseFarcasterProfileReturn {
  profile: FarcasterProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing Farcaster profile data
 */
export function useFarcasterProfile(fid: number | null): UseFarcasterProfileReturn {
  const [profile, setProfile] = useState<FarcasterProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!fid) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const profileData = await farcasterProfileService.getProfile(fid);
      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fid]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refetch = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for fetching multiple profiles efficiently
 */
export function useFarcasterProfiles(fids: number[]): {
  profiles: Map<number, FarcasterProfile>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [profiles, setProfiles] = useState<Map<number, FarcasterProfile>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (fids.length === 0) {
      setProfiles(new Map());
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const profilesData = await farcasterProfileService.getProfiles(fids);
      setProfiles(profilesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profiles';
      setError(errorMessage);
      console.error('Profiles fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fids]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const refetch = useCallback(async () => {
    await fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    refetch
  };
}