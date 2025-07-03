
import { useState, useEffect } from 'react';

interface PitchMascotProps {
  isInTune: boolean;
  isListening: boolean;
  volume: number;
}

const PitchMascot = ({ isInTune, isListening, volume }: PitchMascotProps) => {
  const [expression, setExpression] = useState('neutral');

  useEffect(() => {
    if (!isListening || volume < 2) {
      setExpression('waiting');
    } else if (isInTune) {
      setExpression('happy');
    } else if (volume > 10) {
      setExpression('listening');
    } else {
      setExpression('neutral');
    }
  }, [isInTune, isListening, volume]);

  const getEyes = () => {
    switch (expression) {
      case 'happy': return '✨ ✨';
      case 'listening': return '👀';
      case 'waiting': return '• •';
      default: return '• •';
    }
  };

  const getMouth = () => {
    switch (expression) {
      case 'happy': return '😊';
      case 'listening': return '🎵';
      case 'waiting': return '◡';
      default: return '◡';
    }
  };

  const getMessage = () => {
    if (!isListening) return "Tap to start singing!";
    if (volume < 2) return "I can't hear you yet...";
    if (isInTune) return "Perfect! Keep it up! 🎉";
    return "You're doing great!";
  };

  return (
    <div className="text-center py-2">
      <div className={`text-4xl transition-all duration-500 ${
        expression === 'happy' ? 'animate-bounce' : ''
      }`}>
        <div className="mb-1">{getEyes()}</div>
        <div>{getMouth()}</div>
      </div>
      <p className={`text-sm font-medium mt-2 transition-colors duration-300 ${
        isInTune ? 'text-green-600' : 'text-slate-600'
      }`}>
        {getMessage()}
      </p>
    </div>
  );
};

export default PitchMascot;
