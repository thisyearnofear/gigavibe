import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

interface BeatDetail {
  duration: number; // Duration of the beat's visual/audio cue in ms
  isTarget: boolean; // Should the user tap/interact on this beat?
  delayAfter: number; // Silence/pause AFTER this beat's cue finishes, before the next beat's cue starts (in ms)
}

interface RhythmicPattern {
  name: string;
  tempo: number; // BPM
  pattern: BeatDetail[];
}

const DEFAULT_RHYTHMIC_PATTERNS: RhythmicPattern[] = [
  {
    name: "Simple Quarter Notes",
    tempo: 120, // Each beat is 500ms
    pattern: [
      { duration: 100, isTarget: true, delayAfter: 400 },
      { duration: 100, isTarget: true, delayAfter: 400 },
      { duration: 100, isTarget: true, delayAfter: 400 },
      { duration: 100, isTarget: true, delayAfter: 400 },
    ]
  },
  {
    name: "Eighth Notes and Quarters",
    tempo: 100, // Each quarter beat is 600ms. Eighth = 300ms.
    pattern: [
      { duration: 100, isTarget: true, delayAfter: 500 }, // Q1
      { duration: 80, isTarget: true, delayAfter: 220 },  // E1
      { duration: 80, isTarget: true, delayAfter: 220 },  // E2
      { duration: 100, isTarget: true, delayAfter: 500 }, // Q3
      { duration: 100, isTarget: true, delayAfter: 500 }, // Q4
    ]
  },
];

interface UseRhythmMasterGameProps {
  patterns?: RhythmicPattern[];
  // saveScoreFn for future integration
}

