"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Star, Zap, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";

// Achievement Badge Component
interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked?: boolean;
  progress?: number;
  maxProgress?: number;
}

export function AchievementBadge({
  title,
  description,
  icon,
  rarity,
  unlocked = false,
  progress = 0,
  maxProgress = 100
}: AchievementBadgeProps) {
  const rarityColors = {
    common: "from-gray-500 to-gray-600",
    rare: "from-blue-500 to-blue-600", 
    epic: "from-purple-500 to-purple-600",
    legendary: "from-yellow-500 to-orange-600"
  };

  const rarityGlow = {
    common: "shadow-gray-500/25",
    rare: "shadow-blue-500/25",
    epic: "shadow-purple-500/25", 
    legendary: "shadow-yellow-500/25"
  };

  return (
    <motion.div
      className={cn(
        "relative p-4 rounded-xl border backdrop-blur-md transition-all duration-300",
        unlocked 
          ? `bg-gradient-to-br ${rarityColors[rarity]} ${rarityGlow[rarity]} shadow-lg border-white/20` 
          : "bg-gray-800/50 border-gray-700/50"
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Rarity indicator */}
      <div className={cn(
        "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold",
        unlocked ? "bg-white/20 text-white" : "bg-gray-700 text-gray-400"
      )}>
        {rarity.toUpperCase()}
      </div>

      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto",
        unlocked ? "bg-white/20" : "bg-gray-700/50"
      )}>
        <div className={cn(
          "text-xl",
          unlocked ? "text-white" : "text-gray-500"
        )}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className={cn(
          "font-bold text-sm mb-1",
          unlocked ? "text-white" : "text-gray-400"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-xs leading-relaxed",
          unlocked ? "text-white/80" : "text-gray-500"
        )}>
          {description}
        </p>

        {/* Progress bar for locked achievements */}
        {!unlocked && maxProgress > 0 && (
          <div className="mt-3">
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gigavibe-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${(progress / maxProgress) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {progress}/{maxProgress}
            </p>
          </div>
        )}
      </div>

      {/* Unlock animation */}
      {unlocked && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1] }}
          transition={{ duration: 1.5 }}
        />
      )}
    </motion.div>
  );
}

// Streak Counter Component
interface StreakCounterProps {
  count: number;
  maxStreak: number;
  className?: string;
}

export function StreakCounter({ count, maxStreak, className }: StreakCounterProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-full px-4 py-2 border border-orange-500/30",
        className
      )}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: count > 0 ? [1, 1.2, 1] : 1
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Flame className="w-5 h-5 text-orange-400" />
      </motion.div>
      <div className="text-white">
        <span className="font-bold text-lg">{count}</span>
        <span className="text-xs text-orange-200 ml-1">day streak</span>
      </div>
      {count > 0 && (
        <motion.div
          className="text-xs text-orange-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Best: {maxStreak}
        </motion.div>
      )}
    </motion.div>
  );
}

// XP Progress Bar
interface XPProgressProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  className?: string;
}

export function XPProgress({ currentXP, nextLevelXP, level, className }: XPProgressProps) {
  const progress = (currentXP / nextLevelXP) * 100;

  return (
    <motion.div
      className={cn("space-y-2", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-gigavibe-300 font-medium">Level {level}</span>
        <span className="text-gray-400">{currentXP}/{nextLevelXP} XP</span>
      </div>
      
      <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-gigavibe-500 via-purple-500 to-blue-500 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        
        {/* Level up indicator */}
        {progress >= 100 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}

// Daily Challenge Card
interface DailyChallengeProps {
  title: string;
  description: string;
  reward: string;
  progress: number;
  maxProgress: number;
  completed?: boolean;
  timeLeft?: string;
}

export function DailyChallenge({
  title,
  description,
  reward,
  progress,
  maxProgress,
  completed = false,
  timeLeft = "23h 45m"
}: DailyChallengeProps) {
  return (
    <motion.div
      className={cn(
        "p-4 rounded-xl backdrop-blur-md border transition-all duration-300",
        completed 
          ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
          : "bg-gradient-to-br from-gigavibe-500/10 to-purple-500/10 border-gigavibe-500/30"
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className={cn(
            "w-5 h-5",
            completed ? "text-green-400" : "text-gigavibe-400"
          )} />
          <h3 className="font-bold text-white text-sm">{title}</h3>
        </div>
        <div className="text-xs text-gray-400">{timeLeft}</div>
      </div>

      <p className="text-sm text-gray-300 mb-3 leading-relaxed">
        {description}
      </p>

      {/* Progress */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{progress}/{maxProgress}</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              completed 
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-gigavibe-500 to-purple-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${(progress / maxProgress) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Reward */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400 font-medium">{reward}</span>
        </div>
        {completed && (
          <motion.div
            className="text-green-400 text-sm font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            COMPLETED!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Leaderboard Position Indicator
interface LeaderboardPositionProps {
  position: number;
  totalUsers: number;
  change?: number; // +/- from last period
  className?: string;
}

export function LeaderboardPosition({ 
  position, 
  totalUsers, 
  change = 0,
  className 
}: LeaderboardPositionProps) {
  const isTop10 = position <= 10;
  const isTop100 = position <= 100;

  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl backdrop-blur-md border",
        isTop10 
          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
          : isTop100
          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30"
          : "bg-gray-800/50 border-gray-700/50",
        className
      )}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center font-bold",
        isTop10 
          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
          : isTop100
          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          : "bg-gray-700 text-gray-300"
      )}>
        #{position}
      </div>

      <div className="flex-1">
        <div className="text-white font-medium">
          Rank {position.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">
          of {totalUsers.toLocaleString()} users
        </div>
      </div>

      {change !== 0 && (
        <motion.div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            change > 0 ? "text-green-400" : "text-red-400"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {change > 0 ? "↗" : "↘"}
          {Math.abs(change)}
        </motion.div>
      )}
    </motion.div>
  );
}