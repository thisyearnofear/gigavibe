
import { useMemo } from 'react';

interface CircularPitchWheelProps {
  note: string;
  octave: number;
  cents: number;
  frequency: number;
  isListening: boolean;
  isInTune: boolean;
}

const CircularPitchWheel = ({ 
  note, 
  octave, 
  cents, 
  frequency, 
  isListening, 
  isInTune 
}: CircularPitchWheelProps) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const currentNoteIndex = useMemo(() => {
    return noteNames.indexOf(note);
  }, [note]);

  const getNeedleRotation = () => {
    if (!isListening || frequency === 0) return 0;
    // Convert cents to rotation angle (-50 to +50 cents = -45 to +45 degrees)
    return Math.max(-45, Math.min(45, cents * 0.9));
  };

  const getAccuracyZoneColor = () => {
    if (!isListening || frequency === 0) return 'stroke-slate-300';
    if (Math.abs(cents) < 10) return 'stroke-green-400';
    if (Math.abs(cents) < 25) return 'stroke-yellow-400';
    return 'stroke-red-400';
  };

  return (
    <div className="relative">
      {/* Outer Ring with Note Names */}
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="rgb(226, 232, 240)"
            strokeWidth="2"
          />
          
          {/* Accuracy Zone Indicator */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            className={`${getAccuracyZoneColor()} transition-all duration-300`}
            strokeWidth="6"
            strokeDasharray="10 10"
            opacity="0.7"
          />

          {/* Note Markers */}
          {noteNames.map((noteName, index) => {
            const angle = (index * 30) - 90; // 30 degrees apart, starting from top
            const radian = (angle * Math.PI) / 180;
            const x = 100 + 75 * Math.cos(radian);
            const y = 100 + 75 * Math.sin(radian);
            
            const isActive = index === currentNoteIndex && isListening;
            
            return (
              <g key={noteName}>
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  className={`transition-all duration-300 ${
                    isActive 
                      ? 'fill-indigo-500' 
                      : 'fill-slate-200'
                  }`}
                />
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  className={`text-xs font-bold transform rotate-90 ${
                    isActive ? 'fill-white' : 'fill-slate-600'
                  }`}
                  style={{
                    transformOrigin: `${x}px ${y}px`
                  }}
                >
                  {noteName}
                </text>
              </g>
            );
          })}

          {/* Pitch Needle */}
          <g className="transition-all duration-200 ease-out" style={{
            transformOrigin: '100px 100px',
            transform: `rotate(${currentNoteIndex * 30 + getNeedleRotation()}deg)`
          }}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke={isInTune ? 'rgb(34, 197, 94)' : 'rgb(99, 102, 241)'}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="30"
              r="4"
              fill={isInTune ? 'rgb(34, 197, 94)' : 'rgb(99, 102, 241)'}
            />
          </g>

          {/* Center Hub */}
          <circle
            cx="100"
            cy="100"
            r="12"
            fill="rgb(99, 102, 241)"
            className="drop-shadow-sm"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-3xl font-bold transition-colors duration-300 ${
            !isListening || frequency === 0 
              ? 'text-slate-400' 
              : isInTune 
                ? 'text-green-600' 
                : 'text-indigo-600'
          }`}>
            {frequency > 0 ? `${note}${octave}` : '--'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {frequency > 0 ? `${frequency.toFixed(1)} Hz` : 'Ready'}
          </div>
        </div>
      </div>

      {/* Cents Display */}
      <div className="mt-4 text-center">
        <div className={`text-lg font-bold transition-colors duration-300 ${
          !isListening || frequency === 0 
            ? 'text-slate-400' 
            : Math.abs(cents) < 10 
              ? 'text-green-600' 
              : Math.abs(cents) < 25 
                ? 'text-yellow-600' 
                : 'text-red-500'
        }`}>
          {frequency > 0 ? `${cents > 0 ? '+' : ''}${cents} cents` : '0 cents'}
        </div>
      </div>
    </div>
  );
};

export default CircularPitchWheel;
