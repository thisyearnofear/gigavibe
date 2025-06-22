import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle } from 'lucide-react'; // Assuming you use these for toasts

// Assuming noteToFrequency and TARGET_NOTES are utility/config and might be moved or imported
// For now, let's define them here or assume they are passed in if they become very dynamic.

interface TargetNote {
  name: string;
  duration: number;
}

// Helper to convert note string (e.g., "C#4") to frequency - Duplicated for now, consider centralizing
const noteToFrequency = (noteName: string): number => {
  const noteParts = noteName.match(/([A-G]#?)([0-9])/);
  if (!noteParts) return 0;
  const note = noteParts[1];
  const octave = parseInt(noteParts[2]);
  const noteMap: { [key: string]: number } = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
  const noteIndex = noteMap[note];
  if (noteIndex === undefined) return 0;
  const A4 = 440;
  const n = noteIndex - 9 + (octave - 4) * 12;
  return A4 * Math.pow(2, n / 12);
};

const DEFAULT_TARGET_NOTES: TargetNote[] = [
  { name: "C4", duration: 2500 },
  { name: "E4", duration: 2500 },
  { name: "G4", duration: 2500 },
  { name: "A4", duration: 3000 },
  { name: "F4", duration: 2000 },
  { name: "D4", duration: 2500 },
  { name: "B3", duration: 2500 },
];

interface UsePitchPerfectGameProps {
  enhancedAudio: any; // Type this more strictly based on useEnhancedAudioAnalysis output
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  saveScoreFn: (details: { score: number; notesAttempted: number; notesCorrect: number }, durationMs: number) => Promise<any>;
  targetNotes?: TargetNote[];
}

export const usePitchPerfectGame = ({
  enhancedAudio,
  isListening,
  startListening,
  stopListening,
  saveScoreFn,
  targetNotes = DEFAULT_TARGET_NOTES,
}: UsePitchPerfectGameProps) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentTargetNoteIndex, setCurrentTargetNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const gameStartTimeRef = useRef<number | null>(null);
  const notesAttemptedRef = useRef(0);
  const notesCorrectRef = useRef(0);
  const lastScoredTimeRef = useRef<number>(0);
  const noteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentTargetNote = targetNotes[currentTargetNoteIndex];
  const targetFrequency = currentTargetNote ? noteToFrequency(currentTargetNote.name) : 0;

  const internalStopGame = useCallback(async (finishedNaturally: boolean = true) => {
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    stopListening();
    setGameState('finished');
    const finalFeedback = `Game Over! Final Score: ${score}`;
    setFeedback(finalFeedback);
    setIsSaving(true);

    if (gameStartTimeRef.current && notesAttemptedRef.current > 0 && finishedNaturally) {
      const durationMs = Date.now() - gameStartTimeRef.current;
      try {
        await saveScoreFn(
          { score, notesAttempted: notesAttemptedRef.current, notesCorrect: notesCorrectRef.current },
          durationMs
        );
        toast({ title: "Score Saved!", description: "Your performance has been logged.", icon: <CheckCircle className="text-green-500" />, duration: 3000 });
      } catch (e) {
        toast({ title: "Save Error", description: "Could not save your game score. Please try again.", variant: "destructive", icon: <XCircle className="text-red-500" />, duration: 4000 });
        console.error("Failed to save game score:", e);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(false); // Ensure isSaving is reset if not saving
    }
    gameStartTimeRef.current = null;
  }, [score, stopListening, saveScoreFn, targetNotes]); // Added targetNotes, as it's used in advanceNote

  const advanceNote = useCallback(() => {
    notesAttemptedRef.current += 1;
    if (currentTargetNoteIndex < targetNotes.length - 1) {
      setCurrentTargetNoteIndex(prevIndex => prevIndex + 1);
      setFeedback(`Next up: ${targetNotes[currentTargetNoteIndex + 1].name}`);
      lastScoredTimeRef.current = 0;
    } else {
      internalStopGame(true); // finished naturally
    }
  }, [currentTargetNoteIndex, targetNotes, internalStopGame]);


  const startGame = async () => {
    // Permission check should ideally happen before calling this or be passed as a prop
    await startListening();
    setGameState('playing');
    setCurrentTargetNoteIndex(0);
    setScore(0);
    setFeedback(`Get ready to sing: ${targetNotes[0].name}`);
    gameStartTimeRef.current = Date.now();
    notesAttemptedRef.current = 0;
    notesCorrectRef.current = 0;
    lastScoredTimeRef.current = 0;
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current); // Clear any existing timer
  };

  // Effect for game logic (scoring, advancing notes)
  useEffect(() => {
    if (gameState !== 'playing' || !isListening || !currentTargetNote) {
        if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
        return;
    }

    const currentTime = Date.now();

    if (enhancedAudio.isStable && enhancedAudio.volume > 5 && targetFrequency > 0) {
      const userFrequency = enhancedAudio.smoothedFrequency;
      const centsDiff = Math.abs(1200 * Math.log2(userFrequency / targetFrequency));

      if (currentTime - lastScoredTimeRef.current > 500) {
        if (centsDiff < 30) {
          setScore(s => s + 10);
          setFeedback(`Spot on! ${currentTargetNote.name}`);
          if (lastScoredTimeRef.current === 0) notesCorrectRef.current += 1;
          lastScoredTimeRef.current = currentTime;
        } else if (centsDiff < 70) {
          setScore(s => s + 2);
          setFeedback(`Close! Aim for ${currentTargetNote.name}`);
          lastScoredTimeRef.current = currentTime;
        } else {
          setFeedback(`Adjust for ${currentTargetNote.name}. You: ${userFrequency.toFixed(0)}Hz`);
        }
      }
    }

    // Set timer for current note's duration
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current); // Clear previous timer
    noteTimerRef.current = setTimeout(() => {
      advanceNote();
    }, currentTargetNote.duration);

    return () => {
      if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    };
  }, [gameState, isListening, enhancedAudio, currentTargetNote, targetFrequency, advanceNote, score]); // Score removed from deps to avoid re-triggering on score change

  const manualStopGame = () => internalStopGame(false); // For user clicking stop button

  return {
    gameState,
    score,
    feedback,
    currentTargetNote,
    targetFrequency,
    startGame,
    stopGame: manualStopGame, // Expose the manual stop
    isSavingScore: isSaving,
    notesAttempted: notesAttemptedRef.current, // For potential display
    notesCorrect: notesCorrectRef.current,   // For potential display
  };
};
