'use client';

import React, { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Star, Play, Pause } from 'lucide-react';

interface VocalAttempt {
  id: string;
  audioUrl: string;
  duration: number;
  challenge: string;
  timestamp: Date;
  selfRating: number;
  communityRating?: number;
  isAnonymous: boolean;
}

interface JudgingCardProps {
  attempt: VocalAttempt;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  isActive: boolean;
}

function JudgingCard({ attempt, onSwipeLeft, onSwipeRight, onSwipeUp, isActive }: JudgingCardProps) {
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
    if (xValue > 50) return { text: "Pretty Good", color: "text-green-400", icon: "👍" };
    if (xValue < -50) return { text: "Needs Work", color: "text-red-400", icon: "👎" };
    if (y.get() < -50) return { text: "Amazing!", color: "text-purple-400", icon: "🔥" };
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
            <span className="text-sm text-gray-400">
              {attempt.duration}s
            </span>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Anonymous Singer</h3>
          <p className="text-gray-300 text-sm">
            Someone tried this challenge. How did they do?
          </p>
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
              onLoadedData={() => console.log('Audio loaded')}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8">
          <motion.button
            onClick={onSwipeLeft}
            className="w-14 h-14 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.3)" }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6 text-red-500" />
          </motion.button>
          
          <motion.button
            onClick={onSwipeUp}
            className="w-16 h-16 bg-purple-500/20 border-2 border-purple-500 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(147, 51, 234, 0.3)" }}
            whileTap={{ scale: 0.9 }}
          >
            <Star className="w-8 h-8 text-purple-500" />
          </motion.button>
          
          <motion.button
            onClick={onSwipeRight}
            className="w-14 h-14 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(34, 197, 94, 0.3)" }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="w-6 h-6 text-green-500" />
          </motion.button>
        </div>

        {/* Swipe Hints */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Swipe or tap to judge • ← Needs work • ↑ Amazing • → Pretty good
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PeerJudging() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [judgments, setJudgments] = useState<Array<{id: string, rating: number}>>([]);

  // Mock data - replace with real data later
  const mockAttempts: VocalAttempt[] = [
    {
      id: '1',
      audioUrl: '/mock-audio-1.mp3',
      duration: 15,
      challenge: 'Vocal Range Test',
      timestamp: new Date(),
      selfRating: 4,
      isAnonymous: true
    },
    {
      id: '2', 
      audioUrl: '/mock-audio-2.mp3',
      duration: 20,
      challenge: 'Pitch Perfect',
      timestamp: new Date(),
      selfRating: 5,
      isAnonymous: true
    },
    {
      id: '3',
      audioUrl: '/mock-audio-3.mp3', 
      duration: 18,
      challenge: 'Show Off Mode',
      timestamp: new Date(),
      selfRating: 3,
      isAnonymous: true
    }
  ];

  const handleJudgment = (rating: number) => {
    const currentAttempt = mockAttempts[currentIndex];
    
    setJudgments(prev => [...prev, { id: currentAttempt.id, rating }]);
    
    if (currentIndex < mockAttempts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // All attempts judged - show completion
      console.log('All attempts judged!', judgments);
    }
  };

  const handleSwipeLeft = () => handleJudgment(2); // Needs work
  const handleSwipeRight = () => handleJudgment(4); // Pretty good  
  const handleSwipeUp = () => handleJudgment(5); // Amazing

  if (currentIndex >= mockAttempts.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold mb-4">Great judging!</h2>
          <p className="text-xl text-gray-300 mb-8">
            You&apos;ve helped {judgments.length} singers get feedback
          </p>
          <motion.button
            onClick={() => {
              setCurrentIndex(0);
              setJudgments([]);
            }}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Judge More Attempts
          </motion.button>
        </motion.div>
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
          <h1 className="text-2xl font-bold text-white">Be the Judge</h1>
          <p className="text-sm text-gray-300">
            {mockAttempts.length - currentIndex} attempts left to judge
          </p>
        </div>
        
        <div className="text-right text-white">
          <div className="text-sm text-gray-300">Your judgments</div>
          <div className="text-xl font-bold">{judgments.length}</div>
        </div>
      </motion.div>

      {/* Card Stack */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] p-6">
        <div className="relative w-full max-w-sm h-96">
          {mockAttempts.map((attempt, index) => (
            <motion.div
              key={attempt.id}
              className="absolute inset-0"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ 
                scale: index === currentIndex ? 1 : 0.95,
                opacity: index === currentIndex ? 1 : index === currentIndex + 1 ? 0.7 : 0,
                y: index === currentIndex ? 0 : 20,
                zIndex: mockAttempts.length - index
              }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <JudgingCard
                attempt={attempt}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
                isActive={index === currentIndex}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}