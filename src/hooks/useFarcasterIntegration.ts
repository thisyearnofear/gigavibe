'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';
import { useFarcasterData } from '@/hooks/useFarcasterData';
// No direct Neynar SDK imports needed - using API routes

interface UserInfo {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface ChallengeResult {
  challengeId: string;
  challengeTitle: string;
  userScore: number;
  selfRating: number;
  communityRating: number;
}

export function useFarcasterIntegration() {
  const { user, isAuthenticated, signerUuid } = useFarcasterAuth();
  const { uploadPerformance } = useFarcasterData();
  
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [isFrameAdded, setIsFrameAdded] = useState(false);
  
  // User info derived from auth context
  const userInfo: UserInfo = user ? {
    fid: user.fid,
    username: user.username,
    displayName: user.display_name,
    pfpUrl: user.pfp_url
  } : {};

  // Check if frame has been added
  useEffect(() => {
    if (isAuthenticated && user) {
      const checkFrameStatus = async () => {
        try {
          // Call API to check if the user has added the frame
          const response = await fetch(`/api/farcaster/frame-status?fid=${user.fid}`);
          const data = await response.json();
          
          setIsFrameAdded(data.isAdded);
          setIsFrameReady(true);
        } catch (error) {
          console.error('Failed to check frame status:', error);
          setIsFrameReady(true); // Still set to ready so user can add
        }
      };
      
      checkFrameStatus();
    }
  }, [isAuthenticated, user]);

  // Add the Gigavibe frame to user's Farcaster profile
  const addGigavibeFrame = useCallback(async (): Promise<boolean> => {
    try {
      if (!isAuthenticated || !signerUuid || !user?.fid) {
        throw new Error('Not authenticated with Farcaster');
      }
      
      // Call API to add frame
      const response = await fetch('/api/farcaster/add-frame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signerUuid,
          fid: user.fid
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to add frame: ${error}`);
      }
      
      const result = await response.json();
      setIsFrameAdded(result.success);
      return result.success;
    } catch (error) {
      console.error('Failed to add Gigavibe frame:', error);
      return false;
    }
  }, [isAuthenticated, signerUuid, user]);

  // Share challenge result to Farcaster
  const shareChallengeResult = useCallback(async (result: ChallengeResult): Promise<boolean> => {
    try {
      if (!isAuthenticated || !signerUuid) {
        console.warn('Cannot share result: Not authenticated with Farcaster');
        return false;
      }
      
      const castText = `🎤 Reality Check: "${result.challengeTitle}"
I thought ${result.selfRating}⭐... Community rated me ${result.communityRating}⭐!
${Math.abs(result.selfRating - result.communityRating) > 1 ? 'My reality was checked! 😅' : 'Pretty accurate self-assessment! 🎯'}

#GigaVibe #RealityCheck`;
      
      // Create a cast via API
      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signerUuid,
          text: castText,
          challengeId: result.challengeId
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create cast: ${error}`);
      }
      
      const castResult = await response.json();
      return castResult.success;
    } catch (error) {
      console.error('Failed to share challenge result:', error);
      return false;
    }
  }, [isAuthenticated, signerUuid]);

  // Notify about a new challenge
  const notifyNewChallenge = useCallback(async (challengeTitle: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !signerUuid) {
        console.warn('Cannot notify: Not authenticated with Farcaster');
        return false;
      }
      
      const castText = `🎵 New vocal challenge on GIGAVIBE: "${challengeTitle}"!
Join me and test your skills! 🎤

#GigaVibe #VocalChallenge`;
      
      // Create a cast via API
      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signerUuid,
          text: castText,
          isChallengeNotification: true,
          challengeTitle
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create cast: ${error}`);
      }
      
      const castResult = await response.json();
      return castResult.success;
    } catch (error) {
      console.error('Failed to notify about new challenge:', error);
      return false;
    }
  }, [isAuthenticated, signerUuid]);

  // View user profile on Farcaster
  const viewProfile = useCallback(() => {
    if (user?.fid) {
      const profileUrl = `https://warpcast.com/${user.username}`;
      window.open(profileUrl, '_blank');
    }
  }, [user]);

  // Like a performance on Farcaster
  const likePerformance = useCallback(async (performanceId: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !signerUuid) {
        console.warn('Cannot like: Not authenticated with Farcaster');
        return false;
      }
      
      console.log(`Liking performance ${performanceId} on Farcaster`);
      
      // Send like action to Farcaster via our API
      const response = await fetch('/api/discovery/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId,
          signerUuid,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Performance liked successfully on Farcaster');
      return result.success;
    } catch (error) {
      console.error('Failed to like performance:', error);
      return false;
    }
  }, [isAuthenticated, signerUuid]);

  // Comment on a performance on Farcaster
  const commentOnPerformance = useCallback(async (performanceId: string, comment?: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !signerUuid) {
        console.warn('Cannot comment: Not authenticated with Farcaster');
        return false;
      }
      
      if (!comment) {
        // If no comment provided, we can open a dialog in the UI
        console.log(`Opening comment interface for performance ${performanceId}`);
        // This would trigger a UI component to open
        return true;
      }
      
      // Otherwise post the comment directly
      const response = await fetch('/api/discovery/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId,
          signerUuid,
          comment,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Comment posted successfully on Farcaster');
      return result.success;
    } catch (error) {
      console.error('Failed to comment on performance:', error);
      return false;
    }
  }, [isAuthenticated, signerUuid]);

  return {
    // State
    userInfo,
    isFrameReady,
    isFrameAdded,
    signerUuid,
    
    // Actions
    addGigavibeFrame,
    shareChallengeResult,
    notifyNewChallenge,
    viewProfile,
    likePerformance,
    commentOnPerformance
  };
}