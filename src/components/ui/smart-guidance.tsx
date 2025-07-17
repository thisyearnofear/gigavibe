"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Target,
  Zap,
  Star,
  Music,
  Mic,
  Heart,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// Guidance Types
export type GuidanceContext =
  | "first-visit"
  | "feature-discovery"
  | "onboarding"
  | "help"
  | "achievement"
  | "error-recovery";

export type GuidancePosition = "top" | "bottom" | "left" | "right" | "center";

interface GuidanceStep {
  id: string;
  title: string;
  content: string;
  position?: GuidancePosition;
  target?: string; // CSS selector
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  persistent?: boolean;
}

interface GuidanceFlow {
  id: string;
  context: GuidanceContext;
  steps: GuidanceStep[];
  trigger?: "immediate" | "hover" | "click" | "scroll";
  showOnce?: boolean;
}

// Context-aware guidance content
const getContextualGuidance = (
  context: GuidanceContext
): Partial<GuidanceFlow> => {
  switch (context) {
    case "first-visit":
      return {
        steps: [
          {
            id: "welcome",
            title: "Welcome to GIGAVIBE! 🎤",
            content:
              "Your AI-powered vocal training platform with Web3 social features.",
            icon: Music,
            position: "center",
          },
          {
            id: "record",
            title: "Start Recording",
            content: "Tap the record button to capture your vocal performance.",
            icon: Mic,
            target: "[data-guide='record-button']",
            position: "bottom",
          },
          {
            id: "vote",
            title: "Community Voting",
            content:
              "Rate other performances and earn rewards for your participation.",
            icon: Heart,
            target: "[data-guide='voting-section']",
            position: "top",
          },
        ],
      };

    case "feature-discovery":
      return {
        steps: [
          {
            id: "ai-coaching",
            title: "AI Coaching Available",
            content: "Get personalized feedback on your vocal technique.",
            icon: Zap,
            position: "right",
          },
          {
            id: "market",
            title: "Performance Market",
            content: "Trade performance coins and build your portfolio.",
            icon: TrendingUp,
            position: "left",
          },
        ],
      };

    case "achievement":
      return {
        steps: [
          {
            id: "achievement-unlocked",
            title: "Achievement Unlocked! 🏆",
            content: "You've reached a new milestone in your GIGAVIBE journey.",
            icon: Trophy,
            position: "center",
            persistent: true,
          },
        ],
      };

    default:
      return { steps: [] };
  }
};

// Smart Tooltip Component
interface SmartTooltipProps {
  content: string;
  title?: string;
  position?: GuidancePosition;
  trigger?: "hover" | "click" | "focus";
  children: React.ReactNode;
  showOnce?: boolean;
  storageKey?: string;
}

