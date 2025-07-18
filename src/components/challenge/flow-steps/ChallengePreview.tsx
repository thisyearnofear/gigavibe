/**
 * Challenge Preview Step Component
 * Modular step component following DRY principles
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock, 
  Star, 
  ArrowRight,
  Users,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Challenge } from '@/types/challenge.types';
import { audioManager } from '@/services/AudioManager';

interface ChallengePreviewProps {
  challenge: Challenge;
  onNext: () => void;
  onCancel: () => void;
}

export default function ChallengePreview({ 
  challenge, 
  onNext, 
  onCancel 
}: ChallengePreviewProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isPlayingInstrumental, setIsPlayingInstrumental] = useState(false);

  // Cleanup audio when component unmounts or user navigates away
  useEffect(() => {
    // Preload audio for better UX
    if (challenge.previewUrl) {
      audioManager.preload(challenge.previewUrl);
    }
    if (challenge.instrumentalUrl) {
      audioManager.preload(challenge.instrumentalUrl);
    }

    return () => {
      // Stop all audio when leaving this step
      audioManager.stopAll();
    };
  }, [challenge]);

  // Monitor audio state changes
  useEffect(() => {
    const checkAudioState = () => {
      const state = audioManager.getState();
      setIsPlayingPreview(state.isPlaying && state.type === 'preview');
      setIsPlayingInstrumental(state.isPlaying && state.type === 'instrumental');
    };

    const interval = setInterval(checkAudioState, 100);
    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    const colors = {
      easy: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      hard: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[difficulty];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePreviewPlay = async () => {
    try {
      if (isPlayingPreview) {
        audioManager.stop();
      } else {
        await audioManager.playAudio(challenge.previewUrl, 'preview', {
          volume: 0.8,
          onEnded: () => setIsPlayingPreview(false),
          onError: (error) => {
            console.error('Preview playback failed:', error);
            setIsPlayingPreview(false);
          }
        });
      }
    } catch (error) {
      console.error('Failed to control preview audio:', error);
      setIsPlayingPreview(false);
    }
  };

  const handleInstrumentalPlay = async () => {
    try {
      if (isPlayingInstrumental) {
        audioManager.stop();
      } else {
        await audioManager.playAudio(challenge.instrumentalUrl, 'instrumental', {
          volume: 0.6, // Slightly lower volume for practice
          onEnded: () => setIsPlayingInstrumental(false),
          onError: (error) => {
            console.error('Instrumental playback failed:', error);
            setIsPlayingInstrumental(false);
          }
        });
      }
    } catch (error) {
      console.error('Failed to control instrumental audio:', error);
      setIsPlayingInstrumental(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Challenge Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
        <p className="text-xl text-slate-300">{challenge.artist}</p>
        <div className="flex items-center justify-center gap-4">
          <Badge className={getDifficultyColor(challenge.difficulty)}>
            {challenge.difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(challenge.duration)}</span>
          </div>
          {challenge.trending && (
            <Badge className="bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white">
              Trending
            </Badge>
          )}
        </div>
      </div>

      {/* Challenge Stats */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-gigavibe-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{challenge.participants.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400">Participants</p>
            </div>
            {challenge.coinValue && (
              <div>
                <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold">${challenge.totalEarnings?.toFixed(0)}</span>
                </div>
                <p className="text-xs text-slate-400">Total Earned</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6 space-y-4">
          <p className="text-slate-300 text-center">{challenge.description}</p>
          
          {/* Audio Preview Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handlePreviewPlay}
              className="w-full bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
              size="lg"
            >
              {isPlayingPreview ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Stop Preview
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Listen to Original
                </>
              )}
            </Button>
            
            <Button
              onClick={handleInstrumentalPlay}
              variant="outline"
              className="w-full border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
              size="lg"
            >
              {isPlayingInstrumental ? (
                <>
                  <VolumeX className="w-5 h-5 mr-2" />
                  Stop Instrumental
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 mr-2" />
                  Practice with Instrumental
                </>
              )}
            </Button>
          </div>

          {/* Tips */}
          {challenge.tips && challenge.tips.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Quick Tips:</h3>
              {challenge.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-slate-400">
                  <Star className="w-4 h-4 text-gigavibe-400 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-slate-600 text-slate-300"
        >
          Cancel
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
        >
          Start Challenge
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}