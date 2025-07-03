
import { useState, useEffect } from 'react';

interface ExerciseCountdownProps {
  isActive: boolean;
  onComplete: () => void;
  duration?: number;
}

const ExerciseCountdown = ({ isActive, onComplete, duration = 3 }: ExerciseCountdownProps) => {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    if (!isActive) {
      setCount(duration);
      return;
    }

    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [isActive, count, duration, onComplete]);

  if (!isActive || count === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-12 text-center shadow-2xl">
        <div className="text-6xl font-bold text-indigo-600 mb-4 animate-pulse">
          {count}
        </div>
        <div className="text-lg text-slate-600">
          Get ready to sing...
        </div>
      </div>
    </div>
  );
};

export default ExerciseCountdown;
