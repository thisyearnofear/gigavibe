import React, { useEffect, useState } from 'react';
import { Challenge } from '@/types/challenge.types';

interface ChallengeCountdownProps {
  challenge: Challenge;
  onNext: () => void;
}

export const ChallengeCountdown: React.FC<ChallengeCountdownProps> = ({ challenge, onNext }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onNext();
    }
  }, [countdown, onNext]);

  return (
    <div className="text-center">
      <h2 className="text-6xl font-bold">{countdown}</h2>
    </div>
  );
};