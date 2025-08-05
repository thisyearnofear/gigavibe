
import React from 'react';
import { Button } from '@/components/ui/button';
import { Challenge } from '@/types/challenge.types';

interface ChallengeRatingProps {
  challenge: Challenge;
  recordingData: any;
  initialRating: any;
  onNext: (ratingData: any) => void;
}

export const ChallengeRating: React.FC<ChallengeRatingProps> = ({ challenge, recordingData, initialRating, onNext }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Rate Your Performance</h2>
      <p className="text-lg mb-8">How did you do?</p>
      {/* Mock rating system */}
      <div className="w-full h-12 bg-gray-800 rounded-lg mb-8"></div>
      <Button onClick={() => onNext({ selfRating: 5, confidence: 'confident' })}>Next</Button>
    </div>
  );
};
