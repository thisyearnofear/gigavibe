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
  Zap,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";
import { useCrossTab, useTabContext } from "@/contexts/CrossTabContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DiscoveryFeedProps {
  initialFeedType?: string;
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
}

interface FeedCardProps {
  performance: PerformancePost;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onSwipe: (direction: "up" | "down") => void;
}

function FeedCard({
  performance,
  isActive,
  onLike,
  onComment,
  onShare,
  onSwipe,
}: FeedCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { navigateWithContext } = useCrossTab();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold) {
      onSwipe("up");
    } else if (info.offset.y > threshold) {
      onSwipe("down");
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(performance.id);
  };

  const handleJudgeClick = () => {
    navigateWithContext("judging", {
      highlightPerformance: performance.id,
      fromDiscovery: true,
    });
  };

  const gapColor =
    performance.gap > 0
      ? "text-green-400"
      : performance.gap < 0
      ? "text-red-400"
      : "text-yellow-400";

  const gapText =
    performance.gap > 0 ? `+${performance.gap}` : performance.gap.toString();

  return (
    <motion.div
      className="relative h-full w-full bg-gradient-to-b from-black/20 to-black/60 rounded-3xl overflow-hidden"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.95 }}
    >
      {/* Background Audio Visualization */}
      <div className="absolute inset-0 bg-gradient-to-br from-gigavibe-600/20 via-purple-600/10 to-pink-600/20" />

      {/* New Performance Badge */}
      {performance.isNew && (
        <motion.div
          className="absolute top-4 left-4 z-10"
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Badge className="bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white border-0 px-3 py-1">
            <Zap className="w-3 h-3 mr-1" />
            New
          </Badge>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Top Section - Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-white/20">
              <AvatarImage src={performance.author.pfpUrl} />
              <AvatarFallback className="bg-gigavibe-600 text-white">
                {performance.author.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold">
                {performance.author.displayName}
              </p>
              <p className="text-gray-300 text-sm">
                @{performance.author.username}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Middle Section - Challenge Info */}
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              "{performance.challenge}"
            </h3>
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="outline" className="border-white/30 text-white">
                {performance.duration}s
              </Badge>
              {performance.realityRevealed && (
                <div className="flex items-center space-x-2">
                  <span className="text-white/70">Reality Gap:</span>
                  <span className={`font-bold ${gapColor}`}>{gapText}⭐</span>
                </div>
              )}
            </div>
          </div>

          {/* Audio Player */}
          <motion.button
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </motion.button>

          {/* Rating Comparison */}
          {performance.realityRevealed && (
            <div className="bg-black/40 rounded-2xl p-4 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-gray-300 text-sm">Self-Rated</p>
                  <p className="text-2xl font-bold text-white">
                    {performance.selfRating}⭐
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-300 text-sm">Community</p>
                  <p className="text-2xl font-bold text-white">
                    {performance.communityRating}⭐
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section - Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.button
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
            >
              <Heart
                className={`w-6 h-6 ${
                  isLiked ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
              <span className="text-white font-medium">
                {performance.likes + (isLiked ? 1 : 0)}
              </span>
            </motion.button>

            <motion.button
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onComment(performance.id)}
            >
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="text-white font-medium">
                {performance.comments}
              </span>
            </motion.button>

            <motion.button
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onShare(performance.id)}
            >
              <Share2 className="w-6 h-6 text-white" />
              <span className="text-white font-medium">
                {performance.shares}
              </span>
            </motion.button>
          </div>

          {!performance.realityRevealed && (
            <Button
              onClick={handleJudgeClick}
              className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Judge
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function DiscoveryFeed({
  initialFeedType = "foryou",
}: DiscoveryFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { likePerformance, commentOnPerformance } = useFarcasterIntegration();
  const { context: tabContext, clearContext } = useTabContext("discovery");
  const queryClient = useQueryClient();

  const fetchPerformances = async () => {
    const response = await fetch("/api/farcaster/cast?action=fetchChannel&channelId=gigavibe");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  const transformCastToPerformancePost = (cast: any): PerformancePost => {
    const audioEmbed = cast.embeds?.find(embed => embed.url?.startsWith('lens://'));
    const selfRatingMatch = cast.text?.match(/(\d+)⭐/);

    return {
      id: cast.hash,
      author: {
        fid: cast.author.fid,
        username: cast.author.username,
        displayName: cast.author.display_name,
        pfpUrl: cast.author.pfp_url,
      },
      challenge: cast.text?.split('"')[1] || 'Unknown Challenge',
      audioUrl: audioEmbed?.url || '',
      duration: 30, // Default duration
      selfRating: selfRatingMatch ? parseInt(selfRatingMatch[1]) : 3,
      communityRating: 0, // Placeholder
      gap: 0, // Placeholder
      likes: cast.reactions?.likes_count || 0,
      comments: cast.reactions?.replies_count || 0,
      shares: cast.reactions?.recasts_count || 0,
      timestamp: new Date(cast.timestamp),
      realityRevealed: false, // Placeholder
    };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["performances"],
    queryFn: fetchPerformances,
    select: (data) => {
      return {
        performances: data.casts.map(transformCastToPerformancePost),
      };
    },
  });

  const performances = data?.performances || [];

  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up" && currentIndex < performances.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleLike = async (id: string) => {
    try {
      await likePerformance(id);
      // Update the cache optimistically
      queryClient.setQueryData(["performances"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          performances: oldData.performances.map((p: PerformancePost) =>
            p.id === id ? { ...p, likes: p.likes + 1 } : p
          ),
        };
      });
    } catch (error) {
      console.error("Failed to like performance:", error);
    }
  };

  const handleComment = async (id: string) => {
    // Navigate to comment view or open comment modal
    console.log("Comment on performance:", id);
  };

  const handleShare = async (id: string) => {
    const performance = performances.find((p) => p.id === id);
    if (!performance) return;

    const shareText = `Check out this vocal reality check on GIGAVIBE! 🎵\n\n"${
      performance.challenge
    }" - ${performance.author.displayName}\nSelf-rated: ${
      performance.selfRating
    }⭐\nCommunity: ${performance.communityRating}⭐\nGap: ${
      performance.gap > 0 ? "+" : ""
    }${performance.gap}⭐`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "GIGAVIBE Performance",
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        // Show toast notification
        console.log("Copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gigavibe-mesh flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-gigavibe-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/70">Loading performances...</p>
        </div>
      </div>
    );
  }

  if (performances.length === 0) {
    return (
      <div className="min-h-screen bg-gigavibe-mesh flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            No Performances Yet
          </h2>
          <p className="text-gray-400 mb-6">
            Be the first to share a vocal challenge!
          </p>
          <Button
            className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600"
            onClick={() => {
              // Navigate to challenge tab
              window.dispatchEvent(
                new CustomEvent("gigavibe-navigate", {
                  detail: { tab: "challenge" },
                })
              );
            }}
          >
            Start Singing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gigavibe-mesh relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />

      {/* Feed Type Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Badge
          variant="outline"
          className="border-white/30 text-white bg-black/20 backdrop-blur-sm"
        >
          {initialFeedType === "foryou" ? "For You" : "Following"}
        </Badge>
      </div>

      {/* Main Feed Container */}
      <div className="relative h-screen pt-16 pb-20">
        {/* Performance Cards */}
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
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2 z-10">
          {performances.map((_, index) => (
            <motion.div
              key={index}
              className={`w-1 h-8 rounded-full transition-colors cursor-pointer ${
                index === currentIndex ? "bg-white" : "bg-white/30"
              }`}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Swipe Instructions */}
        {currentIndex === 0 && (
          <motion.div
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <p className="text-white/70 text-sm">
              Swipe up for next performance
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
