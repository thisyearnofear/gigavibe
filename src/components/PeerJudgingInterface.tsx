"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Play,
  Pause,
  Heart,
  X,
  Star,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

interface VocalAttempt {
  id: string;
  challengeTitle: string;
  audioUrl: string;
  duration: number;
  selfRating: number;
  communityRating?: number;
  judgeCount: number;
  waveform: number[];
  timestamp: Date;
  isAnonymous: boolean;
}

interface JudgingCardProps {
  attempt: VocalAttempt;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  isActive: boolean;
}

function JudgingCard({
  attempt,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  isActive,
}: JudgingCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(
    x,
    [-300, -150, 0, 150, 300],
    [0, 0.5, 1, 0.5, 0]
  );

  // Feedback overlays based on swipe direction
  const leftOverlay = useTransform(x, [-300, -50, 0], [1, 0.8, 0]);
  const rightOverlay = useTransform(x, [0, 50, 300], [0, 0.8, 1]);
  const upOverlay = useTransform(y, [-300, -50, 0], [1, 0.8, 0]);
  const downOverlay = useTransform(y, [0, 50, 300], [0, 0.8, 1]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = Math.abs(info.velocity.x) + Math.abs(info.velocity.y);

    if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      // Horizontal swipe
      if (info.offset.x > threshold || (info.offset.x > 50 && velocity > 500)) {
        onSwipeRight();
      } else if (
        info.offset.x < -threshold ||
        (info.offset.x < -50 && velocity > 500)
      ) {
        onSwipeLeft();
      } else {
        // Snap back
        x.set(0);
        y.set(0);
      }
    } else {
      // Vertical swipe
      if (
        info.offset.y < -threshold ||
        (info.offset.y < -50 && velocity > 500)
      ) {
        onSwipeUp();
      } else if (
        info.offset.y > threshold ||
        (info.offset.y > 50 && velocity > 500)
      ) {
        onSwipeDown();
      } else {
        // Snap back
        x.set(0);
        y.set(0);
      }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Swipe Feedback Overlays */}
        <motion.div
          className="absolute inset-0 bg-red-500/80 flex items-center justify-center z-10"
          style={{ opacity: leftOverlay }}
        >
          <div className="text-center text-white">
            <X className="w-16 h-16 mx-auto mb-2" />
            <span className="text-xl font-bold">Needs Work</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-green-500/80 flex items-center justify-center z-10"
          style={{ opacity: rightOverlay }}
        >
          <div className="text-center text-white">
            <Heart className="w-16 h-16 mx-auto mb-2" />
            <span className="text-xl font-bold">Pretty Good!</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-purple-500/80 flex items-center justify-center z-10"
          style={{ opacity: upOverlay }}
        >
          <div className="text-center text-white">
            <Star className="w-16 h-16 mx-auto mb-2" />
            <span className="text-xl font-bold">Absolutely Nailed It!</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-orange-500/80 flex items-center justify-center z-10"
          style={{ opacity: downOverlay }}
        >
          <div className="text-center text-white">
            <RotateCcw className="w-16 h-16 mx-auto mb-2" />
            <span className="text-xl font-bold">Let's Try Again</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-0 h-full flex flex-col">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {attempt.challengeTitle}
                </h3>
                <p className="text-gray-400 text-sm">
                  {attempt.judgeCount} people have judged •{" "}
                  {formatTime(attempt.duration)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {attempt.selfRating}⭐
                </div>
                <div className="text-xs text-gray-400">Their rating</div>
              </div>
            </div>
          </div>

          {/* Waveform Visualization */}
          <div className="px-6 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={togglePlayback}
                  className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" />
                  )}
                </button>

                <div className="flex-1 mx-4">
                  <div className="flex items-center gap-1 h-8">
                    {attempt.waveform.map((height, i) => (
                      <motion.div
                        key={i}
                        className="bg-indigo-400 rounded-full flex-1 min-w-[2px]"
                        style={{ height: `${Math.max(4, height * 32)}px` }}
                        animate={{
                          backgroundColor:
                            isPlaying &&
                            i <
                              (currentTime / attempt.duration) *
                                attempt.waveform.length
                              ? "#6366f1"
                              : "#94a3b8",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(attempt.duration)}</span>
              </div>
            </div>
          </div>

          {/* Judging Prompt */}
          <div className="flex-1 px-6 pb-6 flex flex-col justify-end">
            <div className="bg-gray-700/50 rounded-2xl p-6 text-center">
              <h4 className="text-lg font-semibold text-white mb-2">
                How did they do?
              </h4>
              <p className="text-gray-300 text-sm mb-4">
                Swipe to judge • Be honest but kind
              </p>

              {/* Swipe Hints */}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span>← Needs work</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-green-400" />
                  <span>Pretty good →</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span>↑ Nailed it!</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-orange-400" />
                  <span>Try again ↓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={attempt.audioUrl}
          muted={isMuted}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </motion.div>
  );
}

export default function PeerJudgingInterface() {
  const [attempts, setAttempts] = useState<VocalAttempt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [judgingStats, setJudgingStats] = useState({
    judged: 0,
    remaining: 12,
  });

  // Fetch real data from API
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await fetch("/api/judging/queue?advanced=true");

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Process attempts data
        const processedAttempts = data.attempts.map((attempt: any) => {
          // Generate waveform from audio data if not provided
          const waveform =
            attempt.waveform ||
            Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2);

          return {
            ...attempt,
            waveform,
            timestamp: new Date(attempt.timestamp || Date.now()),
          };
        });

        setAttempts(processedAttempts);

        // Get judging stats
        if (data.stats) {
          setJudgingStats({
            judged: data.stats.judgedToday || 0,
            remaining: data.stats.remaining || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch attempts:", error);
      }
    };

    fetchAttempts();
  }, []);

  const handleJudgment = async (rating: number) => {
    if (attempts.length === 0 || currentIndex >= attempts.length) {
      return;
    }

    const currentAttempt = attempts[currentIndex];

    try {
      // Submit judgment to API
      const response = await fetch("/api/judging/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attemptId: currentAttempt.id,
          rating,
          feedback: {
            category:
              rating <= 2
                ? "needs_work"
                : rating <= 3
                ? "pretty_good"
                : rating === 4
                ? "try_again"
                : "excellent",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit judgment: ${response.status}`);
      }

      // Update stats
      setJudgingStats((prev) => ({
        judged: prev.judged + 1,
        remaining: prev.remaining - 1,
      }));

      // Move to next attempt
      if (currentIndex < attempts.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Load more attempts if available
        try {
          const moreResponse = await fetch("/api/judging/queue?advanced=true");
          if (moreResponse.ok) {
            const moreData = await moreResponse.json();
            if (moreData.attempts && moreData.attempts.length > 0) {
              // Process new attempts
              const newAttempts = moreData.attempts.map((attempt: any) => {
                const waveform =
                  attempt.waveform ||
                  Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2);
                return {
                  ...attempt,
                  waveform,
                  timestamp: new Date(attempt.timestamp || Date.now()),
                };
              });

              // Add new attempts and reset index
              setAttempts(newAttempts);
              setCurrentIndex(0);

              // Update stats
              if (moreData.stats) {
                setJudgingStats({
                  judged: moreData.stats.judgedToday || 0,
                  remaining: moreData.stats.remaining || 0,
                });
              }
            }
          }
        } catch (loadError) {
          console.error("Failed to load more attempts:", loadError);
        }
      }
    } catch (error) {
      console.error("Failed to submit judgment:", error);
      alert("Failed to submit your judgment. Please try again.");
    }
  };

  const handleSwipeLeft = () => handleJudgment(2); // Needs work
  const handleSwipeRight = () => handleJudgment(3); // Pretty good
  const handleSwipeUp = () => handleJudgment(5); // Nailed it
  const handleSwipeDown = () => handleJudgment(1); // Try again

  if (attempts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading vocal attempts to judge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Header */}
      <motion.div
        className="relative z-10 flex items-center justify-between p-6 backdrop-blur-md bg-white/5"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Judge Vocal Attempts
          </h1>
          <p className="text-gray-300 text-sm">
            Help the community discover their true vocal rating
          </p>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {judgingStats.judged}
          </div>
          <div className="text-xs text-gray-400">judged today</div>
        </div>
      </motion.div>

      {/* Card Stack */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="relative w-full max-w-sm h-[600px]">
          <AnimatePresence>
            {attempts
              .slice(currentIndex, currentIndex + 3)
              .map((attempt, index) => (
                <motion.div
                  key={attempt.id}
                  className="absolute inset-0"
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{
                    scale: index === 0 ? 1 : 0.95 - index * 0.02,
                    opacity: index === 0 ? 1 : 0.7 - index * 0.2,
                    y: index * 8,
                    zIndex: 10 - index,
                  }}
                  exit={{
                    scale: 1.05,
                    opacity: 0,
                    transition: { duration: 0.2 },
                  }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  <JudgingCard
                    attempt={attempt}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onSwipeUp={handleSwipeUp}
                    onSwipeDown={handleSwipeDown}
                    isActive={index === 0}
                  />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <motion.div
          className="mt-8 flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {Array.from({ length: Math.min(5, attempts.length) }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i < currentIndex ? "bg-indigo-500" : "bg-gray-600"
              }`}
            />
          ))}
        </motion.div>

        {/* Remaining Count */}
        <motion.p
          className="mt-4 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {judgingStats.remaining} more attempts waiting for your judgment
        </motion.p>
      </div>
    </div>
  );
}
