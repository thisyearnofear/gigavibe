"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCrossTab } from "@/contexts/CrossTabContext";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";
import SmoothVocalChallenge from "./SmoothVocalChallenge";
import SelfRating from "./SelfRating";
import RealityReveal from "./RealityReveal";
import PostChallengeGuidance from "./PostChallengeGuidance";
import { FullScreenLoading } from "./ui/loading";

type FlowPhase =
  | "challenge"
  | "selfRating"
  | "judging"
  | "reveal"
  | "guidance"
  | "complete";

interface UserSubmission {
  challengeId: string;
  challengeTitle: string;
  audioUrl: string;
  selfRating: number;
  confidence: string;
  communityRating?: number;
  totalJudges?: number;
  submissionId?: string;
  castHash?: string;
}

interface UnifiedChallengeFlowProps {
  onComplete?: () => void;
  initialChallenge?: string;
}

export default function UnifiedChallengeFlow({
  onComplete,
  initialChallenge,
}: UnifiedChallengeFlowProps) {
  const [phase, setPhase] = useState<FlowPhase>("challenge");
  const [userSubmission, setUserSubmission] = useState<UserSubmission | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { navigateWithContext, updateVotingProgress } = useCrossTab();
  const { userInfo, signerUuid } = useFarcasterIntegration();

  const apiEndpoint = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  // Handle challenge completion
  const handleChallengeComplete = async (
    challengeTitle: string,
    audioUrl: string,
    challengeId?: string
  ) => {
    try {
      setIsLoading(true);

      // Upload to IPFS and register submission
      const response = await fetch(`${apiEndpoint}/api/challenges/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId: challengeId || "default",
          challengeTitle,
          audioUrl,
          userFid: userInfo?.fid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register submission");
      }

      const data = await response.json();

      setUserSubmission({
        challengeId: challengeId || "default",
        challengeTitle,
        audioUrl,
        selfRating: 0,
        confidence: "",
        submissionId: data.submissionId,
      });

      setPhase("selfRating");
    } catch (err) {
      console.error("Error completing challenge:", err);
      setError("Failed to submit your performance. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle self-rating submission
  const handleSelfRating = async (rating: number, confidence: string) => {
    if (!userSubmission) return;

    try {
      setIsLoading(true);

      // Submit self-rating
      const response = await fetch(`${apiEndpoint}/api/challenges/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId: userSubmission.submissionId,
          selfRating: rating,
          confidence,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      // Update submission with self-rating
      setUserSubmission((prev) =>
        prev
          ? {
              ...prev,
              selfRating: rating,
              confidence,
            }
          : null
      );

      // Create Farcaster cast
      await createFarcasterCast(userSubmission.audioUrl, rating);

      // Navigate to judging phase to encourage community participation
      setPhase("judging");

      // Start polling for community results
      pollForResults();
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Failed to submit your rating. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create Farcaster cast for social sharing
  const createFarcasterCast = async (audioUrl: string, selfRating: number) => {
    if (!userInfo?.fid || !userSubmission) return;

    try {
      const response = await fetch("/api/farcaster/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publishCast",
          signerUuid: signerUuid,
          text: `🎤 Just sang "${userSubmission.challengeTitle}" - I think I'm a ${selfRating}⭐ singer! What do you think? #VocalRealityCheck #GIGAVIBE`,
          embeds: [
            { url: audioUrl },
            {
              url: `${process.env.NEXT_PUBLIC_URL}/performance/${userSubmission.submissionId}`,
            },
          ],
          channelId: "gigavibe",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserSubmission((prev) =>
          prev
            ? {
                ...prev,
                castHash: result.castHash,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to create Farcaster cast:", error);
    }
  };

  // Poll for community rating results
  const pollForResults = () => {
    if (!userSubmission?.submissionId) return;

    let attempts = 0;
    const maxAttempts = 30; // 1 minute of polling

    const poll = async () => {
      if (attempts >= maxAttempts) {
        // Timeout - show partial results or encourage more voting
        setPhase("reveal");
        return;
      }

      attempts++;

      try {
        const response = await fetch(
          `${apiEndpoint}/api/challenges/results/${userSubmission.submissionId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }

        const data = await response.json();

        if (data.status === "completed" && data.totalJudges >= 3) {
          setUserSubmission((prev) =>
            prev
              ? {
                  ...prev,
                  communityRating: data.communityRating,
                  totalJudges: data.totalJudges,
                }
              : null
          );

          setPhase("reveal");
          return;
        }

        // Continue polling
        setTimeout(poll, 2000);
      } catch (err) {
        console.error("Error polling results:", err);
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  // Handle sharing results
  const handleShare = async () => {
    if (!userSubmission) return;

    const shareText = `I thought I was a ${
      userSubmission.selfRating
    }⭐ singer... The community said ${userSubmission.communityRating?.toFixed(
      1
    )}⭐ 😅 #VocalRealityCheck #GIGAVIBE`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Vocal Reality Check",
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        // Show success feedback
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Handle trying again
  const handleTryAgain = () => {
    setUserSubmission(null);
    setPhase("challenge");
    setError(null);
  };

  // Handle completion and navigation
  const handleFlowComplete = () => {
    setPhase("guidance");
  };

  // Handle guidance navigation
  const handleGuidanceNavigate = (tab: string, context?: any) => {
    navigateWithContext(tab, context);
  };

  // Handle guidance dismissal
  const handleGuidanceDismiss = () => {
    if (onComplete) {
      onComplete();
    } else {
      // Default to discovery feed
      navigateWithContext("discovery", {
        highlightCast: userSubmission?.castHash,
        showSuccessMessage: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gigavibe-mesh relative">
      {/* Error Display */}
      {error && (
        <motion.div
          className="absolute top-4 left-4 right-4 bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-2xl z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm underline"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <FullScreenLoading message="Processing..." showLogo={false} />
        </div>
      )}

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        {phase === "challenge" && (
          <SmoothVocalChallenge
            key="challenge"
            onChallengeComplete={handleChallengeComplete}
            isLoading={isLoading}
          />
        )}

        {phase === "selfRating" && userSubmission && (
          <SelfRating
            key="selfRating"
            challengeTitle={userSubmission.challengeTitle}
            onRatingSubmit={handleSelfRating}
            isLoading={isLoading}
          />
        )}

        {phase === "judging" && userSubmission && (
          <motion.div
            key="judging"
            className="min-h-screen flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center text-white max-w-md">
              <div className="text-6xl mb-6">⏳</div>
              <h2 className="text-2xl font-bold mb-4">
                Community is Judging...
              </h2>
              <p className="text-gray-300 mb-6">
                Your performance is being rated by the community. Help others
                while you wait!
              </p>
              <motion.button
                className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white px-8 py-3 rounded-2xl font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  navigateWithContext("judging", { fromChallenge: true })
                }
              >
                Judge Other Performances
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === "reveal" &&
          userSubmission &&
          userSubmission.communityRating && (
            <RealityReveal
              key="reveal"
              selfRating={userSubmission.selfRating}
              communityRating={userSubmission.communityRating}
              confidence={userSubmission.confidence}
              challengeTitle={userSubmission.challengeTitle}
              totalJudges={userSubmission.totalJudges || 0}
              onShare={handleShare}
              onTryAgain={handleTryAgain}
              onContinue={handleFlowComplete}
            />
          )}

        {phase === "guidance" && userSubmission && (
          <PostChallengeGuidance
            key="guidance"
            selfRating={userSubmission.selfRating}
            communityRating={userSubmission.communityRating}
            challengeTitle={userSubmission.challengeTitle}
            onNavigate={handleGuidanceNavigate}
            onDismiss={handleGuidanceDismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
