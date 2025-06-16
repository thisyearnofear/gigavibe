
import { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Target, Pause } from 'lucide-react';
import { useTunerControls } from '@/hooks/useTunerControls';
import { useEnhancedAudioAnalysis } from '@/hooks/useEnhancedAudioAnalysis';
import { useNoteHoldTracker } from '@/hooks/useNoteHoldTracker';
import EnhancedTargetNoteDisplay from './EnhancedTargetNoteDisplay';
import ExerciseCountdown from './ExerciseCountdown';
import HorizontalPitchTrack from './HorizontalPitchTrack';

interface TargetNote {
  note: string;
  octave: number;
  frequency: number;
  duration: number;
}

enum ExerciseState {
  READY = 'ready',
  COUNTDOWN = 'countdown', 
  SINGING = 'singing',
  COMPLETE = 'complete',
  PAUSED = 'paused'
}

const SingMode = () => {
  const {
    audioData,
    isListening,
    handleToggleListening,
    startRecording,
    stopRecording,
    isRecording
  } = useTunerControls();

  const [exerciseState, setExerciseState] = useState<ExerciseState>(ExerciseState.READY);
  const [currentExercise, setCurrentExercise] = useState<TargetNote[]>([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [completedNotes, setCompletedNotes] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  const requiredHoldTime = 3000; // 3 seconds
  const breathPause = 2000; // 2 seconds between notes

  // Enhanced audio analysis
  const enhancedAudio = useEnhancedAudioAnalysis({
    audioData,
    isListening: exerciseState === ExerciseState.SINGING,
    volumeThreshold: 8,
    stabilityWindow: 400
  });

  // Note hold tracking
  const currentTarget = currentExercise[currentTargetIndex];
  const holdState = useNoteHoldTracker({
    targetFrequency: currentTarget?.frequency || 0,
    currentFrequency: enhancedAudio.smoothedFrequency,
    isStable: enhancedAudio.isStable,
    confidence: enhancedAudio.confidence,
    requiredHoldTime,
    tolerance: 25
  });

  // C Major scale exercise
  const cMajorScale: TargetNote[] = [
    { note: 'C', octave: 4, frequency: 261.63, duration: requiredHoldTime },
    { note: 'D', octave: 4, frequency: 293.66, duration: requiredHoldTime },
    { note: 'E', octave: 4, frequency: 329.63, duration: requiredHoldTime },
    { note: 'F', octave: 4, frequency: 349.23, duration: requiredHoldTime },
    { note: 'G', octave: 4, frequency: 392.00, duration: requiredHoldTime },
    { note: 'A', octave: 4, frequency: 440.00, duration: requiredHoldTime },
    { note: 'B', octave: 4, frequency: 493.88, duration: requiredHoldTime },
    { note: 'C', octave: 5, frequency: 523.25, duration: requiredHoldTime },
  ];

  const startExercise = useCallback(() => {
    setCurrentExercise(cMajorScale);
    setCurrentTargetIndex(0);
    setCompletedNotes([]);
    setScore(0);
    setExerciseState(ExerciseState.COUNTDOWN);
    holdState.reset();
  }, [holdState]);

  const resetExercise = useCallback(() => {
    setExerciseState(ExerciseState.READY);
    setCurrentExercise([]);
    setCurrentTargetIndex(0);
    setCompletedNotes([]);
    setScore(0);
    holdState.reset();
    if (isListening) {
      handleToggleListening();
    }
    if (isRecording) {
      stopRecording();
    }
  }, [holdState, isListening, handleToggleListening, isRecording, stopRecording]);

  const pauseExercise = useCallback(() => {
    setExerciseState(ExerciseState.PAUSED);
    if (isListening) {
      handleToggleListening();
    }
  }, [isListening, handleToggleListening]);

  const resumeExercise = useCallback(() => {
    setExerciseState(ExerciseState.COUNTDOWN);
    holdState.reset();
  }, [holdState]);

  // Handle countdown completion
  const handleCountdownComplete = useCallback(() => {
    setExerciseState(ExerciseState.SINGING);
    if (!isListening) {
      handleToggleListening();
    }
    // Start recording for this note
    startRecording();
  }, [isListening, handleToggleListening, startRecording]);

  // Handle note completion
  useEffect(() => {
    if (exerciseState === ExerciseState.SINGING && holdState.isComplete && currentTarget) {
      const newCompletedNotes = [...completedNotes, currentTargetIndex];
      setCompletedNotes(newCompletedNotes);
      setScore(prev => prev + 100);
      
      // Stop recording for this note
      if (isRecording) {
        stopRecording();
      }

      // Check if exercise is complete
      if (currentTargetIndex >= currentExercise.length - 1) {
        setExerciseState(ExerciseState.COMPLETE);
        if (isListening) {
          handleToggleListening();
        }
      } else {
        // Move to next note after breath pause
        setTimeout(() => {
          setCurrentTargetIndex(prev => prev + 1);
          holdState.reset();
          setExerciseState(ExerciseState.COUNTDOWN);
        }, breathPause);
      }
    }
  }, [exerciseState, holdState.isComplete, currentTargetIndex, currentExercise.length, completedNotes, currentTarget, isRecording, stopRecording, isListening, handleToggleListening, holdState]);

  const getExerciseProgress = () => {
    if (currentExercise.length === 0) return 0;
    return (completedNotes.length / currentExercise.length) * 100;
  };

  const canShowPitchTrack = exerciseState === ExerciseState.SINGING && currentTarget;

  return (
    <div className="flex flex-col items-center space-y-6 py-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Enhanced Sing Mode</h2>
        <p className="text-slate-600">Hold each note steady for 3 seconds</p>
      </div>

      {/* Countdown Overlay */}
      <ExerciseCountdown
        isActive={exerciseState === ExerciseState.COUNTDOWN}
        onComplete={handleCountdownComplete}
        duration={3}
      />

      {/* Target Note Display */}
      {currentTarget && (
        <EnhancedTargetNoteDisplay
          targetNote={currentTarget}
          isActive={exerciseState === ExerciseState.SINGING}
          holdState={holdState}
          confidence={enhancedAudio.confidence}
          requiredHoldTime={requiredHoldTime}
        />
      )}

      {/* Pitch Track - Only show during singing */}
      {canShowPitchTrack && (
        <div className="w-full">
          <HorizontalPitchTrack
            currentFrequency={enhancedAudio.smoothedFrequency}
            targetFrequency={currentTarget.frequency}
            isListening={true}
            volume={enhancedAudio.volume}
          />
        </div>
      )}

      {/* Exercise Progress */}
      {currentExercise.length > 0 && (
        <div className="w-full max-w-sm bg-white/70 rounded-xl p-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Progress</span>
            <span>{completedNotes.length} / {currentExercise.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getExerciseProgress()}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Score: {score}</span>
            <span>Hold time: {requiredHoldTime / 1000}s</span>
          </div>
        </div>
      )}

      {/* Exercise Complete */}
      {exerciseState === ExerciseState.COMPLETE && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center w-full max-w-sm">
          <div className="text-green-600 text-xl font-bold mb-2">🎉 Exercise Complete!</div>
          <div className="text-green-700 mb-3">
            You successfully held {completedNotes.length} out of {currentExercise.length} notes
          </div>
          <div className="text-sm text-green-600">
            Final Score: {score} points
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {exerciseState === ExerciseState.READY && (
          <button
            onClick={startExercise}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Play className="w-5 h-5" />
            Start C Major Scale
          </button>
        )}

        {exerciseState === ExerciseState.SINGING && (
          <button
            onClick={pauseExercise}
            className="flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-yellow-600 transition-colors"
          >
            <Pause className="w-5 h-5" />
            Pause Exercise
          </button>
        )}

        {exerciseState === ExerciseState.PAUSED && (
          <button
            onClick={resumeExercise}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            <Play className="w-5 h-5" />
            Resume Exercise
          </button>
        )}

        {(exerciseState !== ExerciseState.READY) && (
          <button
            onClick={resetExercise}
            className="flex items-center gap-2 bg-slate-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Exercise Library Preview */}
      {exerciseState === ExerciseState.READY && (
        <div className="w-full max-w-sm bg-white/50 rounded-xl p-4">
          <h3 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Available Exercises
          </h3>
          <div className="space-y-2">
            <div className="bg-white/70 rounded-lg p-3 border border-slate-200">
              <div className="font-medium text-slate-800">C Major Scale</div>
              <div className="text-sm text-slate-600">8 notes • Hold for 3s each</div>
              <div className="text-xs text-slate-500 mt-1">
                Enhanced with noise filtering and stability tracking
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Status for Debugging */}
      {exerciseState === ExerciseState.SINGING && (
        <div className="bg-white/50 rounded-xl p-3 text-center text-xs text-slate-500">
          <div>State: {exerciseState} | Vol: {Math.round(enhancedAudio.volume)} | 
          Conf: {Math.round(enhancedAudio.confidence * 100)}% | 
          Stable: {enhancedAudio.isStable ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default SingMode;
