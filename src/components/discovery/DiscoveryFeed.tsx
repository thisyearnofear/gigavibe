"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share,
  TrendingUp,
  Flame,
  Star,
  Zap,
  Users,
} from "lucide-react";
import { useDiscoveryFeed } from "@/hooks/useDiscoveryFeed";
import { RealityCheckResult } from "@/lib/zora/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContinuousUpload from "./ContinuousUpload";
import PerformanceCardGenerator from "@/components/community/PerformanceCardGenerator";

interface DiscoveryFeedProps {
  initialFeedType?: "trending" | "foryou" | "recent" | "viral";
}

export default function DiscoveryFeed({
  initialFeedType = "foryou",
}: DiscoveryFeedProps) {
  const [feedType, setFeedType] = useState<
    "trending" | "foryou" | "recent" | "viral"
  >(initialFeedType);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCommunityCard, setShowCommunityCard] = useState(false);
  const {
    performances,
    loading,
    refreshFeed,
    ratePerformance,
    sharePerformance,
    likePerformance,
    commentPerformance,
    getCommunityOwnership,
  } = useDiscoveryFeed(feedType);

  // Will be set after loading checks
  let currentPerformance: RealityCheckResult | undefined;

  const handleSwipeUp = () => {
    if (currentIndex < performances.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(false);
    } else {
      refreshFeed();
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (currentPerformance) {
      await ratePerformance(currentPerformance.id, rating);
      setTimeout(handleSwipeUp, 1000);
    }
  };

  const handleLike = async () => {
    if (currentPerformance) {
      await likePerformance(currentPerformance.id);
    }
  };

  const handleComment = async () => {
    if (currentPerformance) {
      await commentPerformance(currentPerformance.id);
    }
  };

  const handleShare = async () => {
    if (currentPerformance) {
      await sharePerformance(currentPerformance.id);
    }
  };

  const toggleCommunityCard = () => {
    setShowCommunityCard(!showCommunityCard);
  };

  const getViralityBadge = (performance: RealityCheckResult) => {
    if (performance.shareCount >= 1000)
      return { label: "VIRAL", color: "bg-red-500", icon: Flame };
    if (performance.shareCount >= 100)
      return { label: "TRENDING", color: "bg-orange-500", icon: TrendingUp };
    if (performance.communityRating >= 4.5)
      return { label: "LEGENDARY", color: "bg-purple-500", icon: Star };
    if (performance.gap >= 3)
      return { label: "REALITY GAP", color: "bg-blue-500", icon: Zap };
    return null;
  };

  const getGapEmoji = (gap: number) => {
    if (gap >= 3) return "😅";
    if (gap >= 2) return "🤔";
    if (gap <= -2) return "😲";
    if (Math.abs(gap) <= 0.5) return "🎯";
    return "😐";
  };

  if (loading || performances.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading amazing performances...</p>
        </div>
      </div>
    );
  }

  // Set the currentPerformance with fallback
  currentPerformance = performances[currentIndex] || performances[0];
  if (!currentPerformance) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center p-6 bg-black/50 backdrop-blur-md rounded-2xl max-w-md">
          <p className="text-white text-xl mb-4">No performances found</p>
          <p className="text-gray-300">
            Try another feed type or check back later
          </p>
          <button
            className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white"
            onClick={() => refreshFeed()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50">
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-center pt-12 pb-4 z-30 relative">
          <div className="flex bg-black/50 rounded-full p-1">
            {["foryou", "trending", "viral", "recent"].map((type) => (
              <button
                key={type}
                onClick={(e) => {
                  // Stop propagation to prevent touch handler interference
                  e.stopPropagation();
                  setFeedType(
                    type as "trending" | "foryou" | "recent" | "viral"
                  );
                  setCurrentIndex(0);
                  refreshFeed();
                }}
                aria-pressed={feedType === type}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  feedType === type
                    ? "bg-white text-black shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                style={{
                  minWidth: "90px",
                  marginLeft: type !== "foryou" ? "4px" : "0",
                }}
              >
                {type === "foryou"
                  ? "For You"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Content */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {showCommunityCard ? (
              <motion.div
                key={`card-${currentPerformance.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center p-6"
              >
                <PerformanceCardGenerator
                  performance={currentPerformance}
                  communityOwnership={getCommunityOwnership(
                    currentPerformance.id
                  )}
                  showCommunityGrid={true}
                />
              </motion.div>
            ) : (
              <motion.div
                key={currentPerformance.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col justify-center p-6"
              >
                {/* Virality Badge */}
                {getViralityBadge(currentPerformance) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-6 right-6"
                  >
                    <Badge
                      className={`${
                        getViralityBadge(currentPerformance)?.color
                      } text-white flex items-center gap-1`}
                    >
                      {React.createElement(
                        getViralityBadge(currentPerformance)?.icon || Star,
                        { className: "w-3 h-3" }
                      )}
                      {getViralityBadge(currentPerformance)?.label}
                    </Badge>
                  </motion.div>
                )}

                {/* Performance Info */}
                <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 mb-4 max-w-lg mx-auto w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {currentPerformance.userAddress
                          .slice(2, 4)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {currentPerformance.challengeTitle}
                      </h3>
                      <p className="text-gray-300 text-sm">Anonymous Singer</p>
                    </div>
                  </div>

                  {/* Reality Check Stats */}
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-2">
                        {getGapEmoji(currentPerformance.gap)}
                      </div>
                      <p className="text-white text-lg">
                        "I thought{" "}
                        <span className="text-purple-400">
                          {currentPerformance.selfRating}⭐
                        </span>
                        ... they said{" "}
                        <span className="text-pink-400">
                          {currentPerformance.communityRating}⭐
                        </span>
                        "
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-300 italic">
                        "{currentPerformance.wittyCommentary}"
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>{currentPerformance.shareCount} shares</span>
                    <span>Gap: {currentPerformance.gap.toFixed(1)}⭐</span>
                    <span>{currentPerformance.category}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-30">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸️" : "▶️"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
            aria-label="Like"
          >
            <Heart className="w-6 h-6 text-white" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleComment();
            }}
            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
            aria-label="Comment"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
            aria-label="Share"
          >
            <Share className="w-6 h-6 text-white" />
          </motion.button>

          {/* Community Card Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleCommunityCard();
            }}
            className={`w-14 h-14 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg ${
              showCommunityCard ? "bg-purple-500" : "bg-white/20"
            }`}
            aria-label="Community Card"
            aria-pressed={showCommunityCard}
          >
            <Users className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Rating Interface */}
        <div className="absolute bottom-6 left-6 right-20 z-30">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-5 shadow-lg">
            <p className="text-white text-sm mb-4 text-center font-medium">
              Rate this performance:
            </p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <motion.button
                  key={rating}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(255,255,255,0.3)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(rating);
                  }}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold shadow-lg"
                  aria-label={`Rate ${rating} stars`}
                >
                  {rating}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Swipe Indicators */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-2 text-white/50 text-xs">
          Swipe up for next • Swipe down for previous
        </div>

        {/* Continuous Upload Button */}
        <ContinuousUpload
          onUpload={async (performance) => {
            console.log("New performance uploaded:", performance);

            // TODO: In next chunk, we'll integrate with Supabase to store this real audio
            // For now, we can add it to the local feed for immediate feedback
            const newPerformance = {
              id: performance.id,
              eventId: "user-upload",
              challengeTitle: performance.challengeTitle,
              challengeId: "user-generated",
              userAddress: "0x0000000000000000000000000000000000000000" as any, // Will be real address from wallet
              selfRating: performance.selfRating,
              communityRating: performance.selfRating, // Start with self-rating
              gap: 0, // No gap initially
              wittyCommentary:
                "Fresh upload! Let's see what the community thinks...",
              shareCount: 0,
              timestamp: performance.timestamp,
              audioUrl: performance.audioUrl, // Real audio URL from recording
              category: "quality" as const,
            };

            // Add to the beginning of the feed for immediate visibility
            // This will be replaced with proper backend integration in next chunk
            console.log("Would add to feed:", newPerformance);
          }}
        />
      </div>

      {/* Touch Handlers */}
      <div
        className="absolute inset-0 z-20"
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const handleTouchEnd = (endEvent: TouchEvent) => {
            const endY = endEvent.changedTouches[0].clientY;
            const diff = startY - endY;

            if (Math.abs(diff) > 50) {
              if (diff > 0) {
                handleSwipeUp();
              } else {
                handleSwipeDown();
              }
            }

            document.removeEventListener("touchend", handleTouchEnd);
          };

          document.addEventListener("touchend", handleTouchEnd);
        }}
      />
    </div>
  );
}
