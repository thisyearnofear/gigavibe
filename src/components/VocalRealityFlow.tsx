"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import SmoothVocalChallenge from "./SmoothVocalChallenge";
import SelfRating from "./SelfRating";
import RealityReveal from "./RealityReveal";

type FlowPhase = "challenge" | "selfRating" | "judging" | "reveal";

interface UserSubmission {
  challengeId: string;
  challengeTitle: string;
  audioUrl: string;
  selfRating: number;
  confidence: string;
  communityRating?: number;
  totalJudges?: number;
  submissionId?: string;
}

export default function VocalRealityFlow() {
  const [phase, setPhase] = useState<FlowPhase>("challenge");
  const [userSubmission, setUserSubmission] = useState<UserSubmission | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiEndpoint =
    process.env.NEXT_PUBLIC_API_URL || "https://api.gigavibe.xyz";

  const handleChallengeComplete = async (
    challengeId: string,
    challengeTitle: string,
    audioUrl: string
  ) => {
    try {
      setIsLoading(true);

      // Register submission with API
      const response = await fetch(`${apiEndpoint}/api/challenges/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          audioUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register submission");
      }

      const data = await response.json();

      setUserSubmission({
        challengeId,
        challengeTitle,
        audioUrl,
        selfRating: 0,
        confidence: "",
        submissionId: data.submissionId,
      });

      setPhase("selfRating");
    } catch (err) {
      console.error("Error submitting challenge:", err);
      setError("Failed to submit your recording. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfRating = async (rating: number, confidence: string) => {
    if (!userSubmission) return;

    try {
      setIsLoading(true);

      // Update submission with self-rating
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

      setUserSubmission({
        ...userSubmission,
        selfRating: rating,
        confidence,
      });

      // Move to judging phase
      setPhase("judging");

      // Poll for judging results
      let attempts = 0;
      const maxAttempts = 30; // 30 * 2s = 60s max wait time

      const pollForResults = async () => {
        if (attempts >= maxAttempts) {
          throw new Error("Judging timed out");
        }

        attempts++;

        try {
          const resultsResponse = await fetch(
            `${apiEndpoint}/api/challenges/results/${userSubmission.submissionId}`
          );

          if (!resultsResponse.ok) {
            throw new Error("Failed to fetch results");
          }

          const resultsData = await resultsResponse.json();

          if (resultsData.status === "completed") {
            setUserSubmission((prev) =>
              prev
                ? {
                    ...prev,
                    communityRating: resultsData.communityRating,
                    totalJudges: resultsData.totalJudges,
                  }
                : null
            );

            setPhase("reveal");
            return;
          }

          // If not complete, poll again after 2 seconds
          setTimeout(pollForResults, 2000);
        } catch (err) {
          console.error("Error polling results:", err);
          // Continue polling despite errors
          setTimeout(pollForResults, 2000);
        }
      };

      // Start polling
      pollForResults();
    } catch (err) {
      console.error("Error submitting self-rating:", err);
      setError("Failed to submit your rating. Please try again.");
      setPhase("selfRating");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!userSubmission) return;

    try {
      // Record share event with API
      await fetch(`${apiEndpoint}/api/social/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId: userSubmission.submissionId,
          shareType: "reality_check",
        }),
      });

      const shareText = `I thought I was a ${
        userSubmission.selfRating
      }⭐ singer... The community said ${userSubmission.communityRating?.toFixed(
        1
      )}⭐ 😅 #VocalRealityCheck #GIGAVIBE`;

      if (navigator.share) {
        await navigator.share({
          title: "My Vocal Reality Check",
          text: shareText,
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        alert("Copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      alert("Failed to share. Please try again.");
    }
  };

  const handleTryAgain = () => {
    setUserSubmission(null);
    setPhase("challenge");
  };

  return (
    <div className="min-h-screen">
      {error && (
        <div className="bg-red-500 text-white p-4 text-center">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}
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

        {phase === "judging" && (
          <div
            key="judging"
            className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center"
          >
            <div className="text-center text-white">
              <div className="text-6xl mb-6">⏳</div>
              <h2 className="text-2xl font-bold mb-4">
                Community is judging...
              </h2>
              <p className="text-gray-300">This might take a moment</p>
              <div className="mt-8 flex justify-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
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
            />
          )}
      </AnimatePresence>
    </div>
  );
}
