/**
 * Farcaster Audio Card Component
 * Main component for displaying audio performances in Farcaster contexts
 * Uses modular core components following DRY principles
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  ExternalLink,
  Share2,
  Heart,
  MessageCircle,
  Repeat2,
  Trophy,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FarcasterAudioCardProps } from "@/types/farcaster.types";
import VisualAudioSignature from "../core/VisualAudioSignature";
import RealityGapDisplay from "../core/RealityGapDisplay";
import { audioManager } from "@/services/AudioManager";

export default function FarcasterAudioCard({
  performance,
  author,
  variant = "cast",
  showCoinData = false,
  showSocialStats = true,
  onPlay,
  onOpenInApp,
  onTryChallenge,
  onTrade,
  onLike,
  onRecast,
  onReply,
}: FarcasterAudioCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        audioManager.stop();
        setIsPlaying(false);
      } else {
        await audioManager.playAudio(performance.audioUrl, "recording", {
          volume: 0.8,
          onEnded: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
      setIsPlaying(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Compact variant for tight spaces
  if (variant === "compact") {
    return (
      <Card className="bg-slate-900/90 border-slate-700 max-w-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePlayPause}
              size="sm"
              className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0 w-10 h-10 rounded-full flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white text-sm truncate">
                {performance.challengeTitle}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>by @{author.username}</span>
                <span>•</span>
                <VisualAudioSignature
                  rating={performance.communityRating || performance.selfRating}
                  variant="icon-only"
                  size="sm"
                  animated={false}
                />
                <span className="font-medium">
                  {(
                    performance.communityRating || performance.selfRating
                  ).toFixed(1)}
                </span>
              </div>
            </div>

            <Button
              onClick={onOpenInApp}
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Frame variant for Farcaster frames
  if (variant === "frame") {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={author.pfpUrl} />
              <AvatarFallback>{author.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">
                  {author.displayName}
                </h3>
                {author.isVerified && (
                  <VisualAudioSignature
                    rating={10}
                    variant="icon-only"
                    size="sm"
                    animated={false}
                  />
                )}
              </div>
              <p className="text-xs text-slate-400">@{author.username}</p>
            </div>

            <Badge className="bg-gigavibe-500/20 text-gigavibe-400 border-gigavibe-500/30 text-xs">
              GIGAVIBE
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white">
              {performance.challengeTitle}
            </h4>
            <VisualAudioSignature
              rating={performance.communityRating || performance.selfRating}
              variant="badge-only"
              size="sm"
            />
          </div>

          {/* Audio Player */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
            <Button
              onClick={handlePlayPause}
              className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0 w-10 h-10 rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <div className="flex-1">
              <div className="text-sm text-white mb-1">Vocal Performance</div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(performance.duration)}</span>
                {performance.viralScore && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-400">
                      {performance.viralScore}% Viral
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reality Check */}
          {performance.communityRating && (
            <RealityGapDisplay
              selfRating={performance.selfRating}
              communityRating={performance.communityRating}
              variant="compact"
              size="sm"
            />
          )}

          {/* Coin Info - Note: coinData would need to be passed as separate prop */}
          {showCoinData && (
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white font-medium">PERF</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white font-bold">0.0001 ETH</div>
                <div className="text-xs text-green-400">+5.2%</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-700 flex gap-2">
          <Button
            onClick={onTryChallenge || onOpenInApp}
            className="flex-1 bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0"
            size="sm"
          >
            Try Challenge
          </Button>
          <Button
            onClick={onRecast}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            size="sm"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Default cast variant
  return (
    <Card className="bg-slate-900/90 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={author.pfpUrl} />
            <AvatarFallback>{author.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            {/* Author Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white">
                  {author.displayName}
                </h3>
                <span className="text-slate-400">@{author.username}</span>
                {author.isVerified && (
                  <VisualAudioSignature
                    rating={10}
                    variant="icon-only"
                    size="sm"
                    animated={false}
                  />
                )}
                <Badge className="bg-gigavibe-500/20 text-gigavibe-400 border-gigavibe-500/30 text-xs">
                  GIGAVIBE
                </Badge>
              </div>
              <p className="text-slate-300">
                Just crushed the "{performance.challengeTitle}" challenge! 🎤
                {performance.communityRating && (
                  <span className="ml-2">
                    <RealityGapDisplay
                      selfRating={performance.selfRating}
                      communityRating={performance.communityRating}
                      variant="emoji-only"
                      size="sm"
                    />
                  </span>
                )}
              </p>
            </div>

            {/* Audio Preview */}
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  onClick={handlePlayPause}
                  size="sm"
                  className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0 w-10 h-10 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                <div className="flex-1">
                  <div className="text-sm text-white mb-1">
                    Vocal Performance
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Self-rated: {performance.selfRating}/10</span>
                    {performance.communityRating && (
                      <>
                        <span>•</span>
                        <span>Community: {performance.communityRating}/10</span>
                      </>
                    )}
                  </div>
                </div>

                <VisualAudioSignature
                  rating={performance.communityRating || performance.selfRating}
                  variant="compact"
                  size="sm"
                  showLabel={false}
                />
              </div>

              {/* Performance Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(performance.duration)}</span>
                </div>
                {performance.viralScore && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">
                      {performance.viralScore}% Viral
                    </span>
                  </div>
                )}
                <Button
                  onClick={onOpenInApp}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 ml-auto"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open
                </Button>
              </div>
            </div>

            {/* Reality Check (if available) */}
            {performance.communityRating && (
              <RealityGapDisplay
                selfRating={performance.selfRating}
                communityRating={performance.communityRating}
                variant="compact"
                size="sm"
                showDescription={false}
              />
            )}

            {/* Social Stats */}
            {showSocialStats && (
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`flex items-center gap-1 transition-colors ${
                    isLiked ? "text-red-400" : "hover:text-red-400"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  <span>24</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onReply}
                  className="flex items-center gap-1 hover:text-gigavibe-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>8</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRecast}
                  className="flex items-center gap-1 hover:text-green-400 transition-colors"
                >
                  <Repeat2 className="w-4 h-4" />
                  <span>12</span>
                </motion.button>

                {showCoinData && onTrade && (
                  <Button
                    onClick={onTrade}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 ml-auto"
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    Trade
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
