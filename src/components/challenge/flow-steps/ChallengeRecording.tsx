
import React from 'react';
import { Button } from '@/components/ui/button';
import { Challenge } from '@/types/challenge.types';

interface ChallengeRecordingProps {
  challenge: Challenge;
  onNext: (recordingData: { audioBlob?: Blob; mixedAudioBlob?: Blob; audioUrl?: string; duration: number; }) => void;
}

export const ChallengeRecording: React.FC<ChallengeRecordingProps> = ({ challenge, onNext }) => {
  // Mock recording for now
  const handleStopRecording = () => {
    onNext({ duration: 30 });
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Recording...</h2>
      <p className="text-lg mb-8">Sing your heart out!</p>
      <Button onClick={handleStopRecording}>Stop Recording</Button>
    </div>
  );
};
