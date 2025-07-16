"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OnboardingTriggerProps {
  variant?: "icon" | "button" | "text";
  size?: "default" | "sm" | "lg" | "icon" | "xl";
  className?: string;
}

/**
 * Component that allows users to restart onboarding
 * Can be placed anywhere in the app for easy access
 */
export default function OnboardingTrigger({
  variant = "icon",
  size = "default",
  className = "",
}: OnboardingTriggerProps) {
  const { startOnboarding, hasCompletedOnboarding } = useOnboardingFlow();

  const handleClick = () => {
    startOnboarding();
  };

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleClick}
                variant="ghost"
                size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
                className={`text-gray-400 hover:text-white ${className}`}
              >
                {hasCompletedOnboarding ? (
                  <RotateCcw className="w-4 h-4" />
                ) : (
                  <HelpCircle className="w-4 h-4" />
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hasCompletedOnboarding ? "Restart Tour" : "Take Tour"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "button") {
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        size={size}
        className={`border-purple-500 text-purple-400 hover:bg-purple-500/20 ${className}`}
      >
        {hasCompletedOnboarding ? (
          <>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Tour
          </>
        ) : (
          <>
            <HelpCircle className="w-4 h-4 mr-2" />
            Take Tour
          </>
        )}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`text-purple-400 hover:text-purple-300 underline text-sm ${className}`}
    >
      {hasCompletedOnboarding ? "Restart tour" : "Take the tour"}
    </button>
  );
}
