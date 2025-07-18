"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  Pause,
  Volume2,
  MoreHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";
import { useDiscoveryFeed } from "@/hooks/useDiscoveryFeed";
import { FeatureUnlock, ContextualTip } from "@/components/onboarding";
import {
  coldStartContentService,
  SeedPerformance,
} from "@/lib/coldstart/ColdStartContentService";

interface FeedCardProps {
  performance: SeedPerformance;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onSwipe: (direction: "up" | "down") => void;
  showColdStartHints: boolean;
}

function FeedCard({
  performance,
  isActive,
  onLike,
  onComment,
  onShare,
  onSwipe,
  showColdStartHints,
}: FeedCardProps) {
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
      onSwipe("up");
    } else if (info.offset.y > threshold) {
      onSwipe("down");
    }
  };

  const getRealityCheckColor = () => {
    if (!performance.gap) return "text-gray-400";
    if (Math.abs(performance.gap) <= 1) return "text-green-400";
    if (Math.abs(performance.gap) <= 2) return "text-yellow-400";
    return "text-red-400";
  };

  const getRealityCheckMessage = () => {
    if (!performance.gap) return "";
    const gap = Math.abs(performance.gap);
    if (gap === 0) return "Perfect self-awareness! 🎯";
    if (gap <= 1) return "Pretty accurate! 👍";
    if (gap <= 2) return "Reality check! 😅";
    return "Major reality check! 😱";
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
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
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
              <AvatarFallback>
                {performance.author.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white text-sm">
                  {performance.author.displayName}
                </p>
                {performance.author.isVerified && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    ✓
                  </Badge>
                )}
                {performance.author.isSeedAccount && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 border-purple-400 text-purple-400"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Demo
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 text-xs">
                @{performance.author.username}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Cold Start Encouragement Banner */}
        {showColdStartHints && performance.author.isSeedAccount && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-2 p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30"
          >
            <div className="flex items-center gap-2 text-sm text-purple-200">
              <Users className="w-4 h-4" />
              <span>Be the first to try this challenge!</span>
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center p-6">
          {/* Challenge Title */}
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            "{performance.challengeTitle}"
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
                <p className="text-yellow-400 font-bold text-lg">
                  {performance.selfRating}⭐
                </p>
              </div>

              {performance.communityRating !== undefined ? (
                <>
                  <div className="text-gray-400">→</div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Community</p>
                    <p className="text-blue-400 font-bold text-lg">
                      {performance.communityRating}⭐
                    </p>
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
                className={`flex items-center gap-2 ${
                  performance.isLiked ? "text-red-400" : "text-white"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    performance.isLiked ? "fill-current" : ""
                  }`}
                />
                <span className="text-sm">{performance.engagement.likes}</span>
              </Button>

              <Button
                onClick={() => onComment(performance.id)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-white"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">
                  {performance.engagement.comments}
                </span>
              </Button>

              <Button
                onClick={() => onShare(performance.id)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-white"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">{performance.engagement.shares}</span>
              </Button>
            </div>

            <div className="text-gray-400 text-xs">{performance.duration}s</div>
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
              <h3 className="text-2xl font-bold text-white mb-2">
                Reality Check!
              </h3>
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
  const [performances, setPerformances] = useState<SeedPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showColdStartHints, setShowColdStartHints] = useState(false);
  const { likePerformance, commentOnPerformance } = useFarcasterIntegration();

  // Load content using cold start service
  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        const { performances: feedContent, strategy } =
          await coldStartContentService.getDiscoveryFeedContent(10, 0);

        setPerformances(feedContent);
        setShowColdStartHints(
          strategy.showSeedContent && strategy.seedContentRatio > 0.5
        );

        // Add realityRevealed property for existing functionality
        const enhancedPerformances = feedContent.map((perf) => ({
          ...perf,
          realityRevealed: perf.communityRating !== undefined,
        }));

        setPerformances(enhancedPerformances);
      } catch (error) {
        console.error("Failed to load discovery feed content:", error);
        // Fallback to empty state - user will see encouragement messages
        setPerformances([]);
        setShowColdStartHints(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === "down" && currentIndex < performances.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleLike = async (id: string) => {
    try {
      await likePerformance(id);
      // If no error was thrown, consider it successful
      setPerformances((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                engagement: {
                  ...p.engagement,
                  likes: p.engagement.likes + (p.isLiked ? -1 : 1),
                },
                isLiked: !p.isLiked,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Failed to like performance:", error);
      // Optionally show user feedback about the error
    }
  };

  const handleComment = async (id: string) => {
    // For now, we'll use a placeholder comment since this is just a demo
    // In a real implementation, this would open a comment dialog
    try {
      await commentOnPerformance(id, "Great performance! 🎤");
      console.log("Comment added successfully");
    } catch (error) {
      console.error("Failed to comment on performance:", error);
    }
  };

  const handleShare = async (id: string) => {
    // Implement sharing logic
    console.log("Sharing performance:", id);
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

  if (performances.length === 0) {
    return (
      <FeatureUnlock feature="discovery">
        <div className="h-full flex items-center justify-center bg-black p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🎤</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start the Show?
            </h3>
            <p className="text-gray-400 mb-6">
              {coldStartContentService.getEncouragementMessage()}
            </p>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => {
                // Navigate to challenges - this would be implemented based on your routing
                console.log("Navigate to challenges");
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Challenges
            </Button>
          </div>
        </div>
      </FeatureUnlock>
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
                showColdStartHints={showColdStartHints}
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
                index === currentIndex ? "bg-white" : "bg-white/30"
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
