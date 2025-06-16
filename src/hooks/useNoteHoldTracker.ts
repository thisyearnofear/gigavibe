
import { useState, useEffect, useRef, useCallback } from 'react';

interface NoteHoldState {
  isHolding: boolean;
  holdProgress: number;
  isComplete: boolean;
  timeHeld: number;
}

interface UseNoteHoldTrackerProps {
  targetFrequency: number;
  currentFrequency: number;
  isStable: boolean;
  confidence: number;
  requiredHoldTime?: number;
  tolerance?: number;
}

export const useNoteHoldTracker = ({
  targetFrequency,
  currentFrequency,
  isStable,
  confidence,
  requiredHoldTime = 3000,
  tolerance = 30
}: UseNoteHoldTrackerProps) => {
  const [holdState, setHoldState] = useState<NoteHoldState>({
    isHolding: false,
    holdProgress: 0,
    isComplete: false,
    timeHeld: 0
  });

  const holdStartTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number>();

  const isInTune = useCallback(() => {
    if (targetFrequency === 0 || currentFrequency === 0) return false;
    return Math.abs(currentFrequency - targetFrequency) < tolerance && 
           isStable && 
           confidence > 0.5;
  }, [targetFrequency, currentFrequency, tolerance, isStable, confidence]);

  const updateProgress = useCallback(() => {
    if (!holdStartTimeRef.current) return;
    
    const elapsed = Date.now() - holdStartTimeRef.current;
    const progress = Math.min(1, elapsed / requiredHoldTime);
    const timeHeld = elapsed;
    
    setHoldState(prev => ({
      ...prev,
      holdProgress: progress,
      timeHeld,
      isComplete: progress >= 1
    }));

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [requiredHoldTime]);

  useEffect(() => {
    const inTune = isInTune();
    
    if (inTune && !holdState.isHolding && !holdState.isComplete) {
      // Start holding
      holdStartTimeRef.current = Date.now();
      setHoldState(prev => ({
        ...prev,
        isHolding: true,
        holdProgress: 0,
        timeHeld: 0
      }));
      updateProgress();
    } else if (!inTune && holdState.isHolding && !holdState.isComplete) {
      // Stop holding (went out of tune)
      holdStartTimeRef.current = null;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setHoldState(prev => ({
        ...prev,
        isHolding: false,
        holdProgress: 0,
        timeHeld: 0
      }));
    }
  }, [isInTune, holdState.isHolding, holdState.isComplete, updateProgress]);

  const reset = useCallback(() => {
    holdStartTimeRef.current = null;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setHoldState({
      isHolding: false,
      holdProgress: 0,
      isComplete: false,
      timeHeld: 0
    });
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { ...holdState, reset };
};
