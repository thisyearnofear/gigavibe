'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';
import { useFarcasterData } from '@/hooks/useFarcasterData';

interface UserInfo {
  fid?: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  bio?: { text: string };
  follower_count?: number;
  following_count?: number;
}

interface MiniAppContext {
  isMiniApp: boolean;
  parentUrl?: string;
  embedContext?: string;
}

interface FrameGenerationOptions {
  title: string;
  description: string;
  imageUrl?: string;
  buttons?: Array<{
    label: string;
    action: 'post' | 'link' | 'mint';
    target?: string;
  }>;
}

interface UseFarcasterIntegrationReturn {
  // Existing functionality
  userInfo: UserInfo | null;
  signerUuid: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // NEW: Mini app detection
  miniAppContext: MiniAppContext;
  isMiniApp: boolean;
  
  // Enhanced actions
  sharePerformance: (performanceData: any) => Promise<void>;
  notifyNewChallenge: (challengeData: any) => Promise<void>;
  addGigavibeFrame: (frameData: any) => Promise<void>;
  
  // NEW: Frame generation
  generatePerformanceFrame: (performanceData: any, options?: FrameGenerationOptions) => Promise<string>;
  generateChallengeFrame: (challengeData: any, options?: FrameGenerationOptions) => Promise<string>;
  
  // Social actions
  likePerformance: (performanceId: string) => Promise<void>;
  commentOnPerformance: (performanceId: string, comment: string) => Promise<void>;
  viewProfile: (fid: number) => void;
  
  // Utility functions
  shareChallengeResult: (challengeId: string, result: any) => Promise<void>;
}

