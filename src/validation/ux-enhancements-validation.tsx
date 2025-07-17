/**
 * UX Enhancements Validation
 *
 * This file provides validation examples and manual testing scenarios
 * for all UX enhancements without requiring external testing libraries.
 */

import React, { useState, useEffect } from "react";
import { useFeedback, FeedbackHelpers } from "../components/ui/feedback-system";
import { LoadingState, InlineLoader } from "../components/ui/loading-states";
import { EnhancedErrorBoundary } from "../components/ui/enhanced-error-boundary";
import {
  SmartTooltip,
  ContextualHelp,
  FeatureSpotlight,
} from "../components/ui/smart-guidance";
import {
  AnimatedLike,
  AnimatedStarRating,
  RecordingButton,
  AchievementBadge,
} from "../components/ui/micro-interactions";
import {
  EnhancedSkeleton,
  PerformanceCardSkeleton,
  RecordingInterfaceSkeleton,
} from "../components/ui/enhanced-skeleton";

// Validation Component for Feedback System
export function FeedbackValidation() {
  const feedback = useFeedback();
  const [isLoading, setIsLoading] = useState(false);

  const testSuccess = () => {
    feedback.success("Success Test", "This is a success message with context");
  };

  const testError = () => {
    feedback.error("Error Test", "This is an error message with retry option");
  };

  const testWarning = () => {
    feedback.warning("Warning Test", "This is a warning message");
  };

  const testInfo = () => {
    feedback.info("Info Test", "This is an informational message");
  };

  const testLoading = async () => {
    setIsLoading(true);
    const loadingToast = feedback.loading(
      "Processing",
      "Please wait while we process your request..."
    );

    // Simulate async operation
    setTimeout(() => {
      loadingToast.dismiss();
      feedback.success("Complete", "Operation completed successfully!");
      setIsLoading(false);
    }, 3000);
  };

  const testProgress = () => {
    let progress = 0;
    const progressToast = feedback.loading(
      "Uploading",
      "Uploading your performance...",
      progress
    );

    const interval = setInterval(() => {
      progress += 10;

      if (progress >= 100) {
        clearInterval(interval);
        progressToast.dismiss();
        feedback.success(
          "Upload Complete",
          "Your performance has been uploaded!"
        );
      }
    }, 200);
  };

  const testAchievement = () => {
    feedback.achievement(
      "Level Up!",
      { icon: "🏆", rarity: "epic" },
      "You've reached Level 5 in Vocal Training!"
    );
  };

  const testContextualFeedback = () => {
    FeedbackHelpers.likeAdded(feedback);
    setTimeout(() => FeedbackHelpers.shareComplete(feedback), 1000);
    setTimeout(() => FeedbackHelpers.uploadComplete(feedback), 2000);
    setTimeout(() => FeedbackHelpers.tradingSuccess(feedback, 50), 3000);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Feedback System Validation</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={testSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Success
        </button>

        <button
          onClick={testError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Error
        </button>

        <button
          onClick={testWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Test Warning
        </button>

        <button
          onClick={testInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Info
        </button>

        <button
          onClick={testLoading}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Loading
        </button>

        <button
          onClick={testProgress}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Test Progress
        </button>

        <button
          onClick={testAchievement}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
        >
          Test Achievement
        </button>

        <button
          onClick={testContextualFeedback}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Test Contextual
        </button>
      </div>
    </div>
  );
}

// Validation Component for Loading States
export function LoadingStatesValidation() {
  const [loadingStates, setLoadingStates] = useState({
    recording: false,
    uploading: false,
    voting: false,
    trading: false,
  });

  const toggleLoading = (context: keyof typeof loadingStates) => {
    setLoadingStates((prev) => ({
      ...prev,
      [context]: !prev[context],
    }));
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Loading States Validation</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <button
            onClick={() => toggleLoading("recording")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-2"
          >
            Toggle Recording Loading
          </button>
          {loadingStates.recording && (
            <LoadingState
              context="recording"
              message="Recording your performance..."
            />
          )}
        </div>

        <div>
          <button
            onClick={() => toggleLoading("uploading")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
          >
            Toggle Upload Loading
          </button>
          {loadingStates.uploading && (
            <LoadingState
              context="uploading"
              message="Uploading to IPFS..."
              progress={65}
            />
          )}
        </div>

        <div>
          <button
            onClick={() => toggleLoading("voting")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2"
          >
            Toggle Voting Loading
          </button>
          {loadingStates.voting && <InlineLoader context="voting" />}
        </div>

        <div>
          <button
            onClick={() => toggleLoading("trading")}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-2"
          >
            Toggle Trading Loading
          </button>
          {loadingStates.trading && (
            <LoadingState
              context="trading"
              message="Processing transaction..."
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Error Component for Testing Error Boundaries
function ErrorTrigger({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error("This is a test error for validation");
  }
  return (
    <div className="p-4 bg-green-100 rounded">
      No error - component working correctly
    </div>
  );
}

// Validation Component for Error Boundaries
export function ErrorBoundaryValidation() {
  const [triggerError, setTriggerError] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Error Boundary Validation</h2>

      <button
        onClick={() => setTriggerError(!triggerError)}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-4"
      >
        {triggerError ? "Fix Error" : "Trigger Error"}
      </button>

      <EnhancedErrorBoundary context="general">
        <ErrorTrigger shouldError={triggerError} />
      </EnhancedErrorBoundary>
    </div>
  );
}

// Validation Component for Smart Guidance
export function SmartGuidanceValidation() {
  const [showHelp, setShowHelp] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Smart Guidance Validation</h2>

      <div className="space-y-4">
        <div>
          <SmartTooltip
            content="This is a smart tooltip with helpful information"
            title="Tooltip Example"
          >
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Hover for Tooltip
            </button>
          </SmartTooltip>
        </div>

        <div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Toggle Contextual Help
          </button>

          <ContextualHelp
            context="first-visit"
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
          />
        </div>

        <div>
          <button
            onClick={() => setShowSpotlight(!showSpotlight)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Toggle Feature Spotlight
          </button>

          {showSpotlight && (
            <FeatureSpotlight
              target="#spotlight-target"
              title="New Feature!"
              description="This is a new feature that helps you record better performances."
              isActive={showSpotlight}
              onNext={() => setShowSpotlight(false)}
              onSkip={() => setShowSpotlight(false)}
            />
          )}

          <div id="spotlight-target" className="mt-4 p-4 bg-yellow-100 rounded">
            Target element for spotlight
          </div>
        </div>
      </div>
    </div>
  );
}

// Validation Component for Micro-Interactions
export function MicroInteractionsValidation() {
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Micro-Interactions Validation</h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Animated Like</h3>
          <AnimatedLike
            isLiked={isLiked}
            count={42}
            onToggle={() => setIsLiked(!isLiked)}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Star Rating</h3>
          <AnimatedStarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
          />
          <p className="text-sm text-gray-600 mt-1">Current rating: {rating}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Recording Button</h3>
          <RecordingButton
            isRecording={isRecording}
            onToggle={() => setIsRecording(!isRecording)}
            size="lg"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Achievement Badge</h3>
          <button
            onClick={() => setShowBadge(!showBadge)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-2"
          >
            Toggle Badge
          </button>
          {showBadge && (
            <AchievementBadge
              achievement={{
                title: "Level Up!",
                icon: "🎵",
                rarity: "epic",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Validation Component for Enhanced Skeleton
export function SkeletonValidation() {
  const [showSkeletons, setShowSkeletons] = useState({
    shimmer: false,
    pulse: false,
    wave: false,
    performance: false,
    recording: false,
  });

  const toggleSkeleton = (type: keyof typeof showSkeletons) => {
    setShowSkeletons((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Enhanced Skeleton Validation</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <button
            onClick={() => toggleSkeleton("shimmer")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
          >
            Toggle Shimmer Skeleton
          </button>
          {showSkeletons.shimmer && (
            <EnhancedSkeleton variant="shimmer" className="h-20 w-full" />
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSkeleton("pulse")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2"
          >
            Toggle Pulse Skeleton
          </button>
          {showSkeletons.pulse && (
            <EnhancedSkeleton variant="pulse" className="h-20 w-full" />
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSkeleton("wave")}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-2"
          >
            Toggle Wave Skeleton
          </button>
          {showSkeletons.wave && (
            <EnhancedSkeleton variant="wave" className="h-20 w-full" />
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSkeleton("performance")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-2"
          >
            Toggle Performance Card
          </button>
          {showSkeletons.performance && <PerformanceCardSkeleton />}
        </div>

        <div className="col-span-2">
          <button
            onClick={() => toggleSkeleton("recording")}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mb-2"
          >
            Toggle Recording Interface
          </button>
          {showSkeletons.recording && <RecordingInterfaceSkeleton />}
        </div>
      </div>
    </div>
  );
}

// Main Validation Dashboard
export function UXValidationDashboard() {
  const [activeTab, setActiveTab] = useState("feedback");

  const tabs = [
    { id: "feedback", label: "Feedback System", component: FeedbackValidation },
    {
      id: "loading",
      label: "Loading States",
      component: LoadingStatesValidation,
    },
    {
      id: "errors",
      label: "Error Boundaries",
      component: ErrorBoundaryValidation,
    },
    {
      id: "guidance",
      label: "Smart Guidance",
      component: SmartGuidanceValidation,
    },
    {
      id: "interactions",
      label: "Micro-Interactions",
      component: MicroInteractionsValidation,
    },
    {
      id: "skeleton",
      label: "Skeleton Loading",
      component: SkeletonValidation,
    },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || FeedbackValidation;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ActiveComponent />
      </div>
    </div>
  );
}

// Performance Testing Utilities
export const performanceUtils = {
  // Measure component render time
  measureRenderTime: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    console.log(`${componentName} render time: ${end - start}ms`);
    return end - start;
  },

  // Monitor animation performance
  monitorAnimationPerformance: (elementId: string, duration: number = 1000) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log(`Animation performance for ${elementId}:`, entry);
      });
    });

    observer.observe({ entryTypes: ["measure"] });

    setTimeout(() => {
      observer.disconnect();
    }, duration);
  },

  // Check for memory leaks
  checkMemoryUsage: () => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      console.log("Memory usage:", {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`,
      });
    }
  },
};

// Accessibility Testing Utilities
export const a11yUtils = {
  // Check for proper ARIA labels
  checkAriaLabels: (containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const elementsWithoutLabels = container.querySelectorAll(
      "button:not([aria-label]):not([aria-labelledby]), input:not([aria-label]):not([aria-labelledby])"
    );

    if (elementsWithoutLabels.length > 0) {
      console.warn(
        "Elements without proper ARIA labels:",
        elementsWithoutLabels
      );
    }
  },

  // Test keyboard navigation
  testKeyboardNavigation: (containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    console.log(
      `Found ${focusableElements.length} focusable elements in ${containerId}`
    );

    focusableElements.forEach((element, index) => {
      console.log(
        `${index + 1}. ${element.tagName} - ${
          element.getAttribute("aria-label") ||
          element.textContent?.slice(0, 30)
        }`
      );
    });
  },

  // Check color contrast (basic implementation)
  checkColorContrast: (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;

    console.log(`Color contrast for ${elementId}:`, {
      background: backgroundColor,
      text: color,
      // Note: Actual contrast ratio calculation would require more complex logic
    });
  },
};
