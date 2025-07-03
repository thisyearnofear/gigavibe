'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioService } from '@/lib/audio/AudioService';
import { PitchData, UsePitchDetectionReturn } from '@/types';

export function usePitchDetection(): UsePitchDetectionReturn {
  const [pitchData, setPitchData] = useState<PitchData>({
    frequency: 0,
    note: 'A',
    octave: 4,
    cents: 0,
    isInTune: false,
    volume: 0,
    confidence: 0,
    timestamp: Date.now(),
  });

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const audioServiceRef = useRef<AudioService | null>(null);

  const startListening = useCallback(async () => {
    try {
      setError(null);

      if (!audioServiceRef.current) {
        audioServiceRef.current = new AudioService();
      }

      await audioServiceRef.current.initialize();
      setHasPermission(true);

      audioServiceRef.current.startAnalysis((newPitchData) => {
        setPitchData(newPitchData);
      });

      setIsListening(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listening';
      setError(errorMessage);
      setHasPermission(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (audioServiceRef.current) {
      audioServiceRef.current.stopAnalysis();
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.cleanup();
      }
    };
  }, []);

  return {
    pitchData,
    isListening,
    startListening,
    stopListening,
    error,
    hasPermission,
  };
}
