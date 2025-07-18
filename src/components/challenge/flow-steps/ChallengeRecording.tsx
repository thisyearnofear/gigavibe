/**
 * Challenge Recording Step Component
 * Modular recording component following DRY principles
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Challenge } from '@/types/challenge.types';
import { audioRecordingService } from '@/services/AudioRecordingService';
import { audioManager } from '@/services/AudioManager';

interface ChallengeRecordingProps {
  challenge: Challenge;
  onNext: (data: { audioBlob?: Blob; mixedAudioBlob?: Blob; audioUrl?: string; duration: number }) => void;
  onCancel: () => void;
}

export default function ChallengeRecording({ 
  challenge, 
  onNext, 
  onCancel 
}: ChallengeRecordingProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingResult, setRecordingResult] = useState<any>(null);

  // Auto-start recording when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      handleStartRecording();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Recording timer and audio level monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        // Update audio level for visualization
        const level = audioRecordingService.getAudioLevel();
        setAudioLevel(level);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      // Request permission first
      const hasPermission = await audioRecordingService.requestPermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      await audioRecordingService.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await audioRecordingService.stopRecording();
      setIsRecording(false);
      setRecordingResult(result);
      
      // Stop the instrumental audio
      audioManager.stopAll();
      
      // Create audio URL from blob
      const audioUrl = URL.createObjectURL(result.audioBlob);
      
      onNext({
        audioBlob: result.audioBlob,
        audioUrl,
        duration: result.duration
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Ensure instrumental continues playing during recording
  useEffect(() => {
    if (isRecording) {
      // Check if instrumental is still playing, restart if needed
      const checkInstrumental = () => {
        if (!audioManager.isPlaying('instrumental')) {
          audioManager.playAudio(challenge.instrumentalUrl, 'instrumental', {
            volume: 0.5,
            loop: true,
            onError: (error) => console.error('Instrumental restart failed:', error)
          });
        }
      };

      const interval = setInterval(checkInstrumental, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording, challenge.instrumentalUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8"
    >
      {/* Recording Indicator */}
      <div className="space-y-4">
        <motion.div
          animate={{ scale: isRecording ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: isRecording ? Infinity : 0, duration: 2 }}
          className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
            isRecording 
              ? 'bg-gradient-to-r from-red-500 to-pink-500' 
              : 'bg-gradient-to-r from-gigavibe-500 to-purple-500'
          }`}
        >
          <Mic className="w-16 h-16 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white">
          {isRecording ? 'Recording...' : 'Ready to Record'}
        </h2>
        
        <div className="text-4xl font-mono text-gigavibe-400">
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* Instructions */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6">
          <p className="text-slate-300 mb-4">
            {isRecording 
              ? 'Sing along with the instrumental track!' 
              : 'Get ready to sing along with the music'
            }
          </p>
          
          {isRecording && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <motion.div 
                  className="w-3 h-3 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
                <span className="text-sm font-medium">LIVE</span>
              </div>
              
              {/* Audio Level Visualization */}
              <div className="space-y-2">
                <div className="text-center text-xs text-slate-400">Audio Level</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                    style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                    animate={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                
                {/* Simple Audio Bars */}
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-gigavibe-500 to-purple-500 rounded-full"
                      animate={{
                        height: [4, Math.max(4, (audioLevel / 10) * Math.random() * 20), 4],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.3 + Math.random() * 0.3,
                        delay: i * 0.05,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="space-y-3">
        {!isRecording ? (
          <Button
            onClick={handleStartRecording}
            size="lg"
            className="w-full bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={handleStopRecording}
            size="lg"
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop Recording
          </Button>
        )}
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-slate-600 text-slate-300"
          disabled={isRecording}
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  );
}