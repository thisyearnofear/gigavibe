'use client';

import React from 'react';

interface DiscoveryFeedProps {
  initialFeedType?: string;
}

export default function DiscoveryFeed({ initialFeedType = "foryou" }: DiscoveryFeedProps) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🎵</div>
        <h2 className="text-2xl font-bold mb-4">Discovery Feed</h2>
        <p className="text-gray-400">Coming soon with enhanced challenge integration!</p>
        <p className="text-xs text-gray-500 mt-2">Feed type: {initialFeedType}</p>
      </div>
    </div>
  );
}