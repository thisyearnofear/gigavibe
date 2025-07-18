"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Heart, Star, Upload, Play, Pause } from "lucide-react";

// Import all our enhanced UX components
import { useFeedback, FeedbackHelpers } from "./feedback-system";
import { LoadingState, InlineLoader, LoadingOverlay } from "./loading-states";
import { EnhancedErrorBoundary } from "./enhanced-error-boundary";
import {
  SmartTooltip,
  ContextualHelp,
  useSmartGuidance,
} from "./smart-guidance";
import {
  AnimatedLike,
  AnimatedStarRating,
  RecordingButton,
  AchievementBadge,
  ProgressRing,
} from "./micro-interactions";
import {
  PerformanceCardSkeleton,
  OptimisticWrapper,
  EnhancedSkeleton,
} from "./enhanced-skeleton";
import { Button } from "./button";
import { cn } from "@/lib/utils";

// Example: Enhanced Performance Card with all UX features
interface EnhancedPerformanceCardProps {
  performance: {
    id: string;
    title: string;
    artist: string;
    likes: number;
    rating: number;
    isLiked: boolean;
    audioUrl: string;
    waveform: number[];
  };
  onLike: (id: string) => Promise<void>;
  onRate: (id: string, rating: number) => Promise<void>;
  onShare: (id: string) => Promise<void>;
}

