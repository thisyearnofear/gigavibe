'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Mic } from 'lucide-react';
import { usePitchDetection } from '@/hooks/usePitchDetection';
import { SunoService, ViralChallenge } from '@/lib/audio/SunoService';

interface ViralChallengeProps {
  challenge?: ViralChallenge;
  onComplete: (accuracy: number, userRecording: string, challengeId: string) => void;
}

export default function ViralChallengeComponent({ challenge, onComplete }: ViralChallengeProps) {
  const { pitchData, isListening, startListening, stopListening } = usePitchDetection();
  const [phase, setPhase] = useState<'loading' | 'listen' | 'countdown' | 'singing' | 'complete'>('loading');
  const [currentChallenge, setCurrentChallenge] = useState<ViralChallenge | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingInstrumental, setIsPlayingInstrumental] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [userRecording, setUserRecording] = useState<string>('');
  
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const instrumentalAudioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);

  useEffect(() => {
    if (challenge) {
      setCurrentChallenge(challenge);
      setPhase('listen');
    } else {
      // Load a mock challenge for testing
      const mockChallenges = SunoService.getMockChallenges();
      setCurrentChallenge(mockChallenges[0]);
      setPhase('listen');
    }
  }, [challenge]);

  useEffect(() => {
    // Simulate accuracy calculation based on pitch data
    if (phase === 'singing' && isListening && pitchData.frequency > 0) {
      // Mock accuracy calculation - in real implementation, compare to original vocals
      const mockAccuracy = Math.max(20, Math.min(95, 70 + Math.random() * 25));
      setAccuracy(Math.round(mockAccuracy));
    }
  }, [pitchData, phase, isListening]);

  const playOriginal = () => {
    if (originalAudioRef.current) {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      } else {
        originalAudioRef.current.play();
        setIsPlayingOriginal(true);
      }
    }
  };

  const playInstrumental = () => {
    if (instrumentalAudioRef.current) {
      if (isPlayingInstrumental) {
        instrumentalAudioRef.current.pause();
        setIsPlayingInstrumental(false);
      } else {
        instrumentalAudioRef.current.play();
        setIsPlayingInstrumental(true);
      }
    }
  };

  const startChallenge = async () => {
    setPhase('countdown');
    
    // 3-second countdown
    for (let i = 3; i > 0; i--) {
      setTimeRemaining(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setPhase('singing');
    recordingStartTime.current = Date.now();
    
    // Start recording and instrumental playback
    await startListening();
    playInstrumental();
    
    // Set timer for challenge duration
    const duration = currentChallenge?.duration || 30;
    setTimeRemaining(duration);
    
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - recordingStartTime.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        completeChallenge();
      }
    }, 100);
  };

  const completeChallenge = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    stopListening();
    
    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.pause();
      setIsPlayingInstrumental(false);
    }
    
    // Generate mock recording URL
    const mockRecordingUrl = `user_recording_${Date.now()}.wav`;
    setUserRecording(mockRecordingUrl);
    
    setPhase('complete');
  };

  const resetChallenge = () => {
    setPhase('listen');
    setTimeRemaining(0);
    setAccuracy(0);
    setUserRecording('');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    stopListening();
    
    if (originalAudioRef.current) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    }
    
    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.pause();
      setIsPlayingInstrumental(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold">Loading Challenge...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-white">
        
        {/* Hidden audio elements */}
        <audio
          ref={originalAudioRef}
          src={currentChallenge.originalAudio}
          onEnded={() => setIsPlayingOriginal(false)}
          onLoadedData={() => console.log('Original audio loaded')}
        />
        <audio
          ref={instrumentalAudioRef}
          src={currentChallenge.instrumentalAudio}
          onEnded={() => setIsPlayingInstrumental(false)}
          onLoadedData={() => console.log('Instrumental audio loaded')}
        />
        
        <AnimatePresence mode="wait">
          {phase === 'listen' && (
            <motion.div
              key="listen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-6">
                <div className="text-4xl mb-4">🎤</div>
                <h1 className="text-3xl font-bold mb-2">{currentChallenge.title}</h1>
                <div className={`text-sm font-medium ${getDifficultyColor(currentChallenge.difficulty)}`}>
                  {currentChallenge.difficulty} • {Math.round(currentChallenge.duration)}s
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Your Mission:</h3>
                <p className="text-gray-300 mb-6">
                  Listen to this AI-generated track, then sing along as closely as possible. 
                  The community will judge how well you matched it!
                </p>
                
                {/* Play Original Button */}
                <motion.button
                  onClick={playOriginal}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-3">
                    {isPlayingOriginal ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                    <span className="text-lg font-semibold">
                      {isPlayingOriginal ? 'Pause Original' : 'Play Original Track'}
                    </span>
                  </div>
                </motion.button>

                <div className="text-xs text-gray-400 mb-4">
                  Tags: {currentChallenge.tags}
                </div>
              </div>
              
              <motion.button
                onClick={startChallenge}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl font-semibold text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!currentChallenge}
              >
                Ready to Sing!
              </motion.button>
            </motion.div>
          )}

          {phase === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold mb-8">Get Ready to Sing!</h2>
              <motion.div
                className="text-8xl font-bold text-purple-400 mb-8"
                key={timeRemaining}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {timeRemaining}
              </motion.div>
              <p className="text-gray-300">The instrumental will start playing...</p>
            </motion.div>
          )}

          {phase === 'singing' && (
            <motion.div
              key="singing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-3 mb-6">
                <motion.div
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeRemaining / (currentChallenge.duration || 30)) * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Current Status */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6">
                <h3 className="text-lg font-semibold mb-4">🎤 Singing Now!</h3>
                
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-green-400">
                    {Math.round(accuracy)}%
                  </div>
                  <div className="text-sm text-gray-300">
                    Match Accuracy
                  </div>
                  
                  {/* Audio visualization */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Volume2 className="w-5 h-5 text-purple-400" />
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-purple-400 rounded-full"
                          animate={{
                            height: isListening ? [4, 20, 4] : 4,
                            opacity: isListening ? [0.3, 1, 0.3] : 0.3
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Remaining */}
              <div className="text-2xl font-bold mb-4">
                {timeRemaining.toFixed(1)}s remaining
              </div>

              {/* Recording Indicator */}
              <div className="flex items-center justify-center gap-3 text-red-400">
                <motion.div 
                  className="w-4 h-4 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="font-semibold">Recording your performance...</span>
              </div>
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold mb-4">Performance Complete!</h2>
              
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                <div className="text-5xl font-bold text-purple-400 mb-2">
                  {Math.round(accuracy)}%
                </div>
                <p className="text-gray-300 mb-4">Similarity to Original</p>
                <p className="text-sm text-gray-400">
                  Now let's see what the community thinks...
                </p>
              </div>
              
              <div className="flex gap-4">
                <motion.button
                  onClick={resetChallenge}
                  className="flex-1 py-3 bg-white/10 border border-white/20 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </motion.button>
                
                <motion.button
                  onClick={() => onComplete(accuracy, userRecording, currentChallenge.id)}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue to Rating
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}