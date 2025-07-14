"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GigavibeLogo {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  showText?: boolean;
}

export default function GigavibeLogo({
  className,
  size = "md",
  animated = true,
  showText = true,
}: GigavibeLogo) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  const LogoIcon = () => (
    <motion.div
      className={cn(
        "relative rounded-2xl bg-gradient-to-br from-gigavibe-500 via-purple-500 to-blue-500 shadow-gigavibe-glow",
        sizes[size]
      )}
      animate={
        animated
          ? {
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }
          : {}
      }
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gigavibe-500 via-purple-500 to-blue-500 blur-md opacity-50" />

      {/* Main logo container */}
      <div className="relative flex items-center justify-center h-full rounded-2xl bg-gradient-to-br from-gigavibe-500 via-purple-500 to-blue-500 overflow-hidden">
        {/* Sound wave pattern */}
        <svg
          viewBox="0 0 100 100"
          className="w-3/4 h-3/4 text-white"
          fill="currentColor"
        >
          {/* Central circle */}
          <circle cx="50" cy="50" r="8" className="animate-gigavibe-pulse" />

          {/* Sound waves */}
          <motion.path
            d="M35 40 Q50 25 65 40 Q50 55 35 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-80"
            animate={animated ? { pathLength: [0, 1, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path
            d="M30 35 Q50 15 70 35 Q50 65 30 35"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="opacity-60"
            animate={animated ? { pathLength: [0, 1, 0] } : {}}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.path
            d="M25 30 Q50 5 75 30 Q50 75 25 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="opacity-40"
            animate={animated ? { pathLength: [0, 1, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </svg>
      </div>
    </motion.div>
  );

  const LogoText = () => (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <span
        className={cn(
          "font-bold bg-gradient-to-r from-gigavibe-400 via-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wide",
          textSizes[size]
        )}
      >
        GIGAVIBE
      </span>
      <span className="text-xs text-gigavibe-300/60 font-medium tracking-widest">
        VOCAL
      </span>
    </motion.div>
  );

  if (showText) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <LogoIcon />
        <LogoText />
      </div>
    );
  }

  return <LogoIcon />;
}

// Compact version for small spaces
export function GigavibeLogoCompact({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  const sizes = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-lg bg-gradient-to-br from-gigavibe-500 to-purple-600 shadow-lg",
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gigavibe-500 to-purple-600 blur opacity-50" />
      <div className="relative flex items-center justify-center h-full">
        <svg
          viewBox="0 0 100 100"
          className="w-3/4 h-3/4 text-white"
          fill="currentColor"
        >
          <circle cx="50" cy="50" r="6" />
          <path
            d="M35 40 Q50 25 65 40 Q50 55 35 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-80"
          />
        </svg>
      </div>
    </motion.div>
  );
}