export function EnhancedPerformanceCard({
  performance,
  onLike,
  onRate,
  onShare,
}: EnhancedPerformanceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(performance.likes);
  const [optimisticLiked, setOptimisticLiked] = useState(performance.isLiked);

  const feedback = useFeedback();

  // Simple error handler function
  const handleError = (error: Error) => {
    console.error("Error:", error);
    return {
      details: error.message || "An unexpected error occurred",
    };
  };

  // Optimistic like handling
  const handleLike = async () => {
    // Optimistic update
    const newLiked = !optimisticLiked;
    const newLikes = newLiked ? optimisticLikes + 1 : optimisticLikes - 1;

    setOptimisticLiked(newLiked);
    setOptimisticLikes(newLikes);

    try {
      await onLike(performance.id);

      // Show success feedback
      if (newLiked) {
        FeedbackHelpers.likeAdded(feedback);
      }
    } catch (error) {
      // Revert optimistic update
      setOptimisticLiked(!newLiked);
      setOptimisticLikes(optimisticLikes);

      // Handle error
      const errorInfo = handleError(error as Error);
      feedback.error("Like Failed", errorInfo.details, "voting");
    }
  };

  const handleRating = async (rating: number) => {
    setIsLoading(true);

    try {
      await onRate(performance.id, rating);
      feedback.success(
        "Rating Submitted",
        "Thank you for your feedback!",
        "voting"
      );
    } catch (error) {
      const errorInfo = handleError(error as Error);
      feedback.error("Rating Failed", errorInfo.details, "voting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    setIsLoading(true);

    try {
      await onShare(performance.id);
      FeedbackHelpers.shareComplete(feedback);
    } catch (error) {
      const errorInfo = handleError(error as Error);
      feedback.error("Share Failed", errorInfo.details, "sharing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EnhancedErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-white">{performance.title}</h3>
            <p className="text-sm text-slate-400">{performance.artist}</p>
          </div>

          <SmartTooltip
            content="Play this performance to hear the full recording"
            title="Audio Player"
            position="left"
            showOnce
            storageKey={`play-tooltip-${performance.id}`}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </SmartTooltip>
        </div>

        {/* Waveform Visualization */}
        <div className="mb-4 h-20 bg-slate-900/50 rounded-lg p-3 flex items-end justify-center gap-1">
          {performance.waveform.map((height, index) => (
            <motion.div
              key={index}
              className={cn(
                "w-1 rounded-full transition-colors",
                isPlaying ? "bg-gigavibe-500" : "bg-slate-600"
              )}
              style={{ height: `${height}%` }}
              animate={
                isPlaying
                  ? {
                      backgroundColor: ["#d446ef", "#8b5cf6", "#d446ef"],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                repeat: isPlaying ? Infinity : 0,
              }}
            />
          ))}
        </div>

        {/* Stats and Rating */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <OptimisticWrapper
              isLoading={false}
              optimisticData={{
                likes: optimisticLikes,
                isLiked: optimisticLiked,
              }}
            >
              <AnimatedLike
                isLiked={optimisticLiked}
                count={optimisticLikes}
                onToggle={handleLike}
              />
            </OptimisticWrapper>

            <SmartTooltip
              content="Rate this performance from 1 to 5 stars"
              title="Rating System"
              position="top"
            >
              <AnimatedStarRating
                rating={performance.rating}
                onRatingChange={handleRating}
                showValue
              />
            </SmartTooltip>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <InlineLoader context="sharing" size="sm" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Share
            </Button>
          </div>
        </div>

        {/* Achievement notification (example) */}
        {optimisticLikes > 0 && optimisticLikes % 10 === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
          >
            <AchievementBadge
              achievement={{
                icon: "🔥",
                title: "Popular Performance!",
                rarity: "rare",
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </EnhancedErrorBoundary>
  );
}

// Example: Enhanced Recording Interface
export function EnhancedRecordingInterface() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const feedback = useFeedback();
  const { startGuidance } = useSmartGuidance();

  useEffect(() => {
    // Start guidance for first-time users
    startGuidance("first-recording");
  }, [startGuidance]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    FeedbackHelpers.recordingStarted(feedback);

    // Simulate recording progress
    const interval = setInterval(() => {
      setRecordingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setRecordingProgress(0);
    FeedbackHelpers.recordingStopped(feedback);

    // Start upload process
    setIsUploading(true);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          FeedbackHelpers.uploadComplete(feedback);
          return 100;
        }
        FeedbackHelpers.uploadProgress(feedback, prev + 5);
        return prev + 5;
      });
    }, 200);
  };

  return (
    <EnhancedErrorBoundary>
      <div className="text-center space-y-8 p-8">
        {/* Recording Button */}
        <div className="flex justify-center" data-guide="record-button">
          <SmartTooltip
            content={
              isRecording
                ? "Click to stop recording"
                : "Click to start recording your performance"
            }
            title="Recording Control"
            position="bottom"
          >
            <RecordingButton
              isRecording={isRecording}
              onToggle={
                isRecording ? handleStopRecording : handleStartRecording
              }
              size="lg"
            />
          </SmartTooltip>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {isRecording
              ? "Recording..."
              : isUploading
              ? "Uploading..."
              : "Ready to Record"}
          </h2>
          <p className="text-slate-400">
            {isRecording
              ? "Speak clearly into your microphone"
              : isUploading
              ? "Processing your performance..."
              : "Tap the button to start your vocal performance"}
          </p>
        </div>

        {/* Progress Ring */}
        {(isRecording || isUploading) && (
          <div className="flex justify-center">
            <ProgressRing
              progress={isRecording ? recordingProgress : uploadProgress}
              size={120}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(isRecording ? recordingProgress : uploadProgress)}
                  %
                </div>
                <div className="text-xs text-slate-400">
                  {isRecording ? "Recording" : "Uploading"}
                </div>
              </div>
            </ProgressRing>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" disabled={isRecording || isUploading}>
            Settings
          </Button>
          <Button variant="gigavibe" disabled={isRecording || isUploading}>
            View Performances
          </Button>
        </div>
      </div>

      {/* Upload Overlay */}
      {isUploading && (
        <LoadingOverlay
          context="uploading"
          message="Processing your amazing performance..."
          progress={uploadProgress}
        />
      )}
    </EnhancedErrorBoundary>
  );
}

// Example: Enhanced Discovery Feed
export function EnhancedDiscoveryFeed() {
  const [performances, setPerformances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      setPerformances([
        {
          id: "1",
          title: "Amazing Vocal Run",
          artist: "VocalMaster",
          likes: 42,
          rating: 4.5,
          isLiked: false,
          audioUrl: "/audio/sample1.mp3",
          waveform: Array.from({ length: 50 }, () => Math.random() * 100),
        },
        // Add more mock data...
      ]);
    }, 2000);
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load performances</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PerformanceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {performances.map((performance) => (
        <EnhancedPerformanceCard
          key={performance.id}
          performance={performance}
          onLike={async (id) => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
          }}
          onRate={async (id, rating) => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 800));
          }}
          onShare={async (id) => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 300));
          }}
        />
      ))}
    </div>
  );
}
