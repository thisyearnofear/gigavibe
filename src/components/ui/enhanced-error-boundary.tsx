"use client";

import React, { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Wifi,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

// Error Types
export type ErrorType =
  | "network"
  | "timeout"
  | "auth"
  | "permission"
  | "validation"
  | "server"
  | "client"
  | "unknown";

export type ErrorContext =
  | "recording"
  | "upload"
  | "voting"
  | "sharing"
  | "trading"
  | "auth"
  | "general";

interface ErrorInfo {
  type: ErrorType;
  context: ErrorContext;
  message: string;
  details?: string;
  code?: string | number;
  retryable: boolean;
  timestamp: Date;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: (errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: ErrorContext;
  showDetails?: boolean;
}

// Error classification utility
function classifyError(
  error: Error,
  context: ErrorContext = "general"
): ErrorInfo {
  const message = error.message.toLowerCase();
  const timestamp = new Date();

  // Network errors
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("connection")
  ) {
    return {
      type: "network",
      context,
      message: "Connection problem detected",
      details: "Please check your internet connection and try again.",
      retryable: true,
      timestamp,
    };
  }

  // Timeout errors
  if (message.includes("timeout") || message.includes("aborted")) {
    return {
      type: "timeout",
      context,
      message: "Request timed out",
      details: "The operation took too long to complete.",
      retryable: true,
      timestamp,
    };
  }

  // Auth errors
  if (
    message.includes("unauthorized") ||
    message.includes("auth") ||
    message.includes("token")
  ) {
    return {
      type: "auth",
      context,
      message: "Authentication required",
      details: "Please sign in to continue.",
      retryable: false,
      timestamp,
    };
  }

  // Permission errors
  if (
    message.includes("permission") ||
    message.includes("forbidden") ||
    message.includes("access")
  ) {
    return {
      type: "permission",
      context,
      message: "Access denied",
      details: "You don't have permission to perform this action.",
      retryable: false,
      timestamp,
    };
  }

  // Validation errors
  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required")
  ) {
    return {
      type: "validation",
      context,
      message: "Invalid input",
      details: "Please check your input and try again.",
      retryable: true,
      timestamp,
    };
  }

  // Server errors
  if (
    message.includes("server") ||
    message.includes("500") ||
    message.includes("internal")
  ) {
    return {
      type: "server",
      context,
      message: "Server error",
      details: "Something went wrong on our end. Please try again later.",
      retryable: true,
      timestamp,
    };
  }

  // Default to client error
  return {
    type: "client",
    context,
    message: "Something went wrong",
    details: error.message || "An unexpected error occurred.",
    retryable: true,
    timestamp,
  };
}

// Get contextual error styling
function getErrorStyles(type: ErrorType) {
  switch (type) {
    case "network":
      return {
        icon: Wifi,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-400/30",
      };
    case "timeout":
      return {
        icon: Clock,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-400/30",
      };
    case "auth":
      return {
        icon: Shield,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-400/30",
      };
    case "permission":
      return {
        icon: Shield,
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
        borderColor: "border-orange-400/30",
      };
    case "validation":
      return {
        icon: AlertTriangle,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-400/30",
      };
    case "server":
      return {
        icon: Zap,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-400/30",
      };
    default:
      return {
        icon: Bug,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-400/30",
      };
  }
}

// Enhanced Error Display Component
interface ErrorDisplayProps {
  errorInfo: ErrorInfo;
  onRetry: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  variant?: "minimal" | "default" | "full";
}

function ErrorDisplay({
  errorInfo,
  onRetry,
  onGoHome,
  showDetails = false,
  variant = "default",
}: ErrorDisplayProps) {
  const styles = getErrorStyles(errorInfo.type);
  const Icon = styles.icon;

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Icon className={cn("w-8 h-8 mx-auto", styles.color)} />
          <div>
            <p className={cn("font-medium text-sm", styles.color)}>
              {errorInfo.message}
            </p>
            {errorInfo.details && (
              <p className="text-xs text-slate-400 mt-1">{errorInfo.details}</p>
            )}
          </div>
          {errorInfo.retryable && (
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
            className={cn(
              "w-20 h-20 rounded-full mx-auto flex items-center justify-center",
              styles.bgColor,
              styles.borderColor,
              "border-2"
            )}
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className={cn("w-10 h-10", styles.color)} />
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">
              {errorInfo.message}
            </h2>
            <p className="text-slate-300">{errorInfo.details}</p>

            {showDetails && errorInfo.code && (
              <div
                className={cn(
                  "text-xs p-3 rounded-lg font-mono",
                  styles.bgColor,
                  styles.borderColor,
                  "border"
                )}
              >
                Error Code: {errorInfo.code}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            {errorInfo.retryable && (
              <Button variant="error" onClick={onRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            {onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="text-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
            styles.bgColor,
            styles.borderColor,
            "border-2"
          )}
        >
          <Icon className={cn("w-8 h-8", styles.color)} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {errorInfo.message}
          </h3>
          <p className="text-slate-400 max-w-sm mx-auto">{errorInfo.details}</p>

          {showDetails && (
            <details className="mt-4">
              <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-400">
                Technical Details
              </summary>
              <div
                className={cn(
                  "mt-2 p-3 rounded-lg text-xs font-mono text-left",
                  styles.bgColor,
                  styles.borderColor,
                  "border"
                )}
              >
                <p>Type: {errorInfo.type}</p>
                <p>Context: {errorInfo.context}</p>
                <p>Time: {errorInfo.timestamp.toLocaleString()}</p>
                {errorInfo.code && <p>Code: {errorInfo.code}</p>}
              </div>
            </details>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          {errorInfo.retryable && (
            <Button variant="error" onClick={onRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button variant="outline" onClick={onGoHome} className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Enhanced Error Boundary Class Component
export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return {
      hasError: true,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const classifiedError = classifyError(error, this.props.context);

    this.setState({
      errorInfo: classifiedError,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error("Enhanced Error Boundary caught an error:", {
      error,
      errorInfo,
      classified: classifiedError,
      errorId: this.state.errorId,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError && this.state.errorInfo) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.errorInfo, this.handleRetry);
      }

      // Default error display
      return (
        <ErrorDisplay
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          showDetails={this.props.showDetails}
          variant="default"
        />
      );
    }

    return this.props.children;
  }
}

// Hook for programmatic error handling
export function useErrorHandler(context: ErrorContext = "general") {
  const handleError = (
    error: Error | string,
    options?: {
      type?: ErrorType;
      retryable?: boolean;
      onRetry?: () => void;
    }
  ) => {
    const errorObj = typeof error === "string" ? new Error(error) : error;
    const errorInfo = classifyError(errorObj, context);

    if (options?.type) {
      errorInfo.type = options.type;
    }

    if (options?.retryable !== undefined) {
      errorInfo.retryable = options.retryable;
    }

    // You could integrate this with your feedback system
    console.error("Error handled:", errorInfo);

    return errorInfo;
  };

  return { handleError };
}

// Specific error components for common scenarios
export function NetworkErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary context="general">{children}</EnhancedErrorBoundary>
  );
}

export function RecordingErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary context="recording" showDetails>
      {children}
    </EnhancedErrorBoundary>
  );
}

export function UploadErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary context="upload">{children}</EnhancedErrorBoundary>
  );
}

export function TradingErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary context="trading" showDetails>
      {children}
    </EnhancedErrorBoundary>
  );
}
