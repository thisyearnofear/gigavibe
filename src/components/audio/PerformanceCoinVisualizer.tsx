/**
 * Performance Coin Visualizer
 * Shows how vocal performances are transformed into distinctive tradeable assets
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Users,
  Zap,
  Star,
  Crown,
  Volume2,
  Mic,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PerformanceCoinData {
  id: string;
  symbol: string;
  name: string;
  performance: {
    challengeTitle: string;
    artist: string;
    audioUrl: string;
    duration: number;
    selfRating: number;
    communityRating: number;
    gap: number;
    viralScore: number;
    timestamp: Date;
  };
  market: {
    currentPrice: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
    holders: number;
    totalSupply: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface PerformanceCoinVisualizerProps {
  coin: PerformanceCoinData;
  variant?: 'card' | 'detailed' | 'trading';
  onPlay?: () => void;
  onTrade?: (action: 'buy' | 'sell') => void;
}

export default function PerformanceCoinVisualizer({ 
  coin, 
  variant = 'card',
  onPlay,
  onTrade 
}: PerformanceCoinVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [priceAnimation, setPriceAnimation] = useState(0);
  const canvasRef = useRef<HTMLAudioElement>(null);

  // Generate coin-specific visual elements based on performance quality
  const getCoinRarity = () => {
    const rating = coin.performance.communityRating;
    if (rating >= 9.5) return 'legendary';
    if (rating >= 8.5) return 'epic';
    if (rating >= 7.5) return 'rare';
    return 'common';
  };

  const getRarityConfig = () => {
    const rarity = getCoinRarity();
    const configs = {
      legendary: {
        gradient: 'from-yellow-400 via-orange-500 to-red-500',
        glow: 'shadow-yellow-500/50',
        border: 'border-yellow-500/50',
        icon: Crown,
        label: 'Legendary',
        particles: 12
      },
      epic: {
        gradient: 'from-purple-400 via-pink-500 to-purple-600',
        glow: 'shadow-purple-500/50',
        border: 'border-purple-500/50',
        icon: Star,
        label: 'Epic',
        particles: 8
      },
      rare: {
        gradient: 'from-blue-400 via-gigavibe-500 to-purple-500',
        glow: 'shadow-gigavibe-500/50',
        border: 'border-gigavibe-500/50',
        icon: Zap,
        label: 'Rare',
        particles: 6
      },
      common: {
        gradient: 'from-slate-400 via-slate-500 to-slate-600',
        glow: 'shadow-slate-500/30',
        border: 'border-slate-500/30',
        icon: Mic,
        label: 'Common',
        particles: 4
      }
    };
    return configs[rarity];
  };

  const rarityConfig = getRarityConfig();
  const RarityIcon = rarityConfig.icon;

  // Animate price changes
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceAnimation(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate audio-reactive visualization
  const generateAudioVisualization = () => {
    const bars = Array.from({ length: rarityConfig.particles }, (_, i) => {
      const height = isPlaying 
        ? 20 + Math.sin((priceAnimation + i * 10) * 0.1) * 15 + Math.random() * 10
        : 8 + Math.random() * 4;
      
      return (
        <motion.div
          key={i}
          className={`w-1 bg-gradient-to-t ${rarityConfig.gradient} rounded-full`}
          animate={{ height: `${height}px` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      );
    });
    return bars;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    onPlay?.();
  };

  const formatPrice = (price: number) => {
    if (price >= 1) return price.toFixed(3);
    if (price >= 0.001) return price.toFixed(4);
    return price.toFixed(6);
  };

  const getPerformanceEmoji = () => {
    const gap = coin.performance.gap;
    if (gap > 2) return '🤔'; // Overconfident
    if (gap > 0.5) return '😅'; // Slightly high
    if (gap > -0.5) return '🎯'; // Spot on
    return '🌟'; // Underrated
  };

  if (variant === 'card') {
    return (
      <motion.div
        whileHover={{ scale: 1.02, rotateY: 5 }}
        whileTap={{ scale: 0.98 }}
        className="perspective-1000"
      >
        <Card className={`gigavibe-glass-dark ${rarityConfig.border} hover:${rarityConfig.glow} transition-all duration-300 overflow-hidden`}>
          <CardContent className="p-0">
            {/* Coin Header */}
            <div className={`bg-gradient-to-r ${rarityConfig.gradient} p-4 relative overflow-hidden`}>
              {/* Animated Background Particles */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: rarityConfig.particles }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    animate={{
                      x: [0, 100, 0],
                      y: [0, -50, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      delay: i * 0.5
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <RarityIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{coin.symbol}</h3>
                    <p className="text-white/80 text-sm">{rarityConfig.label}</p>
                  </div>
                </div>
                
                <Badge className="bg-white/20 text-white border-white/30">
                  #{coin.market.holders}
                </Badge>
              </div>
            </div>

            {/* Performance Info */}
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-1">{coin.performance.challengeTitle}</h4>
                <p className="text-sm text-slate-400">Performance by {coin.performance.artist}</p>
              </div>

              {/* Audio Preview */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <Button
                  onClick={handlePlayPause}
                  size="sm"
                  className={`bg-gradient-to-r ${rarityConfig.gradient} hover:opacity-80 text-white border-0 w-10 h-10 rounded-full`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-1 h-6">
                    {generateAudioVisualization()}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {coin.performance.communityRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {getPerformanceEmoji()}
                  </div>
                </div>
              </div>

              {/* Market Data */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-slate-400">Price</div>
                  <div className="font-bold text-white">{formatPrice(coin.market.currentPrice)} ETH</div>
                </div>
                <div>
                  <div className="text-slate-400">24h Change</div>
                  <div className={`font-bold flex items-center gap-1 ${
                    coin.market.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coin.market.priceChange24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {coin.market.priceChange24h >= 0 ? '+' : ''}{coin.market.priceChange24h.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Trading Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => onTrade?.('buy')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Buy
                </Button>
                <Button
                  onClick={() => onTrade?.('sell')}
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  size="sm"
                >
                  Sell
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={`gigavibe-glass-dark ${rarityConfig.border} ${rarityConfig.glow} shadow-2xl`}>
        <CardContent className="p-6 space-y-6">
          {/* Detailed Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${rarityConfig.gradient} rounded-full flex items-center justify-center`}>
                <RarityIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
                <p className="text-lg text-slate-300">{coin.symbol}</p>
                <Badge className={`mt-1 bg-gradient-to-r ${rarityConfig.gradient} text-white border-0`}>
                  {rarityConfig.label} Performance
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {formatPrice(coin.market.currentPrice)} ETH
              </div>
              <div className={`flex items-center gap-1 justify-end ${
                coin.market.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {coin.market.priceChange24h >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {coin.market.priceChange24h >= 0 ? '+' : ''}{coin.market.priceChange24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Performance Details */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-white">Original Performance</h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gigavibe-400">
                  {coin.performance.selfRating}
                </div>
                <div className="text-xs text-slate-400">Self Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {coin.performance.communityRating}
                </div>
                <div className="text-xs text-slate-400">Community</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {coin.performance.viralScore}%
                </div>
                <div className="text-xs text-slate-400">Viral Score</div>
              </div>
            </div>

            {/* Audio Player */}
            <div className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-lg">
              <Button
                onClick={handlePlayPause}
                className={`bg-gradient-to-r ${rarityConfig.gradient} hover:opacity-80 text-white border-0 w-12 h-12 rounded-full`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <div className="flex-1">
                <div className="text-sm text-white font-medium mb-1">
                  {coin.performance.challengeTitle}
                </div>
                <div className="flex items-center gap-1 h-8">
                  {generateAudioVisualization()}
                </div>
              </div>
              
              {isPlaying && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Volume2 className="w-5 h-5 text-gigavibe-400" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Market Cap</span>
                <span className="text-white font-medium">{coin.market.marketCap.toFixed(2)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">24h Volume</span>
                <span className="text-white font-medium">{coin.market.volume24h.toFixed(2)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Supply</span>
                <span className="text-white font-medium">{coin.market.totalSupply.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Holders</span>
                <span className="text-white font-medium">{coin.market.holders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reality Gap</span>
                <span className={`font-medium ${
                  coin.performance.gap > 1 ? 'text-red-400' : 
                  coin.performance.gap > 0 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {coin.performance.gap > 0 ? '+' : ''}{coin.performance.gap.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created</span>
                <span className="text-white font-medium">
                  {coin.performance.timestamp.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Trading Interface */}
          <div className="flex gap-3">
            <Button
              onClick={() => onTrade?.('buy')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy {coin.symbol}
            </Button>
            <Button
              onClick={() => onTrade?.('sell')}
              variant="outline"
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell {coin.symbol}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}