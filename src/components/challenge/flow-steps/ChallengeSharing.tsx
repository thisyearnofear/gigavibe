
import React from 'react';
import { Button } from '@/components/ui/button';
import { Challenge } from '@/types/challenge.types';

interface ChallengeSharingProps {
  challenge: Challenge;
  recordingData: any;
  ratingData: any;
  onNext: (sharingData: { shareToSocial: boolean }) => void;
}

export const ChallengeSharing: React.FC<ChallengeSharingProps> = ({ challenge, recordingData, ratingData, onNext }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Share Your Performance</h2>
      <p className="text-lg mb-8">Share your talent with the world!</p>
      <Button onClick={() => onNext({ shareToSocial: true })}>Share to Farcaster</Button>
      <Button onClick={() => onNext({ shareToSocial: false })} variant="ghost">Skip</Button>
    </div>
  );
};
