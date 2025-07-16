'use client';

import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Star, ArrowUp, Volume2 } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOnboarding } from '@/contexts/OnboardingContext';

const DEMO_PERFORMANCES = [
  {
    id: 1,
    challenge: 'Happy Birthday',
    selfRating: 4,
    duration: '0:08',
    isDemo: true
  },
  {
    id: 2,
    challenge: 'Twinkle Twinkle',
    selfRating: 5,
    duration: '0:12',
    isDemo: true
  }
];

export default function FirstVoteStep() {
  const [currentPerformance, setCurrentPerformance] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const [lastVote, setLastVote] = useState<'good' | 'amazing' | 'needs-work' | null>(null);
  const { markStepCompleted } = useOnboarding();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleVote = (vote: 'good' | 'amazing' | 'needs-work') => {
    setLastVote(vote);
    setVotedCount(prev => prev + 1);
    
    if (votedCount + 1 >= 2) {
      markStepCompleted('first-vote');
    }
    
    // Move to next performance
    setTimeout(() => {
      if (currentPerformance < DEMO_PERFORMANCES.length - 1) {
        setCurrentPerformance(prev => prev + 1);
        x.set(0);
        y.set(0);
      }
    }, 1000);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      handleVote('good');
    } else if (info.offset.x < -threshold) {
      handleVote('needs-work');
    } else if (info.offset.y < -threshold) {
      handleVote('amazing');
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const performance = DEMO_PERFORMANCES[currentPerformance];
  const canContinue = votedCount >= 2;

  return (
    <OnboardingLayout
      title="Learn to Judge Performances 👥"
      description="Rate anonymous performances to help create the 'reality check' moment"
      nextLabel="Continue to Discovery"
      nextDisabled={!canContinue}
    >
      <div className="space-y-6 max-w-md mx-auto">
        {/* Instructions */}
        <Card className="bg-blue-600/20 border-blue-500/30">
          <CardContent className="p-4">
            <h4 className="font-semibold text-white mb-2">How to Judge:</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </div>
                <span>Swipe left: Needs work</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
                <span>Swipe right: Good performance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <ArrowUp className="w-3 h-3 text-white" />
                </div>
                <span>Swipe up: Amazing!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Card */}
        {performance && (
          <div className="relative h-96">
            <motion.div
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={handleDragEnd}
              style={{ x, y, rotate, opacity }}
              className="absolute inset-0"
              whileDrag={{ scale: 1.05 }}
            >
              <Card className="h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 cursor-grab active:cursor-grabbing">
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Performance Info */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Volume2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      "{performance.challenge}"
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Duration: {performance.duration}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Performer rated themselves: {performance.selfRating} ⭐
                    </p>
                  </div>

                  {/* Audio Visualization */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-purple-500 rounded"
                          animate={{ height: [8, Math.random() * 32 + 8, 8] }}
                          transition={{ 
                            duration: 0.8, 
                            repeat: Infinity, 
                            delay: i * 0.1 
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Hints */}
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <X className="w-3 h-3 text-red-400" />
                      <span>Needs work</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3 text-yellow-400" />
                      <span>Amazing</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-green-400" />
                      <span>Good</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vote Feedback */}
            {lastVote && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl ${
                  lastVote === 'amazing' ? 'bg-yellow-500' :
                  lastVote === 'good' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {lastVote === 'amazing' ? '🔥' : lastVote === 'good' ? '👍' : '👎'}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="text-center">
          <p className="text-gray-300 text-sm">
            Voted on {votedCount} of 2 performances
          </p>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(votedCount / 2) * 100}%` }}
            />
          </div>
        </div>

        {canContinue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
              <p className="text-gray-300 text-sm">
                🎉 <strong>Great job!</strong> Your votes help create the reality check moment for performers.
              </p>
            </div>
          </motion.div>
        )}

        {/* Manual Voting Buttons (for accessibility) */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => handleVote('needs-work')}
            variant="outline"
            size="sm"
            className="border-red-500 text-red-400 hover:bg-red-500/20"
          >
            <X className="w-4 h-4 mr-1" />
            Needs Work
          </Button>
          <Button
            onClick={() => handleVote('amazing')}
            variant="outline"
            size="sm"
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
          >
            <Star className="w-4 h-4 mr-1" />
            Amazing
          </Button>
          <Button
            onClick={() => handleVote('good')}
            variant="outline"
            size="sm"
            className="border-green-500 text-green-400 hover:bg-green-500/20"
          >
            <Heart className="w-4 h-4 mr-1" />
            Good
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}