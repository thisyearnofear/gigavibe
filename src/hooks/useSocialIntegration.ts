'use client';

import { useState, useCallback } from 'react';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { 
  SocialShareOptions, 
  PerformanceMetadata, 
  UploadResult 
} from '@/types/performance.types';

interface UseSocialIntegrationReturn {
  // State
  isSharing: boolean;
  shareError: string | null;
  shareSuccess: boolean;
  
  // Capabilities
  canShare: boolean;
  canPost: boolean;
  
  // Actions
  shareToFarcaster: (result: UploadResult, options?: Partial<SocialShareOptions>) => Promise<boolean>;
  generateShareMessage: (metadata: PerformanceMetadata) => string;
  clearShareState: () => void;
}

export function useSocialIntegration(): UseSocialIntegrationReturn {
  const { canPost, user: farcasterUser, signerUuid, signIn } = useFarcasterAuth();
  const { isAuthenticated, authMethod } = useUnifiedAuth();
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  const canShare = isAuthenticated && canPost && !!farcasterUser;

  const generateShareMessage = useCallback((metadata: PerformanceMetadata): string => {
    const { challengeTitle, selfRating, accuracy, challengeDifficulty } = metadata;
    
    const emoji = selfRating >= 4 ? '🎤✨' : selfRating >= 3 ? '🎵' : '🎶';
    const performanceText = accuracy >= 80 ? 'crushed' : accuracy >= 60 ? 'tackled' : 'attempted';
    
    return `Just ${performanceText} the "${challengeTitle}" challenge! ${emoji}\n\nSelf-rating: ${'⭐'.repeat(selfRating)}\nDifficulty: ${challengeDifficulty}\n\nThink you can do better? Try it at gigavibe.app! 🚀`;
  }, []);

  const shareToFarcaster = useCallback(async (
    result: UploadResult, 
    options: Partial<SocialShareOptions> = {}
  ): Promise<boolean> => {
    if (!canShare) {
      setShareError('Cannot share - please ensure you are signed in with Farcaster');
      return false;
    }

    setIsSharing(true);
    setShareError(null);
    setShareSuccess(false);

    try {
      const defaultOptions: SocialShareOptions = {
        platform: 'farcaster',
        message: generateShareMessage(result.metadata),
        includeAudio: true,
        includeChallenge: true,
        tags: ['gigavibe', 'vocalchallenge']
      };

      const shareOptions = { ...defaultOptions, ...options };
      
      // Create the cast content
      const castContent = {
        text: shareOptions.message,
        embeds: [] as string[]
      };

      // Add performance URL if available
      if (result.url && shareOptions.includeAudio) {
        castContent.embeds.push(result.url);
      }

      // Add challenge URL if requested
      if (shareOptions.includeChallenge) {
        const challengeUrl = `https://gigavibe.app/challenge/${result.metadata.challengeId}`;
        castContent.embeds.push(challengeUrl);
      }

      // Make the cast via existing API endpoint
      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publishCast',
          signerUuid: signerUuid,
          text: castContent.text,
          embeds: castContent.embeds,
          // Optional: Add to gigavibe channel if it exists
          channelId: 'gigavibe'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share to Farcaster');
      }

      const castData = await response.json();
      
      console.log('✅ Successfully shared to Farcaster:', {
        castHash: castData.hash,
        recordingId: result.recordingId,
        challengeId: result.metadata.challengeId,
        selfRating: result.metadata.selfRating,
        accuracy: result.metadata.accuracy
      });

      setShareSuccess(true);
      
      // Auto-clear success state after 3 seconds
      setTimeout(() => setShareSuccess(false), 3000);
      
      return true;

    } catch (error) {
      console.error('❌ Failed to share to Farcaster:', error);
      setShareError(error instanceof Error ? error.message : 'Failed to share');
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [canShare, farcasterUser, generateShareMessage]);

  const clearShareState = useCallback(() => {
    setShareError(null);
    setShareSuccess(false);
  }, []);

  return {
    // State
    isSharing,
    shareError,
    shareSuccess,
    
    // Capabilities
    canShare,
    canPost,
    
    // Actions
    shareToFarcaster,
    generateShareMessage,
    clearShareState
  };
}