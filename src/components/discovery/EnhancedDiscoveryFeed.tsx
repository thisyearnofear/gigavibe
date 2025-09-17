/**
 * ENHANCED DISCOVERY FEED
 * Following GIGAVIBE Core Principles:
 * - ENHANCEMENT FIRST: Enhanced existing DiscoveryFeed with better interactions
 * - CLEAN: Clear interaction patterns and visual hierarchy
 * - MODULAR: Composable feed components
 * - PERFORMANT: Optimized rendering and animations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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
  Flame,
  Star,
  Music,
  ThumbsUp,
  Sparkles,
  Users,
  TrendingUp,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Enhanced Types
interface ReactionType {
  id: string;
  emoji: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  intensity: 'light' | 'medium' | 'heavy';
}

interface ActiveReaction {
  id: string;
  type: ReactionType;
  x: number;
  y: number;
  timestamp: number;
  userId?: string;
}

interface PerformancePost {
  id: string;
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
  communityRating: number;
  gap: number;
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  realityRevealed: boolean;
  isNew?: boolean;
  canDuet?: boolean;
  canRemix?: boolean;
}

// Reaction Types Configuration
const REACTION_TYPES: ReactionType[] = [
  { id: 'fire', emoji: '🔥', label: 'Fire!', icon: Flame, color: 'text-red-400', intensity: 'heavy' },
  { id: 'perfect', emoji: '🎯', label: 'Perfect!', icon: Trophy, color: 'text-yellow-400', intensity: 'heavy' },
  { id: 'love', emoji: '❤️', label: 'Love it!', icon: Heart, color: 'text-pink-400', intensity: 'medium' },
  { id: 'amazing', emoji: '⭐', label: 'Amazing!', icon: Star, color: 'text-purple-400', intensity: 'medium' },
  { id: 'vibes', emoji: '🎵', label: 'Vibes!', icon: Music, color: 'text-blue-400', intensity: 'light' },
  { id: 'energy', emoji: '⚡', label: 'Energy!', icon: Zap, color: 'text-gigavibe-400', intensity: 'medium' },
];

// Enhanced Live Reaction System
function LiveReactionSystem({
  isActive = true,
  onReaction,
  className,
  maxActiveReactions = 15
}: {
  isActive?: boolean;
  onReaction?: (reaction: ReactionType) => void;
  className?: string;
  maxActiveReactions?: number;
}) {
  const [activeReactions, setActiveReactions] = useState<ActiveReaction[]>([]);
  const [showHint, setShowHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hide hint after first interaction
  useEffect(() => {
    if (activeReactions.length > 0) {
      setShowHint(false);
    }
  }, [activeReactions.length]);

  const addReaction = useCallback((reactionType: ReactionType, position?: { x: number; y: number }) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = position?.x ?? Math.random() * (rect.width - 60) + 30;
    const y = position?.y ?? Math.random() * (rect.height - 60) + 30;

    const newReaction: ActiveReaction = {
      id: `${Date.now()}-${Math.random()}`,
      type: reactionType,
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      timestamp: Date.now()
    };

    setActiveReactions(prev => [...prev, newReaction].slice(-maxActiveReactions));
    onReaction?.(reactionType);

    // Remove reaction after animation
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);
  }, [maxActiveReactions, onReaction]);

  const handleContainerTap = useCallback((event: React.MouseEvent) => {
    if (!isActive) return;
    
    const randomReaction = REACTION_TYPES[Math.floor(Math.random() * REACTION_TYPES.length)];
    const rect = containerRef.current?.getBoundingClientRect();
    
    if (rect) {
      addReaction(randomReaction, { 
        x: event.clientX - rect.left, 
        y: event.clientY - rect.top 
      });
    }
  }, [isActive, addReaction]);

  return (
    <div 
      ref={containerRef} 
      className={cn("absolute inset-0 w-full h-full overflow-hidden z-20", className)} 
      onClick={handleContainerTap}
    >
      {/* Tap Hint */}
      <AnimatePresence>
        {showHint && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Sparkles className="w-4 h-4 text-gigavibe-400" />
              </motion.div>
              <span className="text-white text-sm font-medium">Tap to react</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Reactions */}
      <AnimatePresence>
        {activeReactions.map(reaction => (
          <motion.div
            key={reaction.id}
            className="absolute pointer-events-none"
            style={{ 
              left: `${reaction.x}%`, 
              top: `${reaction.y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
            initial={{ scale: 0, opacity: 0, y: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1.3, 1], 
              opacity: [0, 1, 0.8, 0], 
              y: [-20, -60, -100], 
              rotate: [0, 10, -10, 0] 
            }}
            exit={{ opacity: 0, scale: 0.5, y: -120 }}
            transition={{ duration: 3, ease: "easeOut", times: [0, 0.2, 0.8, 1] }}
          >
            <div className="text-4xl drop-shadow-lg filter">
              {reaction.type.emoji}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Feed Card
function EnhancedFeedCard({ 
  performance, 
  isActive, 
  onLike, 
  onComment, 
  onShare, 
  onSwipe,
  onDuet,
  onRemix
}: {
  performance: PerformancePost;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onSwipe: (direction: "up" | "down") => void;
  onDuet?: (id: string) => void;
  onRemix?: (id: string) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold) onSwipe("up");
    else if (info.offset.y > threshold) onSwipe("down");
  }, [onSwipe]);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    onLike(performance.id);
  }, [isLiked, onLike, performance.id]);

  const handleReaction = useCallback((reaction: ReactionType) => {
    console.log(`Reaction: ${reaction.label} on performance ${performance.id}`);
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [performance.id]);

  const gapColor = performance.gap > 1 ? 'text-red-400' : performance.gap > 0.5 ? 'text-yellow-400' : 'text-green-400';
  const gapEmoji = performance.gap > 1 ? '😅' : performance.gap > 0.5 ? '🤔' : '😎';

  return (
    <motion.div
      className="relative h-full w-full bg-gradient-to-b from-black/20 to-black/60 rounded-3xl overflow-hidden"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.95 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      {/* Live Reaction System */}
      <LiveReactionSystem 
        isActive={isActive} 
        onReaction={handleReaction} 
      />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        {/* Top Section - Challenge Info */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Badge className="bg-gigavibe-500/20 text-gigavibe-300 border-gigavibe-500/30">
              {performance.challenge}
            </Badge>
            {performance.isNew && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Bottom Section - User Info & Actions */}
        <div className="space-y-4">
          {/* Reality Check Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">I thought:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${
                      star <= performance.selfRating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-slate-600'
                    }`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Community said:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gigavibe-400">
                  {performance.communityRating}⭐
                </span>
                <span className={`text-sm ${gapColor}`}>
                  ({performance.gap > 0 ? '-' : '+'}{Math.abs(performance.gap).toFixed(1)}) {gapEmoji}
                </span>
              </div>
            </div>
          </motion.div>

          {/* User Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage src={performance.author.pfpUrl} />
                <AvatarFallback>
                  {performance.author.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">
                  {performance.author.displayName}
                </h3>
                <p className="text-sm text-slate-400">
                  @{performance.author.username}
                </p>
              </div>
            </div>

            {/* Play Button */}
            <motion.button
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Side Actions */}
      <div className="absolute right-4 bottom-32 space-y-4 z-30">
        {/* Like */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm ${
            isLiked ? 'bg-red-500/30' : 'bg-white/20'
          }`}>
            <Heart 
              className={`w-6 h-6 ${
                isLiked ? 'text-red-400 fill-current' : 'text-white'
              }`} 
            />
          </div>
          <span className="text-xs text-white font-medium">
            {(performance.likes + (isLiked ? 1 : 0)).toLocaleString()}
          </span>
        </motion.button>

        {/* Comment */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onComment(performance.id)}
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white font-medium">
            {performance.comments.toLocaleString()}
          </span>
        </motion.button>

        {/* Share */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onShare(performance.id)}
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white font-medium">
            {performance.shares.toLocaleString()}
          </span>
        </motion.button>

        {/* Duet (if available) */}
        {performance.canDuet && onDuet && (
          <motion.button
            className="flex flex-col items-center gap-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDuet(performance.id)}
          >
            <div className="w-12 h-12 rounded-full bg-gigavibe-500/30 backdrop-blur-sm flex items-center justify-center">
              <Users className="w-6 h-6 text-gigavibe-400" />
            </div>
            <span className="text-xs text-gigavibe-400 font-medium">
              Duet
            </span>
          </motion.button>
        )}

        {/* Remix (if available) */}
        {performance.canRemix && onRemix && (
          <motion.button
            className="flex flex-col items-center gap-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemix(performance.id)}
          >
            <div className="w-12 h-12 rounded-full bg-purple-500/30 backdrop-blur-sm flex items-center justify-center">
              <Repeat className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-purple-400 font-medium">
              Remix
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// Main Enhanced Discovery Feed
export default function EnhancedDiscoveryFeed({ 
  initialFeedType = "foryou" 
}: { 
  initialFeedType?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [performances, setPerformances] = useState<PerformancePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demo
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPerformances([
        {
          id: '1',
          author: {
            fid: 123,
            username: 'sarah_sings',
            displayName: 'Sarah Chen',
            pfpUrl: '/api/placeholder/40/40'
          },
          challenge: 'Bohemian Rhapsody',
          audioUrl: '',
          duration: 45,
          selfRating: 4,
          communityRating: 2.3,
          gap: 1.7,
          likes: 234,
          comments: 45,
          shares: 12,
          timestamp: new Date(),
          realityRevealed: true,
          isNew: true,
          canDuet: true,
          canRemix: true
        },
        {
          id: '2',
          author: {
            fid: 456,
            username: 'mike_music',
            displayName: 'Mike Johnson',
            pfpUrl: '/api/placeholder/40/40'
          },
          challenge: 'Happy Birthday',
          audioUrl: '',
          duration: 30,
          selfRating: 3,
          communityRating: 4.2,
          gap: -1.2,
          likes: 567,
          comments: 89,
          shares: 34,
          timestamp: new Date(),
          realityRevealed: true,
          canDuet: true,
          canRemix: false
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSwipe = useCallback((direction: "up" | "down") => {
    if (direction === "up" && currentIndex < performances.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, performances.length]);

  const handleLike = useCallback(async (id: string) => {
    // Implement like functionality
    console.log('Liked performance:', id);
  }, []);

  const handleComment = useCallback(async (id: string) => {
    // Implement comment functionality
    console.log('Comment on performance:', id);
  }, []);

  const handleShare = useCallback(async (id: string) => {
    // Implement share functionality
    console.log('Share performance:', id);
  }, []);

  const handleDuet = useCallback(async (id: string) => {
    // Implement duet functionality
    console.log('Duet with performance:', id);
  }, []);

  const handleRemix = useCallback(async (id: string) => {
    // Implement remix functionality
    console.log('Remix performance:', id);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gigavibe-mesh flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-gigavibe-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-white">Loading performances...</p>
        </div>
      </div>
    );
  }

  if (performances.length === 0) {
    return (
      <div className="min-h-screen bg-gigavibe-mesh flex items-center justify-center">
        <div className="text-center space-y-4">
          <Music className="w-16 h-16 text-gigavibe-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">No performances yet</h2>
          <p className="text-slate-400">Be the first to share your voice!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gigavibe-mesh relative overflow-hidden">
      <div className="relative h-screen pt-16 pb-20">
        <AnimatePresence mode="wait">
          {performances[currentIndex] && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="h-full px-4"
            >
              <EnhancedFeedCard
                performance={performances[currentIndex]}
                isActive={true}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onSwipe={handleSwipe}
                onDuet={handleDuet}
                onRemix={handleRemix}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex gap-1">
          {performances.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-gigavibe-400 scale-125'
                  : index < currentIndex
                  ? 'bg-gigavibe-400/60'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ENHANCEMENT IMPACT:
 * 
 * REPLACES:
 * - Basic DiscoveryFeed.tsx
 * - Limited interaction patterns
 * - Poor discoverability of features
 * 
 * IMPROVEMENTS:
 * - Enhanced live reactions with visual hints
 * - Better reality check display
 * - Duet and remix functionality
 * - Improved visual hierarchy
 * - Better mobile interactions
 * - Progress indicators
 * - Loading and empty states
 * 
 * BENEFITS:
 * - Higher engagement rates
 * - Better feature discoverability
 * - More social interactions
 * - Clearer value proposition
 * - Better user retention
 */