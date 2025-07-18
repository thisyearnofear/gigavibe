"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Pause, 
  Volume2, 
  MoreHorizontal,
  Zap,
  Trophy,
  Coins,
  TrendingUp,
  Mic,
  Users,
  Star,
  ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PerformancePost {
  id: string;
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    isVerified?: boolean;
  };
  challenge: {
    id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  audioUrl: string;
  duration: number;
  selfRating: number;
  communityRating?: number;
  gap: number;
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  realityRevealed: boolean;
  isLiked?: boolean;
  coinData?: {
    currentPrice: number;
    priceChange24h: number;
    holders: number;
    marketCap: number;
  };
  viralScore?: number;
  trendingRank?: number;
}

interface SocialDiscoveryFeedProps {
  feedType?: 'foryou' | 'trending' | 'viral' | 'following';
  onChallengeClick?: (challengeId: string) => void;
  onProfileClick?: (username: string) => void;
}

export default function SocialDiscoveryFeed({ 
  feedType = 'foryou',
  onChallengeClick,
  onProfileClick 
}: SocialDiscoveryFeedProps) {
  const [performances, setPerformances] = useState<PerformancePost[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock data with enhanced social features
  useEffect(() => {
    const mockPerformances: PerformancePost[] = [
      {
        id: 'perf-001',
        author: {
          fid: 12345,
          username: 'vocalqueen',
          displayName: 'Sarah Chen',
          pfpUrl: '/avatars/sarah.jpg',
          isVerified: true
        },
        challenge: {
          id: 'espanol-challenge',
          title: 'Español',
          difficulty: 'medium'
        },
        audioUrl: '/performances/sarah-espanol.mp3',
        duration: 45,
        selfRating: 8.5,
        communityRating: 9.2,
        gap: -0.7,
        likes: 234,
        comments: 45,
        shares: 67,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        realityRevealed: true,
        isLiked: false,
        coinData: {
          currentPrice: 0.024,
          priceChange24h: 15.3,
          holders: 89,
          marketCap: 2140
        },
        viralScore: 87,
        trendingRank: 3
      },
      {
        id: 'perf-002',
        author: {
          fid: 23456,
          username: 'rockstar_mike',
          displayName: 'Mike Rodriguez',
          pfpUrl: '/avatars/mike.jpg'
        },
        challenge: {
          id: 'rock-anthem',
          title: 'Rock Anthem Challenge',
          difficulty: 'hard'
        },
        audioUrl: '/performances/mike-rock.mp3',
        duration: 60,
        selfRating: 7.8,
        communityRating: 8.9,
        gap: -1.1,
        likes: 156,
        comments: 28,
        shares: 34,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        realityRevealed: true,
        isLiked: true,
        coinData: {
          currentPrice: 0.018,
          priceChange24h: -5.2,
          holders: 45,
          marketCap: 810
        },
        viralScore: 72
      }
    ];
    setPerformances(mockPerformances);
  }, [feedType]);

  const handleLike = (performanceId: string) => {
    setPerformances(prev => 
      prev.map(p => 
        p.id === performanceId 
          ? { 
              ...p, 
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1
            }
          : p
      )
    );
  };

  const handlePlayPause = (performanceId: string) => {
    if (playingAudio === performanceId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(performanceId);
      // In real implementation, play audio
    }
  };

  const handleTryChallenge = (challengeId: string) => {
    onChallengeClick?.(challengeId);
  };

  const getRealityGapColor = (gap: number) => {
    if (gap > 1) return 'text-red-400';
    if (gap > 0) return 'text-yellow-400';
    if (gap > -1) return 'text-green-400';
    return 'text-emerald-400';
  };

  const getRealityGapText = (gap: number) => {
    if (gap > 1) return 'Overconfident';
    if (gap > 0) return 'Slightly High';
    if (gap > -1) return 'Spot On';
    return 'Underrated';
  };

  return (
    <div className="space-y-4">
      {/* Feed Type Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['foryou', 'trending', 'viral', 'following'].map((type) => (
          <Button
            key={type}
            variant={feedType === type ? "default" : "outline"}
            size="sm"
            className={`whitespace-nowrap ${
              feedType === type 
                ? 'bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white border-0' 
                : 'border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10'
            }`}
          >
            {type === 'foryou' && 'For You'}
            {type === 'trending' && (
              <>
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </>
            )}
            {type === 'viral' && (
              <>
                <Zap className="w-4 h-4 mr-1" />
                Viral
              </>
            )}
            {type === 'following' && (
              <>
                <Users className="w-4 h-4 mr-1" />
                Following
              </>
            )}
          </Button>
        ))}
      </div>

      {/* Performance Cards */}
      <div className="space-y-4">
        {performances.map((performance, index) => (
          <motion.div
            key={performance.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="gigavibe-glass-dark border-gigavibe-500/20 hover:border-gigavibe-400/40 transition-all duration-300">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="w-12 h-12 cursor-pointer"
                      onClick={() => onProfileClick?.(performance.author.username)}
                    >
                      <AvatarImage src={performance.author.pfpUrl} />
                      <AvatarFallback>
                        {performance.author.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {performance.author.displayName}
                        </h3>
                        {performance.author.isVerified && (
                          <Star className="w-4 h-4 text-gigavibe-400 fill-current" />
                        )}
                        {performance.trendingRank && (
                          <Badge className="bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white text-xs">
                            #{performance.trendingRank} Trending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">
                        @{performance.author.username} • {new Date(performance.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Challenge Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className="cursor-pointer hover:bg-gigavibe-500/20 transition-colors"
                        onClick={() => handleTryChallenge(performance.challenge.id)}
                      >
                        <Mic className="w-3 h-3 mr-1" />
                        {performance.challenge.title}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${
                        performance.challenge.difficulty === 'easy' ? 'border-green-500/30 text-green-400' :
                        performance.challenge.difficulty === 'medium' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-red-500/30 text-red-400'
                      }`}>
                        {performance.challenge.difficulty}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTryChallenge(performance.challenge.id)}
                      className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                    >
                      Try Challenge
                    </Button>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                    <Button
                      size="sm"
                      onClick={() => handlePlayPause(performance.id)}
                      className="bg-gigavibe-500 hover:bg-gigavibe-600 text-white"
                    >
                      {playingAudio === performance.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-slate-400 mb-1">
                        <span>Performance</span>
                        <span>{performance.duration}s</span>
                      </div>
                      <Progress value={playingAudio === performance.id ? 45 : 0} className="h-2" />
                    </div>
                    <Volume2 className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Reality Check Results */}
                {performance.realityRevealed && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">Reality Check</h4>
                      {performance.viralScore && (
                        <Badge className="bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          {performance.viralScore}% Viral
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gigavibe-400">
                          {performance.selfRating}
                        </div>
                        <div className="text-xs text-slate-400">Self Rating</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">
                          {performance.communityRating}
                        </div>
                        <div className="text-xs text-slate-400">Community</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${getRealityGapColor(performance.gap)}`}>
                          {performance.gap > 0 ? '+' : ''}{performance.gap.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {getRealityGapText(performance.gap)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Coin Data */}
                {performance.coinData && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-gigavibe-500/10 to-purple-500/10 rounded-lg border border-gigavibe-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-gigavibe-400" />
                        <span className="font-semibold text-white">Performance Coin</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowUp className={`w-3 h-3 ${
                          performance.coinData.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          performance.coinData.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {performance.coinData.priceChange24h > 0 ? '+' : ''}{performance.coinData.priceChange24h.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-white font-medium">
                          {performance.coinData.currentPrice} ETH
                        </div>
                        <div className="text-slate-400">Price</div>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {performance.coinData.holders}
                        </div>
                        <div className="text-slate-400">Holders</div>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          ${performance.coinData.marketCap}
                        </div>
                        <div className="text-slate-400">Market Cap</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(performance.id)}
                      className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${performance.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                      <span className="text-sm">{performance.likes}</span>
                    </motion.button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-gigavibe-400 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{performance.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">{performance.shares}</span>
                    </button>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0"
                  >
                    <Trophy className="w-4 h-4 mr-1" />
                    Trade Coin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}