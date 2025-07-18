/**
 * Challenge Prepare Step Component
 * Production-ready preparation step with audio setup
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Challenge } from '@/types/challenge.types';
import { audioManager } from '@/services/AudioManager';

interface ChallengePrepareProps {
  challenge: Challenge;
  onNext: () => void;
  onBack?: () => void;
  onCancel: () => void;
}

export default function ChallengePrepare({ 
  challenge, 
  onNext, 
  onBack, 
  onCancel 
}: ChallengePrepareProps) {
  const [isPlayingInstrumental, setIsPlayingInstrumental] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTestingMic, setIsTestingMic] = useState(false);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      
      // Test audio levels
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        
        if (isTestingMic) {
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      setIsTestingMic(true);
      updateAudioLevel();
      
      // Stop after 3 seconds
      setTimeout(() => {
        setIsTestingMic(false);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      }, 3000);
      
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermission('denied');
    }
  };

  const handleInstrumentalPlay = async () => {
    try {
      if (isPlayingInstrumental) {
        audioManager.stop();
        setIsPlayingInstrumental(false);
      } else {
        await audioManager.playAudio(challenge.instrumentalUrl, 'instrumental', {
          volume: 0.6,
          onEnded: () => setIsPlayingInstrumental(false),
          onError: (error) => {
            console.error('Instrumental playback failed:', error);
            setIsPlayingInstrumental(false);
          }
        });
        setIsPlayingInstrumental(true);
      }
    } catch (error) {
      console.error('Failed to control instrumental audio:', error);
      setIsPlayingInstrumental(false);
    }
  };

  // Cleanup audio when leaving this step
  useEffect(() => {
    return () => {
      audioManager.stopAll();
    };
  }, []);

  const canProceed = micPermission === 'granted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full flex items-center justify-center">
          <Mic className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Get Ready to Sing!</h2>
        <p className="text-slate-300">
          Let's make sure everything is set up perfectly for your performance
        </p>
      </div>

      {/* Challenge Info */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6 text-center space-y-3">
          <div className="text-sm text-slate-400">You'll be singing:</div>
          <div className="text-xl font-bold text-white">{challenge.title}</div>
          <div className="text-lg text-slate-300">{challenge.artist}</div>
          
          {/* Practice Button */}
          <Button
            onClick={handleInstrumentalPlay}
            variant="outline"
            className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
          >
            {isPlayingInstrumental ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Practice
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Practice with Instrumental
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Microphone Setup */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Microphone Setup
          </h3>
          
          <div className="space-y-3">
            {/* Permission Status */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Microphone Access</span>
              <div className="flex items-center gap-2">
                {micPermission === 'granted' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Ready
                    </Badge>
                  </>
                )}
                {micPermission === 'denied' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      Denied
                    </Badge>
                  </>
                )}
                {micPermission === 'pending' && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Checking...
                  </Badge>
                )}
              </div>
            </div>

            {/* Audio Level Indicator */}
            {micPermission === 'granted' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Audio Level</span>
                  <span className="text-slate-400">
                    {isTestingMic ? 'Testing...' : 'Ready'}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-green-500 to-gigavibe-500 rounded-full"
                    style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                    animate={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            )}

            {/* Permission Denied Help */}
            {micPermission === 'denied' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 mb-2">
                  Microphone access is required to record your performance.
                </p>
                <Button
                  onClick={checkMicrophonePermission}
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-white">Quick Tips:</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-gigavibe-400 mt-0.5 flex-shrink-0" />
              <span>Find a quiet space with minimal background noise</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-gigavibe-400 mt-0.5 flex-shrink-0" />
              <span>Position yourself about arm's length from your device</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-gigavibe-400 mt-0.5 flex-shrink-0" />
              <span>Sing with confidence - the community loves authenticity!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300"
          >
            Back
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canProceed ? (
            <>
              Ready to Record
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            'Grant Microphone Access'
          )}
        </Button>
      </div>
    </motion.div>
  );
}