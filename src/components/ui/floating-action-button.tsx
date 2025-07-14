"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Plus, X, Zap, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onRecordClick?: () => void;
  onQuickChallengeClick?: () => void;
  onSocialClick?: () => void;
  onLeaderboardClick?: () => void;
  className?: string;
  variant?: "record" | "menu";
}

export function FloatingActionButton({
  onRecordClick,
  onQuickChallengeClick,
  onSocialClick,
  onLeaderboardClick,
  className,
  variant = "record"
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === "record") {
    return (
      <motion.button
        className={cn(
          "fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-gigavibe-500 to-purple-600 rounded-full shadow-gigavibe-glow flex items-center justify-center z-50 touch-target",
          className
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRecordClick}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17,
          delay: 0.2 
        }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Mic className="w-6 h-6 text-white" />
        </motion.div>
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-gigavibe-500 to-purple-600 opacity-30"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    );
  }

  const menuItems = [
    {
      icon: Zap,
      label: "Quick Challenge",
      onClick: onQuickChallengeClick,
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      label: "Social",
      onClick: onSocialClick,
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Trophy,
      label: "Leaderboard",
      onClick: onLeaderboardClick,
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Menu Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-20 right-0 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg flex items-center justify-center touch-target bg-gradient-to-r",
                  item.color
                )}
                initial={{ scale: 0, x: 20 }}
                animate={{ scale: 1, x: 0 }}
                exit={{ scale: 0, x: 20 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 400,
                  damping: 17
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  item.onClick?.();
                  setIsExpanded(false);
                }}
              >
                <item.icon className="w-5 h-5 text-white" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className={cn(
          "w-16 h-16 bg-gradient-to-r from-gigavibe-500 to-purple-600 rounded-full shadow-gigavibe-glow flex items-center justify-center touch-target",
          className
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17,
          delay: 0.2 
        }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </motion.div>
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-gigavibe-500 to-purple-600 opacity-30"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
}

// Quick record button for specific contexts
export function QuickRecordButton({ 
  onRecord, 
  isRecording = false,
  className 
}: { 
  onRecord: () => void;
  isRecording?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl touch-target",
        isRecording 
          ? "bg-gradient-to-r from-red-500 to-pink-500" 
          : "bg-gradient-to-r from-gigavibe-500 to-purple-600",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onRecord}
      animate={isRecording ? { 
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 0 0 0 rgba(239, 68, 68, 0.7)",
          "0 0 0 20px rgba(239, 68, 68, 0)",
          "0 0 0 0 rgba(239, 68, 68, 0)"
        ]
      } : {}}
      transition={{ 
        duration: isRecording ? 1.5 : 0.2,
        repeat: isRecording ? Infinity : 0
      }}
    >
      <motion.div
        animate={{ 
          rotate: isRecording ? [0, 180, 360] : 0,
          scale: isRecording ? [1, 1.2, 1] : 1
        }}
        transition={{ 
          duration: 2,
          repeat: isRecording ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <Mic className="w-8 h-8 text-white" />
      </motion.div>
    </motion.button>
  );
}