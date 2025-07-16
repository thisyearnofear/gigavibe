'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFarcasterIntegration } from '@/hooks/useFarcasterIntegration';
import { useDiscoveryFeed } from '@/hooks/useDiscoveryFeed';
import { FeatureUnlock, ContextualTip } from '@/components/onboarding';

interface PerformancePost {
  id: string;
  castHash?: string;
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  };
  challenge: string;
  audioUrl: string;
  duration: number;
  selfRating: number;
  communityRating?: number;
  gap?: number;
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  isLiked?: boolean;
  realityRevealed?: boolean;
}

interface FeedCardProps {
  performance: PerformancePost;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onSwipe: (direction: 'up' | 'down') => void;
}

function FeedCard({ performance, isActive, onLike, onComment, onShare, onSwipe }: FeedCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRealityCheck, setShowRealityCheck] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRealityReveal = () => {
    if (!performance.realityRevealed) {
      setShowRealityCheck(true);
      // Mark as revealed after animation
      setTimeout(() => {
        performance.realityRevealed = true;
      }, 2000);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.y < -threshold) {
      onSwipe('up');
    } else if (info.offset.y > threshold) {
      onSwipe('down');
    }
  };

  const getRealityCheckColor = () => {
    if (!performance.gap) return 'text-gray-400';
    if (Math.abs(performance.gap) <= 1) return 'text-green-400';
    if (Math.abs(performance.gap) <= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRealityCheckMessage = () => {
    if (!performance.gap) return '';
    const gap = Math.abs(performance.gap);
    if (gap === 0) return 'Perfect self-awareness! 🎯';
    if (gap <= 1) return 'Pretty accurate! 👍';
    if (gap <= 2) return 'Reality check! 😅';
    return 'Major reality check! 😱';
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      className="h-full w-full relative bg-black rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
      whileDrag={{ scale: 0.95 }}
    >
      {/* Background Audio Visualization */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50">
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white/30 rounded"
                  animate={{ height: [4, Math.random() * 40 + 10, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={performance.author.pfpUrl} />
              <AvatarFallback>{performance.author.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white text-sm">{performance.author.displayName}</p>
              <p className="text-gray-400 text-xs">@{performance.author.username}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center p-6">
          {/* Challenge Title */}
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            "{performance.challenge}"
          </h3>

          {/* Play Button */}
          <motion.button
            onClick={handlePlayPause}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </motion.button>

          {/* Reality Check Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="text-center">
                <p className="text-gray-400 text-xs">Self-rated</p>
                <p className="text-yellow-400 font-bold text-lg">{performance.selfRating}⭐</p>
              </div>
              
              {performance.communityRating !== undefined ? (
                <>
                  <div className="text-gray-400">→</div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Community</p>
                    <p className="text-blue-400 font-bold text-lg">{performance.communityRating}⭐</p>
                  </div>
                </>
              ) : (
                <Button
                  onClick={handleRealityReveal}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Reveal Reality Check
                </Button>
              )}
            </div>

            {performance.gap !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${getRealityCheckColor()} font-semibold text-sm`}
              >
                {getRealityCheckMessage()}
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => onLike(performance.id)}
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${performance.isLiked ? 'text-red-400' : 'text-white'}`}
              >
                <Heart className={`w-5 h-5 ${performance.isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{performance.likes}</span>
              </Button>

              <Button
                onClick={() => onComment(performance.id)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-white"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{performance.comments}</span>
              </Button>

              <Button
                onClick={() => onShare(performance.id)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-white"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">{performance.shares}</span>
              </Button>
            </div>

            <div className="text-gray-400 text-xs">
              {performance.duration}s
            </div>
          </div>
        </div>
      </div>

      {/* Reality Check Animation Overlay */}
      <AnimatePresence>
        {showRealityCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1 }}
                className="text-6xl mb-4"
              >
                🎭
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Reality Check!</h3>
              <p className="text-gray-300">Community rating revealed...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DiscoveryFeedV2() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [performances, setPerformances] = useState<PerformancePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { likePerformance, commentOnPerformance } = useFarcasterIntegration();

  // Mock data for now - will be replaced with real Farcaster data
  useEffect(() => {
    const mockPerformances: PerformancePost[] = [
      {
        id: '1',
        author: {
          fid: 123,
          username: 'vocalist1',
          displayName: 'Sarah Chen',
          pfpUrl: 'https://via.placeholder.com/40'
        },
        challenge: 'Happy Birthday',
        audioUrl: '/audio/sample1.mp3',
        duration: 12,
        selfRating: 5,
        communityRating: 2,
        gap: -3,
        likes: 24,
        comments: 8,
        shares: 3,
        timestamp: new Date(),
        realityRevealed: true
      },
      {
        id: '2',
        author: {
          fid: 456,
          username: 'singer2',
          displayName: 'Mike Johnson',
          pfpUrl: 'https://via.placeholder.com/40'
        },
        challenge: 'Twinkle Twinkle Little Star',
        audioUrl: '/audio/sample2.mp3',
        duration: 8,
        selfRating: 3,
        communityRating: 4,
        gap: 1,
        likes: 15,
        comments: 5,
        shares: 2,
        timestamp: new Date(),
        realityRevealed: true
      }
    ];

    setPerformances(mockPerformances);
    setIsLoading(false);
  }, []);

  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'down' && currentIndex < performances.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleLike = async (id: string) => {
    const success = await likePerformance(id);
    if (success) {
      setPerformances(prev => prev.map(p => 
        p.id === id ? { ...p, likes: p.likes + (p.isLiked ? -1 : 1), isLiked: !p.isLiked } : p
      ));
    }
  };

  const handleComment = async (id: string) => {
    await commentOnPerformance(id);
  };

  const handleShare = async (id: string) => {
    // Implement sharing logic
    console.log('Sharing performance:', id);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading performances...</p>
        </div>
      </div>
    );
  }

  return (
    <FeatureUnlock feature="discovery">
      <div className="relative h-full bg-black overflow-hidden">
        {/* Contextual Tip for new users */}
        <ContextualTip
          id="discovery-swipe-tip"
          title="Swipe to Navigate"
          description="Swipe up/down to browse performances. Tap play to hear them!"
          showOnlyForNewUsers={true}
          autoHide={5}
          position="top"
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
        />

        {/* Performance Cards */}
        <AnimatePresence mode="wait">
          {performances[currentIndex] && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <FeedCard
                performance={performances[currentIndex]}
                isActive={true}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onSwipe={handleSwipe}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Indicators */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2">
          {performances.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-8 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Swipe Hints */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-gray-400 text-xs">Swipe up/down to browse</p>
        </div>
      </div>
    </FeatureUnlock>
  );
}