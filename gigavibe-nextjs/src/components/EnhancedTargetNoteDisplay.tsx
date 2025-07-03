
import { Target, CheckCircle, Clock } from 'lucide-react';
import ExerciseProgressRing from './ExerciseProgressRing';

interface TargetNote {
  note: string;
  octave: number;
  frequency: number;
  duration: number;
}

interface EnhancedTargetNoteDisplayProps {
  targetNote: TargetNote;
  isActive: boolean;
  holdState: {
    isHolding: boolean;
    holdProgress: number;
    isComplete: boolean;
    timeHeld: number;
  };
  confidence: number;
  requiredHoldTime: number;
}

const EnhancedTargetNoteDisplay = ({ 
  targetNote, 
  isActive, 
  holdState,
  confidence,
  requiredHoldTime
}: EnhancedTargetNoteDisplayProps) => {
  const getStatusText = () => {
    if (!isActive) return 'Ready';
    if (holdState.isComplete) return 'Perfect!';
    if (holdState.isHolding) return 'Hold it...';
    if (confidence > 0.3) return 'Getting close...';
    return 'Find the note';
  };

  const getStatusColor = () => {
    if (!isActive) return 'text-slate-500';
    if (holdState.isComplete) return 'text-green-600';
    if (holdState.isHolding) return 'text-blue-600';
    if (confidence > 0.3) return 'text-yellow-600';
    return 'text-slate-500';
  };

  const getBorderColor = () => {
    if (!isActive) return 'border-slate-200';
    if (holdState.isComplete) return 'border-green-400';
    if (holdState.isHolding) return 'border-blue-400';
    if (confidence > 0.3) return 'border-yellow-400';
    return 'border-slate-300';
  };

  const getBackgroundColor = () => {
    if (!isActive) return 'bg-white/80';
    if (holdState.isComplete) return 'bg-green-50/80';
    if (holdState.isHolding) return 'bg-blue-50/80';
    return 'bg-white/80';
  };

  return (
    <div className={`${getBackgroundColor()} rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 ${getBorderColor()}`}>
      <div className="flex flex-col items-center space-y-6">
        {/* Target Note */}
        <div className="text-center">
          <div className={`text-5xl font-bold mb-2 transition-colors ${
            isActive 
              ? holdState.isComplete 
                ? 'text-green-600' 
                : holdState.isHolding
                ? 'text-blue-600'
                : 'text-indigo-600'
              : 'text-slate-400'
          }`}>
            {targetNote.note}{targetNote.octave}
          </div>
          
          <div className="text-sm text-slate-600 mb-1">
            Target: {targetNote.frequency.toFixed(1)} Hz
          </div>
        </div>

        {/* Progress Ring */}
        {isActive && (
          <ExerciseProgressRing
            progress={holdState.holdProgress}
            isComplete={holdState.isComplete}
            isHolding={holdState.isHolding}
            requiredTime={requiredHoldTime}
            timeHeld={holdState.timeHeld}
          />
        )}

        {/* Status */}
        <div className={`text-sm px-4 py-2 rounded-full font-medium ${
          holdState.isComplete 
            ? 'bg-green-100 text-green-700'
            : holdState.isHolding
            ? 'bg-blue-100 text-blue-700' 
            : confidence > 0.3
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {getStatusText()}
        </div>

        {/* Confidence indicator */}
        {isActive && !holdState.isComplete && (
          <div className="w-full max-w-48">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Pitch confidence</span>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTargetNoteDisplay;