export function useFarcasterIntegration(): UseFarcasterIntegrationReturn {
  const { user, signerUuid, isAuthenticated } = useFarcasterAuth();
  const { loading, error } = useFarcasterData();
  
  // Mini app detection state
  const [miniAppContext, setMiniAppContext] = useState<MiniAppContext>({
    isMiniApp: false
  });

  // Detect if we're running in a Farcaster mini app context
  useEffect(() => {
    const detectMiniAppContext = () => {
      // Check for Farcaster-specific window properties
      const isMiniApp = !!(
        typeof window !== 'undefined' && (
          window.parent !== window || // Running in iframe
          (window as any).farcaster || // Farcaster SDK available
          document.referrer.includes('farcaster') || // Referred from Farcaster
          window.location.search.includes('fc_frame') // Frame parameter
        )
      );

      const parentUrl = document.referrer || undefined;
      const embedContext = new URLSearchParams(window.location.search).get('fc_frame') || undefined;

      setMiniAppContext({
        isMiniApp,
        parentUrl,
        embedContext
      });
    };

    detectMiniAppContext();
  }, []);

  // Enhanced share performance with frame generation
  const sharePerformance = useCallback(async (performanceData: any) => {
    try {
      const frameUrl = await generatePerformanceFrame(performanceData);
      
      const castText = `🎤 Just nailed this vocal challenge on @gigavibe! 
${performanceData.challengeTitle}
Self-rating: ${performanceData.selfRating}/5 ⭐
${performanceData.communityRating ? `Community: ${performanceData.communityRating}/5 🎯` : ''}

Check out my performance! 🎵`;

      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publishCast',
          signerUuid,
          text: castText,
          embeds: [{ url: frameUrl }],
          channelId: 'gigavibe'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to share performance');
      }
    } catch (error) {
      console.error('Error sharing performance:', error);
      throw error;
    }
  }, [signerUuid]);

  // Generate interactive frame for performance
  const generatePerformanceFrame = useCallback(async (
    performanceData: any, 
    options?: FrameGenerationOptions
  ): Promise<string> => {
    try {
      const response = await fetch('/api/farcaster/frames/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performanceData,
          options: {
            title: options?.title || `${performanceData.challengeTitle} Performance`,
            description: options?.description || `Vocal performance by ${user?.display_name || 'Anonymous'}`,
            buttons: options?.buttons || [
              { label: '🎵 Listen', action: 'post', target: 'play' },
              { label: '⭐ Rate', action: 'post', target: 'rate' },
              { label: '🎤 Try Challenge', action: 'link', target: `/challenge/${performanceData.challengeId}` }
            ],
            ...options
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate performance frame');
      }

      const { frameUrl } = await response.json();
      return frameUrl;
    } catch (error) {
      console.error('Error generating performance frame:', error);
      throw error;
    }
  }, [user]);

  // Generate interactive frame for challenge
  const generateChallengeFrame = useCallback(async (
    challengeData: any,
    options?: FrameGenerationOptions
  ): Promise<string> => {
    try {
      const response = await fetch('/api/farcaster/frames/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeData,
          options: {
            title: options?.title || `New Challenge: ${challengeData.title}`,
            description: options?.description || `Join the vocal challenge on GigaVibe!`,
            buttons: options?.buttons || [
              { label: '🎤 Accept Challenge', action: 'link', target: `/challenge/${challengeData.id}` },
              { label: '👀 View Leaderboard', action: 'post', target: 'leaderboard' },
              { label: '🎵 Preview Song', action: 'post', target: 'preview' }
            ],
            ...options
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate challenge frame');
      }

      const { frameUrl } = await response.json();
      return frameUrl;
    } catch (error) {
      console.error('Error generating challenge frame:', error);
      throw error;
    }
  }, []);

  // Notify about new challenge with enhanced frame
  const notifyNewChallenge = useCallback(async (challengeData: any) => {
    try {
      const frameUrl = await generateChallengeFrame(challengeData);
      
      const castText = `🎤 New vocal challenge is live on @gigavibe!

"${challengeData.title}"
${challengeData.description}

Who's ready to show off their vocals? 🎵✨`;

      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publishCast',
          signerUuid,
          text: castText,
          embeds: [{ url: frameUrl }],
          channelId: 'gigavibe'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to notify about new challenge');
      }
    } catch (error) {
      console.error('Error notifying about new challenge:', error);
      throw error;
    }
  }, [signerUuid, generateChallengeFrame]);

  // Add GigaVibe frame to existing cast
  const addGigavibeFrame = useCallback(async (frameData: any) => {
    try {
      const response = await fetch('/api/farcaster/frames/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameData,
          signerUuid
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add GigaVibe frame');
      }
    } catch (error) {
      console.error('Error adding GigaVibe frame:', error);
      throw error;
    }
  }, [signerUuid]);

  // Like a performance
  const likePerformance = useCallback(async (performanceId: string) => {
    try {
      const response = await fetch('/api/farcaster/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          performanceId,
          signerUuid
        })
      });

      if (!response.ok) {
        throw new Error('Failed to like performance');
      }
    } catch (error) {
      console.error('Error liking performance:', error);
      throw error;
    }
  }, [signerUuid]);

  // Comment on a performance
  const commentOnPerformance = useCallback(async (performanceId: string, comment: string) => {
    try {
      const response = await fetch('/api/farcaster/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performanceId,
          comment,
          signerUuid
        })
      });

      if (!response.ok) {
        throw new Error('Failed to comment on performance');
      }
    } catch (error) {
      console.error('Error commenting on performance:', error);
      throw error;
    }
  }, [signerUuid]);

  // View user profile
  const viewProfile = useCallback((fid: number) => {
    if (miniAppContext.isMiniApp) {
      // In mini app context, open profile in new tab
      window.open(`https://warpcast.com/~/profile/${fid}`, '_blank');
    } else {
      // In regular app, navigate to internal profile view
      window.location.href = `/profile/${fid}`;
    }
  }, [miniAppContext.isMiniApp]);

  // Share challenge result with enhanced presentation
  const shareChallengeResult = useCallback(async (challengeId: string, result: any) => {
    try {
      await sharePerformance({
        challengeId,
        challengeTitle: result.challengeTitle,
        selfRating: result.selfRating,
        communityRating: result.communityRating,
        audioUrl: result.audioUrl,
        gap: result.gap
      });
    } catch (error) {
      console.error('Error sharing challenge result:', error);
      throw error;
    }
  }, [sharePerformance]);

  return {
    // Existing functionality
    userInfo: user,
    signerUuid,
    isConnected: isAuthenticated,
    isLoading: loading,
    error,
    
    // NEW: Mini app context
    miniAppContext,
    isMiniApp: miniAppContext.isMiniApp,
    
    // Enhanced actions
    sharePerformance,
    notifyNewChallenge,
    addGigavibeFrame,
    
    // NEW: Frame generation
    generatePerformanceFrame,
    generateChallengeFrame,
    
    // Social actions
    likePerformance,
    commentOnPerformance,
    viewProfile,
    shareChallengeResult
  };
}