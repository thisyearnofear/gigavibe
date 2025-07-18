/**
 * Modular Challenge Flow Component
 * Clean, organized flow management following DRY principles
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Challenge, ChallengeFlowProps, ChallengeResult } from '@/types/challenge.types';
import { useUnifiedChallenge, useChallengeFlow } from '@/hooks/useUnifiedChallenge';

// Import flow step components
import {
  ChallengePreview,
  ChallengePrepare,
  ChallengeCountdown,
  ChallengeRecording,
  ChallengePlayback,
  ChallengeRating,
  ChallengeSharing
} from './flow-steps';

/**
 * Main Challenge Flow Component
 */
export default function ChallengeFlow({ 
  challenge, 
  onComplete, 
  onCancel,
  initialStep = 'preview' 
}: ChallengeFlowProps) {
  const [recordingData, setRecordingData] = useState<{
    audioBlob?: Blob;
    mixedAudioBlob?: Blob;
    audioUrl?: string;
    duration: number;
  }>({ duration: 0 });

  const [ratingData, setRatingData] = useState<{
    selfRating: number;
    confidence: 'nervous' | 'confident' | 'very confident';
  }>({ selfRating: 5, confidence: 'confident' });

  const { 
    currentStep, 
    goToStep, 
    goBack, 
    getStepProgress, 
    canGoBack,
    isFirstStep,
    isLastStep 
  } = useChallengeFlow(initialStep);

  const { updateProgress } = useUnifiedChallenge();

  // Update challenge progress when step changes
  useEffect(() => {
    updateProgress({ currentStep });
  }, [currentStep, updateProgress]);

  const handleStepComplete = (stepData?: any) => {
    switch (currentStep) {
      case 'preview':
        goToStep('prepare');
        break;
      case 'prepare':
        goToStep('countdown');
        break;
      case 'countdown':
        goToStep('recording');
        break;
      case 'recording':
        if (stepData) {
          setRecordingData(stepData);
        }
        goToStep('playback');
        break;
      case 'playback':
        goToStep('rating');
        break;
      case 'rating':
        if (stepData) {
          setRatingData(stepData);
        }
        goToStep('sharing');
        break;
      case 'sharing':
        handleComplete(stepData?.shareToSocial || false);
        break;
    }
  };

  const handleRetake = () => {
    setRecordingData({ duration: 0 });
    goToStep('prepare');
  };

  const handleComplete = async (shareToSocial: boolean = false) => {
    const result: ChallengeResult = {
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      audioUrl: recordingData.audioUrl || '',
      selfRating: ratingData.selfRating,
      confidence: ratingData.confidence,
      duration: recordingData.duration,
      timestamp: new Date(),
      castHash: shareToSocial ? `mock-cast-${Date.now()}` : undefined
    };

    try {
      await onComplete(result);
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      // Handle error - could show error state or retry option
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      challenge,
      onNext: handleStepComplete,
      onBack: canGoBack ? goBack : undefined,
      onCancel
    };

    switch (currentStep) {
      case 'preview':
        return <ChallengePreview {...stepProps} />;
      case 'prepare':
        return <ChallengePrepare {...stepProps} />;
      case 'countdown':
        return <ChallengeCountdown {...stepProps} />;
      case 'recording':
        return <ChallengeRecording {...stepProps} />;
      case 'playback':
        return (
          <ChallengePlayback 
            {...stepProps} 
            recordingData={recordingData}
            onRetake={handleRetake}
          />
        );
      case 'rating':
        return (
          <ChallengeRating 
            {...stepProps} 
            recordingData={recordingData}
            initialRating={ratingData}
          />
        );
      case 'sharing':
        return (
          <ChallengeSharing 
            {...stepProps} 
            recordingData={recordingData}
            ratingData={ratingData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gigavibe-mesh relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/20" />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={getStepProgress()} className="h-1 bg-black/20">
          <div className="h-full bg-gradient-to-r from-gigavibe-500 to-purple-500" />
        </Progress>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-6">
        <div className="flex items-center gap-3">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-white">{challenge.title}</h1>
            <p className="text-sm text-slate-400">{challenge.artist}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="max-w-md mx-auto"
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step Indicator */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
          {['preview', 'prepare', 'countdown', 'recording', 'playback', 'rating', 'sharing'].map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? 'bg-gigavibe-400 scale-125'
                  : index < ['preview', 'prepare', 'countdown', 'recording', 'playback', 'rating', 'sharing'].indexOf(currentStep)
                  ? 'bg-gigavibe-400/60'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}