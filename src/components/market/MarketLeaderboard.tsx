'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Crown, Wallet } from 'lucide-react';
import { useZoraLeaderboards } from '@/hooks/useZoraLeaderboards';
import PerformanceCoinCard from './PerformanceCoinCard';
import PortfolioDashboard from './PortfolioDashboard';
import CommunityPortfolio from '@/components/community/CommunityPortfolio';

const LEADERBOARD_CATEGORIES = {
  byPrice: {
    title: '💎 Most Valuable',
    description: 'Highest coin prices',
    icon: Crown,
    color: 'from-yellow-500 to-orange-500'
  },
  byVolume: {
    title: '🔥 Most Viral',
    description: '24hr trading volume',
    icon: Activity,
    color: 'from-red-500 to-pink-500'
  },
  byHolders: {
    title: '❤️ Community Favorites',
    description: 'Most coin holders',
    icon: Users,
    color: 'from-purple-500 to-indigo-500'
  },
  byPriceChange: {
    title: '🚀 Trending',
    description: 'Biggest price increases',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500'
  },
  byMarketCap: {
    title: '👑 Legends',
    description: 'Highest market cap',
    icon: DollarSign,
    color: 'from-blue-500 to-cyan-500'
  }
} as const;

export default function MarketLeaderboard() {
  const { leaderboards, tradingMetrics, loading, error, refreshData } = useZoraLeaderboards();
  const [activeCategory, setActiveCategory] = useState<keyof typeof LEADERBOARD_CATEGORIES>('byVolume');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold mb-4">Market Temporarily Unavailable</h2>
          <p className="text-gray-300 mb-6">We're having trouble loading the latest market data.</p>
          <motion.button
            onClick={refreshData}
            className="px-6 py-3 bg-purple-500 rounded-2xl font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  const currentLeaderboard = leaderboards?.[activeCategory] || [];
  const currentCategory = LEADERBOARD_CATEGORIES[activeCategory];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Trading Metrics */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Performance Market</h1>
          <motion.button
            onClick={refreshData}
            className="p-2 bg-gray-800 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Activity className="w-5 h-5" />
          </motion.button>
        </div>

        {tradingMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-2xl p-4">
              <div className="text-sm text-gray-400">Total Volume</div>
              <div className="text-xl font-bold">{tradingMetrics.totalVolume.toFixed(2)} ETH</div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4">
              <div className="text-sm text-gray-400">Performance Coins</div>
              <div className="text-xl font-bold">{tradingMetrics.totalCoins}</div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4">
              <div className="text-sm text-gray-400">Top Performer</div>
              <div className="text-lg font-bold text-green-400">
                +{tradingMetrics.topPerformer?.marketData.priceChangePercent24h.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4">
              <div className="text-sm text-gray-400">Trending</div>
              <div className="text-lg font-bold text-purple-400">
                {tradingMetrics.trendingCoins.length} coins
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Selector */}
      <div className="p-6">
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {Object.entries(LEADERBOARD_CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            const isActive = activeCategory === key;
            
            return (
              <motion.button
                key={key}
                onClick={() => setActiveCategory(key as keyof typeof LEADERBOARD_CATEGORIES)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold text-sm">{category.title}</div>
                  <div className="text-xs opacity-80">{category.description}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Current Category Header */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold mb-2">{currentCategory.title}</h2>
          <p className="text-gray-400">{currentCategory.description}</p>
        </motion.div>

        {/* Leaderboard List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {currentLeaderboard.length > 0 ? (
              currentLeaderboard.map((coin, index) => (
                <motion.div
                  key={coin.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <PerformanceCoinCard
                    coin={coin}
                    rank={index + 1}
                    category={activeCategory}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎤</div>
                <h3 className="text-xl font-bold mb-2">No Performance Coins Yet</h3>
                <p className="text-gray-400">
                  Complete Reality Check events to create the first performance coins!
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}