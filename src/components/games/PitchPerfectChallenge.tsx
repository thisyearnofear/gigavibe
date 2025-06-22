import React, { useState } from 'react'; // Removed useEffect, useCallback, useRef
import useAudioInput from '@/hooks/useAudioInput';
import { useEnhancedAudioAnalysis } from '@/hooks/useEnhancedAudioAnalysis';
import { useProgressData } from '@/hooks/useProgressData';
import { usePitchPerfectGame } from '@/hooks/usePitchPerfectGame'; // Import the new game hook
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Volume2, Mic, AlertTriangle, Info, CheckCircle, XCircle, Music } from 'lucide-react';

// TARGET_NOTES and noteToFrequency are now primarily managed or utilized within usePitchPerfectGame or a shared utility.
// The component itself doesn't need to redefine or directly use them if the hook provides all necessary derived states.

const PitchPerfectChallenge = () => {
  const {
    audioData,
    isListening,
    startListening: hookStartListening,
    stopListening: hookStopListening,
    hasPermission,
    error: audioError
  } = useAudioInput();

  const enhancedAudio = useEnhancedAudioAnalysis({ audioData, isListening, volumeThreshold: 2, stabilityWindow: 200 });
  const { savePitchPerfectScore } = useProgressData();

  const [showInstructions, setShowInstructions] = useState(true);

  const {
    gameState,
    score,
    feedback,
    currentTargetNote,
    targetFrequency,
    startGame: triggerGameStart,
    stopGame: triggerGameStop,
    isSavingScore,
  } = usePitchPerfectGame({
    enhancedAudio,
    isListening,
    startListening: hookStartListening,
    stopListening: hookStopListening,
    saveScoreFn: savePitchPerfectScore,
  });

  const handleStartGameFlow = async () => {
    if (!hasPermission && hasPermission !== null) { // If permission state is known and denied
        toast({ title: "Microphone Required", description: "Please enable microphone permission in your browser settings to play.", variant: "warning", duration: 5000, icon: <AlertTriangle /> });
        return;
    }

    try {
      // Always try to start listening; this handles initial permission prompt if hasPermission is null
      await hookStartListening();

      // Check audioError *after* attempting to start listening.
      // useAudioInput sets this error if navigator.mediaDevices.getUserMedia fails.
      if (audioError) {
          toast({ title: "Audio Error", description: `Could not start microphone: ${audioError}. Please check permissions and connection.`, variant: "destructive", duration: 5000, icon: <XCircle /> });
          // hookStopListening(); // Optional: ensure it's stopped if it somehow partially started with an error.
          return;
      }
      // If startListening was successful (no error thrown and audioError is not set by the hook)
      setShowInstructions(false);
      triggerGameStart();
    } catch (err) {
      // This catch block is for unexpected errors from hookStartListening promise itself, though typically errors are set in `audioError` state.
      toast({ title: "Setup Error", description: "Could not initialize audio for the game.", variant: "destructive", duration: 5000, icon: <XCircle /> });
      console.error("Error in game flow setup:", err);
    }
  };


   if (hasPermission === null && gameState === 'idle') {
     return (
      <div className="p-6 bg-white rounded-xl shadow-lg text-center flex flex-col items-center space-y-4">
        <Mic size={48} className="text-indigo-500" />
        <p className="text-xl font-semibold text-gray-700">Microphone Access</p>
        <p className="text-gray-600">We need your permission to use the microphone for this game.</p>
        <Button onClick={doStartGame} disabled={isSavingScore} className="bg-indigo-500 hover:bg-indigo-600">
          Allow Microphone
        </Button>
         {audioError && <p className="text-red-500 mt-2 text-sm"><AlertTriangle className="inline mr-1 h-4 w-4" />{audioError}</p>}
      </div>
     );
   }

   if (showInstructions && gameState === 'idle') {
     return (
      <div className="p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl text-center text-white">
        <Music size={56} className="mx-auto mb-4 text-pink-300" />
        <h2 className="text-4xl font-bold mb-6">
          Pitch Perfect Challenge!
        </h2>
        <p className="mb-4 text-lg opacity-90">
          Test your vocal accuracy! When the game starts, you'll see a target note.
        </p>
        <p className="mb-8 text-lg opacity-90">
          Sing the note as steadily and accurately as you can. Let's see how high you can score!
        </p>
        <Button
          onClick={doStartGame}
          disabled={isSavingScore}
          className="bg-white text-purple-600 hover:bg-pink-100 font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Start Challenge
        </Button>
        {audioError && <p className="text-pink-200 mt-4 text-sm"><AlertTriangle className="inline mr-1 h-4 w-4" />{audioError}</p>}
      </div>
     );
   }

   return (
    <div className="p-6 bg-white rounded-xl shadow-2xl flex flex-col items-center space-y-5 w-full max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
        Pitch Perfect Challenge
      </h2>

      {gameState === 'playing' && currentTargetNote && (
        <div className="my-3 p-6 border-4 border-dashed border-indigo-300 rounded-xl bg-indigo-50 w-full text-center shadow-inner">
          <p className="text-sm text-indigo-500 font-semibold tracking-wider">TARGET NOTE</p>
          <p className="text-6xl font-bold text-indigo-600 my-1 tracking-tight">{currentTargetNote.name}</p>
          <p className="text-sm text-gray-500">(Target: {targetFrequency.toFixed(0)} Hz)</p>
        </div>
      )}

      {isListening && gameState === 'playing' && (
        <div className="my-2 p-5 border-2 border-purple-300 rounded-xl bg-purple-50 w-full text-center shadow-inner">
          <p className="text-sm text-purple-500 font-semibold tracking-wider">YOUR PITCH</p>
          <p className="text-5xl font-bold text-purple-600 my-1">
            {enhancedAudio.isStable && enhancedAudio.volume > 5 ? `${enhancedAudio.note}${enhancedAudio.octave}` : '--'}
          </p>
          <p className="text-sm text-gray-500">
            ({enhancedAudio.isStable && enhancedAudio.volume > 5 ? enhancedAudio.smoothedFrequency.toFixed(0) : '0'} Hz)
          </p>
          <div className="w-full bg-purple-200 rounded-full h-3 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-400 to-purple-500 h-3 rounded-full transition-all duration-150 ease-in-out"
              style={{ width: `${Math.min(enhancedAudio.volume, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-center text-xs text-purple-500 mt-1">
            <Volume2 size={14} className="mr-1" /> Volume
          </div>
        </div>
      )}

      <div className="h-10 flex items-center justify-center">
        <p className="text-md font-medium text-gray-600 text-center px-2">{feedback}</p>
      </div>
      <p className={`text-5xl font-bold ${score > 0 ? 'text-green-500' : 'text-gray-700'} transition-colors duration-300`}>Score: {score}</p>

      <div className="flex space-x-4 mt-3 pt-2 border-t border-gray-200 w-full justify-center">
        {gameState === 'idle' && !showInstructions && (
          <Button onClick={doStartGame} disabled={isSavingScore} size="lg" className="bg-indigo-500 hover:bg-indigo-600">
            <Info className="mr-2 h-5 w-5" /> Start Game
          </Button>
        )}
        {gameState === 'playing' && (
          <Button onClick={() => doStopGame(false)} variant="destructive" size="lg" disabled={isSavingScore} className="bg-red-500 hover:bg-red-600">
             <XCircle className="mr-2 h-5 w-5" /> Stop Game
          </Button>
        )}
        {gameState === 'finished' && (
          <Button onClick={doStartGame} disabled={isSavingScore} size="lg" className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="mr-2 h-5 w-5" /> Play Again?
          </Button>
        )}
      </div>
       {audioError && !showInstructions && <p className="text-red-500 mt-2 text-sm"><AlertTriangle className="inline mr-1 h-4 w-4" />{audioError}</p>}
       {isSavingScore && <p className="text-blue-500 mt-2 text-sm animate-pulse">Saving score...</p>}
    </div>
  );
};

export default PitchPerfectChallenge;
