'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Crown, Wallet, Zap, Eye, Star } from 'lucide-react';
import { useZoraLeaderboards } from '@/hooks/useZoraLeaderboards';
import { useTabContext, useCrossTab } from '@/contexts/CrossTabContext';
import { useFarcasterIntegration } from '@/hooks/useFarcasterIntegration';
import { ViralDetectionService } from '@/lib/discovery/ViralDetectionService';
import PerformanceCoinCard from './PerformanceCoinCard';
import PortfolioDashboard from './PortfolioDashboard';
import CommunityPortfolio from '@/components/community/CommunityPortfolio';

const LEADERBOARD_CATEGORIES = {
  byViralScore: {
    title: '⚡ Viral Performances',
    description: 'Farcaster cast viral metrics',
    icon: Zap,
    color: 'from-gigavibe-500 to-purple-500'
  },
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

interface CastMetrics {
  hash: string;
  viralScore: number;
  likes: number;
  recasts: number;
  replies: number;
  author: {
    fid: number;
    username: string;
    displayName: string;
  };
  text: string;
  timestamp: string;
  audioUrl?: string;
  coinStatus: 'pending' | 'creating' | 'created';
  coinAddress?: string;
  challengeType: 'viral' | 'structured' | 'advanced';
  viralThreshold: number;
}

export default function MarketLeaderboard() {
  const { leaderboards, tradingMetrics, loading, error, refreshData } = useZoraLeaderboards();
  const [activeCategory, setActiveCategory] = useState<keyof typeof LEADERBOARD_CATEGORIES>('byViralScore');
  const [viralCasts, setViralCasts] = useState<CastMetrics[]>([]);
  const [isLoadingCasts, setIsLoadingCasts] = useState(false);
  
  // Get tab context for cast tracking
  const { context: tabContext, clearContext } = useTabContext('market');
  const { navigateWithContext } = useCrossTab();
  const { userInfo } = useFarcasterIntegration();
  
  // Initialize viral detection service
  const viralDetectionService = ViralDetectionService.getInstance();

  // Load viral casts and track metrics
  useEffect(() => {
    const loadViralCasts = async () => {
      setIsLoadingCasts(true);
      try {
        // Get casts from /gigavibe channel
        const response = await fetch('/api/farcaster/cast?action=fetchChannel&channelId=gigavibe');
        if (!response.ok) throw new Error('Failed to fetch casts');
        
        const data = await response.json();
        const casts = data.casts || [];
        
        // Calculate viral scores and transform to CastMetrics
        const castsWithMetrics = await Promise.all(
          casts
            .filter(cast => cast.embeds?.some(embed => embed.url?.startsWith('lens://')))
            .map(async (cast) => {
              // Get replies for voting data
              const repliesResponse = await fetch(`/api/farcaster/replies?castHash=${cast.hash}`);
              const repliesData = repliesResponse.ok ? await repliesResponse.json() : { casts: [] };
              const votes = repliesData.casts?.filter(c => c.text.includes('Rating:') && c.text.includes('⭐')) || [];
              
              // Calculate viral score
              const viralScore = calculateViralScore({
                likes: cast.reactions?.likes_count || 0,
                recasts: cast.reactions?.recasts_count || 0,
                replies: votes.length,
                timeDecay: getTimeDecay(cast.timestamp)
              });
              
              // Detect challenge type and get appropriate threshold
              const challengeType = detectChallengeType(cast.text);
              const viralThreshold = viralDetectionService.getChallengeThreshold(challengeType);
              
              // Check coin status
              const coinStatus = await checkCoinStatus(cast.hash);
              
              return {
                hash: cast.hash,
                viralScore,
                likes: cast.reactions?.likes_count || 0,
                recasts: cast.reactions?.recasts_count || 0,
                replies: votes.length,
                author: {
                  fid: cast.author.fid,
                  username: cast.author.username,
                  displayName: cast.author.display_name
                },
                text: cast.text,
                timestamp: cast.timestamp,
                audioUrl: cast.embeds?.find(embed => embed.url?.startsWith('lens://'))?.url,
                coinStatus: coinStatus.status,
                coinAddress: coinStatus.address,
                challengeType,
                viralThreshold
              };
            })
        );
        
        // Sort by viral score and take top 20
        const sortedCasts = castsWithMetrics
          .sort((a, b) => b.viralScore - a.viralScore)
          .slice(0, 20);
        
        setViralCasts(sortedCasts);
      } catch (error) {
        console.error('Failed to load viral casts:', error);
      } finally {
        setIsLoadingCasts(false);
      }
    };

    loadViralCasts();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(loadViralCasts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper functions
  const calculateViralScore = ({ likes, recasts, replies, timeDecay }) => {
    const engagementScore = (likes * 1) + (recasts * 3) + (replies * 2);
    return Math.round(engagementScore * timeDecay);
  };

  const detectChallengeType = (castText: string): 'viral' | 'structured' | 'advanced' => {
    const text = castText.toLowerCase();
    
    // Check for challenge type indicators in cast text
    if (text.includes('viral challenge') || text.includes('fun mode') || text.includes('/creators')) {
      return 'viral';
    } else if (text.includes('show off') || text.includes('advanced') || text.includes('pro')) {
      return 'advanced';
    } else if (text.includes('vocal range') || text.includes('training') || text.includes('pitch')) {
      return 'structured';
    }
    
    // Default based on channel - /creators = viral, /music = structured
    // This is a fallback when text doesn't contain clear indicators
    return 'structured'; // Default to structured for /music channel
  };

  const getTimeDecay = (timestamp) => {
    const hoursAgo = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
    return Math.max(0.1, 1 - (hoursAgo / 168)); // Decay over 1 week
  };

  const checkCoinStatus = async (castHash) => {
    try {
      const response = await fetch(`/api/zora/has-coin?castHash=${castHash}`);
      if (response.ok) {
        const data = await response.json();
        return { status: data.hasCoin ? 'created' : 'pending', address: data.address };
      }
    } catch (error) {
      console.error('Failed to check coin status:', error);
    }
    return { status: 'pending' };
  };

  // Handle tracked cast from tab context
  useEffect(() => {
    if (tabContext.trackCast) {
      // Scroll to and highlight the tracked cast
      const castElement = document.getElementById(`cast-${tabContext.trackCast}`);
      if (castElement) {
        castElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Clear context after highlighting
        setTimeout(() => clearContext(), 5000);
      }
    }
  }, [tabContext.trackCast, clearContext]);

  if (loading || isLoadingCasts) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-2 border-gigavibe-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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

        {/* Enhanced Trading Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tradingMetrics ? (
            <>
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
            </>
          ) : (
            <>
              <div className="bg-gray-900 rounded-2xl p-4">
                <div className="text-sm text-gray-400">Viral Performances</div>
                <div className="text-xl font-bold text-gigavibe-400">{viralCasts.length}</div>
              </div>
              <div className="bg-gray-900 rounded-2xl p-4">
                <div className="text-sm text-gray-400">Ready for Coins</div>
                <div className="text-xl font-bold text-green-400">
                  {viralCasts.filter(cast => cast.viralScore >= cast.viralThreshold).length}
                </div>
              </div>
              <div className="bg-gray-900 rounded-2xl p-4">
                <div className="text-sm text-gray-400">Top Viral Score</div>
                <div className="text-xl font-bold text-purple-400">
                  {viralCasts.length > 0 ? viralCasts[0]?.viralScore || 0 : 0}
                </div>
              </div>
              <div className="bg-gray-900 rounded-2xl p-4">
                <div className="text-sm text-gray-400">Coins Created</div>
                <div className="text-xl font-bold text-yellow-400">
                  {viralCasts.filter(cast => cast.coinStatus === 'created').length}
                </div>
              </div>
            </>
          )}
        </div>
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
            {activeCategory === 'byViralScore' ? (
              // Viral Casts Display
              viralCasts.length > 0 ? (
                viralCasts.map((cast, index) => (
                  <motion.div
                    key={cast.hash}
                    id={`cast-${cast.hash}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`${
                      cast.hash === tabContext.trackCast 
                        ? 'ring-2 ring-gigavibe-500 ring-opacity-50' 
                        : ''
                    }`}
                  >
                    <ViralCastCard
                      cast={cast}
                      rank={index + 1}
                      onViewInDiscovery={() => navigateWithContext('discovery', { 
                        highlightCast: cast.hash,
                        channelFocus: 'gigavibe'
                      })}
                      onJudgePerformance={() => navigateWithContext('judging', { 
                        focusCast: cast.hash 
                      })}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold mb-2">No Viral Performances Yet</h3>
                  <p className="text-gray-400">
                    Performances need community engagement to appear here!
                  </p>
                </div>
              )
            ) : (
              // Existing Coin Leaderboards
              currentLeaderboard.length > 0 ? (
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
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Viral Cast Card Component
interface ViralCastCardProps {
  cast: CastMetrics;
  rank: number;
  onViewInDiscovery: () => void;
  onJudgePerformance: () => void;
}

function ViralCastCard({ cast, rank, onViewInDiscovery, onJudgePerformance }: ViralCastCardProps) {
  const progressToViral = Math.min((cast.viralScore / cast.viralThreshold) * 100, 100);
  
  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'viral': return 'text-orange-400';
      case 'structured': return 'text-blue-400';
      case 'advanced': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'viral': return 'Viral Challenge';
      case 'structured': return 'Vocal Training';
      case 'advanced': return 'Show Off Mode';
      default: return 'Performance';
    }
  };
  
  const getCoinStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'text-green-400';
      case 'creating': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getCoinStatusText = (status: string) => {
    switch (status) {
      case 'created': return 'Coin Created';
      case 'creating': return 'Creating Coin...';
      default: return progressToViral >= 100 ? 'Ready for Coin' : 'Building Momentum';
    }
  };

  return (
    <motion.div
      className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-gigavibe-500/30 transition-all duration-300"
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(212, 70, 239, 0.1)" }}
    >
      {/* Header with Rank and Author */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            rank <= 3 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}>
            #{rank}
          </div>
          <div>
            <div className="font-semibold text-white">{cast.author.displayName}</div>
            <div className="text-xs text-gray-400">@{cast.author.username}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gigavibe-400">{cast.viralScore}</div>
          <div className="text-xs text-gray-400">viral score</div>
          <div className={`text-xs font-medium ${getChallengeTypeColor(cast.challengeType)}`}>
            {getChallengeTypeLabel(cast.challengeType)}
          </div>
        </div>
      </div>

      {/* Performance Content */}
      <div className="mb-3">
        <p className="text-white text-sm leading-relaxed line-clamp-2">
          {cast.text}
        </p>
      </div>

      {/* Engagement Metrics */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1 text-red-400">
          <span>❤️</span>
          <span>{cast.likes}</span>
        </div>
        <div className="flex items-center gap-1 text-green-400">
          <span>🔄</span>
          <span>{cast.recasts}</span>
        </div>
        <div className="flex items-center gap-1 text-blue-400">
          <span>💬</span>
          <span>{cast.replies}</span>
        </div>
      </div>

      {/* Viral Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">
            Progress to coin creation ({cast.viralScore}/{cast.viralThreshold})
          </span>
          <span className={getCoinStatusColor(cast.coinStatus)}>
            {getCoinStatusText(cast.coinStatus)}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              progressToViral >= 100 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-gigavibe-500 to-purple-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressToViral}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          onClick={onViewInDiscovery}
          className="flex-1 py-2 px-3 bg-gigavibe-500/20 border border-gigavibe-500/30 rounded-lg text-gigavibe-400 text-sm font-medium hover:bg-gigavibe-500/30 transition-colors touch-target"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Eye className="w-4 h-4 inline mr-1" />
          View
        </motion.button>
        
        <motion.button
          onClick={onJudgePerformance}
          className="flex-1 py-2 px-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-medium hover:bg-purple-500/30 transition-colors touch-target"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Star className="w-4 h-4 inline mr-1" />
          Rate
        </motion.button>

        {cast.coinStatus === 'created' && cast.coinAddress && (
          <motion.button
            onClick={() => window.open(`https://zora.co/collect/base:${cast.coinAddress}`, '_blank')}
            className="py-2 px-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors touch-target"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <DollarSign className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}