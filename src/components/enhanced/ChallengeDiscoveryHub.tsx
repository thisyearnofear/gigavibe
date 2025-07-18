"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Mic, 
  Clock, 
  Star, 
  TrendingUp, 
  Users, 
  Zap,
  ChevronRight,
  Volume2,
  Trophy,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Challenge {
  id: string;
  title: string;
  artist: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  participants: number;
  trending: boolean;
  previewUrl: string;
  instrumentalUrl: string;
  recentPerformers: Array<{
    username: string;
    avatar: string;
    score: number;
  }>;
  coinValue?: number;
  totalEarnings?: number;
}

interface ChallengeDiscoveryHubProps {
  onChallengeSelect: (challenge: Challenge) => void;
  onViewAllChallenges: () => void;
}

export default function ChallengeDiscoveryHub({ 
  onChallengeSelect, 
  onViewAllChallenges 
}: ChallengeDiscoveryHubProps) {
  const [featuredChallenges, setFeaturedChallenges] = useState<Challenge[]>([]);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    setFeaturedChallenges([
      {
        id: 'espanol-challenge',
        title: 'Español',
        artist: 'GIGAVIBE',
        difficulty: 'medium',
        duration: 180,
        participants: 1247,
        trending: true,
        previewUrl: '/audio/espanol.mp3',
        instrumentalUrl: '/audio/espanol-instrumental.mp3',
        recentPerformers: [
          { username: 'musiclover', avatar: '/avatars/user1.jpg', score: 9.2 },
          { username: 'vocalstar', avatar: '/avatars/user2.jpg', score: 8.8 },
          { username: 'singqueen', avatar: '/avatars/user3.jpg', score: 9.5 }
        ],
        coinValue: 0.024,
        totalEarnings: 156.7
      },
      {
        id: 'pop-hits-2024',
        title: 'Pop Hits Medley',
        artist: 'Various Artists',
        difficulty: 'hard',
        duration: 240,
        participants: 892,
        trending: false,
        previewUrl: '/audio/pop-medley.mp3',
        instrumentalUrl: '/audio/pop-medley-instrumental.mp3',
        recentPerformers: [
          { username: 'popstar', avatar: '/avatars/user4.jpg', score: 8.9 },
          { username: 'melody', avatar: '/avatars/user5.jpg', score: 9.1 }
        ],
        coinValue: 0.031,
        totalEarnings: 203.4
      }
    ]);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handlePreviewPlay = (challengeId: string) => {
    if (playingPreview === challengeId) {
      setPlayingPreview(null);
    } else {
      setPlayingPreview(challengeId);
      // In real implementation, play audio preview
      setTimeout(() => setPlayingPreview(null), 15000); // Auto-stop after 15s
    }
  };

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    // Show challenge details modal or navigate to challenge
    onChallengeSelect(challenge);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Featured Challenges
          </h2>
          <p className="text-slate-400">
            Jump into trending vocal challenges
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={onViewAllChallenges}
          className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Featured Challenges Grid */}
      <div className="grid gap-4">
        {featuredChallenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="group"
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
                    </div>
                    <p className="text-slate-400 mb-3">{challenge.artist}</p>
                    
                    {/* Challenge Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.floor(challenge.duration / 60)}:{(challenge.duration % 60).toString().padStart(2, '0')}
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
                    {challenge.coinValue && (
                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1 text-gigavibe-400">
                          <Coins className="w-4 h-4" />
                          <span className="font-medium">{challenge.coinValue} ETH</span>
                          <span className="text-slate-400">per coin</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-400">
                          <Trophy className="w-4 h-4" />
                          <span className="font-medium">${challenge.totalEarnings}</span>
                          <span className="text-slate-400">earned</span>
                        </div>
                      </div>
                    )}

                    {/* Recent Performers */}
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
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreviewPlay(challenge.id)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      {playingPreview === challenge.id ? (
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
                      onClick={() => handleChallengeSelect(challenge)}
                      className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0"
                    >
                      <Mic className="w-4 h-4 mr-1" />
                      Sing
                    </Button>
                  </div>
                </div>

                {/* Progress Bar for Trending */}
                {challenge.trending && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Trending momentum</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-1 bg-slate-800">
                      <div className="h-full bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full" />
                    </Progress>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Start CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="gigavibe-glass-dark border-gigavibe-500/20 bg-gradient-to-r from-gigavibe-500/10 to-purple-500/10">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-gigavibe-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Ready to go viral?
            </h3>
            <p className="text-slate-400 mb-4">
              Start with any challenge and watch your performance climb the leaderboards
            </p>
            <Button 
              onClick={() => handleChallengeSelect(featuredChallenges[0])}
              className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Singing Now
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}