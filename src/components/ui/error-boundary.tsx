"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
  variant?: "default" | "minimal" | "full";
}

export function ErrorState({
  title = "Something went wrong",
  message = "We're having trouble loading this content. Please try again.",
  onRetry,
  onGoHome,
  showRetry = true,
  showHome = false,
  variant = "default"
}: ErrorStateProps) {
  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-400">{message}</p>
          {showRetry && onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className="min-h-screen bg-gigavibe-mesh flex items-center justify-center p-6">
        <motion.div 
          className="text-center space-y-6 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-slate-300">{message}</p>
          </div>

          <div className="flex gap-3 justify-center">
            {showRetry && onRetry && (
              <Button 
                variant="error" 
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            {showHome && onGoHome && (
              <Button 
                variant="outline" 
                onClick={onGoHome}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-slate-400 max-w-sm mx-auto">{message}</p>
        </div>

        <div className="flex gap-3 justify-center">
          {showRetry && onRetry && (
            <Button 
              variant="error" 
              onClick={onRetry}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          {showHome && onGoHome && (
            <Button 
              variant="outline" 
              onClick={onGoHome}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Empty state component
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title = "Nothing here yet",
  message = "Be the first to create something amazing!",
  icon = "👀",
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <motion.div 
          className="text-6xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {icon}
        </motion.div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-slate-400 max-w-sm mx-auto">{message}</p>
        </div>

        {action && (
          <Button 
            variant="gigavibe" 
            onClick={action.onClick}
            className="mt-6"
          >
            {action.label}
          </Button>
        )}
      </motion.div>
    </div>
  );
}

// Network error specific component
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Connection Problem"
      message="Check your internet connection and try again."
      onRetry={onRetry}
      variant="default"
    />
  );
}

// Timeout error component
export function TimeoutError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Request Timed Out"
      message="This is taking longer than expected. Please try again."
      onRetry={onRetry}
      variant="default"
    />
  );
}