import React, { useState } from 'react'; // Removed useEffect, useCallback, useRef
import { Button } from '@/components/ui/button';
import { Hand, Circle, PauseCircle, PlayCircle, Music2, XCircle } from 'lucide-react';
// Removed Info, CheckCircle from here as they are used via toast in the hook
// toast can still be used here for UI-specific messages if needed, but game feedback toasts are in hook
import { useRhythmMasterGame } from '@/hooks/useRhythmMasterGame';

const RhythmMaster = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  // This UI state is for immediate visual feedback of the tap, separate from game logic feedback
  const [showUserTapIndicator, setShowUserTapIndicator] = useState(false);

  const {
    availablePatterns,
    selectedPattern,
    setSelectedPattern, // Exposed from hook to allow UI to set it
    gameState,
    score,
    feedback, // Game logic feedback from hook
    showBeatCue, // Controlled by hook
    currentBeatIndex, // From hook
    startGame: triggerHookStartGame,
    stopGame: triggerHookStopGame,
    handleUserTap: triggerHookUserTap,
  } = useRhythmMasterGame(); // Default patterns are used from the hook

  // UI specific tap handler that also triggers hook's tap handler
  const localHandleUserTap = () => {
    const gameFeedback = triggerHookUserTap(); // Hook now handles scoring and internal feedback

    // Show visual tap indicator regardless of gameFeedback, as it's a UI reaction to physical tap
    setShowUserTapIndicator(true);
    setTimeout(() => setShowUserTapIndicator(false), 200);

    // The main 'feedback' state is now updated by the hook based on scoring logic.
    // No need to setFeedback here unless it's for something purely UI-related not covered by hook's feedback.
  };

  const handlePatternSelection = (patternName: string) => {
    const pattern = availablePatterns.find(p => p.name === patternName);
    if (pattern) {
      setSelectedPattern(pattern); // Update the selected pattern in the hook's state
    }
  };

  const handleGameStart = () => {
    setShowInstructions(false);
    triggerHookStartGame(selectedPattern); // Start game in hook with currently selected pattern
  };

  if (showInstructions && gameState === 'idle') {
    return (
      <div className="p-8 bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 rounded-xl shadow-2xl text-center text-white">
        <Music2 size={56} className="mx-auto mb-4 text-sky-300" />
        <h2 className="text-4xl font-bold mb-6">
          Rhythm Master!
        </h2>
        <p className="mb-4 text-lg opacity-90">
          Test your rhythmic precision! Select a pattern.
        </p>
        <p className="mb-8 text-lg opacity-90">
          When the circle pulses, tap the button in time with the beat.
        </p>
        <Button
          onClick={handleInitialStart}
          className="bg-white text-teal-600 hover:bg-sky-100 font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Start with {selectedPattern.name}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl flex flex-col items-center space-y-5 w-full max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">
        Rhythm Master
      </h2>

      {gameState === 'idle' && ( // This block is for when instructions are dismissed but game not started
        <div className="w-full space-y-5 pt-4">
          <p className="text-center text-gray-600 text-lg">Select a pattern to begin:</p>
          <select
            value={selectedPattern.name}
            onChange={(e) => setSelectedPattern(RHYTHMIC_PATTERNS.find(p => p.name === e.target.value) || RHYTHMIC_PATTERNS[0])}
            className="w-full p-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700 text-md"
          >
            {RHYTHMIC_PATTERNS.map(p => <option key={p.name} value={p.name}>{p.name} ({p.tempo} BPM)</option>)}
          </select>
          <Button onClick={doStartGame} size="lg" className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-3 text-lg">
            <PlayCircle className="mr-2 h-6 w-6" /> Start Challenge
          </Button>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'listening' || gameState === 'finished') && (
        <div className="space-y-5 text-center w-full flex flex-col items-center">
          <div className="h-36 w-36 mx-auto bg-gray-100 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-200 relative overflow-hidden">
            {showBeatCue && (
              <div className="absolute inset-0 rounded-full bg-teal-400 animate-pulse-once"></div>
            )}
             <Circle className={`w-28 h-28 transition-colors duration-100 ${showBeatCue ? 'text-teal-500 scale-110' : 'text-gray-300'}`} />
            {showUserTapIndicator && (
                <div className="absolute inset-2 rounded-full bg-cyan-300 opacity-70 animate-ping-once-fast"></div>
            )}
          </div>

          <div className="h-10 flex items-center justify-center">
            <p className="text-md font-medium text-gray-600">{feedback}</p>
          </div>
          <p className={`text-5xl font-bold ${score > 0 ? 'text-teal-500' : 'text-gray-700'} transition-colors duration-300`}>Score: {score}</p>

          {gameState === 'playing' && (
             <p className="text-sm text-gray-500">Beat: {Math.min(currentBeatIndex + 1, selectedPattern.pattern.length)} / {selectedPattern.pattern.length}</p>
          )}

          {gameState === 'playing' && (
            <div className="py-3 text-center">
              <Button
                onClick={handleUserAction}
                className="p-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 hover:from-cyan-500 hover:to-teal-600 text-white shadow-xl transform active:scale-95 transition-all duration-150 h-28 w-28"
              >
                <Hand size={48} />
              </Button>
              <p className="mt-3 text-sm text-gray-600">Tap in time!</p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200 w-full flex justify-center">
            {(gameState === 'finished' || (gameState === 'idle' && !showInstructions)) && (
              <Button onClick={doStartGame} size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
                <PlayCircle className="mr-2 h-5 w-5" /> {gameState === 'finished' ? 'Play Again' : 'Start'}
              </Button>
            )}
            {gameState === 'playing' && (
              <Button onClick={() => doStopGame()} variant="destructive" size="lg" className="bg-red-500 hover:bg-red-600">
                <XCircle className="mr-2 h-5 w-5" /> Stop Game
              </Button>
            )}
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes pulse-once {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
        .animate-pulse-once {
          animation: pulse-once 0.3s ease-out forwards;
        }
        @keyframes ping-once-fast {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-once-fast {
          animation: ping-once-fast 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
export default RhythmMaster;
