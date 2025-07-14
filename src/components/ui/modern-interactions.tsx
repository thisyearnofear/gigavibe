"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { useHapticFeedback } from "@/hooks/usePerformanceOptimization";

// Swipeable Card Component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  swipeThreshold?: number;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = "",
  swipeThreshold = 100,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const { lightTap } = useHapticFeedback();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500) {
      lightTap();
      if (offset.x > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (
      Math.abs(offset.y) > swipeThreshold ||
      Math.abs(velocity.y) > 500
    ) {
      lightTap();
      if (offset.y < 0) {
        onSwipeUp?.();
      } else {
        onSwipeDown?.();
      }
    }
  };

  return (
    <motion.div
      className={`cursor-grab active:cursor-grabbing ${className}`}
      style={{ x, y, rotate, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
    >
      {children}
    </motion.div>
  );
}

// Pull to Refresh Component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  refreshThreshold = 80,
  className = "",
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { success } = useHapticFeedback();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      const touch = e.touches[0];
      containerRef.current.dataset.startY = touch.clientY.toString();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current?.dataset.startY) return;

    const touch = e.touches[0];
    const startY = parseInt(containerRef.current.dataset.startY);
    const currentY = touch.clientY;
    const distance = Math.max(0, currentY - startY);

    if (distance > 0 && containerRef.current.scrollTop === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, refreshThreshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      success();
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    if (containerRef.current) {
      delete containerRef.current.dataset.startY;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gigavibe-500/20 backdrop-blur-md"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height:
            pullDistance > 0 ? Math.min(pullDistance, refreshThreshold) : 0,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
        transition={{ duration: 0.1 }}
      >
        <motion.div
          className="text-white text-sm font-medium"
          animate={{
            rotate: pullDistance >= refreshThreshold ? 360 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {isRefreshing
            ? "Refreshing..."
            : pullDistance >= refreshThreshold
            ? "Release to refresh"
            : "Pull to refresh"}
        </motion.div>
      </motion.div>

      <motion.div
        style={{
          transform: `translateY(${pullDistance > 0 ? pullDistance : 0}px)`,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Long Press Component
interface LongPressProps {
  children: React.ReactNode;
  onLongPress: () => void;
  delay?: number;
  className?: string;
}

export function LongPress({
  children,
  onLongPress,
  delay = 500,
  className = "",
}: LongPressProps) {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { mediumTap } = useHapticFeedback();

  const handleStart = () => {
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      mediumTap();
      onLongPress();
      setIsPressed(false);
    }, delay);
  };

  const handleEnd = () => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={className}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

// Double Tap Component
interface DoubleTapProps {
  children: React.ReactNode;
  onDoubleTap: () => void;
  delay?: number;
  className?: string;
}

export function DoubleTap({
  children,
  onDoubleTap,
  delay = 300,
  className = "",
}: DoubleTapProps) {
  const [tapCount, setTapCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { success } = useHapticFeedback();

  const handleTap = () => {
    setTapCount((prev) => prev + 1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (tapCount + 1 >= 2) {
        success();
        onDoubleTap();
      }
      setTapCount(0);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={className}
      onClick={handleTap}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}
