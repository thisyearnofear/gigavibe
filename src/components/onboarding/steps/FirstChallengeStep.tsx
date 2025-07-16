'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, Square, Volume2, Star } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function FirstChallengeStep() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [selfRating, setSelfRating] = useState<number | null>(null);
  const [showRating, setShowRating] = useState(false);
  const { markStepCompleted } = useOnboarding();

  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording for demo
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
      setShowRating(true);
    }, 3000);
  };

  const handleRating = (rating: number) => {
    setSelfRating(rating);
    markStepCompleted('first-challenge');
  };

  const canContinue = hasRecorded && selfRating !== null;

  return (
    <OnboardingLayout
      title="Your First Vocal Challenge! 🎤"
      description="Let's record a quick performance and see how you rate yourself"
      nextLabel="Continue to Judging"
      nextDisabled={!canContinue}
    >
      <div className="space-y-8 max-w-md mx-auto">
        {/* Challenge Card */}
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Practice Challenge</h3>
            <p className="text-gray-300 mb-4">
              Sing "Happy Birthday" or hum any tune for 5-10 seconds. This is just practice!
            </p>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                💡 <strong>Tip:</strong> Don't worry about being perfect - this is about discovering your vocal reality!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <div className="text-center space-y-6">
          {!hasRecorded ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: isRecording ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={startRecording}
                disabled={isRecording}
                size="lg"
                className={`w-24 h-24 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white shadow-lg`}
              >
                {isRecording ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              <p className="text-gray-300 mt-4">
                {isRecording ? 'Recording... Sing away! 🎵' : 'Tap to start recording'}
              </p>
              {isRecording && (
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-8 bg-purple-500 rounded"
                      animate={{ height: [8, 32, 8] }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: Infinity, 
                        delay: i * 0.1 
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white" />
              </div>
              <p className="text-green-400 font-semibold">Recording Complete! 🎉</p>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Play Back
              </Button>
            </motion.div>
          )}
        </div>

        {/* Self Rating */}
        {showRating && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4 text-center">
                  How do you think you did?
                </h4>
                <p className="text-gray-300 text-sm text-center mb-6">
                  Rate your performance honestly - the community will judge it too!
                </p>
                
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      variant={selfRating === rating ? "default" : "outline"}
                      size="lg"
                      className={`w-12 h-12 rounded-full ${
                        selfRating === rating 
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${selfRating === rating ? 'fill-current' : ''}`} />
                    </Button>
                  ))}
                </div>
                
                {selfRating && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-4 text-gray-300"
                  >
                    You rated yourself: <span className="text-yellow-400 font-semibold">{selfRating} stars</span>
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {canContinue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
              <p className="text-gray-300 text-sm">
                🎯 <strong>Next:</strong> Learn how to judge other performances and see how the community rates yours!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </OnboardingLayout>
  );
}