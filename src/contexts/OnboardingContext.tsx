'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFarcasterAuth } from './FarcasterAuthContext';

// Onboarding step definitions
export type OnboardingStep = 
  | 'welcome'
  | 'feature-tour'
  | 'first-challenge'
  | 'first-vote'
  | 'discovery-intro'
  | 'market-intro'
  | 'completed';

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isOnboardingActive: boolean;
  hasCompletedOnboarding: boolean;
  skipOnboarding: boolean;
}

export interface OnboardingContextType extends OnboardingProgress {
  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  skipToEnd: () => void;
  
  // State management
  markStepCompleted: (step: OnboardingStep) => void;
  resetOnboarding: () => void;
  
  // Helpers
  isStepCompleted: (step: OnboardingStep) => boolean;
  canAccessStep: (step: OnboardingStep) => boolean;
  getNextStep: () => OnboardingStep | null;
  getPreviousStep: () => OnboardingStep | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Step flow configuration
const ONBOARDING_FLOW: OnboardingStep[] = [
  'welcome',
  'feature-tour',
  'first-challenge',
  'first-vote',
  'discovery-intro',
  'market-intro',
  'completed'
];

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_PROGRESS: 'gigavibe_onboarding_progress',
  ONBOARDING_COMPLETED: 'gigavibe_onboarding_completed',
  SKIP_ONBOARDING: 'gigavibe_skip_onboarding'
};

// Default state
const DEFAULT_PROGRESS: OnboardingProgress = {
  currentStep: 'welcome',
  completedSteps: [],
  isOnboardingActive: false,
  hasCompletedOnboarding: false,
  skipOnboarding: false
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<OnboardingProgress>(DEFAULT_PROGRESS);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, user } = useFarcasterAuth();

  // Initialize onboarding state from storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedProgress = localStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
      const hasCompleted = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
      const shouldSkip = localStorage.getItem(STORAGE_KEYS.SKIP_ONBOARDING) === 'true';

      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgress({
          ...parsed,
          hasCompletedOnboarding: hasCompleted,
          skipOnboarding: shouldSkip,
          isOnboardingActive: !hasCompleted && !shouldSkip && isAuthenticated
        });
      } else if (isAuthenticated && !hasCompleted && !shouldSkip) {
        // First time user - start onboarding
        setProgress({
          ...DEFAULT_PROGRESS,
          isOnboardingActive: true
        });
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
      setProgress(DEFAULT_PROGRESS);
    }

    setIsInitialized(true);
  }, [isAuthenticated]);

  // Save progress to storage
  const saveProgress = (newProgress: OnboardingProgress) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_PROGRESS, JSON.stringify(newProgress));
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, newProgress.hasCompletedOnboarding.toString());
      localStorage.setItem(STORAGE_KEYS.SKIP_ONBOARDING, newProgress.skipOnboarding.toString());
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  };

  // Navigation helpers
  const getStepIndex = (step: OnboardingStep): number => ONBOARDING_FLOW.indexOf(step);
  
  const getNextStep = (): OnboardingStep | null => {
    const currentIndex = getStepIndex(progress.currentStep);
    return currentIndex < ONBOARDING_FLOW.length - 1 ? ONBOARDING_FLOW[currentIndex + 1] : null;
  };

  const getPreviousStep = (): OnboardingStep | null => {
    const currentIndex = getStepIndex(progress.currentStep);
    return currentIndex > 0 ? ONBOARDING_FLOW[currentIndex - 1] : null;
  };

  // Step management
  const goToStep = (step: OnboardingStep) => {
    const newProgress = {
      ...progress,
      currentStep: step,
      isOnboardingActive: step !== 'completed'
    };

    if (step === 'completed') {
      newProgress.hasCompletedOnboarding = true;
      newProgress.isOnboardingActive = false;
    }

    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const nextStep = () => {
    const next = getNextStep();
    if (next) {
      // Mark current step as completed
      markStepCompleted(progress.currentStep);
      goToStep(next);
    }
  };

  const previousStep = () => {
    const previous = getPreviousStep();
    if (previous) {
      goToStep(previous);
    }
  };

  const markStepCompleted = (step: OnboardingStep) => {
    if (progress.completedSteps.includes(step)) return;

    const newProgress = {
      ...progress,
      completedSteps: [...progress.completedSteps, step]
    };

    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const skipToEnd = () => {
    const newProgress = {
      ...progress,
      currentStep: 'completed' as OnboardingStep,
      isOnboardingActive: false,
      skipOnboarding: true
    };

    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const resetOnboarding = () => {
    const newProgress = {
      ...DEFAULT_PROGRESS,
      isOnboardingActive: isAuthenticated
    };

    setProgress(newProgress);
    saveProgress(newProgress);
    
    // Clear storage
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.SKIP_ONBOARDING);
  };

  // Helper functions
  const isStepCompleted = (step: OnboardingStep): boolean => {
    return progress.completedSteps.includes(step);
  };

  const canAccessStep = (step: OnboardingStep): boolean => {
    const stepIndex = getStepIndex(step);
    const currentIndex = getStepIndex(progress.currentStep);
    
    // Can access current step, completed steps, or next step
    return stepIndex <= currentIndex + 1 || isStepCompleted(step);
  };

  const value: OnboardingContextType = {
    // State
    ...progress,
    
    // Navigation
    nextStep,
    previousStep,
    goToStep,
    skipToEnd,
    
    // State management
    markStepCompleted,
    resetOnboarding,
    
    // Helpers
    isStepCompleted,
    canAccessStep,
    getNextStep,
    getPreviousStep
  };

  // Don't render until initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// Optional hook that doesn't throw
export function useOnboardingOptional() {
  const context = useContext(OnboardingContext);
  return context;
}