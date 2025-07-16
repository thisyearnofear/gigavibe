"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Trophy, 
  Zap, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Target,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrossTab } from "@/contexts/CrossTabContext";

interface PostChallengeGuidanceProps {
  selfRating: number;
  communityRating?: number;
  challengeTitle: string;
  onNavigate: (tab: string, context?: any) => void;
  onDismiss: () => void;
}

interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: string;
  tab: string;
  context?: any;
  badge?: string;
  color: string;
}

export default function PostChallengeGuidance({
  selfRating,
  communityRating,
  challengeTitle,
  onNavigate,
  onDismiss
}: PostChallengeGuidanceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { votingProgress } = useCrossTab();

  // Generate personalized guidance based on performance
  const getGuidanceSteps = (): GuidanceStep[] => {
    const steps: GuidanceStep[] = [];

    // Always suggest exploring the discovery feed
    steps.push({
      id: 'discovery',
      title: 'See Your Performance Live',
      description: 'Your performance is now in the community feed. See how others react!',
      icon: Zap,
      action: 'View in Feed',
      tab: 'discovery',
      context: { highlightPerformance: true },
      badge: 'New',
      color: 'from-gigavibe-500 to-purple-500'
    });

    // If no community rating yet, encourage judging
    if (!communityRating) {
      steps.push({
        id: 'judging',
        title: 'Help Others While You Wait',
        description: 'Judge other performances to earn your community rating faster!',
        icon: Users,
        action: 'Start Judging',
        tab: 'judging',
        context: { fromChallenge: true },
        badge: `${votingProgress}/5`,
        color: 'from-blue-500 to-indigo-500'
      });
    }

    // If performance was good, suggest market features
    if (communityRating && communityRating >= 4) {
      steps.push({
        id: 'market',
        title: 'Your Performance is Trending!',
        description: 'Check if your performance has earned viral coins in the market.',
        icon: Trophy,
        action: 'View Market',
        tab: 'leaderboard',
        badge: 'Hot',
        color: 'from-yellow-500 to-orange-500'
      });
    }

    // If there's a big gap, suggest improvement
    if (communityRating && Math.abs(selfRating - communityRating) >= 2) {
      steps.push({
        id: 'improve',
        title: 'Level Up Your Voice',
        description: 'Try another challenge to improve your vocal accuracy!',
        icon: Target,
        action: 'New Challenge',
        tab: 'challenge',
        badge: 'Improve',
        color: 'from-green-500 to-emerald-500'
      });
    }

    return steps;
  };

  const steps = getGuidanceSteps();

  const handleStepAction = (step: GuidanceStep) => {
    setCompletedSteps(prev => [...prev, step.id]);
    onNavigate(step.tab, step.context);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onDismiss();
    }
  };

  const handleSkip = () => {
    onDismiss();
  };

  if (steps.length === 0) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const isCompleted = completedSteps.includes(currentStepData.id);

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gigavibe-mesh border border-white/20 rounded-3xl p-6 max-w-md w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">What's Next?</h2>
          <p className="text-gray-400 text-sm">
            Your "{challengeTitle}" performance is complete!
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-gigavibe-400' 
                  : index < currentStep 
                  ? 'bg-green-400' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Current Step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${currentStepData.color} flex items-center justify-center`}
              whileHover={{ scale: 1.05 }}
            >
              <currentStepData.icon className="w-8 h-8 text-white" />
            </motion.div>

            {/* Content */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">
                  {currentStepData.title}
                </h3>
                {currentStepData.badge && (
                  <Badge className={`bg-gradient-to-r ${currentStepData.color} text-white border-0`}>
                    {currentStepData.badge}
                  </Badge>
                )}
              </div>
              <p className="text-gray-300">
                {currentStepData.description}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => handleStepAction(currentStepData)}
                disabled={isCompleted}
                className={`w-full bg-gradient-to-r ${currentStepData.color} hover:opacity-90 text-white border-0`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    {currentStepData.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                {currentStep < steps.length - 1 ? (
                  <>
                    <Button
                      onClick={handleNext}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Next Tip
                    </Button>
                    <Button
                      onClick={handleSkip}
                      variant="ghost"
                      className="flex-1 text-gray-400 hover:text-white"
                    >
                      Skip Guide
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Achievement Summary */}
        {communityRating && (
          <motion.div
            className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Your Performance</span>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">
                  {communityRating.toFixed(1)}/5.0
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
