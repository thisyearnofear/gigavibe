
import React from 'react';
import { Button } from '@/components/ui/button';
import { Challenge } from '@/types/challenge.types';

interface ChallengePlaybackProps {
  challenge: Challenge;
  recordingData: { audioUrl?: string };
  onNext: () => void;
  onRetake: () => void;
}

export const ChallengePlayback: React.FC<ChallengePlaybackProps> = ({ challenge, recordingData, onNext, onRetake }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Playback</h2>
      <p className="text-lg mb-8">Listen to your performance.</p>
      {/* Mock audio player */}
      <div className="w-full h-12 bg-gray-800 rounded-lg mb-8"></div>
      <Button onClick={onNext}>Next</Button>
      <Button onClick={onRetake} variant="ghost">Retake</Button>
    </div>
  );
};
