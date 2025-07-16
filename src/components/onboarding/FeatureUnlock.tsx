'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Star, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';

interface FeatureUnlockProps {
  feature: 'record' | 'judge' | 'discovery' | 'market' | 'advanced';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUnlockHint?: boolean;
  className?: string;
}

const FEATURE_CONFIG = {
  record: {
    name: 'Recording',
    description: 'Create your first vocal performance',
    unlockHint: 'Always available - start recording!',
    icon: Star
  },
  judge: {
    name: 'Judging',
    description: 'Rate community performances',
    unlockHint: 'Complete your first challenge to unlock',
    icon: CheckCircle
  },
  discovery: {
    name: 'Discovery Feed',
    description: 'Explore viral performances',
    unlockHint: 'Judge your first performance to unlock',
    icon: Star
  },
  market: {
    name: 'Performance Market',
    description: 'Trade performance coins',
    unlockHint: 'Complete onboarding to unlock',
    icon: Star
  },
  advanced: {
    name: 'Advanced Features',
    description: 'Premium tools and analytics',
    unlockHint: 'Complete onboarding to unlock',
    icon: Star
  }
};

/**
 * Progressive disclosure component that shows/hides features based on onboarding progress
 * Provides visual feedback about locked features and how to unlock them
 */
export default function FeatureUnlock({
  feature,
  children,
  fallback,
  showUnlockHint = true,
  className = ''
}: FeatureUnlockProps) {
  const { featureAccess, startOnboarding } = useOnboardingFlow();
  
  const config = FEATURE_CONFIG[feature];
  const isUnlocked = featureAccess[`can${feature.charAt(0).toUpperCase() + feature.slice(1)}` as keyof typeof featureAccess] || 
                    featureAccess[feature as keyof typeof featureAccess];

  // If feature is unlocked, render children
  if (isUnlocked) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state UI
  return (
    <div className={`relative ${className}`}>
      {/* Blurred/disabled version of children */}
      <div className="filter blur-sm opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* Unlock overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg"
      >
        <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/90 border-purple-500/50 max-w-xs mx-4">
          <CardContent className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
            >
              <Lock className="w-6 h-6 text-white" />
            </motion.div>
            
            <h3 className="font-semibold text-white mb-2">{config.name} Locked</h3>
            <p className="text-gray-200 text-sm mb-4">{config.description}</p>
            
            {showUnlockHint && (
              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <p className="text-yellow-200 text-xs">{config.unlockHint}</p>
              </div>
            )}
            
            <Button
              onClick={startOnboarding}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Start Tour
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}