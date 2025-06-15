
import { useState, useEffect, useCallback } from 'react';

interface VocalMetrics {
  pitchRange: {
    lowest: number;
    highest: number;
    lowestNote: string;
    highestNote: string;
  };
  vibrato: {
    detected: boolean;
    rate: number; // Hz
    depth: number; // cents
  };
  stability: {
    pitchConsistency: number; // 0-100%
    averageDeviation: number; // cents
  };
  volume: {
    current: number;
    average: number;
    dynamicRange: number;
  };
  formants: {
    f1: number;
    f2: number;
    vowelEstimate: string;
  };
  sessionStats: {
    duration: number;
    notesHit: string[];
    accuracyScore: number;
  };
}

const useVocalAnalysis = (audioData: any, isListening: boolean) => {
  const [metrics, setMetrics] = useState<VocalMetrics>({
    pitchRange: { lowest: 0, highest: 0, lowestNote: '', highestNote: '' },
    vibrato: { detected: false, rate: 0, depth: 0 },
    stability: { pitchConsistency: 0, averageDeviation: 0 },
    volume: { current: 0, average: 0, dynamicRange: 0 },
    formants: { f1: 0, f2: 0, vowelEstimate: '' },
    sessionStats: { duration: 0, notesHit: [], accuracyScore: 0 }
  });

  const [pitchHistory, setPitchHistory] = useState<number[]>([]);
  const [volumeHistory, setVolumeHistory] = useState<number[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const frequencyToNote = useCallback((frequency: number) => {
    if (frequency === 0) return '';
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    const h = Math.round(12 * Math.log2(frequency / C0));
    const octave = Math.floor(h / 12);
    const n = h % 12;
    return `${noteNames[n]}${octave}`;
  }, []);

  const detectVibrato = useCallback((pitches: number[]) => {
    if (pitches.length < 20) return { detected: false, rate: 0, depth: 0 };
    
    const recentPitches = pitches.slice(-20);
    const mean = recentPitches.reduce((a, b) => a + b, 0) / recentPitches.length;
    const deviations = recentPitches.map(p => p - mean);
    
    // Simple vibrato detection - look for oscillating pattern
    let oscillations = 0;
    for (let i = 1; i < deviations.length - 1; i++) {
      if ((deviations[i-1] < deviations[i] && deviations[i] > deviations[i+1]) ||
          (deviations[i-1] > deviations[i] && deviations[i] < deviations[i+1])) {
        oscillations++;
      }
    }
    
    const vibratoRate = (oscillations / 2) * 5; // Approximate Hz
    const vibratoDepth = Math.max(...deviations) - Math.min(...deviations);
    
    return {
      detected: oscillations > 3 && vibratoDepth > 10,
      rate: vibratoRate,
      depth: vibratoDepth
    };
  }, []);

  const estimateVowel = useCallback((f1: number, f2: number) => {
    // Simplified vowel estimation based on formant frequencies
    if (f1 < 400 && f2 > 2000) return 'i';
    if (f1 < 500 && f2 < 1500) return 'u';
    if (f1 > 700 && f2 > 1800) return 'a';
    if (f1 > 500 && f2 > 1500) return 'e';
    if (f1 > 400 && f2 < 1200) return 'o';
    return 'unknown';
  }, []);

  useEffect(() => {
    if (!isListening || !audioData.frequency) return;

    if (sessionStartTime === 0) {
      setSessionStartTime(Date.now());
    }

    const { frequency, volume, note } = audioData;

    // Update pitch history
    setPitchHistory(prev => {
      const newHistory = [...prev, frequency].slice(-100);
      return newHistory;
    });

    // Update volume history
    setVolumeHistory(prev => {
      const newHistory = [...prev, volume].slice(-100);
      return newHistory;
    });

    // Calculate metrics
    setMetrics(prev => {
      const currentPitchHistory = [...pitchHistory, frequency];
      const currentVolumeHistory = [...volumeHistory, volume];
      
      // Pitch range
      const validPitches = currentPitchHistory.filter(p => p > 0);
      const lowest = validPitches.length > 0 ? Math.min(...validPitches) : 0;
      const highest = validPitches.length > 0 ? Math.max(...validPitches) : 0;

      // Vibrato analysis
      const vibrato = detectVibrato(validPitches);

      // Stability analysis
      const recentPitches = validPitches.slice(-20);
      const avgPitch = recentPitches.reduce((a, b) => a + b, 0) / recentPitches.length || 0;
      const deviations = recentPitches.map(p => Math.abs(p - avgPitch));
      const averageDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length || 0;
      const pitchConsistency = Math.max(0, 100 - (averageDeviation / 10));

      // Volume analysis
      const avgVolume = currentVolumeHistory.reduce((a, b) => a + b, 0) / currentVolumeHistory.length || 0;
      const volumeRange = Math.max(...currentVolumeHistory) - Math.min(...currentVolumeHistory);

      // Basic formant estimation (simplified)
      const f1 = 500 + (volume * 5); // Simplified estimation
      const f2 = 1500 + (frequency * 0.5);
      const vowelEstimate = estimateVowel(f1, f2);

      // Session stats
      const duration = sessionStartTime > 0 ? (Date.now() - sessionStartTime) / 1000 : 0;
      const notesHit = [...new Set([...prev.sessionStats.notesHit, note])].filter(n => n);
      const accuracyScore = pitchConsistency;

      return {
        pitchRange: {
          lowest,
          highest,
          lowestNote: frequencyToNote(lowest),
          highestNote: frequencyToNote(highest)
        },
        vibrato,
        stability: {
          pitchConsistency,
          averageDeviation
        },
        volume: {
          current: volume,
          average: avgVolume,
          dynamicRange: volumeRange
        },
        formants: {
          f1,
          f2,
          vowelEstimate
        },
        sessionStats: {
          duration,
          notesHit,
          accuracyScore
        }
      };
    });
  }, [audioData, isListening, pitchHistory, volumeHistory, sessionStartTime, detectVibrato, frequencyToNote, estimateVowel]);

  const resetSession = useCallback(() => {
    setPitchHistory([]);
    setVolumeHistory([]);
    setSessionStartTime(0);
    setMetrics({
      pitchRange: { lowest: 0, highest: 0, lowestNote: '', highestNote: '' },
      vibrato: { detected: false, rate: 0, depth: 0 },
      stability: { pitchConsistency: 0, averageDeviation: 0 },
      volume: { current: 0, average: 0, dynamicRange: 0 },
      formants: { f1: 0, f2: 0, vowelEstimate: '' },
      sessionStats: { duration: 0, notesHit: [], accuracyScore: 0 }
    });
  }, []);

  return { metrics, resetSession };
};

export default useVocalAnalysis;
