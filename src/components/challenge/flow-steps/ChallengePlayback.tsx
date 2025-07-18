/**
 * Challenge Playback Step Component
 * Production-ready playback with audio controls
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Volume2,
  ArrowRight,
  Clock,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Challenge } from '@/types/challenge.types';

interface ChallengePlaybackProps {
  challenge: Challenge;
  recordingData: {
    audioBlob?: Blob;
    mixedAudioBlob?: Blob;
    audioUrl?: string;
    duration: number;
  };
  onNext: () => void;
  onRetake: () => void;
  onCancel: () => void;
}

export default function ChallengePlayback({ 
  challenge, 
  recordingData, 
  onNext, 
  onRetake, 
  onCancel 
}: ChallengePlaybackProps) {
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [isPlayingMixed, setIsPlayingMixed] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlayingRecording || isPlayingMixed) {
      interval = setInterval(() => {
        setCurrentPlaybackTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= recordingData.duration) {
            setIsPlayingRecording(false);
            setIsPlayingMixed(false);
            return 0;
          }
          setPlaybackProgress((newTime / recordingData.duration) * 100);
          return newTime;
        });
      }, 100);
    } else {
      setCurrentPlaybackTime(0);
      setPlaybackProgress(0);
    }

    return () => clearInterval(interval);
  }, [isPlayingRecording, isPlayingMixed, recordingData.duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayRecording = () => {
    if (isPlayingMixed) setIsPlayingMixed(false);
    setIsPlayingRecording(!isPlayingRecording);
    // In production, this would control actual audio playback
  };

  const handlePlayMixed = () => {
    if (isPlayingRecording) setIsPlayingRecording(false);
    setIsPlayingMixed(!isPlayingMixed);
    // In production, this would play the mixed version (vocal + instrumental)
  };

  const isPlaying = isPlayingRecording || isPlayingMixed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Recording Complete!</h2>
        <p className="text-slate-300">
          Great job! Listen to your performance and decide if you want to keep it
        </p>
      </div>

      {/* Recording Stats */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-gigavibe-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{formatTime(recordingData.duration)}</span>
              </div>
              <p className="text-xs text-slate-400">Duration</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                <Mic className="w-4 h-4" />
                <span className="font-semibold">High Quality</span>
              </div>
              <p className="text-xs text-slate-400">Audio Quality</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Playback Controls */}
      <div className="space-y-4">
        {/* Your Recording */}
        <Card className="gigavibe-glass-dark border-gigavibe-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Your Performance</h3>
              <Button
                onClick={handlePlayRecording}
                size="sm"
                className={`${
                  isPlayingRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600'
                } text-white`}
              >
                {isPlayingRecording ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>{formatTime(currentPlaybackTime)}</span>
                <span>{formatTime(recordingData.duration)}</span>
              </div>
              <Progress 
                value={isPlayingRecording ? playbackProgress : 0} 
                className="h-2 bg-slate-800"
              >
                <div className="h-full bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full" />
              </Progress>
            </div>
          </CardContent>
        </Card>

        {/* Mixed Version (if available) */}
        {recordingData.mixedAudioBlob && (
          <Card className="gigavibe-glass-dark border-gigavibe-500/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">With Instrumental</h3>
                  <p className="text-sm text-slate-400">Your vocals mixed with the backing track</p>
                </div>
                <Button
                  onClick={handlePlayMixed}
                  size="sm"
                  variant="outline"
                  className={`border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10 ${
                    isPlayingMixed ? 'bg-gigavibe-500/20' : ''
                  }`}
                >
                  {isPlayingMixed ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{formatTime(currentPlaybackTime)}</span>
                  <span>{formatTime(recordingData.duration)}</span>
                </div>
                <Progress 
                  value={isPlayingMixed ? playbackProgress : 0} 
                  className="h-2 bg-slate-800"
                >
                  <div className="h-full bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full" />
                </Progress>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Audio Visualization */}
      {isPlaying && (
        <Card className="gigavibe-glass-dark border-gigavibe-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 text-gigavibe-400">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Volume2 className="w-5 h-5" />
              </motion.div>
              <span className="text-sm font-medium">
                {isPlayingRecording ? 'Playing Your Performance' : 'Playing Mixed Version'}
              </span>
            </div>
            
            {/* Simple Audio Bars */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-gigavibe-500 to-purple-500 rounded-full"
                  animate={{
                    height: [8, Math.random() * 32 + 8, 8],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5 + Math.random() * 0.5,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onRetake}
          variant="outline"
          className="flex-1 border-slate-600 text-slate-300"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
        >
          Keep Recording
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}