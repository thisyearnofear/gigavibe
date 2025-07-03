'use client';

import { useState, useCallback } from 'react';
import { VocalChallenge, ChallengeProgress, ChallengeResult, UseChallengeReturn } from '@/types';
import { useFilCDN } from '@/providers/FilCDNProvider';

export function useChallenge(): UseChallengeReturn {
  const [currentChallenge, setCurrentChallenge] = useState<VocalChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress | null>(null);
  const { uploadFile } = useFilCDN();

  const startChallenge = useCallback((challenge: VocalChallenge) => {
    setCurrentChallenge(challenge);
    setChallengeProgress({
      currentNoteIndex: 0,
      notesHit: new Array(challenge.notes.length).fill(false),
      startTime: Date.now(),
      isComplete: false,
      score: 0,
      accuracy: 0,
      timingAccuracy: [],
    });
  }, []);

  const updateProgress = useCallback((
    frequency: number, 
    note: string, 
    octave: number,
    userFid?: string
  ) => {
    if (!currentChallenge || !challengeProgress) return;

    const currentNoteIndex = challengeProgress.currentNoteIndex;
    if (currentNoteIndex >= currentChallenge.notes.length) return;

    const targetFreq = currentChallenge.targetFrequencies[currentNoteIndex];
    const tolerance = currentChallenge.tolerance;

    // Check if frequency is within tolerance
    const centsOff = 1200 * Math.log2(frequency / targetFreq);
    const isCorrect = Math.abs(centsOff) <= tolerance;

    if (isCorrect) {
      const newNotesHit = [...challengeProgress.notesHit];
      newNotesHit[currentNoteIndex] = true;

      const nextIndex = currentNoteIndex + 1;
      const isComplete = nextIndex >= currentChallenge.notes.length;
      
      // Calculate score based on accuracy
      const noteAccuracy = Math.max(0, 100 - Math.abs(centsOff));
      const newScore = challengeProgress.score + noteAccuracy;
      
      // Calculate timing accuracy
      const expectedTime = currentChallenge.timing[currentNoteIndex];
      const actualTime = Date.now() - challengeProgress.startTime;
      const timingError = Math.abs(actualTime - expectedTime);
      const timingAccuracy = Math.max(0, 100 - (timingError / expectedTime) * 100);
      
      const newTimingAccuracy = [...challengeProgress.timingAccuracy, timingAccuracy];
      const overallAccuracy = (newNotesHit.filter(Boolean).length / newNotesHit.length) * 100;

      setChallengeProgress({
        ...challengeProgress,
        currentNoteIndex: isComplete ? currentNoteIndex : nextIndex,
        notesHit: newNotesHit,
        isComplete,
        score: newScore,
        accuracy: overallAccuracy,
        timingAccuracy: newTimingAccuracy,
      });
    }
  }, [currentChallenge, challengeProgress]);

  const completeChallenge = useCallback(async (): Promise<ChallengeResult | null> => {
    if (!currentChallenge || !challengeProgress || !challengeProgress.isComplete) {
      return null;
    }

    const result: ChallengeResult = {
      challengeId: currentChallenge.id,
      score: Math.round(challengeProgress.score),
      accuracy: Math.round(challengeProgress.accuracy),
      completionTime: Date.now() - challengeProgress.startTime,
      timestamp: Date.now(),
      socialShared: false,
    };

    try {
      // Store result on FilCDN for decentralized leaderboard
      const resultData = JSON.stringify(result);
      const buffer = new TextEncoder().encode(resultData);
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
      const cid = await uploadFile(arrayBuffer);
      
      console.log('Challenge result stored on FilCDN:', cid);
      
      return result;
    } catch (error) {
      console.error('Failed to store challenge result:', error);
      return result; // Return result even if storage fails
    }
  }, [currentChallenge, challengeProgress, uploadFile]);

  const resetChallenge = useCallback(() => {
    setCurrentChallenge(null);
    setChallengeProgress(null);
  }, []);

  const isActive = Boolean(currentChallenge && challengeProgress && !challengeProgress.isComplete);

  return {
    currentChallenge,
    challengeProgress,
    startChallenge,
    updateProgress,
    completeChallenge,
    resetChallenge,
    isActive,
  };
}
