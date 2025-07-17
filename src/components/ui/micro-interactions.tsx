"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Heart, Star, Zap, Trophy, Music, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

// Animated Like Button with Burst Effect
interface AnimatedLikeProps {
  isLiked: boolean;
  onToggle: () => void;
  count: number;
  className?: string;
}

export function AnimatedLike({ isLiked, onToggle, count, className }: AnimatedLikeProps) {
  const [showBurst, setShowBurst] = useState(false);

  const handleClick = () => {
    if (!isLiked) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }
    onToggle();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn("relative flex items-center gap-2 group", className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        <motion.div
          animate={{
            scale: isLiked ? [1, 1.3, 1] : 1,
            rotate: isLiked ? [0, 15, -15, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-400"
            )}
          />
        </motion.div>

        {/* Burst effect */}
        {showBurst && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-red-500 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * 60) * Math.PI / 180) * 20,
                  y: Math.sin((i * 60) * Math.PI / 180) * 20,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </div>

      <motion.span
        animate={{ scale: isLiked ? [1, 1.1, 1] : 1 }}
        className={cn(
          "font-medium transition-colors",
          isLiked ? "text-red-500" : "text-gray-400"
        )}
      >
        {count}
      </motion.span>
    </motion.button>
  );
}

// Star Rating with Smooth Animations
interface AnimatedStarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function AnimatedStarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showValue = false,
}: AnimatedStarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleStarClick = (starRating: number) => {
    if (readonly || !onRatingChange) return;
    
    setIsAnimating(true);
    onRatingChange(starRating);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= (hoverRating || rating);
          
          return (
            <motion.button
              key={index}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => !readonly && setHoverRating(starValue)}
              onMouseLeave={() => !readonly && setHoverRating(0)}
              className={cn(
                "transition-colors",
                readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
              )}
              whileHover={readonly ? {} : { scale: 1.1 }}
              whileTap={readonly ? {} : { scale: 0.9 }}
              animate={{
                rotate: isAnimating && starValue <= rating ? [0, 360] : 0,
                scale: isAnimating && starValue <= rating ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Star
                className={cn(
                  sizes[size],
                  isActive
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400"
                )}
              />
            </motion.button>
          );
        })}
      </div>
      
      {showValue && (
        <motion.span
          key={rating}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-medium text-gray-300"
        >
          {rating.toFixed(1)}
        </motion.span>
      )}
    </div>
  );
}

// Recording Button with Pulse Animation
interface RecordingButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RecordingButton({
  isRecording,
  onToggle,
  disabled = false,
  size = "md",
}: RecordingButtonProps) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <motion.button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative rounded-full flex items-center justify-center transition-all",
        sizes[size],
        isRecording
          ? "bg-red-500 shadow-lg shadow-red-500/50"
          : "bg-gradient-to-r from-gigavibe-500 to-purple-500 shadow-lg shadow-gigavibe-500/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        boxShadow: isRecording
          ? [
              "0 0 0 0 rgba(239, 68, 68, 0.7)",
              "0 0 0 10px rgba(239, 68, 68, 0)",
              "0 0 0 0 rgba(239, 68, 68, 0)",
            ]
          : "0 0 20px rgba(212, 70, 239, 0.5)",
      }}
      transition={{
        duration: isRecording ? 1.5 : 0.3,
        repeat: isRecording ? Infinity : 0,
      }}
    >
      <motion.div
        animate={{ scale: isRecording ? [1, 0.8, 1] : 1 }}
        transition={{
          duration: 1,
          repeat: isRecording ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <Mic className={cn(iconSizes[size], "text-white")} />
      </motion.div>

      {/* Recording indicator */}
      {isRecording && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

// Achievement Badge with Entrance Animation
interface AchievementBadgeProps {
  achievement: {
    icon: string;
    title: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
  delay?: number;
}

export function AchievementBadge({ achievement, delay = 0 }: AchievementBadgeProps) {
  const rarityColors = {
    common: "from-gray-500 to-gray-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-purple-600",
    legendary: "from-gigavibe-500 to-yellow-500",
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay,
      }}
      className={cn(
        "relative inline-flex items-center gap-2 px-3 py-2 rounded-full text-white font-medium text-sm bg-gradient-to-r",
        rarityColors[achievement.rarity]
      )}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-lg"
      >
        {achievement.icon}
      </motion.span>
      <span>{achievement.title}</span>
      
      {/* Sparkle effect for legendary */}
      {achievement.rarity === "legendary" && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {Array.from({ length: 8 }).map((_, i) => (
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

// Progress Ring with Smooth Animation
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d446ef" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-2xl font-bold text-white">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
}