export const useRhythmMasterGame = ({
  patterns = DEFAULT_RHYTHMIC_PATTERNS,
}: UseRhythmMasterGameProps = {}) => {
  const [availablePatterns] = useState<RhythmicPattern[]>(patterns);
  const [selectedPattern, setSelectedPattern] = useState<RhythmicPattern>(availablePatterns[0]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');

  // UI-related states
  const [currentUiBeatIndex, setCurrentUiBeatIndex] = useState(0); // For displaying progress like "Beat 1/4"
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showBeatCueVisual, setShowBeatCueVisual] = useState(false); // For UI visual cue

  // Web Audio API and timing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextAudioEventTimeRef = useRef(0); // Tracks the Web Audio time for the next scheduled sound event
  const currentPatternPlayheadRef = useRef(0); // Index in the selectedPattern.pattern being processed by scheduler

  const schedulerIntervalRef = useRef<NodeJS.Timeout | null>(null); // For the JS-based scheduler loop
  const beatVisualTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For timing the visual cue display

  // Expected tap time for the *current* UI beat (in milliseconds, compatible with Date.now())
  // This gets updated when a beat becomes "active" visually.
  const expectedTapTimeForUiBeatMsRef = useRef(0);

  const lookaheadSec = 0.1; // How far scheduler looks ahead (100ms)
  const scheduleIntervalMs = 25; // How often scheduler runs

  // Initialize AudioContext
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    audioContextRef.current.resume();
  }, []);

  // Cleanup AudioContext
  const cleanupAudioContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      // audioContextRef.current.close(); // Decide if closing is appropriate or just suspending
      // audioContextRef.current = null;
    }
    if (schedulerIntervalRef.current) clearInterval(schedulerIntervalRef.current);
    if (beatVisualTimeoutRef.current) clearTimeout(beatVisualTimeoutRef.current);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => cleanupAudioContext();
  }, [cleanupAudioContext]);


  // Function to play a metronome click using Web Audio
  const playAudibleCue = useCallback((time: number, isTarget: boolean) => {
    if (!audioContextRef.current) return;
    const context = audioContextRef.current;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);

    osc.frequency.setValueAtTime(isTarget ? 880 : 440, time); // Higher for target beats
    gain.gain.setValueAtTime(isTarget ? 0.15 : 0.08, time); // Slightly louder for target
    gain.gain.exponentialRampToValueAtTime(0.00001, time + 0.05);
    osc.start(time);
    osc.stop(time + 0.05);
  }, []);

  // Scheduler: schedules audio events using Web Audio API
  const scheduleAudioEvents = useCallback(() => {
    if (!audioContextRef.current || gameState !== 'playing') return;

    const currentTime = audioContextRef.current.currentTime;

    while (nextAudioEventTimeRef.current < currentTime + lookaheadSec && currentPatternPlayheadRef.current < selectedPattern.pattern.length) {
      const beat = selectedPattern.pattern[currentPatternPlayheadRef.current];

      // Schedule the audible cue (metronome click)
      playAudibleCue(nextAudioEventTimeRef.current, beat.isTarget);

      // Schedule the visual cue and UI updates using setTimeout, delayed to match the audio event time
      const delayToVisualCueMs = Math.max(0, (nextAudioEventTimeRef.current - currentTime) * 1000 - (beat.duration / 2)); // Try to center visual cue

      // Store the expected tap time (center of the audio cue) for this beat
      const beatAudioStartTimeMs = nextAudioEventTimeRef.current * 1000;

      setTimeout(() => {
        if (gameState === 'playing') { // Check gameState again inside timeout
          setCurrentUiBeatIndex(currentPatternPlayheadRef.current -1); // UI shows the beat that's now "live"
          setFeedback(beat.isTarget ? "Tap!" : "Listen...");
          setShowBeatCueVisual(true);
          expectedTapTimeForUiBeatMsRef.current = beatAudioStartTimeMs + (audioContextRef.current?.baseLatency || 0) * 1000;

          if (beatVisualTimeoutRef.current) clearTimeout(beatVisualTimeoutRef.current);
          beatVisualTimeoutRef.current = setTimeout(() => setShowBeatCueVisual(false), beat.duration);
        }
      }, delayToVisualCueMs);

      // Advance time for the next audio event
      const beatFullDurationSec = (beat.duration + beat.delayAfter) / 1000;
      nextAudioEventTimeRef.current += beatFullDurationSec;
      currentPatternPlayheadRef.current++;
    }

    // Check if pattern finished
    if (currentPatternPlayheadRef.current >= selectedPattern.pattern.length &&
        currentTime >= nextAudioEventTimeRef.current - lookaheadSec) { // Ensure last scheduled events had time to play
      const lastBeat = selectedPattern.pattern[selectedPattern.pattern.length - 1];
      const endDelay = (lastBeat.duration + lastBeat.delayAfter); // Wait for last beat to fully complete
      setTimeout(() => {
          if(gameState === 'playing') { // Check again, game might have been stopped manually
            setGameState('finished');
            setFeedback(`Pattern Complete! Final Score: ${score}`);
          }
      }, endDelay);
      if (schedulerIntervalRef.current) clearInterval(schedulerIntervalRef.current);
    }
  }, [gameState, selectedPattern, playAudibleCue, score]); // Added score to deps for feedback

  // Start/Stop Game Logic
  const startGame = useCallback((pattern?: RhythmicPattern) => {
    initAudioContext();
    if (pattern) setSelectedPattern(pattern);

    setCurrentUiBeatIndex(0);
    currentPatternPlayheadRef.current = 0;
    setScore(0);
    setFeedback('Get Ready...');
    setGameState('playing');

    // Initialize nextAudioEventTimeRef just before starting the scheduler
    nextAudioEventTimeRef.current = audioContextRef.current!.currentTime + 0.1; // Start audio events 100ms from now

    if (schedulerIntervalRef.current) clearInterval(schedulerIntervalRef.current);
    schedulerIntervalRef.current = setInterval(scheduleAudioEvents, scheduleIntervalMs);
  }, [initAudioContext, scheduleAudioEvents]);

  const stopGame = useCallback(() => {
    setGameState('idle');
    setFeedback(gameState === 'playing' ? 'Game stopped.' : `Pattern Complete! Final Score: ${score}`);
    if (schedulerIntervalRef.current) clearInterval(schedulerIntervalRef.current);
    if (beatVisualTimeoutRef.current) clearTimeout(beatVisualTimeoutRef.current);
    setShowBeatCueVisual(false);
    // currentPatternPlayheadRef and setCurrentUiBeatIndex are reset by startGame
  }, [gameState, score]);


  // Handle User Tap
  const handleUserTap = useCallback(() => {
    if (gameState !== 'playing' || currentUiBeatIndex >= selectedPattern.pattern.length) return null;

    const tapTime = Date.now(); // System time of tap
    const beatDataForTap = selectedPattern.pattern[currentUiBeatIndex];
    let tapOutcomeFeedback = '';

    if (beatDataForTap && beatDataForTap.isTarget) {
      const timeDifference = Math.abs(tapTime - expectedTapTimeForUiBeatMsRef.current);
      const perfectWindow = 80;
      const goodWindow = 160;

      if (timeDifference < perfectWindow) {
        setScore(prev => prev + 20);
        tapOutcomeFeedback = 'Perfect!';
        toast({ title: tapOutcomeFeedback, duration: 800, icon: <CheckCircle className="text-green-500" /> });
      } else if (timeDifference < goodWindow) {
        setScore(prev => prev + 10);
        tapOutcomeFeedback = 'Good!';
        toast({ title: tapOutcomeFeedback, duration: 800, icon: <CheckCircle className="text-yellow-500" /> });
      } else {
        setScore(prev => prev - 2);
        tapOutcomeFeedback = 'Off Beat...';
        toast({ title: tapOutcomeFeedback, description: "Try to tap closer to the cue.", duration: 1200, variant: "warning" });
      }
    } else {
      tapOutcomeFeedback = 'Missed Target!';
      setScore(prev => prev - 5); // Penalty for tapping when not supposed to
      toast({ title: tapOutcomeFeedback, description: "Only tap on cued target beats.", duration: 1200, variant: "destructive" });
    }
    return tapOutcomeFeedback; // For any immediate UI reaction if needed
  }, [gameState, currentUiBeatIndex, selectedPattern, score]);

  return {
    availablePatterns,
    selectedPattern,
    setSelectedPattern,
    gameState,
    score,
    feedback,
    showBeatCue: showBeatCueVisual,
    currentBeatIndex: currentUiBeatIndex, // UI uses this for display
    patternLength: selectedPattern.pattern.length,
    startGame,
    stopGame,
    handleUserTap,
  };
};
