"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface CastContext {
  highlightCast?: string;
  focusCast?: string;
  trackCast?: string;
  channelFocus?: string;
  showSuccessMessage?: boolean;
  showRatingReveal?: boolean;
}

interface TabContext {
  discovery?: CastContext;
  judging?: CastContext;
  market?: CastContext;
  challenge?: CastContext;
}

interface CrossTabContextType {
  tabContext: TabContext;
  setTabContext: (context: TabContext) => void;
  navigateWithContext: (tab: string, context: CastContext) => void;
  clearTabContext: (tab: string) => void;
  
  // User performance tracking
  userPerformances: string[];
  addUserPerformance: (castHash: string) => void;
  
  // Voting progress
  votingProgress: number;
  updateVotingProgress: (increment?: number) => void;
  resetVotingProgress: () => void;
}

const CrossTabContext = createContext<CrossTabContextType | undefined>(undefined);

export function CrossTabProvider({ children }: { children: React.ReactNode }) {
  const [tabContext, setTabContext] = useState<TabContext>({});
  const [userPerformances, setUserPerformances] = useState<string[]>([]);
  const [votingProgress, setVotingProgress] = useState(0);

  const navigateWithContext = useCallback((tab: string, context: CastContext) => {
    setTabContext(prev => ({
      ...prev,
      [tab]: { ...prev[tab], ...context }
    }));
    
    // Trigger navigation event for MainNavigation to listen to
    window.dispatchEvent(new CustomEvent('gigavibe-navigate', {
      detail: { tab, context }
    }));
  }, []);

  const clearTabContext = useCallback((tab: string) => {
    setTabContext(prev => {
      const newContext = { ...prev };
      delete newContext[tab];
      return newContext;
    });
  }, []);

  const addUserPerformance = useCallback((castHash: string) => {
    setUserPerformances(prev => {
      if (!prev.includes(castHash)) {
        return [...prev, castHash];
      }
      return prev;
    });
  }, []);

  const updateVotingProgress = useCallback((increment: number = 1) => {
    setVotingProgress(prev => prev + increment);
  }, []);

  const resetVotingProgress = useCallback(() => {
    setVotingProgress(0);
  }, []);

  const value = {
    tabContext,
    setTabContext,
    navigateWithContext,
    clearTabContext,
    userPerformances,
    addUserPerformance,
    votingProgress,
    updateVotingProgress,
    resetVotingProgress
  };

  return (
    <CrossTabContext.Provider value={value}>
      {children}
    </CrossTabContext.Provider>
  );
}

export function useCrossTab() {
  const context = useContext(CrossTabContext);
  if (context === undefined) {
    throw new Error('useCrossTab must be used within a CrossTabProvider');
  }
  return context;
}

// Hook for specific tab context
export function useTabContext(tab: string) {
  const { tabContext, clearTabContext } = useCrossTab();
  
  const context = tabContext[tab] || {};
  
  const clearContext = useCallback(() => {
    clearTabContext(tab);
  }, [tab, clearTabContext]);
  
  return { context, clearContext };
}