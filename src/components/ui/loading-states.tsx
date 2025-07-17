"use client";

import { motion } from "framer-motion";
import {
  Loader2,
  Mic,
  Upload,
  Music,
  Heart,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Loading Context Types
export type LoadingContext =
  | "recording"
  | "uploading"
  | "processing"
  | "voting"
  | "sharing"
  | "trading"
  | "generating"
  | "analyzing"
  | "general";

interface LoadingStateProps {
  context?: LoadingContext;
  message?: string;
  progress?: number;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "pulse" | "skeleton" | "contextual";
}

// Context-aware loading icons and messages
const getContextualContent = (context: LoadingContext) => {
  switch (context) {
    case "recording":
      return {
        icon: Mic,
        defaultMessage: "Recording your performance...",
        color: "text-red-400",
        bgColor: "bg-red-500/20",
      };
    case "uploading":
      return {
        icon: Upload,
        defaultMessage: "Uploading to GIGAVIBE...",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
      };
    case "processing":
      return {
        icon: Zap,
        defaultMessage: "Processing with AI...",
        color: "text-gigavibe-400",
        bgColor: "bg-gigavibe-500/20",
      };
    case "voting":
      return {
        icon: Heart,
        defaultMessage: "Submitting your vote...",
        color: "text-pink-400",
        bgColor: "bg-pink-500/20",
      };
    case "sharing":
      return {
        icon: Star,
        defaultMessage: "Sharing your performance...",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
      };
    case "trading":
      return {
        icon: Trophy,
        defaultMessage: "Processing trade...",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
      };
    case "generating":
      return {
        icon: Music,
        defaultMessage: "Generating music...",
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
      };
    case "analyzing":
      return {
        icon: Zap,
        defaultMessage: "Analyzing performance...",
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
      };
    default:
      return {
        icon: Loader2,
        defaultMessage: "Loading...",
        color: "text-slate-400",
        bgColor: "bg-slate-500/20",
      };
  }
};

// Main Loading State Component
export function LoadingState({
  context = "general",
  message,
  progress,
  size = "md",
  variant = "contextual",
}: LoadingStateProps) {
  const contextContent = getContextualContent(context);
  const displayMessage = message || contextContent.defaultMessage;

  const sizes = {
    sm: { icon: "w-4 h-4", container: "p-4", text: "text-sm" },
    md: { icon: "w-6 h-6", container: "p-6", text: "text-base" },
    lg: { icon: "w-8 h-8", container: "p-8", text: "text-lg" },
  };

  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center">
        <Loader2
          className={cn("animate-spin", sizes[size].icon, contextContent.color)}
        />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={cn(
          "rounded-lg",
          sizes[size].container,
          contextContent.bgColor
        )}
      >
        <div className="flex items-center gap-3">
          <contextContent.icon
            className={cn(sizes[size].icon, contextContent.color)}
          />
          <span className={cn(sizes[size].text, contextContent.color)}>
            {displayMessage}
          </span>
        </div>
      </motion.div>
    );
  }

  if (variant === "skeleton") {
    return <SkeletonLoader context={context} />;
  }

  // Contextual variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center text-center space-y-4 rounded-2xl backdrop-blur-xl border",
        sizes[size].container,
        contextContent.bgColor,
        "border-white/10"
      )}
    >
      {/* Animated Icon */}
      <motion.div
        animate={{
          rotate: context === "processing" || context === "analyzing" ? 360 : 0,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        }}
        className={cn(
          "p-4 rounded-full",
          contextContent.bgColor,
          "border border-white/20"
        )}
      >
        <contextContent.icon
          className={cn(sizes[size].icon, contextContent.color)}
        />
      </motion.div>

      {/* Message */}
      <div className="space-y-2">
        <p
          className={cn("font-medium", sizes[size].text, contextContent.color)}
        >
          {displayMessage}
        </p>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="w-full max-w-xs">
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className={cn(
                  "h-2 rounded-full",
                  `bg-current ${contextContent.color}`
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs opacity-75 mt-1">{Math.round(progress)}%</p>
          </div>
        )}
      </div>

      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full",
              contextContent.color.replace("text-", "bg-")
            )}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Skeleton Loading Components
interface SkeletonLoaderProps {
  context: LoadingContext;
}

function SkeletonLoader({ context }: SkeletonLoaderProps) {
  if (context === "recording") {
    return <RecordingSkeleton />;
  }

  if (context === "uploading") {
    return <UploadSkeleton />;
  }

  if (context === "voting") {
    return <VotingSkeleton />;
  }

  return <DefaultSkeleton />;
}

function RecordingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-center">
        <motion.div
          className="w-20 h-20 rounded-full bg-red-500/20 border-4 border-red-500/30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded animate-pulse" />
        <div className="h-3 bg-slate-700 rounded w-3/4 mx-auto animate-pulse" />
      </div>
    </div>
  );
}

function UploadSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-700 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700 rounded animate-pulse" />
              <div className="h-3 bg-slate-700 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VotingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-center space-x-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-8 h-8 bg-yellow-500/20 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
          />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded animate-pulse" />
        <div className="h-3 bg-slate-700 rounded w-1/2 mx-auto animate-pulse" />
      </div>
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-700 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded animate-pulse" />
          <div className="h-3 bg-slate-700 rounded w-3/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Inline Loading Components
export function InlineLoader({
  context = "general",
  size = "sm",
}: {
  context?: LoadingContext;
  size?: "sm" | "md" | "lg";
}) {
  const contextContent = getContextualContent(context);
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <contextContent.icon className={cn(sizes[size], contextContent.color)} />
    </motion.div>
  );
}

// Button Loading State
export function ButtonLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return <Loader2 className={cn("animate-spin", sizes[size])} />;
}

// Full Page Loading
export function FullPageLoader({
  context = "general",
  message,
}: {
  context?: LoadingContext;
  message?: string;
}) {
  return (
    <div className="min-h-screen bg-gigavibe-mesh flex items-center justify-center p-6">
      <LoadingState
        context={context}
        message={message}
        size="lg"
        variant="contextual"
      />
    </div>
  );
}

// Loading Overlay
export function LoadingOverlay({
  context = "general",
  message,
  progress,
}: {
  context?: LoadingContext;
  message?: string;
  progress?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <LoadingState
        context={context}
        message={message}
        progress={progress}
        size="lg"
        variant="contextual"
      />
    </motion.div>
  );
}
