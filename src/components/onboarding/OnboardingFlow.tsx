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
  ArrowRight,
  Sparkles,
  Music,
  Flame
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
  const [floatingIcons, setFloatingIcons] = useState<Array<{id: number, icon: React.ReactNode, x: number, y: number}>>([]);
  
  useEffect(() => {
    // Create floating icons
    const icons = [<Mic />, <Music />, <Star />, <Zap />, <Heart />, <Trophy />];
    const newIcons = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      icon: icons[i],
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setFloatingIcons(newIcons);
    
    // Animate icons periodically
    const interval = setInterval(() => {
      setFloatingIcons(prev => prev.map(icon => ({
        ...icon,
        x: Math.random() * 100,
        y: Math.random() * 100
      })));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 relative overflow-hidden"
    >
      {/* Floating background icons */}
      {floatingIcons.map((icon) => (
        <motion.div
          key={icon.id}
          className="absolute text-gigavibe-500/20"
          style={{ left: `${icon.x}%`, top: `${icon.y}%` }}
          animate={{ 
            x: [0, Math.random() * 20 - 10, 0],
            y: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {icon.icon}
        </motion.div>
      ))}
      
      <div className="mb-8 relative z-10">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <GigavibeLogo className="w-24 h-24 mx-auto mb-4" />
        </motion.div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome to GIGAVIBE
        </h1>
        <p className="text-xl text-gray-300 mt-2">
          Where your voice becomes valuable
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <motion.div 
          className="flex items-center gap-3 p-3 bg-purple-500/20 rounded-lg"
          whileHover={{ scale: 1.05, x: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Mic className="w-6 h-6 text-purple-400" />
          <span className="text-gray-200">Record vocal performances</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg"
          whileHover={{ scale: 1.05, x: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Users className="w-6 h-6 text-blue-400" />
          <span className="text-gray-200">Get community feedback</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-3 p-3 bg-green-500/20 rounded-lg"
          whileHover={{ scale: 1.05, x: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Trophy className="w-6 h-6 text-green-400" />
          <span className="text-gray-200">Turn viral moments into coins</span>
        </motion.div>
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 group"
        >
          Let's Get Started
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Farcaster Connection Step
function FarcasterConnectionStep({ onNext, onSkip }: OnboardingStepProps) {
  const { isAuthenticated, user } = useFarcasterAuth();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
        <motion.div 
          className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
          animate={{ 
            scale: pulse ? [1, 1.1, 1] : 1,
            boxShadow: pulse ? ["0 0 0 0 rgba(147, 51, 234, 0)", "0 0 0 10px rgba(147, 51, 234, 0.3)", "0 0 0 0 rgba(147, 51, 234, 0)"] : "0 0 0 0 rgba(147, 51, 234, 0)"
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Users className="w-8 h-8 text-purple-400" />
        </motion.div>
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
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <CheckCircle className="w-6 h-6" />
            </motion.div>
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
            <motion.p 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Share performances to your Farcaster feed
            </motion.p>
            <motion.p 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              Vote on community performances
            </motion.p>
            <motion.p 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Trophy className="w-4 h-4 text-green-400" />
              Earn ownership in viral performance coins
            </motion.p>
          </div>

          {onSkip && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={onSkip}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Skip for now
              </Button>
            </motion.div>
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
            <motion.div 
              className={`w-20 h-20 bg-${demoSteps[currentDemo].color}-500/20 rounded-full flex items-center justify-center mx-auto`}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {demoSteps[currentDemo].icon}
            </motion.div>
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
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentDemo ? 'bg-purple-400' : 'bg-gray-600'
            }`}
            animate={{
              scale: index === currentDemo ? [1, 1.5, 1] : 1
            }}
            transition={{
              duration: 0.5,
              repeat: index === currentDemo ? Infinity : 0,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <motion.div 
        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg max-w-md mx-auto"
        whileHover={{ scale: 1.02 }}
      >
        <p className="text-sm text-gray-200">
          💡 <strong>The magic:</strong> Even "bad" singing creates shareable moments like 
          "I thought 5⭐... they said 2⭐ 😅"
        </p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 group"
        >
          Try Your First Challenge
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// First Challenge Step
function FirstChallengeStep({ onNext }: OnboardingStepProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const startCountdown = () => {
    setHasStarted(true);
    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        setTimeout(onNext, 500);
      }
    }, 1000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-center space-y-6"
    >
      <div className="mb-6">
        <motion.div 
          className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Mic className="w-8 h-8 text-purple-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Your First Challenge
        </h2>
        <p className="text-gray-300">
          Let's start with something fun and easy
        </p>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
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
      </motion.div>

      <div className="space-y-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={startCountdown}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
            disabled={hasStarted}
          >
            {hasStarted ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                </motion.div>
                {countdown > 0 ? `Starting in ${countdown}...` : "Starting Challenge..."}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </motion.div>

        <p className="text-xs text-gray-400">
          Don't worry about being perfect - the fun is in the surprise!
        </p>
      </div>
    </motion.div>
  );
}

// Completion Step
function CompletionStep({ onNext }: OnboardingStepProps) {
  const [confetti, setConfetti] = useState<Array<{id: number, x: number, y: number}>>([]);
  
  useEffect(() => {
    // Create confetti effect
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setConfetti(newConfetti);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 relative overflow-hidden"
    >
      {/* Confetti effect */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            left: `${piece.x}%`, 
            top: `${piece.y}%`,
            backgroundColor: ['#d946ef', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
          }}
          initial={{ y: -100, opacity: 0 }}
          animate={{ 
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}
      
      <div className="mb-6 relative z-10">
        <motion.div
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <CheckCircle className="w-10 h-10 text-green-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          You're All Set! 🎉
        </h2>
        <p className="text-gray-300">
          Welcome to the GIGAVIBE community
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
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
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
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
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
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
        </motion.div>
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 group"
        >
          Explore GIGAVIBE
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Main Onboarding Flow Component
export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { isAuthenticated } = useFarcasterAuth();
  const [stepDirection, setStepDirection] = useState(0); // -1 for back, 1 for forward

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
      setStepDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setStepDirection(-1);
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
          <motion.div
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <GigavibeLogo className="w-8 h-8" />
          </motion.div>
          <span className="font-bold">GIGAVIBE</span>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleSkipAll}
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            Skip Setup
          </Button>
        </motion.div>
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
              initial={{ opacity: 0, x: stepDirection > 0 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: stepDirection > 0 ? -20 : 20 }}
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleBack}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </motion.div>
            
            <div className="text-xs text-gray-400 self-center">
              {currentStepData.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}