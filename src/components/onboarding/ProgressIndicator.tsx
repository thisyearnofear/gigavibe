'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  variant?: 'compact' | 'detailed' | 'minimal';
  showLabels?: boolean;
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

/**
 * Shows onboarding progress in various formats
 * Can be used in headers, sidebars, or as standalone component
 */
export default function ProgressIndicator({ 
  variant = 'compact', 
  showLabels = true,
  className = '' 
}: ProgressIndicatorProps) {
  const { progressInfo, currentStep, completedSteps, isStepCompleted } = useOnboardingFlow();

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {Object.keys(STEP_LABELS).slice(0, -1).map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${
                isStepCompleted(step as any) ? 'bg-green-400' : 
                step === currentStep ? 'bg-purple-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        {showLabels && (
          <span className="text-xs text-gray-400">
            {progressInfo.currentStepIndex + 1}/{progressInfo.totalSteps}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Onboarding Progress
          </span>
          <span className="text-sm text-gray-400">
            {progressInfo.completedStepsCount}/{progressInfo.totalSteps}
          </span>
        </div>
        <Progress 
          value={progressInfo.progressPercentage} 
          className="h-2 bg-gray-800"
        />
        {showLabels && (
          <span className="text-xs text-gray-500">
            Current: {STEP_LABELS[currentStep as keyof typeof STEP_LABELS]}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className={`bg-white/5 border-white/10 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Onboarding Progress</h4>
            <span className="text-sm text-gray-400">
              {progressInfo.completedStepsCount}/{progressInfo.totalSteps}
            </span>
          </div>
          
          <Progress 
            value={progressInfo.progressPercentage} 
            className="h-3 bg-gray-800"
          />
          
          <div className="space-y-2">
            {Object.entries(STEP_LABELS).slice(0, -1).map(([step, label], index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                {isStepCompleted(step as any) ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : step === currentStep ? (
                  <Circle className="w-4 h-4 text-purple-400 fill-current" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-600" />
                )}
                <span className={`text-sm ${
                  isStepCompleted(step as any) ? 'text-green-400' :
                  step === currentStep ? 'text-purple-400' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}