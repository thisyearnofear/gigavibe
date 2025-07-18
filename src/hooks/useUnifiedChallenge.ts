/**
 * Unified Challenge Hook
 * Consolidates all challenge-related state management following DRY principles
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  Challenge, 
  ChallengeResult, 
  ChallengeProgress, 
  ChallengeFlowStep,
  UseChallengeReturn,
  UseChallengeDiscoveryReturn,
  ChallengeFilters 
} from '@/types/challenge.types';
import { challengeService } from '@/services/ChallengeService';
import { useFarcasterIntegration } from './useFarcasterIntegration';

/**
 * Main challenge hook for managing active challenge state
 */
export function useUnifiedChallenge(): UseChallengeReturn {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { sharePerformance } = useFarcasterIntegration();

  const startChallenge = useCallback((challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setProgress({
      currentStep: 'preview',
      startTime: new Date(),
      recordingTime: 0,
      isRecording: false,
      hasRecording: false
    });
    setError(null);
  }, []);

  const updateProgress = useCallback((updates: Partial<ChallengeProgress>) => {
    setProgress(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const completeChallenge = useCallback(async (result: ChallengeResult) => {
    if (!currentChallenge) return;

    setIsLoading(true);
    try {
      // Submit to backend
      await challengeService.submitChallengeResult(result);
      
      // Share to Farcaster if requested
      if (result.castHash) {
        await sharePerformance({
          challengeId: result.challengeId,
          challengeTitle: result.challengeTitle,
          selfRating: result.selfRating,
          communityRating: result.communityRating || 0,
          audioUrl: result.audioUrl,
          gap: Math.abs(result.selfRating - (result.communityRating || 0))
        });
      }

      // Update progress to complete
      setProgress(prev => prev ? { ...prev, currentStep: 'complete' } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete challenge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentChallenge, sharePerformance]);

  const cancelChallenge = useCallback(() => {
    setCurrentChallenge(null);
    setProgress(null);
    setError(null);
  }, []);

  const isActive = Boolean(currentChallenge && progress && progress.currentStep !== 'complete');

  return {
    currentChallenge,
    progress,
    startChallenge,
    completeChallenge,
    cancelChallenge,
    updateProgress,
    isActive,
    isLoading,
    error
  };
}

/**
 * Challenge discovery hook for browsing and searching challenges
 */
export function useChallengeDiscovery(
  initialFilters?: ChallengeFilters
): UseChallengeDiscoveryReturn {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [featuredChallenges, setFeaturedChallenges] = useState<Challenge[]>([]);
  const [trendingChallenges, setTrendingChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChallenges = useCallback(async (filters?: ChallengeFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const [allChallenges, featured, trending] = await Promise.all([
        challengeService.getChallenges(filters),
        challengeService.getFeaturedChallenges(5),
        challengeService.getTrendingChallenges(5)
      ]);

      setChallenges(allChallenges);
      setFeaturedChallenges(featured);
      setTrendingChallenges(trending);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshChallenges = useCallback(async () => {
    challengeService.clearCache();
    await loadChallenges(initialFilters);
  }, [loadChallenges, initialFilters]);

  const searchChallenges = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await challengeService.searchChallenges(query);
      setChallenges(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadChallenges(initialFilters);
  }, [loadChallenges, initialFilters]);

  return {
    challenges,
    featuredChallenges,
    trendingChallenges,
    loading,
    error,
    refreshChallenges,
    searchChallenges
  };
}

/**
 * Challenge statistics hook
 */
export function useChallengeStats(challengeId?: string) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const challengeStats = await challengeService.getChallengeStats(challengeId);
      setStats(challengeStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refreshStats: loadStats };
}

/**
 * Challenge flow step management hook
 */
export function useChallengeFlow(initialStep: ChallengeFlowStep = 'preview') {
  const [currentStep, setCurrentStep] = useState<ChallengeFlowStep>(initialStep);
  const [stepHistory, setStepHistory] = useState<ChallengeFlowStep[]>([initialStep]);

  const goToStep = useCallback((step: ChallengeFlowStep) => {
    setCurrentStep(step);
    setStepHistory(prev => [...prev, step]);
  }, []);

  const goBack = useCallback(() => {
    if (stepHistory.length > 1) {
      const newHistory = stepHistory.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      setCurrentStep(previousStep);
      setStepHistory(newHistory);
    }
  }, [stepHistory]);

  const resetFlow = useCallback((step: ChallengeFlowStep = 'preview') => {
    setCurrentStep(step);
    setStepHistory([step]);
  }, []);

  const getStepProgress = useCallback(() => {
    const steps: ChallengeFlowStep[] = ['preview', 'prepare', 'countdown', 'recording', 'playback', 'rating', 'sharing'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  }, [currentStep]);

  const canGoBack = stepHistory.length > 1;
  const isFirstStep = currentStep === 'preview';
  const isLastStep = currentStep === 'sharing' || currentStep === 'complete';

  return {
    currentStep,
    stepHistory,
    goToStep,
    goBack,
    resetFlow,
    getStepProgress,
    canGoBack,
    isFirstStep,
    isLastStep
  };
}