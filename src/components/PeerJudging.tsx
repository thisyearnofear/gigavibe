"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Star, Play, Pause, Trophy, Zap } from "lucide-react";
import { useTabContext, useCrossTab } from "@/contexts/CrossTabContext";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";

interface VocalAttempt {
  id: string;
  hash?: string; // Farcaster cast hash
  audioUrl: string;
  duration: number;
  challenge: string;
  timestamp: Date;
  selfRating: number;
  communityRating?: number;
  isAnonymous: boolean;
  author?: {
    fid: number;
    username: string;
    displayName: string;
  };
  existingVotes?: number;
}

interface JudgingCardProps {
  attempt: VocalAttempt;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  isActive: boolean;
}

function JudgingCard({
  attempt,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isActive,
}: JudgingCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.x > threshold) {
      onSwipeRight(); // Good
    } else if (info.offset.x < -threshold) {
      onSwipeLeft(); // Needs work
    } else if (info.offset.y < -threshold) {
      onSwipeUp(); // Amazing
    } else {
      // Snap back
      x.set(0);
      y.set(0);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getSwipeIndicator = () => {
    const xValue = x.get();
    if (xValue > 50)
      return { text: "Pretty Good", color: "text-green-400", icon: "👍" };
    if (xValue < -50)
      return { text: "Needs Work", color: "text-red-400", icon: "👎" };
    if (y.get() < -50)
      return { text: "Amazing!", color: "text-purple-400", icon: "🔥" };
    return null;
  };

  const indicator = getSwipeIndicator();

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate, opacity }}
      drag={isActive}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 flex flex-col justify-between text-white shadow-2xl border border-gray-700">
        {/* Swipe Indicator */}
        {indicator && (
          <motion.div
            className={`absolute top-8 left-1/2 transform -translate-x-1/2 ${indicator.color} font-bold text-xl flex items-center gap-2`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <span>{indicator.icon}</span>
            <span>{indicator.text}</span>
          </motion.div>
        )}

        {/* Challenge Info */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium bg-purple-500/20 px-3 py-1 rounded-full">
              {attempt.challenge}
            </span>
            <span className="text-sm text-gray-400">{attempt.duration}s</span>
          </div>

          <h3 className="text-xl font-semibold mb-2">
            {attempt.author?.displayName || "Anonymous Singer"}
          </h3>
          <p className="text-gray-300 text-sm">
            {attempt.author?.username ? `@${attempt.author.username}` : "Someone"} tried this challenge. How did they do?
          </p>
          {attempt.existingVotes > 0 && (
            <p className="text-xs text-purple-400 mt-1">
              {attempt.existingVotes} community votes so far
            </p>
          )}
        </div>

        {/* Audio Player */}
        <div className="my-8">
          <div className="bg-gray-700/50 rounded-2xl p-6 text-center">
            <motion.button
              onClick={togglePlayback}
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </motion.button>

            <p className="text-sm text-gray-400">
              {isPlaying ? "Playing..." : "Tap to listen"}
            </p>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={attempt.audioUrl}
              onEnded={() => setIsPlaying(false)}
              onLoadedData={() => console.log("Audio loaded")}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8">
          <motion.button
            onClick={onSwipeLeft}
            disabled={!isActive}
            className="w-14 h-14 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center touch-target disabled:opacity-50"
            whileHover={isActive ? {
              scale: 1.1,
              backgroundColor: "rgba(239, 68, 68, 0.3)",
            } : {}}
            whileTap={isActive ? { scale: 0.9 } : {}}
          >
            <X className="w-6 h-6 text-red-500" />
          </motion.button>

          <motion.button
            onClick={onSwipeUp}
            disabled={!isActive}
            className="w-16 h-16 bg-purple-500/20 border-2 border-purple-500 rounded-full flex items-center justify-center touch-target disabled:opacity-50"
            whileHover={isActive ? {
              scale: 1.1,
              backgroundColor: "rgba(147, 51, 234, 0.3)",
            } : {}}
            whileTap={isActive ? { scale: 0.9 } : {}}
          >
            <Star className="w-8 h-8 text-purple-500" />
          </motion.button>

          <motion.button
            onClick={onSwipeRight}
            disabled={!isActive}
            className="w-14 h-14 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center touch-target disabled:opacity-50"
            whileHover={isActive ? {
              scale: 1.1,
              backgroundColor: "rgba(34, 197, 94, 0.3)",
            } : {}}
            whileTap={isActive ? { scale: 0.9 } : {}}
          >
            <Heart className="w-6 h-6 text-green-500" />
          </motion.button>
        </div>

        {/* Swipe Hints */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Swipe or tap to judge • ← Needs work (2⭐) • ↑ Amazing (5⭐) • → Pretty good (4⭐)
          </p>
          {attempt.selfRating && (
            <p className="text-xs text-purple-400 mt-1">
              Singer thought: {attempt.selfRating}⭐
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PeerJudging() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [judgments, setJudgments] = useState<
    Array<{ id: string; rating: number; castHash?: string }>
  >([]);
  const [attempts, setAttempts] = useState<VocalAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingStreak, setVotingStreak] = useState(0);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  
  // Get tab context and cross-tab navigation
  const { context: tabContext, clearContext } = useTabContext('judging');
  const { navigateWithContext, votingProgress, updateVotingProgress } = useCrossTab();
  const { userInfo, signerUuid } = useFarcasterIntegration();

  // Fetch attempts from Farcaster channel or API
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setIsLoading(true);
        
        // If we have a focused cast from tab context, prioritize it
        if (tabContext.focusCast) {
          const focusedResponse = await fetch(`/api/farcaster/cast?action=getCast&hash=${tabContext.focusCast}`);
          if (focusedResponse.ok) {
            const focusedCast = await focusedResponse.json();
            // Transform cast to VocalAttempt format
            const focusedAttempt = transformCastToAttempt(focusedCast);
            setAttempts([focusedAttempt]);
            setIsLoading(false);
            return;
          }
        }
        
        // Otherwise, fetch from /gigavibe channel
        const response = await fetch("/api/farcaster/cast?action=fetchChannel&channelId=gigavibe");
        
        if (!response.ok) {
          // Fallback to existing API
          const fallbackResponse = await fetch("/api/judging/queue");
          if (!fallbackResponse.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          const fallbackData = await fallbackResponse.json();
          setAttempts(fallbackData.attempts);
        } else {
          const data = await response.json();
          // Transform Farcaster casts to VocalAttempt format
          const transformedAttempts = data.casts
            .filter(cast => cast.embeds?.some(embed => embed.url?.startsWith('lens://')))
            .map(transformCastToAttempt)
            .slice(0, 10); // Limit to 10 for performance
          
          setAttempts(transformedAttempts);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch attempts:", error);
        setError("Failed to load vocal attempts. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [tabContext.focusCast]);

  // Transform Farcaster cast to VocalAttempt
  const transformCastToAttempt = (cast: any): VocalAttempt => {
    const audioEmbed = cast.embeds?.find(embed => embed.url?.startsWith('lens://'));
    const selfRatingMatch = cast.text?.match(/(\d+)⭐/);
    
    return {
      id: cast.hash,
      hash: cast.hash,
      audioUrl: audioEmbed?.url || '',
      duration: 30, // Default duration
      challenge: cast.text?.split('"')[1] || 'Unknown Challenge',
      timestamp: new Date(cast.timestamp),
      selfRating: selfRatingMatch ? parseInt(selfRatingMatch[1]) : 3,
      isAnonymous: false,
      author: {
        fid: cast.author.fid,
        username: cast.author.username,
        displayName: cast.author.display_name
      },
      existingVotes: cast.replies?.count || 0
    };
  };

  const handleJudgment = async (rating: number) => {
    if (attempts.length === 0 || currentIndex >= attempts.length || isSubmittingVote) {
      return;
    }

    const currentAttempt = attempts[currentIndex];
    setIsSubmittingVote(true);

    try {
      // Submit vote as Farcaster reply if we have a cast hash
      if (currentAttempt.hash && signerUuid) {
        const farcasterResponse = await fetch('/api/farcaster/cast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'publishCast',
            signerUuid: signerUuid,
            text: `Rating: ${rating}⭐ #GigaVibe`,
            parent: currentAttempt.hash,
            channelId: 'gigavibe'
          })
        });

        if (!farcasterResponse.ok) {
          throw new Error('Failed to submit Farcaster vote');
        }

        const farcasterResult = await farcasterResponse.json();
        console.log('✅ Farcaster vote submitted:', farcasterResult.cast?.hash);
      }

      // Also submit to existing API for backward compatibility
      const response = await fetch("/api/judging/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: currentAttempt.id,
          rating,
          castHash: currentAttempt.hash
        }),
      });

      if (!response.ok) {
        console.warn('Legacy API submission failed, but Farcaster vote succeeded');
      }

      // Update local state
      setJudgments((prev) => [...prev, { 
        id: currentAttempt.id, 
        rating,
        castHash: currentAttempt.hash 
      }]);

      // Update voting progress
      updateVotingProgress(1);
      setVotingStreak(prev => prev + 1);

      // Check for achievements
      if (votingProgress + 1 === 5) {
        // Unlock user's own performance rating
        setTimeout(() => {
          navigateWithContext('discovery', { 
            showRatingReveal: true,
            channelFocus: 'gigavibe'
          });
        }, 1000);
      }

      // Move to next attempt
      if (currentIndex < attempts.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to submit judgment:", error);
      alert("Failed to submit your judgment. Please try again.");
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleSwipeLeft = () => handleJudgment(2); // Needs work
  const handleSwipeRight = () => handleJudgment(4); // Pretty good
  const handleSwipeUp = () => handleJudgment(5); // Amazing

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading vocal attempts to judge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <div className="text-center text-white bg-red-500/20 p-6 rounded-xl max-w-md">
          <p className="text-xl mb-4">Error</p>
          <p>There was an error loading the attempts. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors min-h-[44px] touch-manipulation"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <div className="text-center text-white bg-white/10 p-6 rounded-xl max-w-md">
          <p className="text-xl mb-4">No attempts to judge</p>
          <p>There are currently no vocal attempts waiting for judgment.</p>
          <p className="mt-4">Please check back later!</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= attempts.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <motion.div
          className="text-center text-white max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold mb-4">Great judging!</h2>
          <p className="text-xl text-gray-300 mb-6">
            You&apos;ve helped {judgments.length} singers get feedback
          </p>
          
          {/* Achievement summary */}
          {votingProgress >= 5 && (
            <motion.div
              className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-green-400 font-semibold">Achievement Unlocked!</span>
              </div>
              <p className="text-sm text-green-300">
                Your performance ratings are now visible in Discovery
              </p>
            </motion.div>
          )}

          <div className="flex gap-3 justify-center">
            <motion.button
              onClick={() => navigateWithContext('discovery', { channelFocus: 'gigavibe' })}
              className="px-6 py-3 bg-gigavibe-500 rounded-xl font-semibold touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Discovery
            </motion.button>
            
            <motion.button
              onClick={() => {
                setCurrentIndex(0);
                setJudgments([]);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Judge More
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Header with Voting Progress */}
      <motion.div
        className="relative z-10 p-6 backdrop-blur-md bg-white/5"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Be the Judge</h1>
            <p className="text-sm text-gray-300">
              {attempts.length - currentIndex} attempts left to judge
            </p>
          </div>

          <div className="text-right text-white">
            <div className="text-sm text-gray-300">Your votes</div>
            <div className="text-xl font-bold">{judgments.length}</div>
          </div>
        </div>

        {/* Voting Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gigavibe-300 font-medium">
              Progress to unlock your rating
            </span>
            <span className="text-gray-400">{votingProgress}/5 votes</span>
          </div>
          
          <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gigavibe-500 via-purple-500 to-blue-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${(votingProgress / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>

          {/* Achievement Preview */}
          {votingProgress >= 3 && votingProgress < 5 && (
            <motion.div
              className="flex items-center gap-2 text-xs text-yellow-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Trophy className="w-4 h-4" />
              <span>Almost there! {5 - votingProgress} more votes to unlock your performance rating</span>
            </motion.div>
          )}

          {/* Success message */}
          {votingProgress >= 5 && (
            <motion.div
              className="flex items-center gap-2 text-xs text-green-400"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Zap className="w-4 h-4" />
              <span>Achievement unlocked! Check Discovery to see your rating</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Card Stack */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] p-6">
        <div className="relative w-full max-w-sm h-96">
          {/* Loading overlay when submitting vote */}
          {isSubmittingVote && (
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center text-white">
                <motion.div
                  className="w-12 h-12 border-4 border-gigavibe-500 border-t-transparent rounded-full mx-auto mb-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm">Submitting your vote...</p>
              </div>
            </motion.div>
          )}

          {attempts.map((attempt, index) => (
            <motion.div
              key={attempt.id}
              className="absolute inset-0"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{
                scale: index === currentIndex ? 1 : 0.95,
                opacity:
                  index === currentIndex
                    ? 1
                    : index === currentIndex + 1
                    ? 0.7
                    : 0,
                y: index === currentIndex ? 0 : 20,
                zIndex: attempts.length - index,
              }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <JudgingCard
                attempt={attempt}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
                isActive={index === currentIndex && !isSubmittingVote}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
