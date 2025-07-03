
import { Target, CheckCircle } from 'lucide-react';

interface TargetNote {
  note: string;
  octave: number;
  frequency: number;
  duration: number;
}

interface TargetNoteDisplayProps {
  targetNote: TargetNote;
  isActive: boolean;
  isHit: boolean;
}

const TargetNoteDisplay = ({ targetNote, isActive, isHit }: TargetNoteDisplayProps) => {
  return (
    <div className={`bg-white/80 rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
      isActive 
        ? isHit 
          ? 'border-green-400 bg-green-50/50' 
          : 'border-indigo-400 animate-pulse' 
        : 'border-slate-200'
    }`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          {isHit ? (
            <CheckCircle className="w-8 h-8 text-green-500" />
          ) : (
            <Target className={`w-8 h-8 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
          )}
        </div>
        
        <div className={`text-4xl font-bold mb-2 transition-colors ${
          isActive 
            ? isHit 
              ? 'text-green-600' 
              : 'text-indigo-600' 
            : 'text-slate-400'
        }`}>
          {targetNote.note}{targetNote.octave}
        </div>
        
        <div className="text-sm text-slate-600 mb-2">
          Target: {targetNote.frequency.toFixed(1)} Hz
        </div>
        
        <div className={`text-xs px-3 py-1 rounded-full ${
          isActive
            ? isHit
              ? 'bg-green-100 text-green-700'
              : 'bg-indigo-100 text-indigo-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {isActive 
            ? isHit 
              ? 'Perfect!' 
              : 'Sing this note' 
            : 'Ready'
          }
        </div>
      </div>
    </div>
  );
};

export default TargetNoteDisplay;
