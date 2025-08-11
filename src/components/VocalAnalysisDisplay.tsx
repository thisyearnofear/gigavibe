import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, CheckCircle, AlertCircle, Minus } from 'lucide-react';
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useFeatureFlags } from '@/lib/features/FeatureFlags';
import { cn } from '@/lib/utils';

interface VocalAnalysisDisplayProps {
  metrics: any;
  isListening: boolean;
  currentPitch?: {
    note: string;
    octave: number;
    frequency: number;
    accuracy?: number;
    cents?: number;
    confidence?: number;
  };
  targetNote?: {
    note: string;
    octave: number;
  };
  enableLiveCoaching?: boolean;
  isMobile?: boolean;
  sensitivity?: number; // 1-10, from LivePitchCoach
}

const VocalAnalysisDisplay = ({ 
  metrics,
  isListening,
  currentPitch,
  targetNote,
  enableLiveCoaching = false,
  isMobile = false,
  sensitivity = 5
}: VocalAnalysisDisplayProps) => {
  const { pitchRange, vibrato, stability, volume, formants, sessionStats } = metrics;
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);
  const { getAudioFeatures } = useFeatureFlags();
  const audioFeatures = getAudioFeatures();

  useEffect(() => {
    if (enableLiveCoaching && currentPitch?.confidence !== undefined) {
      const accuracy = calculatePitchAccuracy()?.accuracy || 0;
      setAccuracyHistory(prev => {
        const updated = [...prev, accuracy];
        return updated.slice(-20);
      });
    }
  }, [currentPitch, enableLiveCoaching]);

  const getNoteOffset = (note: string): number => {
    const noteOffsets: { [key: string]: number } = {
      'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
      'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2
    };
    return noteOffsets[note] || 0;
  };

  const calculatePitchAccuracy = () => {
    if (!currentPitch || !targetNote || currentPitch.frequency === 0) return null;

    const A4 = 440;
    const semitoneRatio = Math.pow(2, 1/12);
    const semitonesFromA4 = getNoteOffset(targetNote.note) + (targetNote.octave - 4) * 12;
    const targetFrequency = A4 * Math.pow(semitoneRatio, semitonesFromA4);

    const centsOff = 1200 * Math.log2(currentPitch.frequency / targetFrequency);
    
    const maxCentsOff = 50 / (sensitivity / 5);
    const accuracy = Math.max(0, 100 - (Math.abs(centsOff) / maxCentsOff) * 100);

    let direction: 'flat' | 'sharp' | 'perfect' = 'perfect';
    if (Math.abs(centsOff) > 10) {
      direction = centsOff > 0 ? 'sharp' : 'flat';
    }
    
    return { accuracy, direction, centsOff };
  };

  const pitchAccuracy = calculatePitchAccuracy();
  const smoothedAccuracy = accuracyHistory.length > 0
    ? accuracyHistory.reduce((a, b) => a + b, 0) / accuracyHistory.length
    : 0;

  const stabilityData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    stability: Math.max(0, stability.pitchConsistency + (Math.random() - 0.5) * 20)
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 70) return 'text-yellow-400';
    if (accuracy >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-500/20';
    if (accuracy >= 70) return 'bg-yellow-500/20';
    if (accuracy >= 50) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'sharp': return <TrendingUp className="w-5 h-5" />;
      case 'flat': return <TrendingDown className="w-5 h-5" />;
      case 'perfect': return <CheckCircle className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {enableLiveCoaching && audioFeatures.liveCoaching && targetNote && (
        <motion.div 
          className={cn(
            "relative bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden p-4",
            isListening && pitchAccuracy && getAccuracyBgColor(pitchAccuracy.accuracy)
          )}
          animate={{
            borderColor: isListening && pitchAccuracy 
              ? pitchAccuracy.accuracy >= 90 ? 'rgba(34, 197, 94, 0.5)' : 
                pitchAccuracy.accuracy >= 70 ? 'rgba(234, 179, 8, 0.5)' :
                'rgba(239, 68, 68, 0.5)'
              : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/70">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Target: {targetNote.note}{targetNote.octave}</span>
            </div>
            {pitchAccuracy && (
              <div className={cn("font-medium", getAccuracyColor(pitchAccuracy.accuracy))}>
                {Math.round(smoothedAccuracy)}%
              </div>
            )}
          </div>

          <div className="text-center space-y-2 mb-4">
            <AnimatePresence mode="wait">
              {currentPitch && currentPitch.frequency > 0 ? (
                <motion.div key="pitch-detected" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="space-y-1">
                  <div className="text-2xl font-bold text-white">{currentPitch.note}{currentPitch.octave}</div>
                  <div className="text-sm text-white/60">{Math.round(currentPitch.frequency)}Hz</div>
                </motion.div>
              ) : isListening ? (
                <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <div className="text-lg text-white/60">Listening...</div>
                  <motion.div className="w-6 h-6 border-2 border-gigavibe-400 border-t-transparent rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                </motion.div>
              ) : (
                <motion.div key="inactive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-lg text-white/40">
                  Start singing to see pitch
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {pitchAccuracy && (
            <motion.div className="space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="relative">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full rounded-full transition-colors duration-300", getAccuracyBgColor(smoothedAccuracy))}
                    initial={{ width: 0 }}
                    animate={{ width: `${smoothedAccuracy}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-white/50 transform -translate-x-1/2" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className={cn("flex items-center gap-2", getAccuracyColor(pitchAccuracy.accuracy))}>
                  {getDirectionIcon(pitchAccuracy.direction)}
                  <span>{pitchAccuracy.direction === 'perfect' ? 'Perfect!' : pitchAccuracy.direction === 'sharp' ? 'Too High' : 'Too Low'}</span>
                </div>
                {Math.abs(pitchAccuracy.centsOff) > 5 && (
                  <div className="text-xs text-white/60">{Math.abs(Math.round(pitchAccuracy.centsOff))} cents {pitchAccuracy.direction}</div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-4")}>
        {/* ... rest of the component ... */}
      </div>
    </div>
  );
};

export default VocalAnalysisDisplay;