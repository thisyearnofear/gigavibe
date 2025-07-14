'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';

export interface FarcasterCast {
  hash: string;
  text: string;
  timestamp: string;
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  };
  reactions?: {
    likes_count: number;
    recasts_count: number;
    replies_count: number;
  };
  embeds?: Array<{
    url?: string;
    metadata?: {
      title?: string;
      description?: string;
      image?: string;
    };
  }>;
  replies?: {
    count: number;
  };
  channel?: {
    id: string;
    name: string;
  };
}

export interface DiscoveryFeedData {
  casts: FarcasterCast[];
  next?: {
    cursor: string | null;
  };
}

export type FeedType = 'foryou' | 'trending' | 'following';

export function useFarcasterDiscovery() {
  const { isAuthenticated, user } = useFarcasterAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedData, setFeedData] = useState<DiscoveryFeedData | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);

  /**
   * Fetch discovery feed from multiple channels with gigavibe filtering
   */
  const fetchDiscoveryFeed = useCallback(async (
    feedType: FeedType = 'foryou',
    limit: number = 25,
    loadMore: boolean = false
  ): Promise<DiscoveryFeedData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        action: 'fetchDiscoveryFeed',
        feedType,
        limit: limit.toString(),
        ...(loadMore && cursor ? { cursor } : {})
      });
      
      const response = await fetch(`/api/farcaster/discovery?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch discovery feed: ${response.status}`);
      }
      
      const data: DiscoveryFeedData = await response.json();
      
      if (loadMore && feedData) {
        // Append new data for infinite scroll
        const updatedData = {
          casts: [...feedData.casts, ...data.casts],
          next: data.next
        };
        setFeedData(updatedData);
        return updatedData;
      } else {
        // Fresh data
        setFeedData(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to fetch discovery feed:', err);
      setError('Failed to load discovery feed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cursor, feedData]);

  /**
   * Search for gigavibe mentions across channels
   */
  const searchGigavibe = useCallback(async (
    limit: number = 25,
    searchCursor?: string
  ): Promise<DiscoveryFeedData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        action: 'searchGigavibe',
        limit: limit.toString(),
        ...(searchCursor ? { cursor: searchCursor } : {})
      });
      
      const response = await fetch(`/api/farcaster/discovery?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search gigavibe mentions: ${response.status}`);
      }
      
      const data: DiscoveryFeedData = await response.json();
      setFeedData(data);
      return data;
    } catch (err) {
      console.error('Failed to search gigavibe mentions:', err);
      setError('Failed to search mentions');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load more content for infinite scroll
   */
  const loadMore = useCallback(async (feedType: FeedType) => {
    if (!feedData?.next?.cursor || loading) return;
    
    setCursor(feedData.next.cursor);
    await fetchDiscoveryFeed(feedType, 25, true);
  }, [feedData, loading, fetchDiscoveryFeed]);

  /**
   * Refresh feed data
   */
  const refreshFeed = useCallback(async (feedType: FeedType) => {
    setCursor(null);
    await fetchDiscoveryFeed(feedType, 25, false);
  }, [fetchDiscoveryFeed]);

  /**
   * Get cast engagement metrics
   */
  const getCastMetrics = useCallback((cast: FarcasterCast) => {
    return {
      likes: cast.reactions?.likes_count || 0,
      recasts: cast.reactions?.recasts_count || 0,
      replies: cast.replies?.count || 0,
      totalEngagement: (cast.reactions?.likes_count || 0) + 
                      (cast.reactions?.recasts_count || 0) + 
                      (cast.replies?.count || 0)
    };
  }, []);

  /**
   * Extract audio/music embeds from cast
   */
  const extractMusicEmbeds = useCallback((cast: FarcasterCast) => {
    return cast.embeds?.filter(embed => 
      embed.metadata?.description?.toLowerCase().includes('music') ||
      embed.metadata?.description?.toLowerCase().includes('audio') ||
      embed.url?.includes('spotify') ||
      embed.url?.includes('soundcloud') ||
      embed.url?.includes('youtube')
    ) || [];
  }, []);

  /**
   * Check if cast is gigavibe-related
   */
  const isGigavibeRelated = useCallback((cast: FarcasterCast) => {
    const text = cast.text.toLowerCase();
    const embedTexts = cast.embeds?.map(e => e.metadata?.description?.toLowerCase()).join(' ') || '';
    
    return text.includes('gigavibe') || embedTexts.includes('gigavibe');
  }, []);

  // Update cursor when feedData changes
  useEffect(() => {
    if (feedData?.next?.cursor) {
      setCursor(feedData.next.cursor);
    }
  }, [feedData]);

  return {
    // State
    loading,
    error,
    feedData,
    cursor,
    hasMore: !!feedData?.next?.cursor,
    
    // Actions
    fetchDiscoveryFeed,
    searchGigavibe,
    loadMore,
    refreshFeed,
    
    // Utilities
    getCastMetrics,
    extractMusicEmbeds,
    isGigavibeRelated,
    
    // Computed
    isAuthenticated,
    currentUser: user,
    castCount: feedData?.casts.length || 0
  };
}
