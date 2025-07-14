"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Enhanced skeleton component
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "rectangular",
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-white/10 skeleton";

  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full aspect-square",
    rectangular: "rounded",
    rounded: "rounded-xl",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "skeleton",
    none: "",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      aria-hidden="true"
    />
  );
}

// Card skeleton for feed items
export function CardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-24 h-3" />
          <Skeleton variant="text" className="w-16 h-2" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-3/4 h-4" />
      <div className="flex justify-between">
        <Skeleton variant="text" className="w-12 h-3" />
        <Skeleton variant="text" className="w-12 h-3" />
        <Skeleton variant="text" className="w-12 h-3" />
      </div>
    </div>
  );
}

// Enhanced loading spinner
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gigavibe" | "minimal";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  if (variant === "gigavibe") {
    return (
      <div className={cn("relative", sizes[size], className)}>
        <motion.div
          className="w-full h-full border-4 border-gigavibe-500/30 border-t-gigavibe-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 w-full h-full border-2 border-gigavibe-300/20 border-b-gigavibe-300 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <motion.div
        className={cn(
          "border-2 border-white/20 border-t-white rounded-full",
          sizes[size],
          className
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    );
  }

  return (
    <motion.div
      className={cn(
        "border-4 border-purple-500/30 border-t-purple-500 rounded-full",
        sizes[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}

// Full screen loading with brand elements
interface FullScreenLoadingProps {
  message?: string;
  showLogo?: boolean;
}

export function FullScreenLoading({
  message = "Loading your experience...",
  showLogo = true,
}: FullScreenLoadingProps) {
  return (
    <div className="min-h-screen bg-gigavibe-mesh flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gigavibe-600/30 via-transparent to-transparent animate-pulse" />

      <div className="text-center space-y-8 relative z-10">
        {/* Enhanced loading animation */}
        <div className="relative">
          <LoadingSpinner size="lg" variant="gigavibe" />
        </div>

        {showLogo && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gigavibe-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              <h1 className="text-4xl font-bold tracking-wide">GIGAVIBE</h1>
              <p className="text-sm text-slate-300 font-medium tracking-widest mt-2">
                VOCAL TRAINING
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-400">
              <motion.div
                className="w-2 h-2 bg-gigavibe-400 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-medium">{message}</span>
              <motion.div
                className="w-2 h-2 bg-gigavibe-400 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Subtle sound wave animation */}
        <div className="flex items-center justify-center gap-1 opacity-60">
          {[...Array(5)].map((_, i) => {
            const heights = [15, 25, 20, 18, 22]; // Fixed heights to avoid hydration mismatch
            const scales = [1.5, 2.2, 1.8, 1.6, 2.0]; // Fixed scale values
            const durations = [1.2, 1.5, 1.1, 1.3, 1.4]; // Fixed durations

            return (
              <motion.div
                key={i}
                className="w-1 bg-gigavibe-400 rounded-full"
                style={{ height: heights[i] }}
                animate={{
                  scaleY: [1, scales[i], 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: durations[i],
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Loading state for lists/feeds
export function ListLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <CardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}
