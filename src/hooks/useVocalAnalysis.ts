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

// Utility function to convert frequency to note
const frequencyToNote = (frequency: number): { note: string; octave: number } => {
  if (frequency < 16.35) return { note: '', octave: 0 };
  
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const c0 = 16.35; // C0 frequency
  const semitonesFromC0 = Math.round(12 * Math.log2(frequency / c0));
  const octave = Math.floor(semitonesFromC0 / 12);
  const noteIndex = semitonesFromC0 % 12;
  const note = notes[noteIndex >= 0 ? noteIndex : noteIndex + 12];
  return { note, octave };
};

// Utility function to estimate vowel based on formants
const estimateVowel = (f1: number, f2: number): string => {
  if (f1 < 200 || f2 < 500) return 'N/A';
  
  // Approximate vowel formant ranges (based on average male/female speech)
  if (f1 > 600 && f2 > 1800) return 'i (ee)';
  if (f1 > 600 && f2 < 1200) return 'u (oo)';
  if (f1 < 400 && f2 > 2000) return 'a (ah)';
  if (f1 < 500 && f2 < 1500) return 'o (oh)';
  if (f1 < 500 && f2 > 1500) return 'e (eh)';
  return '?';
};

// Utility function to analyze pitch stability
const analyzePitchStability = (history: number[]): { consistency: number; deviation: number } => {
  if (history.length < 10) return { consistency: 0, deviation: 0 };
  
  const nonZero = history.filter(f => f > 20);
  if (nonZero.length < 10) return { consistency: 0, deviation: 0 };
  
  const mean = nonZero.reduce((sum, val) => sum + val, 0) / nonZero.length;
  const squaredDiffs = nonZero.reduce((sum, val) => sum + (val - mean) ** 2, 0);
  const variance = squaredDiffs / nonZero.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to cents for deviation (1 semitone = 100 cents)
  const deviationCents = nonZero.length > 0 ? (stdDev / mean) * 1200 : 0;
  // Consistency score: lower deviation = higher consistency
  const consistency = Math.max(0, 100 - deviationCents * 0.5);
  
  return { consistency, deviation: deviationCents };
};

// Utility function to detect vibrato
const detectVibrato = (history: number[]): { detected: boolean; rate: number; depth: number } => {
  if (history.length < 20) return { detected: false, rate: 0, depth: 0 };
  
  // Simple peak counting for vibrato detection
  let peaks = 0;
  let troughs = 0;
  let lastDirection = 0; // 1 for up, -1 for down
  const threshold = 5; // Hz change threshold
  
  for (let i = 1; i < history.length - 1; i++) {
    if (history[i] < 20) continue; // Skip invalid frequencies
    
    const diffNext = history[i + 1] - history[i];
    const diffPrev = history[i] - history[i - 1];
    
    if (diffPrev > threshold && diffNext < -threshold) {
      peaks++;
      lastDirection = 1;
    } else if (diffPrev < -threshold && diffNext > threshold) {
      troughs++;
      lastDirection = -1;
    }
  }
  
  const cycles = Math.min(peaks, troughs);
  const detected = cycles > 3;
  const rate = detected ? (cycles / (history.length * 0.02)) : 0; // Rough Hz estimate
  const depth = detected ? (Math.max(...history) - Math.min(...history)) * 0.5 : 0; // Rough cents
  
  return { detected, rate, depth };
};

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

  useEffect(() => {
    if (isListening && sessionStartTime === 0) {
      setSessionStartTime(Date.now());
    }
  }, [isListening, sessionStartTime]);

  useEffect(() => {
    if (!isListening || !audioData) return;
    
    const { frequency, volume, cents, note, octave, isInTune, formants } = audioData;
    
    // Update pitch history for analysis
    setPitchHistory(prev => {
      const newHistory = [...prev, frequency].slice(-100); // Last 2-3 seconds at 50ms intervals
      return newHistory;
    });
    
    // Update volume history
    setVolumeHistory(prev => {
      const newHistory = [...prev, volume].slice(-100);
      return newHistory;
    });
    
    // Comprehensive analysis
    setMetrics(prev => {
      const nonZeroPitches = pitchHistory.filter(f => f > 20);
      const lowest = nonZeroPitches.length > 0 ? Math.min(...nonZeroPitches) : 0;
      const highest = nonZeroPitches.length > 0 ? Math.max(...nonZeroPitches) : 0;
      const lowestNoteObj = lowest > 0 ? frequencyToNote(lowest) : { note: '', octave: 0 };
      const highestNoteObj = highest > 0 ? frequencyToNote(highest) : { note: '', octave: 0 };
      const vibrato = detectVibrato(pitchHistory);
      const stability = analyzePitchStability(pitchHistory);
      
      // Volume metrics
      const volNonZero = volumeHistory.filter(v => v > 0);
      const volAvg = volNonZero.length > 0 ? volNonZero.reduce((sum, v) => sum + v, 0) / volNonZero.length : 0;
      const volMin = volNonZero.length > 0 ? Math.min(...volNonZero) : 0;
      const volMax = volNonZero.length > 0 ? Math.max(...volNonZero) : 0;
      
      // Session stats
      const duration = sessionStartTime > 0 ? (Date.now() - sessionStartTime) / 1000 : 0;
      const notesHit = prev.sessionStats.notesHit;
      if (note && note !== '' && isInTune && !notesHit.includes(note + octave)) {
        notesHit.push(note + octave);
      }
      // Rough accuracy score based on cents deviation and stability
      const accuracyScore = Math.max(0, 100 - Math.abs(cents) * 0.5) * (stability.consistency / 100);
      
      // Formants and vowel estimation
      const f1 = formants?.f1 || 0;
      const f2 = formants?.f2 || 0;
      const vowel = estimateVowel(f1, f2);
      
      return {
        pitchRange: {
          lowest,
          highest,
          lowestNote: lowestNoteObj.note + lowestNoteObj.octave,
          highestNote: highestNoteObj.note + highestNoteObj.octave
        },
        vibrato,
        stability: {
          pitchConsistency: stability.consistency,
          averageDeviation: stability.deviation
        },
        volume: {
          current: volume,
          average: volAvg,
          dynamicRange: volMax - volMin
        },
        formants: {
          f1,
          f2,
          vowelEstimate: vowel
        },
        sessionStats: {
          duration,
          notesHit,
          accuracyScore
        }
      };
    });
  }, [audioData, isListening, pitchHistory, volumeHistory, sessionStartTime]);

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
