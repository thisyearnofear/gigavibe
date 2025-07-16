'use client';

import { useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';

/**
 * Custom hook for managing onboarding flow logic
 * Provides high-level actions and computed state
 */
export function useOnboardingFlow() {
  const onboarding = useOnboarding();
  const { isAuthenticated } = useFarcasterAuth();

  // Check if user should see onboarding
  const shouldShowOnboarding = useCallback(() => {
    return (
      isAuthenticated && 
      onboarding.isOnboardingActive && 
      !onboarding.hasCompletedOnboarding &&
      !onboarding.skipOnboarding
    );
  }, [isAuthenticated, onboarding.isOnboardingActive, onboarding.hasCompletedOnboarding, onboarding.skipOnboarding]);

  // Start onboarding for new users
  const startOnboarding = useCallback(() => {
    if (isAuthenticated) {
      onboarding.resetOnboarding();
    }
  }, [isAuthenticated, onboarding]);

  // Complete onboarding and transition to main app
  const completeOnboarding = useCallback(() => {
    onboarding.goToStep('completed');
    // Add any additional completion logic here
    console.log('🎉 Onboarding completed successfully!');
  }, [onboarding]);

  // Skip onboarding entirely
  const skipOnboarding = useCallback(() => {
    onboarding.skipToEnd();
    console.log('⏭️ Onboarding skipped');
  }, [onboarding]);

  // Get progress information
  const getProgressInfo = useCallback(() => {
    const totalSteps = 6; // welcome, feature-tour, first-challenge, first-vote, discovery-intro, market-intro
    const currentStepIndex = ['welcome', 'feature-tour', 'first-challenge', 'first-vote', 'discovery-intro', 'market-intro'].indexOf(onboarding.currentStep);
    const progressPercentage = currentStepIndex >= 0 ? (currentStepIndex / totalSteps) * 100 : 0;
    
    return {
      currentStepIndex: Math.max(0, currentStepIndex),
      totalSteps,
      progressPercentage,
      completedStepsCount: onboarding.completedSteps.length
    };
  }, [onboarding.currentStep, onboarding.completedSteps]);

  // Check if specific features should be unlocked
  const getFeatureAccess = useCallback(() => {
    const hasCompletedChallenge = onboarding.isStepCompleted('first-challenge');
    const hasCompletedVoting = onboarding.isStepCompleted('first-vote');
    
    return {
      canRecord: true, // Always available
      canJudge: hasCompletedChallenge, // Unlock after first challenge
      canExploreDiscovery: hasCompletedVoting, // Unlock after first vote
      canAccessMarket: onboarding.hasCompletedOnboarding, // Unlock after completion
      showAdvancedFeatures: onboarding.hasCompletedOnboarding
    };
  }, [onboarding]);

  return {
    // State
    ...onboarding,
    shouldShowOnboarding: shouldShowOnboarding(),
    progressInfo: getProgressInfo(),
    featureAccess: getFeatureAccess(),
    
    // Actions
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    
    // Utilities
    isNewUser: !onboarding.hasCompletedOnboarding && onboarding.completedSteps.length === 0
  };
}