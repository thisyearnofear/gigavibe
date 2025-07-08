'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Share, Mic2, TrendingUp } from 'lucide-react';
import { RealityCheckResult } from '@/lib/zora/types';
import { CommunityOwnership } from '@/lib/community/CommunityOwnershipService';

interface PerformanceCardGeneratorProps {
  performance: RealityCheckResult;
  communityOwnership?: CommunityOwnership;
  showCommunityGrid?: boolean;
}

export default function PerformanceCardGenerator({
  performance,
  communityOwnership,
  showCommunityGrid = true
}: PerformanceCardGeneratorProps) {
  
  const getGapEmoji = (gap: number) => {
    if (gap >= 3) return '😅';
    if (gap >= 2) return '🤔';
    if (gap <= -2) return '😲';
    if (Math.abs(gap) <= 0.5) return '🎯';
    return '😐';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      comedy: 'from-orange-500 to-red-500',
      quality: 'from-blue-500 to-purple-500',
      legendary: 'from-purple-500 to-pink-500',
      diva: 'from-pink-500 to-rose-500',
      baritone: 'from-indigo-500 to-blue-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const renderCommunityGrid = () => {
    if (!communityOwnership || !showCommunityGrid) return null;

    const allContributors = [
      ...communityOwnership.allocations.voters.map(v => ({ ...v, type: 'voter' })),
      ...communityOwnership.allocations.coverArtists.map(c => ({ ...c, type: 'cover' })),
      ...communityOwnership.allocations.sharers.map(s => ({ ...s, type: 'sharer' }))
    ].slice(0, 12); // Show max 12 contributors

    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Community Contributors</span>
        </div>
        
        <div className="grid grid-cols-6 gap-1">
          {allContributors.map((contributor, index) => (
            <div
              key={`${contributor.address}-${index}`}
              className="relative"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {contributor.address.slice(2, 4).toUpperCase()}
              </div>
              
              {/* Contribution type indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gray-900 flex items-center justify-center">
                {contributor.type === 'voter' && <Star className="w-2 h-2 text-yellow-400" />}
                {contributor.type === 'cover' && <Mic2 className="w-2 h-2 text-blue-400" />}
                {contributor.type === 'sharer' && <Share className="w-2 h-2 text-green-400" />}
              </div>
            </div>
          ))}
          
          {communityOwnership.totalContributions > 12 && (
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-300">
              +{communityOwnership.totalContributions - 12}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOwnershipBreakdown = () => {
    if (!communityOwnership) return null;

    return (
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-400 mb-2">Ownership Breakdown</div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-300">Original Performer</span>
            <span className="text-xs font-semibold text-purple-400">
              {(communityOwnership.allocations.originalPerformer.percentage * 100).toFixed(0)}%
            </span>
          </div>
          
          {communityOwnership.allocations.voters.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300">
                Voters ({communityOwnership.allocations.voters.length})
              </span>
              <span className="text-xs font-semibold text-yellow-400">
                {(communityOwnership.allocations.voters.reduce((sum, v) => sum + v.percentage, 0) * 100).toFixed(0)}%
              </span>
            </div>
          )}
          
          {communityOwnership.allocations.coverArtists.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300">
                Cover Artists ({communityOwnership.allocations.coverArtists.length})
              </span>
              <span className="text-xs font-semibold text-blue-400">
                {(communityOwnership.allocations.coverArtists.reduce((sum, c) => sum + c.percentage, 0) * 100).toFixed(0)}%
              </span>
            </div>
          )}
          
          {communityOwnership.allocations.sharers.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300">
                Sharers ({communityOwnership.allocations.sharers.length})
              </span>
              <span className="text-xs font-semibold text-green-400">
                {(communityOwnership.allocations.sharers.reduce((sum, s) => sum + s.percentage, 0) * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 max-w-sm mx-auto"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-r ${getCategoryColor(performance.category)} p-4 relative`}>
        <div className="flex items-center gap-3">
          {/* Performer Avatar */}
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {performance.userAddress.slice(2, 4).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{performance.challengeTitle}</h3>
            <p className="text-white/80 text-sm">Anonymous Singer</p>
          </div>
          
          {/* Category Badge */}
          <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
            <span className="text-white text-xs font-semibold uppercase">
              {performance.category}
            </span>
          </div>
        </div>
        
        {/* Coin Status */}
        {communityOwnership?.eligibleForCoin && (
          <div className="absolute top-2 right-2">
            <div className="bg-green-500 rounded-full p-1">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Reality Check Display */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <div className="text-center">
            <div className="text-3xl mb-2">{getGapEmoji(performance.gap)}</div>
            <p className="text-white text-lg mb-2">
              "I thought <span className="text-purple-400">{performance.selfRating}⭐</span>... 
              they said <span className="text-pink-400">{performance.communityRating}⭐</span>"
            </p>
            <p className="text-gray-300 italic text-sm">"{performance.wittyCommentary}"</p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{performance.shareCount}</div>
            <div className="text-xs text-gray-400">Shares</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{performance.gap.toFixed(1)}</div>
            <div className="text-xs text-gray-400">Reality Gap</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {communityOwnership?.totalContributions || 0}
            </div>
            <div className="text-xs text-gray-400">Contributors</div>
          </div>
        </div>

        {/* Community Grid */}
        {renderCommunityGrid()}

        {/* Ownership Breakdown */}
        {renderOwnershipBreakdown()}

        {/* Timestamp */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 text-center">
            {performance.timestamp.toLocaleDateString()} • {performance.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}