export function SmartTooltip({
  content,
  title,
  position = "top",
  trigger = "hover",
  children,
  showOnce = false,
  storageKey,
}: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (showOnce && storageKey) {
      const shown = localStorage.getItem(`tooltip-${storageKey}`);
      setHasBeenShown(!!shown);
    }
  }, [showOnce, storageKey]);

  const handleShow = () => {
    if (showOnce && hasBeenShown) return;

    setIsVisible(true);

    if (showOnce && storageKey) {
      localStorage.setItem(`tooltip-${storageKey}`, "true");
      setHasBeenShown(true);
    }
  };

  const handleHide = () => {
    setIsVisible(false);
  };

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      handleShow();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      timeoutRef.current = setTimeout(handleHide, 300);
    }
  };

  const handleClick = () => {
    if (trigger === "click") {
      setIsVisible(!isVisible);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 border-t-slate-800 border-t-8 border-x-transparent border-x-8 border-b-0";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 border-b-slate-800 border-b-8 border-x-transparent border-x-8 border-t-0";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 border-l-slate-800 border-l-8 border-y-transparent border-y-8 border-r-0";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 border-r-slate-800 border-r-8 border-y-transparent border-y-8 border-l-0";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 border-t-slate-800 border-t-8 border-x-transparent border-x-8 border-b-0";
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn("absolute z-50 max-w-xs", getPositionClasses())}
          >
            <div className="bg-slate-800 text-white p-3 rounded-lg shadow-2xl border border-slate-700">
              {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
              <p className="text-xs text-slate-300 leading-relaxed">
                {content}
              </p>

              {/* Arrow */}
              <div className={cn("absolute w-0 h-0", getArrowClasses())} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Contextual Help Panel
interface ContextualHelpProps {
  context: GuidanceContext;
  isOpen: boolean;
  onClose: () => void;
  customSteps?: GuidanceStep[];
}

export function ContextualHelp({
  context,
  isOpen,
  onClose,
  customSteps,
}: ContextualHelpProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const guidance = getContextualGuidance(context);
  const steps = customSteps || guidance.steps || [];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];
  const Icon = step.icon || HelpCircle;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gigavibe-500/20 rounded-lg">
                <Icon className="w-5 h-5 text-gigavibe-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="text-xs text-slate-400">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>

            {step.dismissible !== false && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-slate-300 leading-relaxed">{step.content}</p>

            {step.action && (
              <Button
                onClick={step.action.onClick}
                className="mt-4 w-full"
                variant="gigavibe"
              >
                {step.action.label}
              </Button>
            )}
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 rounded-full flex-1 transition-colors",
                    index <= currentStep ? "bg-gigavibe-500" : "bg-slate-700"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} variant="gigavibe" size="sm">
                Complete
              </Button>
            ) : (
              <Button onClick={handleNext} variant="gigavibe" size="sm">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Feature Spotlight
interface FeatureSpotlightProps {
  target: string;
  title: string;
  description: string;
  isActive: boolean;
  onNext: () => void;
  onSkip: () => void;
  position?: GuidancePosition;
}

export function FeatureSpotlight({
  target,
  title,
  description,
  isActive,
  onNext,
  onSkip,
  position = "bottom",
}: FeatureSpotlightProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      const element = document.querySelector(target) as HTMLElement;
      setTargetElement(element);
    }
  }, [target, isActive]);

  if (!isActive || !targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  const spotlightStyle = {
    top: rect.top - 8,
    left: rect.left - 8,
    width: rect.width + 16,
    height: rect.height + 16,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Spotlight */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="absolute rounded-lg border-2 border-gigavibe-400 shadow-gigavibe-glow"
          style={spotlightStyle}
        />

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "absolute bg-slate-900 rounded-xl p-4 max-w-sm border border-slate-700 shadow-2xl",
            position === "bottom" && "mt-4",
            position === "top" && "mb-4",
            position === "left" && "mr-4",
            position === "right" && "ml-4"
          )}
          style={{
            top:
              position === "bottom"
                ? rect.bottom + 8
                : position === "top"
                ? rect.top - 120
                : rect.top,
            left:
              position === "right"
                ? rect.right + 8
                : position === "left"
                ? rect.left - 240
                : rect.left,
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <Lightbulb className="w-5 h-5 text-gigavibe-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm">{title}</h4>
              <p className="text-slate-300 text-xs mt-1">{description}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onNext} size="sm" variant="gigavibe">
              Got it
            </Button>
            <Button onClick={onSkip} size="sm" variant="outline">
              Skip tour
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Smart Guidance Hook
export function useSmartGuidance() {
  const [activeGuidance, setActiveGuidance] = useState<string | null>(null);
  const [completedGuidance, setCompletedGuidance] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // Load completed guidance from localStorage
    const completed = localStorage.getItem("completed-guidance");
    if (completed) {
      setCompletedGuidance(new Set(JSON.parse(completed)));
    }
  }, []);

  const startGuidance = (guidanceId: string) => {
    if (!completedGuidance.has(guidanceId)) {
      setActiveGuidance(guidanceId);
    }
  };

  const completeGuidance = (guidanceId: string) => {
    const newCompleted = new Set(completedGuidance);
    newCompleted.add(guidanceId);
    setCompletedGuidance(newCompleted);
    localStorage.setItem(
      "completed-guidance",
      JSON.stringify([...newCompleted])
    );
    setActiveGuidance(null);
  };

  const resetGuidance = () => {
    setCompletedGuidance(new Set());
    localStorage.removeItem("completed-guidance");
  };

  return {
    activeGuidance,
    completedGuidance,
    startGuidance,
    completeGuidance,
    resetGuidance,
  };
}

// Help Button Component
export function HelpButton({ context }: { context: GuidanceContext }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <HelpCircle className="w-4 h-4" />
        Help
      </Button>

      <ContextualHelp
        context={context}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
