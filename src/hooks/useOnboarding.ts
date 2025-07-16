'use client';

import { useState, useEffect } from 'react';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  hasConnectedFarcaster: boolean;
  hasCompletedFirstChallenge: boolean;
  hasVotedOnPerformance: boolean;
  hasSharedPerformance: boolean;
  lastOnboardingStep: number;
}

const STORAGE_KEY = 'gigavibe_onboarding_state';
const ONBOARDING_VERSION = '1.0';

const defaultState: OnboardingState = {
  hasCompletedOnboarding: false,
  hasConnectedFarcaster: false,
  hasCompletedFirstChallenge: false,
  hasVotedOnPerformance: false,
  hasSharedPerformance: false,
  lastOnboardingStep: 0,
};

export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useFarcasterAuth();

  // Load onboarding state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if we need to reset due to version change
        if (parsed.version === ONBOARDING_VERSION) {
          setOnboardingState({ ...defaultState, ...parsed.state });
        } else {
          // Version mismatch, reset onboarding
          console.log('Onboarding version mismatch, resetting...');
          setOnboardingState(defaultState);
        }
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
      setOnboardingState(defaultState);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update Farcaster connection status
  useEffect(() => {
    if (isAuthenticated && !onboardingState.hasConnectedFarcaster) {
      updateOnboardingState({ hasConnectedFarcaster: true });
    }
  }, [isAuthenticated, onboardingState.hasConnectedFarcaster]);

  // Save onboarding state to localStorage
  const saveOnboardingState = (state: OnboardingState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: ONBOARDING_VERSION,
        state,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  // Update specific onboarding state
  const updateOnboardingState = (updates: Partial<OnboardingState>) => {
    const newState = { ...onboardingState, ...updates };
    setOnboardingState(newState);
    saveOnboardingState(newState);
  };

  // Mark onboarding as complete
  const completeOnboarding = () => {
    updateOnboardingState({ 
      hasCompletedOnboarding: true,
      lastOnboardingStep: 999 // Max step to indicate completion
    });
  };

  // Reset onboarding (for testing or user request)
  const resetOnboarding = () => {
    setOnboardingState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Check if user should see onboarding
  const shouldShowOnboarding = () => {
    return !onboardingState.hasCompletedOnboarding && !isLoading;
  };

  // Mark specific milestones
  const markFirstChallengeComplete = () => {
    updateOnboardingState({ hasCompletedFirstChallenge: true });
  };

  const markFirstVoteComplete = () => {
    updateOnboardingState({ hasVotedOnPerformance: true });
  };

  const markFirstShareComplete = () => {
    updateOnboardingState({ hasSharedPerformance: true });
  };

  // Get onboarding progress percentage
  const getOnboardingProgress = () => {
    const milestones = [
      onboardingState.hasConnectedFarcaster,
      onboardingState.hasCompletedFirstChallenge,
      onboardingState.hasVotedOnPerformance,
      onboardingState.hasSharedPerformance,
    ];
    
    const completed = milestones.filter(Boolean).length;
    return Math.round((completed / milestones.length) * 100);
  };

  // Get next suggested action
  const getNextAction = () => {
    if (!onboardingState.hasConnectedFarcaster) {
      return {
        action: 'connect_farcaster',
        title: 'Connect Farcaster',
        description: 'Connect your account to share and vote',
        priority: 'high' as const,
      };
    }
    
    if (!onboardingState.hasCompletedFirstChallenge) {
      return {
        action: 'first_challenge',
        title: 'Try Your First Challenge',
        description: 'Record a performance and get community feedback',
        priority: 'high' as const,
      };
    }
    
    if (!onboardingState.hasVotedOnPerformance) {
      return {
        action: 'first_vote',
        title: 'Judge a Performance',
        description: 'Help create reality checks for other users',
        priority: 'medium' as const,
      };
    }
    
    if (!onboardingState.hasSharedPerformance) {
      return {
        action: 'first_share',
        title: 'Share Your Results',
        description: 'Share your reality check moment to Farcaster',
        priority: 'low' as const,
      };
    }
    
    return null;
  };

  // Check if user is a returning user (has some progress but not complete)
  const isReturningUser = () => {
    return !onboardingState.hasCompletedOnboarding && (
      onboardingState.hasConnectedFarcaster ||
      onboardingState.hasCompletedFirstChallenge ||
      onboardingState.hasVotedOnPerformance ||
      onboardingState.hasSharedPerformance
    );
  };

  return {
    // State
    onboardingState,
    isLoading,
    
    // Computed
    shouldShowOnboarding: shouldShowOnboarding(),
    isReturningUser: isReturningUser(),
    progress: getOnboardingProgress(),
    nextAction: getNextAction(),
    
    // Actions
    completeOnboarding,
    resetOnboarding,
    updateOnboardingState,
    
    // Milestone tracking
    markFirstChallengeComplete,
    markFirstVoteComplete,
    markFirstShareComplete,
  };
}

// Hook for tracking onboarding analytics
export function useOnboardingAnalytics() {
  const trackOnboardingEvent = (event: string, properties?: Record<string, any>) => {
    // This would integrate with your analytics service
    console.log('Onboarding Event:', event, properties);
    
    // Example: Send to analytics API
    // fetch('/api/analytics/track', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     event: `onboarding_${event}`,
    //     properties: {
    //       timestamp: Date.now(),
    //       ...properties,
    //     },
    //   }),
    // });
  };

  return {
    trackOnboardingEvent,
  };
}