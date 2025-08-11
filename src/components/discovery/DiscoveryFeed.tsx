"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Flame,
  Star as StarIcon, // Renamed to avoid conflict
  Music,
  ThumbsUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";
import { useCrossTab, useTabContext } from "@/contexts/CrossTabContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// Types from LiveReactionSystem
export interface ReactionType {
  id: string;
  emoji: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  intensity: 'light' | 'medium' | 'heavy';
}

export interface ActiveReaction {
  id: string;
  type: ReactionType;
  x: number;
  y: number;
  timestamp: number;
  userId?: string;
  username?: string;
}

const REACTION_TYPES: ReactionType[] = [
    { id: 'fire', emoji: '🔥', label: 'Fire!', icon: Flame, color: 'text-red-400', intensity: 'heavy' },
    { id: 'perfect', emoji: '🎯', label: 'Perfect!', icon: Trophy, color: 'text-yellow-400', intensity: 'heavy' },
    { id: 'love', emoji: '❤️', label: 'Love it!', icon: Heart, color: 'text-pink-400', intensity: 'medium' },
    { id: 'amazing', emoji: '⭐', label: 'Amazing!', icon: StarIcon, color: 'text-purple-400', intensity: 'medium' },
    { id: 'vibes', emoji: '🎵', label: 'Vibes!', icon: Music, color: 'text-blue-400', intensity: 'light' },
    { id: 'energy', emoji: '⚡', label: 'Energy!', icon: Zap, color: 'text-gigavibe-400', intensity: 'medium' },
    { id: 'nice', emoji: '👍', label: 'Nice!', icon: ThumbsUp, color: 'text-green-400', intensity: 'light' },
    { id: 'magic', emoji: '✨', label: 'Magic!', icon: Sparkles, color: 'text-yellow-300', intensity: 'heavy' }
];

// LiveReactionSystem component logic integrated into FeedCard
function LiveReactionSystem({
  isActive = true,
  onReaction,
  className,
  showReactionButtons = true,
  maxActiveReactions = 20
}: any) {
    const [activeReactions, setActiveReactions] = useState<ActiveReaction[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const addReaction = (reactionType: ReactionType, position?: { x: number; y: number }) => {
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

        setTimeout(() => {
            setActiveReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 3000);
    };

    const handleContainerTap = (event: React.MouseEvent) => {
        if (!isActive) return;
        const randomReaction = REACTION_TYPES[Math.floor(Math.random() * REACTION_TYPES.length)];
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            addReaction(randomReaction, { x: event.clientX - rect.left, y: event.clientY - rect.top });
        }
    };

    return (
        <div ref={containerRef} className={cn("absolute inset-0 w-full h-full overflow-hidden z-20", className)} onClick={handleContainerTap}>
            <AnimatePresence>
                {activeReactions.map(reaction => (
                    <motion.div
                        key={reaction.id}
                        className="absolute pointer-events-none"
                        style={{ left: `${reaction.x}%`, top: `${reaction.y}%`, transform: 'translate(-50%, -50%)' }}
                        initial={{ scale: 0, opacity: 0, y: 0, rotate: 0 }}
                        animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.8, 0], y: [-20, -60, -100], rotate: [0, 10, -10, 0] }}
                        exit={{ opacity: 0, scale: 0.5, y: -120 }}
                        transition={{ duration: 3, ease: "easeOut", times: [0, 0.2, 0.8, 1] }}
                    >
                        <div className="text-4xl drop-shadow-lg">{reaction.type.emoji}</div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}


interface PerformancePost {
  id: string;
  author: { fid: number; username: string; displayName: string; pfpUrl: string; };
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

function FeedCard({ performance, isActive, onLike, onComment, onShare, onSwipe }: FeedCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { navigateWithContext } = useCrossTab();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold) onSwipe("up");
    else if (info.offset.y > threshold) onSwipe("down");
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(performance.id);
  };

  const handleReaction = (reaction: ReactionType) => {
    console.log(`Reaction: ${reaction.label} on performance ${performance.id}`);
    // Here you would typically send the reaction to a backend service
  };

  return (
    <motion.div
      className="relative h-full w-full bg-gradient-to-b from-black/20 to-black/60 rounded-3xl overflow-hidden"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.95 }}
    >
      <LiveReactionSystem isActive={isActive} onReaction={handleReaction} />
      {/* ... rest of FeedCard JSX ... */}
    </motion.div>
  );
}

export default function DiscoveryFeed({ initialFeedType = "foryou" }: any) {
  // ... (DiscoveryFeed component logic remains the same)
  const [currentIndex, setCurrentIndex] = useState(0);
  const { likePerformance, commentOnPerformance } = useFarcasterIntegration();
  const { context: tabContext, clearContext } = useTabContext("discovery");
  const queryClient = useQueryClient();

  const fetchPerformances = async () => {
    const response = await fetch("/api/farcaster/cast?action=fetchChannel&channelId=gigavibe");
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  };

  const transformCastToPerformancePost = (cast: any): PerformancePost => {
    const audioEmbed = cast.embeds?.find((embed:any) => embed.url?.startsWith('lens://'));
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
      duration: 30,
      selfRating: selfRatingMatch ? parseInt(selfRatingMatch[1]) : 3,
      communityRating: 0,
      gap: 0,
      likes: cast.reactions?.likes_count || 0,
      comments: cast.reactions?.replies_count || 0,
      shares: cast.reactions?.recasts_count || 0,
      timestamp: new Date(cast.timestamp),
      realityRevealed: false,
    };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["performances"],
    queryFn: fetchPerformances,
    select: (data) => ({ performances: data.casts.map(transformCastToPerformancePost) }),
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
    // ... (handleLike logic)
  };

  const handleComment = async (id: string) => {
    // ... (handleComment logic)
  };

  const handleShare = async (id: string) => {
    // ... (handleShare logic)
  };

  if (isLoading) { /* ... loading UI ... */ }
  if (performances.length === 0) { /* ... no performances UI ... */ }

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
      </div>
    </div>
  );
}