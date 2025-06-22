import React, { useState, useEffect, useCallback, useRef } from 'react';
import useAudioInput from '@/hooks/useAudioInput';
import { useEnhancedAudioAnalysis } from '@/hooks/useEnhancedAudioAnalysis';
import { useProgressData } from '@/hooks/useProgressData';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Volume2, Mic, AlertTriangle, Info, CheckCircle, XCircle, Music } from 'lucide-react';

// Helper to convert note string (e.g., "C#4") to frequency
const noteToFrequency = (noteName: string): number => {
  const noteParts = noteName.match(/([A-G]#?)([0-9])/);
  if (!noteParts) return 0;

  const note = noteParts[1];
  const octave = parseInt(noteParts[2]);

  const noteMap: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  const noteIndex = noteMap[note];
  if (noteIndex === undefined) return 0;

  const A4 = 440;
  const n = noteIndex - 9 + (octave - 4) * 12;
  return A4 * Math.pow(2, n / 12);
};

const TARGET_NOTES = [
  { name: "C4", duration: 2500 },
  { name: "E4", duration: 2500 },
  { name: "G4", duration: 2500 },
  { name: "A4", duration: 3000 },
  { name: "F4", duration: 2000 },
  { name: "D4", duration: 2500 },
  { name: "B3", duration: 2500 },
];

const PitchPerfectChallenge = () => {
  const { audioData, isListening, startListening, stopListening, hasPermission, error: audioError } = useAudioInput();
  const enhancedAudio = useEnhancedAudioAnalysis({ audioData, isListening, volumeThreshold: 2, stabilityWindow: 200 });
  const { savePitchPerfectScore, isSavingScore } = useProgressData(); // Get save function and loading state

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentTargetNoteIndex, setCurrentTargetNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);

  // For tracking game session data
  const gameStartTimeRef = useRef<number | null>(null);
  const notesAttemptedRef = useRef(0);
  const notesCorrectRef = useRef(0);
  const lastScoredTimeRef = useRef<number>(0); // To prevent rapid scoring for the same note

  const currentTargetNote = TARGET_NOTES[currentTargetNoteIndex];
  const targetFrequency = currentTargetNote ? noteToFrequency(currentTargetNote.name) : 0;

  const startGame = async () => {
    if (!hasPermission && hasPermission !== null) {
        alert("Microphone permission is required to play. Please enable it in your browser settings.");
        return;
    }
    await startListening();
    if (error) {
        alert(`Error starting audio: ${error}. Please ensure your microphone is connected and permissions are granted.`);
        return;
    }
    setGameState('playing');
    setCurrentTargetNoteIndex(0);
    setScore(0);
    setFeedback(`Sing: ${TARGET_NOTES[0].name}`);
    setShowInstructions(false);
  };

  const stopGame = () => {
    stopListening();
    setGameState('finished');
    setFeedback(`Game Over! Final Score: ${score}`);
  };

  const advanceNote = useCallback(() => {
    if (currentTargetNoteIndex < TARGET_NOTES.length - 1) {
      setCurrentTargetNoteIndex(prevIndex => prevIndex + 1);
      setFeedback(`Sing: ${TARGET_NOTES[currentTargetNoteIndex + 1].name}`);
    } else {
      stopGame();
    }
  }, [currentTargetNoteIndex]);

  useEffect(() => {
    if (gameState !== 'playing' || !isListening || !currentTargetNote) return;

    let noteTimer: NodeJS.Timeout;

    if (enhancedAudio.isStable && enhancedAudio.volume > 5 && targetFrequency > 0) {
      const userFrequency = enhancedAudio.smoothedFrequency;
      const diff = Math.abs(userFrequency - targetFrequency);
      const centsDiff = Math.abs(1200 * Math.log2(userFrequency / targetFrequency));

      if (centsDiff < 30) { // Within ~30 cents (quarter-tone)
        setScore(s => s + 10); // Points for being close
        setFeedback(`Great! Holding ${currentTargetNote.name}`);
      } else if (centsDiff < 70) { // Within ~70 cents (more than a quarter tone but less than a semitone)
         setScore(s => s + 2);
         setFeedback(`A bit off for ${currentTargetNote.name}. Try adjusting!`);
      } else {
        setFeedback(`Way off for ${currentTargetNote.name}. Target: ${targetFrequency.toFixed(1)} Hz, You: ${userFrequency.toFixed(1)} Hz`);
      }
    }

    // Timer for current note's duration
    noteTimer = setTimeout(() => {
        advanceNote();
    }, currentTargetNote.duration);

    return () => {
      clearTimeout(noteTimer);
    };
  }, [gameState, isListening, enhancedAudio, currentTargetNote, targetFrequency, advanceNote]);


  if (hasPermission === null && gameState === 'idle') {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md text-center">
        <p className="text-lg font-semibold mb-4">Requesting microphone permission...</p>
        <Button onClick={startGame}>Allow Microphone</Button>
         {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  if (showInstructions && gameState === 'idle') {
    return (
      <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-xl text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
          Pitch Perfect Challenge!
        </h2>
        <p className="text-gray-700 mb-4 text-lg">
          Test your vocal accuracy! When the game starts, you'll see a target note.
        </p>
        <p className="text-gray-700 mb-6 text-lg">
          Sing the note as steadily and accurately as you can. Let's see how high you can score!
        </p>
        <Button
          onClick={startGame}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Start Challenge
        </Button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-semibold text-indigo-600">Pitch Perfect Challenge</h2>

      {gameState === 'playing' && currentTargetNote && (
        <div className="my-4 p-6 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50 w-full max-w-xs text-center">
          <p className="text-xl text-indigo-700 font-medium">Target Note:</p>
          <p className="text-4xl font-bold text-indigo-500 my-2">{currentTargetNote.name}</p>
          <p className="text-sm text-gray-600">(~{targetFrequency.toFixed(1)} Hz)</p>
        </div>
      )}

      {isListening && gameState === 'playing' && (
        <div className="my-2 p-4 border border-gray-300 rounded-lg bg-gray-50 w-full max-w-xs text-center">
          <p className="text-lg text-gray-700">Your Pitch:</p>
          <p className="text-3xl font-bold text-purple-600 my-1">
            {enhancedAudio.isStable && enhancedAudio.volume > 5 ? `${enhancedAudio.note}${enhancedAudio.octave}` : '--'}
          </p>
          <p className="text-sm text-gray-500">
            ({enhancedAudio.isStable && enhancedAudio.volume > 5 ? enhancedAudio.smoothedFrequency.toFixed(1) : '0.0'} Hz)
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${Math.min(enhancedAudio.volume, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Volume</p>
        </div>
      )}

      <p className="text-lg font-medium text-gray-800">{feedback}</p>
      <p className="text-2xl font-bold text-green-500">Score: {score}</p>

      {gameState === 'idle' && (
        <Button onClick={startGame}>Start Game</Button>
      )}
      {gameState === 'playing' && (
        <Button onClick={stopGame} variant="destructive">Stop Game</Button>
      )}
      {gameState === 'finished' && (
        <Button onClick={startGame}>Play Again?</Button>
      )}
       {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default PitchPerfectChallenge;
