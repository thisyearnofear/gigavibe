
import React from 'react';
import { Button } from '@/components/ui/button';
import { Challenge } from '@/types/challenge.types';

interface ChallengePreviewProps {
  challenge: Challenge;
  onNext: () => void;
  onCancel?: () => void;
}

export const ChallengePreview: React.FC<ChallengePreviewProps> = ({ challenge, onNext, onCancel }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">{challenge.title}</h2>
      <p className="text-lg mb-8">{challenge.artist}</p>
      <Button onClick={onNext}>Start Challenge</Button>
      {onCancel && <Button onClick={onCancel} variant="ghost">Cancel</Button>}
    </div>
  );
};
