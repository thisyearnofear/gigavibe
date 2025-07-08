'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SmoothVocalChallenge from './SmoothVocalChallenge';
import SelfRating from './SelfRating';
import RealityReveal from './RealityReveal';

type FlowPhase = 'challenge' | 'selfRating' | 'judging' | 'reveal';

interface UserSubmission {
  challengeTitle: string;
  audioUrl: string;
  selfRating: number;
  confidence: string;
  communityRating?: number;
  totalJudges?: number;
}

export default function VocalRealityFlow() {
  const [phase, setPhase] = useState<FlowPhase>('challenge');
  const [userSubmission, setUserSubmission] = useState<UserSubmission | null>(null);

  // Mock community rating calculation
  const calculateCommunityRating = (selfRating: number): { rating: number; judges: number } => {
    // Simulate some variance from self-rating for demo purposes
    const variance = (Math.random() - 0.5) * 2; // -1 to +1
    const communityRating = Math.max(1, Math.min(5, selfRating + variance));
    const judges = Math.floor(Math.random() * 50) + 20; // 20-70 judges
    
    return { rating: Math.round(communityRating * 10) / 10, judges };
  };

  const handleChallengeComplete = (challengeTitle: string, audioUrl: string) => {
    setUserSubmission({
      challengeTitle,
      audioUrl,
      selfRating: 0,
      confidence: ''
    });
    setPhase('selfRating');
  };

  const handleSelfRating = (rating: number, confidence: string) => {
    if (userSubmission) {
      setUserSubmission({
        ...userSubmission,
        selfRating: rating,
        confidence
      });
      
      // Simulate community judging with mock data
      const { rating: communityRating, judges } = calculateCommunityRating(rating);
      
      setTimeout(() => {
        setUserSubmission(prev => prev ? {
          ...prev,
          communityRating,
          totalJudges: judges
        } : null);
        setPhase('reveal');
      }, 2000); // Simulate judging time
      
      setPhase('judging');
    }
  };

  const handleShare = () => {
    if (userSubmission) {
      const shareText = `I thought I was a ${userSubmission.selfRating}⭐ singer... The community said ${userSubmission.communityRating?.toFixed(1)}⭐ 😅 #VocalRealityCheck #GIGAVIBE`;
      
      if (navigator.share) {
        navigator.share({
          title: 'My Vocal Reality Check',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        alert('Copied to clipboard!');
      }
    }
  };

  const handleTryAgain = () => {
    setUserSubmission(null);
    setPhase('challenge');
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {phase === 'challenge' && (
          <SmoothVocalChallenge 
            key="challenge"
            onChallengeComplete={handleChallengeComplete}
          />
        )}
        
        {phase === 'selfRating' && userSubmission && (
          <SelfRating
            key="selfRating"
            challengeTitle={userSubmission.challengeTitle}
            onRatingSubmit={handleSelfRating}
          />
        )}
        
        {phase === 'judging' && (
          <div key="judging" className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-6">⏳</div>
              <h2 className="text-2xl font-bold mb-4">Community is judging...</h2>
              <p className="text-gray-300">This might take a moment</p>
              <div className="mt-8 flex justify-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        {phase === 'reveal' && userSubmission && userSubmission.communityRating && (
          <RealityReveal
            key="reveal"
            selfRating={userSubmission.selfRating}
            communityRating={userSubmission.communityRating}
            confidence={userSubmission.confidence}
            challengeTitle={userSubmission.challengeTitle}
            totalJudges={userSubmission.totalJudges || 0}
            onShare={handleShare}
            onTryAgain={handleTryAgain}
          />
        )}
      </AnimatePresence>
    </div>
  );
}