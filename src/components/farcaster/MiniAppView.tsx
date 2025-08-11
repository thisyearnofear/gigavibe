"use client";

import React from 'react';
import { useFarcasterIntegration } from '@/hooks/useFarcasterIntegration';
import UnifiedChallengeFlow from '@/components/UnifiedChallengeFlow';
import DiscoveryFeed from '@/components/discovery/DiscoveryFeed';
import { FullScreenLoading } from '@/components/ui/loading';

export default function MiniAppView() {
  const { isMiniApp, miniAppContext } = useFarcasterIntegration();

  if (!isMiniApp) {
    // This component should only be rendered in a mini app context
    return null;
  }

  // Example of context-based rendering
  // You would parse the miniAppContext.embedContext to determine what to show
  const renderContent = () => {
    if (!miniAppContext.embedContext) {
      // Default view if no context is provided
      return <DiscoveryFeed initialFeedType="foryou" />;
    }

    try {
      const context = JSON.parse(miniAppContext.embedContext);

      if (context.challengeId) {
        // Show a specific challenge
        return <UnifiedChallengeFlow initialChallenge={context.challengeId} />;
      }

      if (context.performanceId) {
        // Show a specific performance in the feed
        // This would require a way to focus on a specific item in DiscoveryFeed
        return <DiscoveryFeed initialFeedType="foryou" />;
      }

    } catch (error) {
      console.error("Failed to parse mini app context:", error);
      // Fallback to default view
      return <DiscoveryFeed initialFeedType="foryou" />;
    }

    return <DiscoveryFeed initialFeedType="foryou" />;
  };

  return (
    <div className="min-h-screen bg-gigavibe-mesh">
      {/* Simplified header for mini app */}
      <div className="p-4 text-center text-white bg-black/20">
        <h1 className="text-lg font-bold">GIGAVIBE Mini</h1>
      </div>
      {renderContent()}
    </div>
  );
}