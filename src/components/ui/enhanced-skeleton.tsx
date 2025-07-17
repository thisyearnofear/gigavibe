"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

// Enhanced Skeleton with shimmer effect
interface EnhancedSkeletonProps {
  className?: string;
  variant?: "default" | "shimmer" | "pulse" | "wave";
  speed?: "slow" | "normal" | "fast";
  children?: React.ReactNode;
}

export function EnhancedSkeleton({
  className,
  variant = "shimmer",
  speed = "normal",
  children,
}: EnhancedSkeletonProps) {
  const speedConfig = {
    slow: 2,
    normal: 1.5,
    fast: 1,
  };

  if (variant === "default") {
    return <Skeleton className={className} />;
  }

  if (variant === "pulse") {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: speedConfig[speed],
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn("bg-slate-700 rounded-md", className)}
      >
        {children}
      </motion.div>
    );
  }

  if (variant === "wave") {
    return (
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: speedConfig[speed],
          repeat: Infinity,
          ease: "linear",
        }}
        className={cn(
          "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] rounded-md",
          className
        )}
        style={{
          backgroundSize: "200% 100%",
        }}
      >
        {children}
      </motion.div>
    );
  }

  // Shimmer variant (default)
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-700 rounded-md",
        className
      )}
    >
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: speedConfig[speed],
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"
        style={{ width: "100%" }}
      />
      {children}
    </div>
  );
}

// GIGAVIBE-specific skeleton components
export function PerformanceCardSkeleton() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <EnhancedSkeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <EnhancedSkeleton className="h-4 w-32" />
          <EnhancedSkeleton className="h-3 w-24" />
        </div>
        <EnhancedSkeleton className="w-8 h-8 rounded-lg" />
      </div>

      {/* Waveform */}
      <div className="mb-4">
        <EnhancedSkeleton className="h-20 w-full rounded-lg" variant="wave" />
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <EnhancedSkeleton className="w-4 h-4 rounded" />
            <EnhancedSkeleton className="h-3 w-8" />
          </div>
          <div className="flex items-center gap-2">
            <EnhancedSkeleton className="w-4 h-4 rounded" />
            <EnhancedSkeleton className="h-3 w-8" />
          </div>
        </div>
        <EnhancedSkeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <EnhancedSkeleton className="h-10 flex-1 rounded-xl" />
        <EnhancedSkeleton className="h-10 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function RecordingInterfaceSkeleton() {
  return (
    <div className="text-center space-y-6 p-8">
      {/* Recording button */}
      <div className="flex justify-center">
        <EnhancedSkeleton
          className="w-24 h-24 rounded-full"
          variant="pulse"
          speed="slow"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <EnhancedSkeleton className="h-6 w-48 mx-auto" />
        <EnhancedSkeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Waveform visualization */}
      <div className="flex justify-center items-end gap-1 h-16">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: [8, Math.random() * 40 + 8, 8],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            className="w-2 bg-gigavibe-500/30 rounded-full"
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <EnhancedSkeleton className="h-12 w-24 rounded-xl" />
        <EnhancedSkeleton className="h-12 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function VotingInterfaceSkeleton() {
  return (
    <div className="space-y-6">
      {/* Performance being voted on */}
      <PerformanceCardSkeleton />

      {/* Voting controls */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="text-center space-y-4">
          <EnhancedSkeleton className="h-6 w-40 mx-auto" />

          {/* Star rating */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <EnhancedSkeleton
                key={i}
                className="w-8 h-8 rounded"
                variant="pulse"
                speed="fast"
              />
            ))}
          </div>

          <EnhancedSkeleton className="h-12 w-32 mx-auto rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function MarketDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center gap-3">
              <EnhancedSkeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <EnhancedSkeleton className="h-4 w-20" />
                <EnhancedSkeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="space-y-4">
          <EnhancedSkeleton className="h-6 w-32" />
          <EnhancedSkeleton className="h-64 w-full rounded-lg" variant="wave" />
        </div>
      </div>

      {/* Performance list */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PerformanceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function DiscoveryFeedSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <EnhancedSkeleton key={i} className="h-10 w-20 rounded-xl" />
        ))}
      </div>

      {/* Feed items */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <PerformanceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Optimistic update wrapper
interface OptimisticWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  skeleton?: React.ReactNode;
  optimisticData?: any;
}

export function OptimisticWrapper({
  children,
  isLoading = false,
  skeleton,
  optimisticData,
}: OptimisticWrapperProps) {
  if (isLoading && !optimisticData) {
    return skeleton || <EnhancedSkeleton className="h-20 w-full" />;
  }

  return <>{children}</>;
}

// Skeleton provider for consistent loading states
interface SkeletonProviderProps {
  children: React.ReactNode;
  loading?: boolean;
  variant?: "shimmer" | "pulse" | "wave";
  speed?: "slow" | "normal" | "fast";
}

export function SkeletonProvider({
  children,
  loading = false,
  variant = "shimmer",
  speed = "normal",
}: SkeletonProviderProps) {
  if (loading) {
    return <div className="animate-pulse">{children}</div>;
  }

  return <>{children}</>;
}

// Intersection observer skeleton for lazy loading
export function LazyLoadSkeleton({
  children,
  skeleton,
  threshold = 0.1,
}: {
  children: React.ReactNode;
  skeleton: React.ReactNode;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return <div ref={setRef}>{isVisible ? children : skeleton}</div>;
}
