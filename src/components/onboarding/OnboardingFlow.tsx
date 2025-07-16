"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  Users, 
  Trophy, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  Play,
  Volume2,
  Heart,
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFarcasterAuth } from "@/contexts/FarcasterAuthContext";
import { FarcasterAuthStatus } from "@/components/auth/FarcasterAuthStatus";
import GigavibeLogo from "@/components/ui/gigavibe-logo";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
  requiresAuth?: boolean;
  canSkip?: boolean;
}

interface OnboardingStepProps {
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
}

// Welcome Step
function WelcomeStep({ onNext }: OnboardingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="mb-8">
        <GigavibeLogo className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome to GIGAVIBE
        </h1>
        <p className="text-xl text-gray-300 mt-2">
          Where your voice becomes valuable
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 p-3 bg-purple-500/20 rounded-lg">
          <Mic className="w-6 h-6 text-purple-400" />
          <span className="text-gray-200">Record vocal performances</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg">
          <Users className="w-6 h-6 text-blue-400" />
          <span className="text-gray-200">Get community feedback</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded-lg">
          <Trophy className="w-6 h-6 text-green-400" />
          <span className="text-gray-200">Turn viral moments into coins</span>
        </div>
      </div>

      <Button 
        onClick={onNext}
        size="lg"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
      >
        Let's Get Started
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}

