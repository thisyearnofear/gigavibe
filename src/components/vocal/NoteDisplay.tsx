'use client';

interface NoteDisplayProps {
  note: string;
  octave: number;
  isInTune: boolean;
  isListening: boolean;
  size?: 'small' | 'normal' | 'large';
}

export function NoteDisplay({ 
  note, 
  octave, 
  isInTune, 
  isListening, 
  size = 'normal' 
}: NoteDisplayProps) {
  const sizeClasses = {
    small: 'text-3xl',
    normal: 'text-6xl',
    large: 'text-8xl',
  };

  const containerClasses = {
    small: 'w-20 h-20',
    normal: 'w-32 h-32',
    large: 'w-40 h-40',
  };

  if (!isListening) {
    return (
      <div className={`${containerClasses[size]} mx-auto flex items-center justify-center bg-gray-100 rounded-full border-4 border-gray-200`}>
        <div className="text-center">
          <div className={`${sizeClasses[size]} font-bold text-gray-400`}>--</div>
          {size !== 'small' && <div className="text-sm text-gray-400 mt-1">No signal</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerClasses[size]} mx-auto flex items-center justify-center rounded-full border-4 transition-all duration-300 ${
      isInTune 
        ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-lg shadow-green-200' 
        : 'bg-gradient-to-br from-orange-400 to-red-500 border-orange-300 shadow-lg shadow-orange-200'
    }`}>
      <div className="text-center text-white">
        <div className={`${sizeClasses[size]} font-bold drop-shadow-sm`}>
          {note}
        </div>
        {size !== 'small' && (
          <div className="text-lg font-medium drop-shadow-sm">
            {octave}
          </div>
        )}
      </div>
    </div>
  );
}
