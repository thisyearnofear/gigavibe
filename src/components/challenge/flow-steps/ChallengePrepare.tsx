
import React from 'react';
import { Button } from '@/components/ui/button';
import { Challenge } from '@/types/challenge.types';

interface ChallengePrepareProps {
  challenge: Challenge;
  onNext: () => void;
  onBack?: () => void;
}

export const ChallengePrepare: React.FC<ChallengePrepareProps> = ({ challenge, onNext, onBack }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Prepare to Sing</h2>
      <p className="text-lg mb-8">Get your voice ready!</p>
      <Button onClick={onNext}>I'm Ready</Button>
      {onBack && <Button onClick={onBack} variant="ghost">Back</Button>}
    </div>
  );
};