// Farcaster Connection Step
function FarcasterConnectionStep({ onNext, onSkip }: OnboardingStepProps) {
  const { isAuthenticated, user } = useFarcasterAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Auto-advance when authenticated
      setTimeout(onNext, 1500);
    }
  }, [isAuthenticated, user, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-center space-y-6"
    >
      <div className="mb-6">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Connect Your Farcaster Account
        </h2>
        <p className="text-gray-300 max-w-md mx-auto">
          Connect to share your performances, vote on others, and earn from viral moments
        </p>
      </div>

      {isAuthenticated && user ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-green-400">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-medium">Connected!</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 bg-gray-800 rounded-lg max-w-sm mx-auto">
            <img 
              src={user.pfp_url} 
              alt={user.display_name}
              className="w-10 h-10 rounded-full"
            />
            <div className="text-left">
              <div className="font-medium text-white">{user.display_name}</div>
              <div className="text-sm text-gray-400">@{user.username}</div>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Redirecting to your first challenge...
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <FarcasterAuthStatus showSignInButton={true} />
          
          <div className="text-sm text-gray-400 space-y-2">
            <p>✨ Share performances to your Farcaster feed</p>
            <p>🗳️ Vote on community performances</p>
            <p>💰 Earn ownership in viral performance coins</p>
          </div>

          {onSkip && (
            <Button 
              onClick={onSkip}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Skip for now
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// How It Works Step
function HowItWorksStep({ onNext }: OnboardingStepProps) {
  const [currentDemo, setCurrentDemo] = useState(0);
  
  const demoSteps = [
    {
      icon: <Mic className="w-8 h-8 text-purple-400" />,
      title: "1. Record Your Voice",
      description: "Choose a challenge and record yourself singing",
      color: "purple"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      title: "2. Rate Yourself",
      description: "Give yourself a rating from 1-5 stars",
      color: "yellow"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-400" />,
      title: "3. Community Judges",
      description: "Other users anonymously rate your performance",
      color: "blue"
    },
    {
      icon: <Zap className="w-8 h-8 text-green-400" />,
      title: "4. Reality Check!",
      description: "See the gap between your rating and theirs",
      color: "green"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-center space-y-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          How GIGAVIBE Works
        </h2>
        <p className="text-gray-300">
          The viral loop that makes every performance entertaining
        </p>
      </div>

      <div className="relative h-64 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDemo}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className={`w-20 h-20 bg-${demoSteps[currentDemo].color}-500/20 rounded-full flex items-center justify-center mx-auto`}>
              {demoSteps[currentDemo].icon}
            </div>
            <h3 className="text-xl font-bold text-white">
              {demoSteps[currentDemo].title}
            </h3>
            <p className="text-gray-300 max-w-xs mx-auto">
              {demoSteps[currentDemo].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {demoSteps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentDemo ? 'bg-purple-400' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg max-w-md mx-auto">
        <p className="text-sm text-gray-200">
          💡 <strong>The magic:</strong> Even "bad" singing creates shareable moments like 
          "I thought 5⭐... they said 2⭐ 😅"
        </p>
      </div>

      <Button 
        onClick={onNext}
        size="lg"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
      >
        Try Your First Challenge
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}

// First Challenge Step
function FirstChallengeStep({ onNext }: OnboardingStepProps) {
  const [hasStarted, setHasStarted] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-center space-y-6"
    >
      <div className="mb-6">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Your First Challenge
        </h2>
        <p className="text-gray-300">
          Let's start with something fun and easy
        </p>
      </div>

      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-white">Happy Birthday</h3>
              <p className="text-sm text-gray-300">Classic & Simple</p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Everyone knows the words</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Short and sweet (30 seconds)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Perfect for your first reality check</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button 
          onClick={() => {
            setHasStarted(true);
            // This would trigger the actual challenge component
            setTimeout(onNext, 2000); // Simulate challenge completion
          }}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
          disabled={hasStarted}
        >
          {hasStarted ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Starting Challenge...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start Recording
            </>
          )}
        </Button>

        <p className="text-xs text-gray-400">
          Don't worry about being perfect - the fun is in the surprise!
        </p>
      </div>
    </motion.div>
  );
}

// Completion Step
function CompletionStep({ onNext }: OnboardingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="mb-6">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          You're All Set! 🎉
        </h2>
        <p className="text-gray-300">
          Welcome to the GIGAVIBE community
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        <Card className="bg-purple-500/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-white">Discover Feed</div>
                <div className="text-sm text-gray-300">Swipe through performances</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <div className="font-medium text-white">Judge Others</div>
                <div className="text-sm text-gray-300">Help create reality checks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-green-400" />
              <div className="text-left">
                <div className="font-medium text-white">Market</div>
                <div className="text-sm text-gray-300">Trade performance coins</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={onNext}
        size="lg"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
      >
        Explore GIGAVIBE
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}

// Main Onboarding Flow Component
export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { isAuthenticated } = useFarcasterAuth();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Introduction to GIGAVIBE',
      component: WelcomeStep,
    },
    {
      id: 'farcaster',
      title: 'Connect',
      description: 'Connect your Farcaster account',
      component: FarcasterConnectionStep,
      canSkip: true,
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      description: 'Learn the viral loop',
      component: HowItWorksStep,
    },
    {
      id: 'first-challenge',
      title: 'First Challenge',
      description: 'Try your first vocal challenge',
      component: FirstChallengeStep,
      requiresAuth: false, // Allow without auth for demo
    },
    {
      id: 'completion',
      title: 'Complete',
      description: 'You\'re ready to go!',
      component: CompletionStep,
    },
  ];

  const currentStepData = steps[currentStep];
  const CurrentStepComponent = currentStepData.component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    handleNext();
  };

  const handleSkipAll = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GigavibeLogo className="w-8 h-8" />
          <span className="font-bold">GIGAVIBE</span>
        </div>
        
        <Button 
          onClick={handleSkipAll}
          variant="ghost" 
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          Skip Setup
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                onNext={handleNext}
                onSkip={currentStepData.canSkip ? handleSkipStep : undefined}
                onBack={currentStep > 0 ? handleBack : undefined}
                isFirst={currentStep === 0}
                isLast={currentStep === steps.length - 1}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <div className="p-4">
          <div className="max-w-lg mx-auto flex justify-between">
            <Button 
              onClick={handleBack}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div className="text-xs text-gray-400 self-center">
              {currentStepData.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}