/**
 * Unified Challenge Card Component
 * Reusable card component following DRY principles with multiple variants
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Mic, 
  Clock, 
  Users, 
  TrendingUp, 
  Star,
  Coins,
  Trophy,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Challenge, ChallengeCardProps } from '@/types/challenge.types';

/**
 * Difficulty color mapping utility
 */
const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
  const colors = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30'
  };
  return colors[difficulty];
};

/**
 * Format duration utility
 */
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Challenge Card Component
 */
export default function ChallengeCard({ 
  challenge, 
  onSelect, 
  onPreview,
  showEconomics = true,
  showSocial = true,
  variant = 'detailed' 
}: ChallengeCardProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const handlePreviewPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingPreview(!isPlayingPreview);
    onPreview?.(challenge);
  };

  const handleSelect = () => {
    onSelect(challenge);
  };

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSelect}
        className="cursor-pointer"
      >
        <Card className="gigavibe-glass-dark border-gigavibe-500/20 hover:border-gigavibe-400/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white truncate">{challenge.title}</h3>
                  {challenge.trending && (
                    <Badge className="bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-400 truncate">{challenge.artist}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(challenge.duration)}
                  </span>
                  <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePreviewPlay}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Featured variant for hero sections
  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="group cursor-pointer"
        onClick={handleSelect}
      >
        <Card className="gigavibe-glass-dark border-gigavibe-500/20 hover:border-gigavibe-400/40 transition-all duration-300 overflow-hidden">
          <CardContent className="p-0">
            {/* Hero Section */}
            <div className="relative p-6 bg-gradient-to-r from-gigavibe-500/20 to-purple-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-white group-hover:text-gigavibe-400 transition-colors">
                      {challenge.title}
                    </h2>
                    {challenge.trending && (
                      <Badge className="bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-slate-300 mb-3">{challenge.artist}</p>
                  <p className="text-slate-400">{challenge.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handlePreviewPlay}
                  variant="outline"
                  className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                >
                  {isPlayingPreview ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Preview
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </>
                  )}
                </Button>
                <Button className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0">
                  <Mic className="w-4 h-4 mr-2" />
                  Start Challenge
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="p-6 space-y-4">
              {/* Challenge Stats */}
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(challenge.duration)}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {challenge.participants.toLocaleString()}
                </div>
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              </div>

              {/* Economics */}
              {showEconomics && challenge.coinValue && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-gigavibe-400">
                    <Coins className="w-4 h-4" />
                    <span className="font-medium">{challenge.coinValue.toFixed(3)} ETH</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">${challenge.totalEarnings?.toFixed(0)}</span>
                  </div>
                </div>
              )}

              {/* Recent Performers */}
              {showSocial && challenge.recentPerformers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">Recent performers:</span>
                  <div className="flex -space-x-2">
                    {challenge.recentPerformers.slice(0, 4).map((performer, index) => (
                      <Avatar key={index} className="w-6 h-6 border-2 border-slate-800">
                        <AvatarImage src={performer.avatar} />
                        <AvatarFallback className="text-xs">
                          {performer.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-xs text-gigavibe-400 font-medium">
                    Avg: {(challenge.recentPerformers.reduce((acc, p) => acc + p.score, 0) / challenge.recentPerformers.length).toFixed(1)}
                  </span>
                </div>
              )}

              {/* Trending Progress */}
              {challenge.trending && challenge.viralScore && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Viral momentum</span>
                    <span>{challenge.viralScore}%</span>
                  </div>
                  <Progress value={challenge.viralScore} className="h-1 bg-slate-800">
                    <div className="h-full bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full" />
                  </Progress>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default detailed variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer"
      onClick={handleSelect}
    >
      <Card className="gigavibe-glass-dark border-gigavibe-500/20 hover:border-gigavibe-400/40 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-white group-hover:text-gigavibe-400 transition-colors">
                  {challenge.title}
                </h3>
                {challenge.trending && (
                  <Badge className="bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {challenge.trendingRank && (
                  <Badge variant="outline" className="border-gigavibe-500/30 text-gigavibe-400">
                    #{challenge.trendingRank}
                  </Badge>
                )}
              </div>
              <p className="text-slate-400 mb-3">{challenge.artist}</p>
              
              {/* Challenge Stats */}
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(challenge.duration)}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {challenge.participants.toLocaleString()}
                </div>
                <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </Badge>
              </div>

              {/* Coin Economics */}
              {showEconomics && challenge.coinValue && (
                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1 text-gigavibe-400">
                    <Coins className="w-4 h-4" />
                    <span className="font-medium">{challenge.coinValue.toFixed(3)} ETH</span>
                    <span className="text-slate-400">per coin</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">${challenge.totalEarnings?.toFixed(0)}</span>
                    <span className="text-slate-400">earned</span>
                  </div>
                </div>
              )}

              {/* Recent Performers */}
              {showSocial && challenge.recentPerformers.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-slate-400">Recent performers:</span>
                  <div className="flex -space-x-2">
                    {challenge.recentPerformers.slice(0, 3).map((performer, index) => (
                      <Avatar key={index} className="w-6 h-6 border-2 border-slate-800">
                        <AvatarImage src={performer.avatar} />
                        <AvatarFallback className="text-xs">
                          {performer.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-xs text-gigavibe-400 font-medium">
                    Avg: {(challenge.recentPerformers.reduce((acc, p) => acc + p.score, 0) / challenge.recentPerformers.length).toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePreviewPlay}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isPlayingPreview ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Volume2 className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0"
              >
                <Mic className="w-4 h-4 mr-1" />
                Sing
              </Button>
            </div>
          </div>

          {/* Progress Bar for Trending */}
          {challenge.trending && challenge.viralScore && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Trending momentum</span>
                <span>{challenge.viralScore}%</span>
              </div>
              <Progress value={challenge.viralScore} className="h-1 bg-slate-800">
                <div className="h-full bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full" />
              </Progress>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}