import { useState, useEffect, useRef, useCallback } from 'react';

interface EnhancedAudioData {
  frequency: number;
  note: string;
  octave: number;
  volume: number;
  confidence: number;
  isStable: boolean;
  smoothedFrequency: number;
}

interface UseEnhancedAudioAnalysisProps {
  audioData: any;
  isListening: boolean;
  volumeThreshold?: number;
  stabilityWindow?: number;
}

export const useEnhancedAudioAnalysis = ({
  audioData,
  isListening,
  volumeThreshold = 5,
  stabilityWindow = 300
}: UseEnhancedAudioAnalysisProps) => {
  const [enhancedData, setEnhancedData] = useState<EnhancedAudioData>({
    frequency: 0,
    note: '',
    octave: 0,
    volume: 0,
    confidence: 0,
    isStable: false,
    smoothedFrequency: 0
  });

  const frequencyHistoryRef = useRef<number[]>([]);
  const volumeHistoryRef = useRef<number[]>([]);
  const lastUpdateRef = useRef<number>(0);

  const calculateConfidence = useCallback((frequencies: number[], volumes: number[]) => {
    if (frequencies.length < 3) return 0;
    
    const recentFreqs = frequencies.slice(-5);
    const avgFreq = recentFreqs.reduce((sum, f) => sum + f, 0) / recentFreqs.length;
    const variance = recentFreqs.reduce((sum, f) => sum + Math.pow(f - avgFreq, 2), 0) / recentFreqs.length;
    const stability = Math.max(0, 1 - variance / 1000);
    
    const avgVolume = volumes.slice(-5).reduce((sum, v) => sum + v, 0) / Math.min(5, volumes.length);
    const volumeConfidence = Math.min(1, avgVolume / 30);
    
    return stability * volumeConfidence;
  }, []);

  const smoothFrequency = useCallback((frequencies: number[]) => {
    if (frequencies.length === 0) return 0;
    
    const weights = [0.4, 0.3, 0.2, 0.1];
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < Math.min(frequencies.length, weights.length); i++) {
      const freq = frequencies[frequencies.length - 1 - i];
      const weight = weights[i];
      weightedSum += freq * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : frequencies[frequencies.length - 1];
  }, []);

  useEffect(() => {
    if (!isListening) {
      frequencyHistoryRef.current = [];
      volumeHistoryRef.current = [];
      setEnhancedData({
        frequency: 0,
        note: '',
        octave: 0,
        volume: 0,
        confidence: 0,
        isStable: false,
        smoothedFrequency: 0
      });
      return;
    }

    const now = Date.now();
    if (now - lastUpdateRef.current < 50) return; // Throttle updates
    lastUpdateRef.current = now;

    const { frequency, note, octave, volume } = audioData;
    
    // Only process if volume is above threshold
    if (volume < volumeThreshold) {
      setEnhancedData(prev => ({
        ...prev,
        volume,
        confidence: 0,
        isStable: false
      }));
      return;
    }

    // Update history
    frequencyHistoryRef.current.push(frequency);
    volumeHistoryRef.current.push(volume);
    
    // Keep only recent history
    const maxHistory = Math.ceil(stabilityWindow / 50);
    if (frequencyHistoryRef.current.length > maxHistory) {
      frequencyHistoryRef.current = frequencyHistoryRef.current.slice(-maxHistory);
    }
    if (volumeHistoryRef.current.length > maxHistory) {
      volumeHistoryRef.current = volumeHistoryRef.current.slice(-maxHistory);
    }

    const confidence = calculateConfidence(frequencyHistoryRef.current, volumeHistoryRef.current);
    const smoothedFrequency = smoothFrequency(frequencyHistoryRef.current);
    const isStable = confidence > 0.6 && volumeHistoryRef.current.length >= 3;

    setEnhancedData({
      frequency,
      note,
      octave,
      volume,
      confidence,
      isStable,
      smoothedFrequency
    });
  }, [audioData, isListening, volumeThreshold, stabilityWindow, calculateConfidence, smoothFrequency]);

  return enhancedData;
};
