'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';

interface ContextualTipProps {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  trigger?: 'immediate' | 'hover' | 'click';
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnlyForNewUsers?: boolean;
  autoHide?: number; // Auto hide after X seconds
  className?: string;
}

/**
 * Contextual tip component that shows helpful hints based on user progress
 * Can be positioned around UI elements to provide just-in-time guidance
 */
export default function ContextualTip({
  id,
  title,
  description,
  action,
  trigger = 'immediate',
  position = 'bottom',
  showOnlyForNewUsers = false,
  autoHide,
  className = ''
}: ContextualTipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { isNewUser, hasCompletedOnboarding } = useOnboardingFlow();

  // Check if tip should be shown
  useEffect(() => {
    // Don't show if dismissed
    if (isDismissed) return;

    // Check if tip was previously dismissed
    const dismissedTips = JSON.parse(localStorage.getItem('gigavibe_dismissed_tips') || '[]');
    if (dismissedTips.includes(id)) {
      setIsDismissed(true);
      return;
    }

    // Show only for new users if specified
    if (showOnlyForNewUsers && !isNewUser) {
      return;
    }

    // Show tip based on trigger
    if (trigger === 'immediate') {
      setIsVisible(true);
    }
  }, [id, isDismissed, showOnlyForNewUsers, isNewUser, trigger]);

  // Auto hide functionality
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHide * 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);

    // Save to localStorage
    const dismissedTips = JSON.parse(localStorage.getItem('gigavibe_dismissed_tips') || '[]');
    if (!dismissedTips.includes(id)) {
      dismissedTips.push(id);
      localStorage.setItem('gigavibe_dismissed_tips', JSON.stringify(dismissedTips));
    }
  };

  const handleAction = () => {
    if (action?.onClick) {
      action.onClick();
    }
    handleDismiss();
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : -10 }}
        className={`absolute z-50 ${positionClasses[position]} ${className}`}
      >
        <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/90 border-purple-500/50 backdrop-blur-sm shadow-xl max-w-xs">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
                <p className="text-gray-200 text-xs leading-relaxed">{description}</p>
                
                {action && (
                  <Button
                    onClick={handleAction}
                    size="sm"
                    className="mt-3 bg-white/20 hover:bg-white/30 text-white text-xs h-7"
                  >
                    {action.label}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
              
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/20 p-1 h-6 w-6 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Arrow pointer */}
        <div className={`absolute w-3 h-3 bg-purple-600 transform rotate-45 ${
          position === 'top' ? 'top-full -mt-1.5 left-1/2 -ml-1.5' :
          position === 'bottom' ? 'bottom-full -mb-1.5 left-1/2 -ml-1.5' :
          position === 'left' ? 'left-full -ml-1.5 top-1/2 -mt-1.5' :
          'right-full -mr-1.5 top-1/2 -mt-1.5'
        }`} />
      </motion.div>
    </AnimatePresence>
  );
}