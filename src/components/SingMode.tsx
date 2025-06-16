
import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Target } from 'lucide-react';
import { useTunerControls } from '@/hooks/useTunerControls';
import HorizontalPitchTrack from './HorizontalPitchTrack';
import TargetNoteDisplay from './TargetNoteDisplay';

interface TargetNote {
  note: string;
  octave: number;
  frequency: number;
  duration: number; // in seconds
}

const SingMode = () => {
  const {
    audioData,
    isListening,
    handleToggleListening,
  } = useTunerControls();

  const [currentExercise, setCurrentExercise] = useState<TargetNote[]>([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [exerciseStartTime, setExerciseStartTime] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [hitTargets, setHitTargets] = useState(0);

  // Simple C Major scale exercise
  const cMajorScale: TargetNote[] = [
    { note: 'C', octave: 4, frequency: 261.63, duration: 2 },
    { note: 'D', octave: 4, frequency: 293.66, duration: 2 },
    { note: 'E', octave: 4, frequency: 329.63, duration: 2 },
    { note: 'F', octave: 4, frequency: 349.23, duration: 2 },
    { note: 'G', octave: 4, frequency: 392.00, duration: 2 },
    { note: 'A', octave: 4, frequency: 440.00, duration: 2 },
    { note: 'B', octave: 4, frequency: 493.88, duration: 2 },
    { note: 'C', octave: 5, frequency: 523.25, duration: 2 },
  ];

  const startExercise = () => {
    setCurrentExercise(cMajorScale);
    setCurrentTargetIndex(0);
    setExerciseStartTime(Date.now());
    setScore(0);
    setHitTargets(0);
    if (!isListening) {
      handleToggleListening();
    }
  };

  const resetExercise = () => {
    setCurrentExercise([]);
    setCurrentTargetIndex(0);
    setExerciseStartTime(null);
    setScore(0);
    setHitTargets(0);
  };

  // Check if user is hitting the target note
  useEffect(() => {
    if (!exerciseStartTime || currentTargetIndex >= currentExercise.length) return;

    const currentTarget = currentExercise[currentTargetIndex];
    const { frequency, note, octave } = audioData;

    // Check if user is close to the target frequency (within 20 cents)
    const isHittingTarget = Math.abs(frequency - currentTarget.frequency) < 20;
    
    if (isHittingTarget && frequency > 0) {
      setScore(prev => prev + 1);
    }

    // Auto-advance to next note after duration
    const elapsed = (Date.now() - exerciseStartTime) / 1000;
    const targetTime = currentExercise.slice(0, currentTargetIndex + 1)
      .reduce((total, target) => total + target.duration, 0);

    if (elapsed >= targetTime) {
      if (isHittingTarget) {
        setHitTargets(prev => prev + 1);
      }
      setCurrentTargetIndex(prev => prev + 1);
    }
  }, [audioData, exerciseStartTime, currentTargetIndex, currentExercise]);

  const currentTarget = currentExercise[currentTargetIndex];
  const isExerciseActive = exerciseStartTime && currentTargetIndex < currentExercise.length;
  const exerciseComplete = currentTargetIndex >= currentExercise.length && currentExercise.length > 0;

  return (
    <div className="flex flex-col items-center space-y-6 py-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sing Mode</h2>
        <p className="text-slate-600">Follow the target notes and sing along</p>
      </div>

      {/* Current Target Display */}
      {currentTarget && (
        <TargetNoteDisplay
          targetNote={currentTarget}
          isActive={isExerciseActive}
          isHit={Math.abs(audioData.frequency - currentTarget.frequency) < 20}
        />
      )}

      {/* Horizontal Pitch Track */}
      <div className="w-full">
        <HorizontalPitchTrack
          currentFrequency={audioData.frequency}
          targetFrequency={currentTarget?.frequency || 440}
          isListening={isListening}
          volume={audioData.volume}
        />
      </div>

      {/* Exercise Progress */}
      {currentExercise.length > 0 && (
        <div className="w-full max-w-sm bg-white/70 rounded-xl p-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Progress</span>
            <span>{currentTargetIndex} / {currentExercise.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentTargetIndex / currentExercise.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Accuracy: {hitTargets} / {Math.max(1, currentTargetIndex)}</span>
            <span>Score: {score}</span>
          </div>
        </div>
      )}

      {/* Exercise Complete */}
      {exerciseComplete && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-green-600 text-lg font-bold mb-2">Exercise Complete!</div>
          <div className="text-green-700">
            You hit {hitTargets} out of {currentExercise.length} target notes
          </div>
          <div className="text-sm text-green-600 mt-1">
            Final Score: {score}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isExerciseActive && !exerciseComplete && (
          <button
            onClick={startExercise}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Play className="w-5 h-5" />
            Start C Major Scale
          </button>
        )}

        {isExerciseActive && (
          <button
            onClick={handleToggleListening}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isListening ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isListening ? 'Pause' : 'Resume'}
          </button>
        )}

        {(isExerciseActive || exerciseComplete) && (
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
      {!isExerciseActive && !exerciseComplete && (
        <div className="w-full max-w-sm bg-white/50 rounded-xl p-4">
          <h3 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Available Exercises
          </h3>
          <div className="space-y-2">
            <div className="bg-white/70 rounded-lg p-3 border border-slate-200">
              <div className="font-medium text-slate-800">C Major Scale</div>
              <div className="text-sm text-slate-600">8 notes • Basic difficulty</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingMode;
