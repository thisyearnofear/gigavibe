"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Loader2,
  Trophy,
  Music,
  Mic,
  Heart,
  Star,
  Zap,
  Upload,
  Download,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Enhanced Toast Types
export type FeedbackType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "achievement"
  | "vocal"
  | "social";

export type FeedbackContext =
  | "recording"
  | "upload"
  | "sharing"
  | "voting"
  | "achievement"
  | "challenge"
  | "market"
  | "auth"
  | "general";

interface FeedbackOptions {
  type: FeedbackType;
  context?: FeedbackContext;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: number;
  achievement?: {
    icon: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
}

// Context-aware icons and colors
const getContextualIcon = (type: FeedbackType, context?: FeedbackContext) => {
  if (context === "recording") return Mic;
  if (context === "upload") return Upload;
  if (context === "sharing") return Share2;
  if (context === "voting") return Heart;
  if (context === "achievement") return Trophy;
  if (context === "challenge") return Music;

  switch (type) {
    case "success":
      return CheckCircle;
    case "error":
      return XCircle;
    case "warning":
      return AlertCircle;
    case "info":
      return Info;
    case "loading":
      return Loader2;
    case "achievement":
      return Trophy;
    case "vocal":
      return Mic;
    case "social":
      return Heart;
    default:
      return Info;
  }
};

const getTypeStyles = (type: FeedbackType, context?: FeedbackContext) => {
  const baseStyles = "backdrop-blur-xl border shadow-2xl";

  switch (type) {
    case "success":
      return `${baseStyles} bg-green-500/20 border-green-400/30 text-green-100 shadow-green-500/20`;
    case "error":
      return `${baseStyles} bg-red-500/20 border-red-400/30 text-red-100 shadow-red-500/20`;
    case "warning":
      return `${baseStyles} bg-yellow-500/20 border-yellow-400/30 text-yellow-100 shadow-yellow-500/20`;
    case "info":
      return `${baseStyles} bg-blue-500/20 border-blue-400/30 text-blue-100 shadow-blue-500/20`;
    case "loading":
      return `${baseStyles} bg-gigavibe-500/20 border-gigavibe-400/30 text-gigavibe-100 shadow-gigavibe-500/20`;
    case "achievement":
      return `${baseStyles} bg-gradient-to-r from-gigavibe-500/20 to-yellow-500/20 border-gigavibe-400/30 text-white shadow-gigavibe-500/30`;
    case "vocal":
      return `${baseStyles} bg-purple-500/20 border-purple-400/30 text-purple-100 shadow-purple-500/20`;
    case "social":
      return `${baseStyles} bg-pink-500/20 border-pink-400/30 text-pink-100 shadow-pink-500/20`;
    default:
      return `${baseStyles} bg-slate-500/20 border-slate-400/30 text-slate-100 shadow-slate-500/20`;
  }
};

// Enhanced Toast Component
interface EnhancedToastProps {
  options: FeedbackOptions;
  onDismiss: () => void;
}

function EnhancedToast({ options, onDismiss }: EnhancedToastProps) {
  const [progress, setProgress] = useState(options.progress || 0);
  const Icon = getContextualIcon(options.type, options.context);

  useEffect(() => {
    if (options.type === "loading" && options.progress !== undefined) {
      setProgress(options.progress);
    }
  }, [options.progress, options.type]);

  useEffect(() => {
    if (options.duration && options.type !== "loading") {
      const timer = setTimeout(onDismiss, options.duration);
      return () => clearTimeout(timer);
    }
  }, [options.duration, options.type, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-2xl max-w-md mx-auto",
        getTypeStyles(options.type, options.context)
      )}
    >
      {/* Icon with context-aware animation */}
      <div className="flex-shrink-0 mt-0.5">
        <motion.div
          animate={{
            rotate: options.type === "loading" ? 360 : 0,
            scale: options.type === "achievement" ? [1, 1.2, 1] : 1,
          }}
          transition={{
            rotate: {
              duration: 1,
              repeat: options.type === "loading" ? Infinity : 0,
              ease: "linear",
            },
            scale: { duration: 0.5, ease: "easeOut" },
          }}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              options.type === "loading" && "animate-spin"
            )}
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm leading-tight">
              {options.title}
            </h4>
            {options.message && (
              <p className="text-xs opacity-90 mt-1 leading-relaxed">
                {options.message}
              </p>
            )}
          </div>

          {/* Close button for non-loading toasts */}
          {options.type !== "loading" && (
            <button
              onClick={onDismiss}
              className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress bar for loading states */}
        {options.type === "loading" && (
          <div className="mt-3">
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <motion.div
                className="bg-current h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs opacity-75 mt-1">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* Achievement badge */}
        {options.type === "achievement" && options.achievement && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg">{options.achievement.icon}</span>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                options.achievement.rarity === "legendary" &&
                  "bg-gradient-to-r from-gigavibe-500 to-yellow-500",
                options.achievement.rarity === "epic" && "bg-purple-500",
                options.achievement.rarity === "rare" && "bg-blue-500",
                options.achievement.rarity === "common" && "bg-gray-500"
              )}
            >
              {options.achievement.rarity.toUpperCase()}
            </span>
          </div>
        )}

        {/* Action button */}
        {options.action && (
          <button
            onClick={options.action.onClick}
            className="mt-3 text-xs font-medium underline hover:no-underline transition-all"
          >
            {options.action.label}
          </button>
        )}
      </div>

      {/* Sparkle effect for achievements */}
      {options.type === "achievement" && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Enhanced Feedback Hook
export function useFeedback() {
  const { toast } = useToast();

  const showFeedback = (options: FeedbackOptions) => {
    return toast({
      duration:
        options.duration || (options.type === "loading" ? undefined : 5000),
      className: "p-0 bg-transparent border-none shadow-none",
      description: (
        <EnhancedToast
          options={options}
          onDismiss={() => {}} // Will be handled by toast system
        />
      ),
    });
  };

  // Convenience methods for common feedback types
  const success = (
    title: string,
    message?: string,
    context?: FeedbackContext
  ) => showFeedback({ type: "success", title, message, context });

  const error = (title: string, message?: string, context?: FeedbackContext) =>
    showFeedback({ type: "error", title, message, context });

  const warning = (
    title: string,
    message?: string,
    context?: FeedbackContext
  ) => showFeedback({ type: "warning", title, message, context });

  const info = (title: string, message?: string, context?: FeedbackContext) =>
    showFeedback({ type: "info", title, message, context });

  const loading = (title: string, message?: string, progress?: number) =>
    showFeedback({ type: "loading", title, message, progress });

  const achievement = (
    title: string,
    achievement: {
      icon: string;
      rarity: "common" | "rare" | "epic" | "legendary";
    },
    message?: string
  ) => showFeedback({ type: "achievement", title, achievement, message });

  const vocal = (title: string, message?: string) =>
    showFeedback({ type: "vocal", title, message, context: "recording" });

  const social = (title: string, message?: string, context?: FeedbackContext) =>
    showFeedback({
      type: "social",
      title,
      message,
      context: context || "sharing",
    });

  return {
    showFeedback,
    success,
    error,
    warning,
    info,
    loading,
    achievement,
    vocal,
    social,
  };
}

// Context-specific feedback helpers
export const FeedbackHelpers = {
  // Recording feedback
  recordingStarted: (feedback: ReturnType<typeof useFeedback>) =>
    feedback.vocal("Recording Started", "Speak clearly into your microphone"),

  recordingStopped: (feedback: ReturnType<typeof useFeedback>) =>
    feedback.success(
      "Recording Complete",
      "Processing your performance...",
      "recording"
    ),

  uploadProgress: (
    feedback: ReturnType<typeof useFeedback>,
    progress: number
  ) =>
    feedback.loading(
      "Uploading Performance",
      `${Math.round(progress)}% complete`,
      progress
    ),

  uploadComplete: (feedback: ReturnType<typeof useFeedback>) =>
    feedback.success(
      "Upload Successful",
      "Your performance is now live!",
      "upload"
    ),

  // Social feedback
  likeAdded: (feedback: ReturnType<typeof useFeedback>) =>
    feedback.social("Liked!", "Your support means everything"),

  shareComplete: (feedback: ReturnType<typeof useFeedback>) =>
    feedback.social("Shared Successfully", "Spread the GIGAVIBE!", "sharing"),

  // Achievement feedback
  firstPerformance: (feedback: ReturnType<typeof useFeedback>) =>
    feedback.achievement(
      "First Performance!",
      { icon: "🎤", rarity: "common" },
      "Welcome to GIGAVIBE!"
    ),

  viralHit: (feedback: ReturnType<typeof useFeedback>) =>
    feedback.achievement(
      "Viral Hit!",
      { icon: "🔥", rarity: "legendary" },
      "Your performance is trending!"
    ),

  // Error feedback
  networkError: (feedback: ReturnType<typeof useFeedback>) =>
    feedback.error(
      "Connection Lost",
      "Check your internet and try again",
      "general"
    ),

  uploadFailed: (feedback: ReturnType<typeof useFeedback>) =>
    feedback.error(
      "Upload Failed",
      "Something went wrong. Please try again.",
      "upload"
    ),

  // Market feedback
  coinPurchased: (feedback: ReturnType<typeof useFeedback>, amount: number) =>
    feedback.success(
      "Coins Purchased",
      `You bought ${amount} performance coins!`,
      "market"
    ),

  tradingSuccess: (feedback: ReturnType<typeof useFeedback>, profit: number) =>
    feedback.success(
      "Trade Complete",
      `You made ${profit} coins profit!`,
      "market"
    ),
};

// Progress feedback for multi-step processes
export function useProgressFeedback() {
  const { showFeedback } = useFeedback();
  const [currentToast, setCurrentToast] = useState<any>(null);

  const startProgress = (title: string, message?: string) => {
    const toast = showFeedback({
      type: "loading",
      title,
      message,
      progress: 0,
    });
    setCurrentToast(toast);
    return toast;
  };

  const updateProgress = (
    progress: number,
    title?: string,
    message?: string
  ) => {
    if (currentToast) {
      currentToast.update({
        type: "loading",
        title: title || "Processing...",
        message,
        progress,
      });
    }
  };

  const completeProgress = (
    title: string,
    message?: string,
    context?: FeedbackContext
  ) => {
    if (currentToast) {
      currentToast.dismiss();
    }
    showFeedback({
      type: "success",
      title,
      message,
      context,
    });
    setCurrentToast(null);
  };

  const failProgress = (
    title: string,
    message?: string,
    context?: FeedbackContext
  ) => {
    if (currentToast) {
      currentToast.dismiss();
    }
    showFeedback({
      type: "error",
      title,
      message,
      context,
    });
    setCurrentToast(null);
  };

  return {
    startProgress,
    updateProgress,
    completeProgress,
    failProgress,
  };
}
