'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Volume2, Crown, Star, ExternalLink } from 'lucide-react';
import { PerformanceCoin } from '@/lib/zora/types';
import TradingInterface from './TradingInterface';

interface PerformanceCoinCardProps {
  coin: PerformanceCoin;
  rank: number;
  category: string;
  onTrade?: () => void;
}

export default function PerformanceCoinCard({ 
  coin, 
  rank, 
  category,
  onTrade 
}: PerformanceCoinCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showTrading, setShowTrading] = useState(false);

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getGapEmoji = (gap: number) => {
    if (gap >= 3) return '😅';
    if (gap >= 2) return '🤔';
    if (gap <= -2) return '😲';
    if (Math.abs(gap) <= 0.5) return '🎯';
    return '😐';
  };

  const getCategoryMetric = () => {
    switch (category) {
      case 'byPrice':
        return { label: 'Price', value: `${coin.marketData.price.toFixed(4)} ETH`, icon: Crown };
      case 'byVolume':
        return { label: '24h Volume', value: `${coin.marketData.volume24h.toFixed(2)} ETH`, icon: Volume2 };
      case 'byHolders':
        return { label: 'Holders', value: coin.marketData.holders.toString(), icon: Users };
      case 'byPriceChange':
        return { 
          label: '24h Change', 
          value: `+${coin.marketData.priceChangePercent24h.toFixed(1)}%`, 
          icon: TrendingUp,
          color: coin.marketData.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
        };
      case 'byMarketCap':
        return { label: 'Market Cap', value: `${coin.marketData.marketCap.toFixed(2)} ETH`, icon: Star };
      default:
        return { label: 'Price', value: `${coin.marketData.price.toFixed(4)} ETH`, icon: Crown };
    }
  };

  const metric = getCategoryMetric();
  const MetricIcon = metric.icon;

  return (
    <motion.div
      className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex items-center justify-between">
        {/* Left: Rank + Performance Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="text-2xl font-bold text-purple-400 min-w-[3rem]">
            {getRankEmoji(rank)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">
                {coin.performance.challengeTitle}
              </h3>
              <span className="text-sm text-gray-400">
                {getGapEmoji(coin.performance.gap)}
              </span>
            </div>
            
            <div className="text-sm text-gray-400 mb-2">
              "I thought {coin.performance.selfRating}⭐... they said {coin.performance.communityRating}⭐"
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{coin.symbol}</span>
              <span>{coin.performance.shareCount} shares</span>
              <span>{coin.performance.timestamp.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Metric */}
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <MetricIcon className={`w-4 h-4 ${metric.color || 'text-purple-400'}`} />
            <span className={`font-bold ${metric.color || 'text-white'}`}>
              {metric.value}
            </span>
          </div>
          <div className="text-xs text-gray-400">{metric.label}</div>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-gray-800"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-400">Market Cap</div>
              <div className="font-semibold">{coin.marketData.marketCap.toFixed(2)} ETH</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">24h Change</div>
              <div className={`font-semibold flex items-center gap-1 ${
                coin.marketData.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {coin.marketData.priceChangePercent24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {coin.marketData.priceChangePercent24h.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-300 mb-4 italic">
            "{coin.performance.wittyCommentary}"
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setShowTrading(true);
              }}
              className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Trade Coin
            </motion.button>
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                // Open external link to Zora
              }}
              className="px-4 py-2 bg-gray-800 rounded-xl font-semibold text-sm flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-4 h-4" />
              View
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Trading Interface Modal */}
      {showTrading && (
        <TradingInterface
          coin={coin}
          onClose={() => setShowTrading(false)}
        />
      )}
    </motion.div>
  );
}