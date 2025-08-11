"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Heart, X, Star, Play, Pause, Trophy, Zap, Users, Clock, Eye } from "lucide-react";
import { useTabContext, useCrossTab } from "@/contexts/CrossTabContext";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Types from both components
interface VocalAttempt {
  id: string;
  hash?: string;
  audioUrl: string;
  duration: number;
  challenge: string;
  timestamp: Date;
  selfRating: number;
  communityRating?: number;
  isAnonymous: boolean;
  author?: { fid: number; username: string; displayName: string; pfpUrl?: string; };
  existingVotes?: number;
  isLiveSession?: boolean; // To trigger live voting mode
}

export interface VotingSession {
  id: string;
  performanceId: string;
  performer: { fid: number; username: string; displayName: string; pfpUrl: string; };
  challenge: { title: string; difficulty: 'easy' | 'medium' | 'hard'; };
  audioUrl: string;
  duration: number;
  selfRating: number;
  status: 'waiting' | 'active' | 'completed';
  timeRemaining: number;
  totalVoters: number;
  currentVotes: VoteData[];
  averageRating: number;
  createdAt: Date;
}

export interface VoteData { voterId: number; voterName: string; voterPfp: string; rating: number; timestamp: Date; feedback?: string; }
export interface LiveVoter { fid: number; username: string; displayName: string; pfpUrl: string; isVoting: boolean; joinedAt: Date; }

// JudgingCard component from PeerJudging.tsx
function JudgingCard({ attempt, onSwipeLeft, onSwipeRight, onSwipeUp, isActive }: any) {
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
        <div>
          <h3 className="text-xl font-semibold mb-2">{attempt.challenge}</h3>
          <p className="text-gray-300 text-sm">
            {attempt.author?.displayName || "Anonymous Singer"}
          </p>
        </div>
        <div className="my-8">
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
          <audio
            ref={audioRef}
            src={attempt.audioUrl}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
        <div className="flex items-center justify-center gap-8">
          <motion.button
            onClick={onSwipeLeft}
            disabled={!isActive}
            className="w-14 h-14 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-red-500" />
          </motion.button>
          <motion.button
            onClick={onSwipeUp}
            disabled={!isActive}
            className="w-16 h-16 bg-purple-500/20 border-2 border-purple-500 rounded-full flex items-center justify-center"
          >
            <Star className="w-8 h-8 text-purple-500" />
          </motion.button>
          <motion.button
            onClick={onSwipeRight}
            disabled={!isActive}
            className="w-14 h-14 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center"
          >
            <Heart className="w-6 h-6 text-green-500" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Main component
export default function PeerJudging() {
  // State from both components
  const [currentIndex, setCurrentIndex] = useState(0);
  const [judgments, setJudgments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<VocalAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingStreak, setVotingStreak] = useState(0);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);

  // RealTimeVoting state
  const [currentSession, setCurrentSession] = useState<VotingSession | null>(null);
  const [liveViewers, setLiveViewers] = useState<LiveVoter[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showVoteAnimation, setShowVoteAnimation] = useState(false);
  const [recentVotes, setRecentVotes] = useState<VoteData[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { context: tabContext, clearContext } = useTabContext('judging');
  const { navigateWithContext, votingProgress, updateVotingProgress } = useCrossTab();
  const { userInfo, signerUuid } = useFarcasterIntegration();

  // Fetching logic from PeerJudging
  useEffect(() => {
    const fetchAttempts = async () => {
      // ... (original fetchAttempts logic)
    };
    fetchAttempts();
  }, [tabContext.focusCast]);

  // Effect to check if current attempt is a live session
  useEffect(() => {
    if (attempts.length > 0 && attempts[currentIndex]?.isLiveSession) {
      // This is a live session, switch to live mode
      const attempt = attempts[currentIndex];
      const sessionData: VotingSession = {
        id: `session-${attempt.id}`,
        performanceId: attempt.id,
        performer: { 
            fid: attempt.author?.fid || 0,
            username: attempt.author?.username || 'unknown',
            displayName: attempt.author?.displayName || 'Anonymous',
            pfpUrl: attempt.author?.pfpUrl || ''
        },
        challenge: { title: attempt.challenge, difficulty: 'medium' },
        audioUrl: attempt.audioUrl,
        duration: attempt.duration,
        selfRating: attempt.selfRating,
        status: 'active',
        timeRemaining: 120, // Example time
        totalVoters: 0,
        currentVotes: [],
        averageRating: 0,
        createdAt: new Date()
      };
      setCurrentSession(sessionData);
      setIsLiveMode(true);
    } else {
      setIsLiveMode(false);
    }
  }, [currentIndex, attempts]);

  // Timer and vote simulation logic from RealTimeVoting
  useEffect(() => {
    // ... (timer and vote simulation logic from RealTimeVoting.tsx)
  }, [currentSession?.status]);

  const handleJudgment = async (rating: number) => {
    // ... (original handleJudgment logic)
  };

  const handleLiveVote = (rating: number) => {
    // ... (logic from handleVote in RealTimeVoting.tsx)
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render logic
  if (isLoading) { /* ... loading UI ... */ }
  if (error) { /* ... error UI ... */ }
  if (attempts.length === 0) { /* ... no attempts UI ... */ }

  if (isLiveMode && currentSession) {
    // Render RealTimeVoting UI
    return (
        <div className={cn("space-y-6 p-6", "bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 min-h-screen")}>
            {/* Header */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                {/* ... RealTimeVoting Header JSX ... */}
            </Card>

            {/* Audio Player */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                {/* ... RealTimeVoting Audio Player JSX ... */}
            </Card>

            {/* Voting Interface */}
            {currentSession.status === 'active' && userVote === null && (
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                    {/* ... RealTimeVoting Voting Interface JSX ... */}
                </Card>
            )}

            {/* ... Other RealTimeVoting sections ... */}
        </div>
    );
  }

  // Render PeerJudging UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        {/* Header with Voting Progress */}
        <motion.div className="relative z-10 p-6 backdrop-blur-md bg-white/5">
            {/* ... PeerJudging Header JSX ... */}
        </motion.div>

        {/* Card Stack */}
        <div className="relative z-10 flex items-center justify-center min-h-[80vh] p-6">
            <div className="relative w-full max-w-sm h-96">
                {attempts.map((attempt, index) => (
                    <motion.div key={attempt.id} className="absolute inset-0">
                        <JudgingCard
                            attempt={attempt}
                            onSwipeLeft={() => handleJudgment(2)}
                            onSwipeRight={() => handleJudgment(4)}
                            onSwipeUp={() => handleJudgment(5)}
                            isActive={index === currentIndex && !isSubmittingVote}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    </div>
  );
}