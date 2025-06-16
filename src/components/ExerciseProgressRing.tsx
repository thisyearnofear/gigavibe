
import { CheckCircle } from 'lucide-react';

interface ExerciseProgressRingProps {
  progress: number;
  isComplete: boolean;
  isHolding: boolean;
  requiredTime: number;
  timeHeld: number;
}

const ExerciseProgressRing = ({ 
  progress, 
  isComplete, 
  isHolding, 
  requiredTime,
  timeHeld 
}: ExerciseProgressRingProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Background circle */}
      <svg className="w-32 h-32 transform -rotate-90 absolute" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="rgb(226, 232, 240)"
          strokeWidth="8"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={isComplete ? "rgb(34, 197, 94)" : isHolding ? "rgb(59, 130, 246)" : "rgb(226, 232, 240)"}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-150 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isComplete ? (
          <CheckCircle className="w-8 h-8 text-green-500" />
        ) : (
          <div className="text-center">
            <div className={`text-lg font-bold ${
              isHolding ? 'text-blue-600' : 'text-slate-400'
            }`}>
              {formatTime(timeHeld)}s
            </div>
            <div className="text-xs text-slate-500">
              / {formatTime(requiredTime)}s
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseProgressRing;
