import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Hand, Circle, PauseCircle, PlayCircle, Music2, Info, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Example Rhythmic Patterns
// Each object in the pattern array represents a beat.
// `duration` is in milliseconds for how long the beat indication lasts (visual/audio cue).
// `isTarget` means this beat should be tapped/sung by the user.
// `delayAfter` is the silence/pause AFTER this beat's cue finishes, before the next beat starts.
const RHYTHMIC_PATTERNS = [
  {
    name: "Simple Quarter Notes",
    tempo: 120, // BPM
    pattern: [
      { duration: 100, isTarget: true, delayAfter: 400 }, // Total 500ms per beat (120 BPM)
      { duration: 100, isTarget: true, delayAfter: 400 },
      { duration: 100, isTarget: true, delayAfter: 400 },
      { duration: 100, isTarget: true, delayAfter: 400 },
    ]
  },
  {
    name: "Eighth Note Burst",
    tempo: 100, // BPM
    pattern: [
      { duration: 100, isTarget: true, delayAfter: 200 }, // Beat 1 (quarter) = 600ms
      { duration: 100, isTarget: true, delayAfter: 200 }, // Beat 2 (quarter)
      { duration: 50, isTarget: true, delayAfter: 50 },  // Beat 3.1 (eighth)
      { duration: 50, isTarget: true, delayAfter: 200 }, // Beat 3.2 (eighth) - longer delay after
      { duration: 100, isTarget: true, delayAfter: 200 }, // Beat 4 (quarter)
    ]
  },
  // Add more complex patterns here
];

const RhythmMaster = () => {
  const [selectedPattern, setSelectedPattern] = useState(RHYTHMIC_PATTERNS[0]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'listening' | 'finished'>('idle');
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showBeatCue, setShowBeatCue] = useState(false);
  const [showUserTapIndicator, setShowUserTapIndicator] = useState(false);

  const beatInterval = 60000 / selectedPattern.tempo; // ms per beat (based on quarter note)

  // Placeholder for actual audio input hook if needed for singing mode
  // const { isListening, startListening, stopListening } = useAudioInput();

  const playBeatCue = useCallback((beat: typeof selectedPattern.pattern[0]) => {
    setShowBeatCue(true);
    // In a real version, you might play a sound here
    setTimeout(() => {
      setShowBeatCue(false);
    }, beat.duration);
  }, []);

  const processNextBeat = useCallback(() => {
    if (currentBeatIndex >= selectedPattern.pattern.length) {
      setGameState('finished');
      setFeedback(`Pattern Complete! Score: ${score}`);
      return;
    }

    const currentBeat = selectedPattern.pattern[currentBeatIndex];
    playBeatCue(currentBeat);

    // This timeout is crucial: it schedules the *next* beat processing
    // AFTER the current beat's cue AND its specified delay.
    const totalTimeForThisBeat = currentBeat.duration + currentBeat.delayAfter;

    setTimeout(() => {
      setCurrentBeatIndex(prev => prev + 1);
    }, totalTimeForThisBeat);

  }, [currentBeatIndex, selectedPattern.pattern, playBeatCue, score]);


  useEffect(() => {
    if (gameState === 'playing' && currentBeatIndex < selectedPattern.pattern.length) {
      processNextBeat();
    }
  }, [gameState, currentBeatIndex, processNextBeat, selectedPattern.pattern.length]);


  const handleUserAction = () => {
    if (gameState !== 'playing') return;

    setShowUserTapIndicator(true);
    setTimeout(() => setShowUserTapIndicator(false), 150); // Visual feedback for tap

    const beat = selectedPattern.pattern[currentBeatIndex -1]; // User reacts to the beat that just played or is playing
    if (beat && beat.isTarget) {
        // Basic scoring: For now, any tap on a target beat gets points.
        // Timing precision would require more complex logic.
        setScore(prev => prev + 10);
        setFeedback('Good!');
        // In a real game, you'd check the timing accuracy here.
        // For now, we assume if they tap while a target beat is "active" (loose timing), it's good.
    } else {
        setFeedback('Miss!');
        setScore(prev => prev - 5); // Penalty for tapping on non-target or out of sync
    }
  };

  const startGame = () => {
    setCurrentBeatIndex(0);
    setScore(0);
    setFeedback('Get Ready...');
    setGameState('playing');
    // If using microphone for singing mode:
    // startListening();
  };

  const stopGame = () => {
    setGameState('idle');
    setFeedback('Game stopped.');
    setCurrentBeatIndex(0); // Reset
    // If using microphone:
    // stopListening();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-xl flex flex-col items-center space-y-6 max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
        Rhythm Master
      </h2>

      {gameState === 'idle' && (
        <div className="w-full space-y-4">
          <p className="text-center text-gray-700">Select a pattern and test your rhythm!</p>
          <select
            value={selectedPattern.name}
            onChange={(e) => setSelectedPattern(RHYTHMIC_PATTERNS.find(p => p.name === e.target.value) || RHYTHMIC_PATTERNS[0])}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {RHYTHMIC_PATTERNS.map(p => <option key={p.name} value={p.name}>{p.name} ({p.tempo} BPM)</option>)}
          </select>
          <Button onClick={startGame} size="lg" className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white">
            <PlayCircle className="mr-2" /> Start Rhythm Challenge
          </Button>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'listening' || gameState === 'finished') && (
        <div className="space-y-4 text-center w-full">
          <div className="h-32 w-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center shadow-inner relative">
            {/* Beat Cue Indicator */}
            {showBeatCue && (
              <Circle className="w-24 h-24 text-teal-500 animate-ping absolute" style={{ animationDuration: '0.3s'}} />
            )}
             <Circle className={`w-20 h-20 transition-colors duration-100 ${showBeatCue ? 'text-teal-400' : 'text-gray-300'}`} />
            {/* User Tap Visual Feedback */}
            {showUserTapIndicator && (
                <div className="absolute w-20 h-20 rounded-full bg-cyan-300 opacity-50 animate-fade-out" style={{ animationDuration: '0.2s'}}></div>
            )}
          </div>

          <p className="text-xl font-semibold text-gray-700 min-h-[28px]">{feedback}</p>
          <p className="text-3xl font-bold text-teal-600">Score: {score}</p>

          {gameState === 'playing' && (
             <p className="text-sm text-gray-500">Current Beat: {currentBeatIndex + 1} / {selectedPattern.pattern.length}</p>
          )}

          {/* User Interaction Area */}
          {gameState === 'playing' && (
            <div className="py-4">
              <Button
                onClick={handleUserAction}
                className="p-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 hover:from-cyan-500 hover:to-teal-600 text-white shadow-xl transform hover:scale-105 transition-all"
              >
                <Hand size={40} />
              </Button>
              <p className="mt-2 text-sm text-gray-600">Tap on the beat!</p>
            </div>
          )}

          {(gameState === 'finished' || gameState === 'playing') && (
            <Button onClick={gameState === 'playing' ? stopGame : startGame} variant="outline" className="w-full">
              {gameState === 'playing' ? <PauseCircle className="mr-2" /> : <PlayCircle className="mr-2" />}
              {gameState === 'playing' ? 'Stop Game' : 'Play Again'}
            </Button>
          )}
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-out {
          from { opacity: 0.5; transform: scale(1); }
          to { opacity: 0; transform: scale(1.5); }
        }
        .animate-fade-out {
          animation-name: fade-out;
        }
      `}</style>
    </div>
  );
};

export default RhythmMaster;
