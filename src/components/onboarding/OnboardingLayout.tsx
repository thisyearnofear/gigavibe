'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';
import GigavibeLogo from '@/components/ui/gigavibe-logo';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showProgress?: boolean;
  showSkip?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  className?: string;
}

const STEP_LABELS = {
  'welcome': 'Welcome',
  'feature-tour': 'Features',
  'first-challenge': 'First Challenge',
  'first-vote': 'First Vote',
  'discovery-intro': 'Discovery',
  'market-intro': 'Market',
  'completed': 'Complete'
};

export default function OnboardingLayout({
  children,
  title,
  description,
  showProgress = true,
  showSkip = true,
  showBack = true,
  showNext = true,
  nextLabel = 'Continue',
  nextDisabled = false,
  onNext,
  onBack,
  onSkip,
  className = ''
}: OnboardingLayoutProps) {
  const {
    currentStep,
    nextStep,
    previousStep,
    skipToEnd,
    getPreviousStep,
    completedSteps
  } = useOnboarding();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      previousStep();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      skipToEnd();
    }
  };

  // Calculate progress
  const totalSteps = Object.keys(STEP_LABELS).length - 1; // Exclude 'completed'
  const currentStepIndex = Object.keys(STEP_LABELS).indexOf(currentStep);
  const progressPercentage = (currentStepIndex / totalSteps) * 100;

  const canGoBack = showBack && getPreviousStep() !== null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col h-full min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-3">
          <GigavibeLogo className="w-8 h-8" />
          <span className="text-xl font-bold">GIGAVIBE</span>
        </div>
        
        {showSkip && (
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            Skip Tour
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="px-4 md:px-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {STEP_LABELS[currentStep]}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-gray-800"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Title Section */}
        <div className="px-4 md:px-6 mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold mb-2"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-300 text-lg"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 md:p-6 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              {canGoBack && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
            </div>

            <div>
              {showNext && (
                <Button
                  onClick={handleNext}
                  disabled={nextDisabled}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                >
                  {nextLabel}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}