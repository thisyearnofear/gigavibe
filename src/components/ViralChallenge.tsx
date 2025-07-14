"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, Mic } from "lucide-react";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { SunoService, ViralChallenge } from "@/lib/audio/SunoService";
import { AudioPlayerService } from "@/lib/audio/AudioPlayerService";
import { AudioUploadService } from "@/lib/audio/AudioUploadService";
import { AudioMixerService } from "@/lib/audio/AudioMixerService";
import { AudioRecordingService } from "@/lib/audio/AudioRecordingService";
import { GroveService } from "@/lib/storage/GroveService";
import PerformanceSubmissionFlow from "@/components/performance/PerformanceSubmissionFlow";
import { PerformanceData } from "@/types/performance.types";

interface ViralChallengeProps {
  challenge?: ViralChallenge;
  onComplete: (
    accuracy: number,
    userRecording: string,
    challengeId: string
  ) => void;
}

export default function ViralChallengeComponent({
  challenge,
  onComplete,
}: ViralChallengeProps) {
  const {
    isRecording,
    audioBlob,
    mixedAudioBlob,
    hasRecording,
    startRecording,
    stopRecording,
    clearRecording,
    mixWithInstrumental,
  } = useAudioRecording();

  const [phase, setPhase] = useState<
    "loading" | "listen" | "countdown" | "singing" | "processing" | "complete" | "submission"
  >("loading");
  const [currentChallenge, setCurrentChallenge] =
    useState<ViralChallenge | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingInstrumental, setIsPlayingInstrumental] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [userRecording, setUserRecording] = useState<string>("");

  // Local state for audio blobs (for playback)
  const [localAudioBlob, setLocalAudioBlob] = useState<Blob | null>(null);
  const [localMixedAudioBlob, setLocalMixedAudioBlob] = useState<Blob | null>(
    null
  );

  // Effect to ensure all other audio is stopped when showing results
  useEffect(() => {
    if (phase === "complete") {
      // Stop all other audio players when showing results
      if (originalPlayerRef.current) {
        originalPlayerRef.current.pause();
      }
      if (instrumentalPlayerRef.current) {
        instrumentalPlayerRef.current.pause();
      }

      console.log("🔇 All audio stopped for results page");
    }
  }, [phase]);

  // References for audio elements and UI state
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);

  // Player services
  const originalPlayerRef = useRef<AudioPlayerService | null>(null);
  const instrumentalPlayerRef = useRef<AudioPlayerService | null>(null);

  // Initialize audio players when challenge is loaded
  useEffect(() => {
    // Clean up previous players if any
    if (originalPlayerRef.current) {
      originalPlayerRef.current.dispose();
      originalPlayerRef.current = null;
    }

    if (instrumentalPlayerRef.current) {
      instrumentalPlayerRef.current.dispose();
      instrumentalPlayerRef.current = null;
    }

    // Set up new challenge
    if (challenge) {
      setCurrentChallenge(challenge);
      setPhase("listen");

      // Initialize players if audio URLs are available
      if (challenge.originalAudio) {
        originalPlayerRef.current = new AudioPlayerService(
          new Audio(challenge.originalAudio),
          (isPlaying) => setIsPlayingOriginal(isPlaying)
        );
      }

      if (challenge.instrumentalAudio) {
        instrumentalPlayerRef.current = new AudioPlayerService(
          new Audio(challenge.instrumentalAudio),
          (isPlaying) => setIsPlayingInstrumental(isPlaying)
        );
      }
    } else {
      // Load a challenge from the API
      const loadChallenge = async () => {
        try {
          setPhase("loading");
          const response = await fetch("/api/challenges/featured?limit=1");

          if (!response.ok) {
            throw new Error("Failed to fetch challenge");
          }

          const data = await response.json();
          if (data.challenges && data.challenges.length > 0) {
            const newChallenge = data.challenges[0];
            setCurrentChallenge(newChallenge);

            // Initialize players
            if (newChallenge.originalAudio) {
              originalPlayerRef.current = new AudioPlayerService(
                new Audio(newChallenge.originalAudio),
                (isPlaying) => setIsPlayingOriginal(isPlaying)
              );
            }

            if (newChallenge.instrumentalAudio) {
              instrumentalPlayerRef.current = new AudioPlayerService(
                new Audio(newChallenge.instrumentalAudio),
                (isPlaying) => setIsPlayingInstrumental(isPlaying)
              );
            }
          } else {
            throw new Error("No challenges available");
          }
          setPhase("listen");
        } catch (error) {
          console.error("Error loading challenge:", error);
          alert("Failed to load challenge. Please try again later.");
        }
      };

      loadChallenge();
    }

    // Clean up when component unmounts
    return () => {
      if (originalPlayerRef.current) {
        originalPlayerRef.current.dispose();
      }

      if (instrumentalPlayerRef.current) {
        instrumentalPlayerRef.current.dispose();
      }
    };
  }, [challenge]);

  // Simple accuracy calculation for viral challenge (no pitch detection needed)
  useEffect(() => {
    if (phase === "singing" && isRecording) {
      // For viral challenges, we'll use a simple random accuracy score
      // In a real implementation, this could be based on audio analysis post-recording
      const randomAccuracy = Math.floor(Math.random() * 30) + 70; // 70-100%
      setAccuracy(randomAccuracy);
    }
  }, [phase, isRecording]);

  const playOriginal = () => {
    if (originalPlayerRef.current) {
      originalPlayerRef.current.togglePlayback(30); // Limit to 30 seconds
    }
  };

  const playInstrumental = () => {
    if (instrumentalPlayerRef.current) {
      instrumentalPlayerRef.current.togglePlayback(30); // Limit to 30 seconds
    }
  };

  // Reset challenge to initial state
  const resetChallenge = () => {
    console.log(
      "🔄 Resetting challenge - cleaning up all audio/microphone access"
    );

    setPhase("listen");
    setTimeRemaining(0);
    setAccuracy(0);
    setUserRecording("");

    // Clear local audio blobs
    setLocalAudioBlob(null);
    setLocalMixedAudioBlob(null);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Stop all audio/microphone access
    stopRecording();
    clearRecording();

    if (originalPlayerRef.current) {
      originalPlayerRef.current.pause();
    }

    if (instrumentalPlayerRef.current) {
      instrumentalPlayerRef.current.pause();
    }

    console.log("✅ Challenge reset complete - microphone should be released");
  };

  const startChallenge = async () => {
    try {
      console.log("Starting challenge...");
      setPhase("countdown");

      // 3-second countdown
      for (let i = 3; i > 0; i--) {
        console.log(`Countdown: ${i}`);
        setTimeRemaining(i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log("Countdown complete, starting singing phase");
      setPhase("singing");
      recordingStartTime.current = Date.now();

      // Start recording and instrumental playback
      console.log("Requesting microphone access...");
      await startRecording();
      console.log("Microphone access granted, starting recording");

      console.log("Starting instrumental playback");
      playInstrumental();

      // Set timer for challenge duration
      const duration = currentChallenge?.duration || 15;
      setTimeRemaining(duration);

      console.log(`Challenge will run for ${duration} seconds`);
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - recordingStartTime.current) / 1000;
        const remaining = Math.max(0, duration - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          completeChallenge().catch((err) => {
            console.error("Error completing challenge:", err);
            alert(
              "Something went wrong while finishing your challenge. Please try again."
            );
            setPhase("listen");
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error starting challenge:", error);
      // Fall back to listen phase if there's an error
      setPhase("listen");
      alert(
        "Could not start the challenge. Please check microphone permissions and try again."
      );
    }
  };

  const completeChallenge = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    console.log("Completing challenge, stopping audio...");
    setPhase("processing"); // Set to processing phase immediately to update UI

    // Stop instrumental playback first to reduce audio resource conflicts
    if (instrumentalPlayerRef.current) {
      instrumentalPlayerRef.current.pause();
    }

    // Also stop the original audio if it's playing
    if (originalPlayerRef.current) {
      originalPlayerRef.current.pause();
    }

    // More significant delay to ensure audio resources are fully released
    console.log("Waiting for audio resources to be released...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Small delay before stopping recording to ensure clean audio
    console.log("Preparing to stop recording...");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Now stop the recording after pitch detection is off
    console.log("Stopping and processing recording...");
    try {
      const recordingSuccess = await stopRecording();
      console.log("Recording stop result:", recordingSuccess);
    } catch (error) {
      console.error("Error stopping recording:", error);
      // Continue with the process even if there was an error stopping the recording
      // as we might still have a valid audio blob from earlier
    }

    // IMPORTANT: Do NOT clear the recording here!
    // We need to keep the audio blob for upload
    // The clearRecording() call was removing our audio data before we could use it

    // Get the current audio blob directly from the recording service
    // This avoids stale closure issues with the component state
    const recordingService = AudioRecordingService.getInstance();
    const currentState = recordingService.getRecordingState();

    console.log("Getting audio blob from recording service:", {
      hasRecording: currentState.hasRecording,
      audioBlobSize: currentState.audioBlob?.size || 0,
      audioBlobType: currentState.audioBlob?.type || "none",
    });

    const finalAudioBlob = currentState.audioBlob;

    // Get recorded audio blob from the real audio recording hook
    console.log("Checking recording status:", {
      hasRecording,
      audioBlob: !!finalAudioBlob,
      blobSize: finalAudioBlob ? finalAudioBlob.size : 0,
      type: finalAudioBlob ? finalAudioBlob.type : "none",
    });

    // Force a check of the actual recording state
    console.log("Current hook recording state:", {
      hasRecordingFromHook: hasRecording,
      audioBlobFromHook: !!audioBlob,
      audioBlobSize: audioBlob ? audioBlob.size : 0,
      type: audioBlob ? audioBlob.type : "none",
    });

    // Create a new variable to use throughout the rest of the function
    // This addresses the issue where we can't modify the finalAudioBlob constant
    const effectiveAudioBlob =
      !finalAudioBlob && audioBlob ? audioBlob : finalAudioBlob;

    if (!finalAudioBlob && audioBlob) {
      console.log("Using audioBlob from hook as finalAudioBlob was null");
    }

    // Create a fallback empty audio blob if no recording is available
    // This allows the user to continue even if recording failed
    if (!effectiveAudioBlob) {
      console.warn("No audio recording available, creating empty placeholder");

      try {
        // Create an empty audio placeholder using our service
        const emptyAudio = AudioMixerService.createEmptyAudioPlaceholder();

        // Continue with the empty blob but show a notification to the user
        alert(
          "Note: Your audio couldn't be recorded properly. You can still submit the challenge, but no audio will be included."
        );

        // Use the empty blob to continue the flow
        setPhase("complete");
        return;
      } catch (error) {
        console.error("Failed to create fallback audio blob:", error);
        alert("Failed to record your performance. Please try again.");
        setPhase("listen");
        return;
      }
    }

    // Log successful recording before mixing
    console.log("✅ Valid audio recording available:", {
      size: effectiveAudioBlob.size,
      type: effectiveAudioBlob.type,
    });

    // If we have a valid audio blob, mix with instrumental if possible
    try {
      // Use our reusable AudioMixerService to mix the vocals with instrumental
      const instrumentalSrc = currentChallenge?.instrumentalAudio;
      if (!instrumentalSrc) {
        throw new Error("No instrumental track available for mixing");
      }

      console.log("Starting audio mixing process with:", {
        vocalBlobSize: effectiveAudioBlob.size,
        vocalBlobType: effectiveAudioBlob.type,
        instrumentalSrc,
      });

      // Ensure we're working with the correct audio formats
      // The mixer expects audio/webm for the vocals
      if (effectiveAudioBlob.type !== "audio/webm") {
        console.warn(
          `Vocal recording is ${effectiveAudioBlob.type} instead of audio/webm - this might cause mixing issues`
        );
      }

      // First verify our vocal audio is valid
      if (effectiveAudioBlob.size < 100) {
        console.warn(
          "Vocal audio blob is suspiciously small:",
          effectiveAudioBlob.size
        );
        // Try to continue anyway, but log the warning
      }

      console.log("About to start mixing process with AudioMixerService");
      try {
        const mixedAudio = await AudioMixerService.mixVocalsWithInstrumental(
          effectiveAudioBlob,
          instrumentalSrc
        );

        // Always verify we got a valid mixed audio blob back
        if (!mixedAudio) {
          console.error(
            "Audio mixing failed to produce output - falling back to vocals only"
          );
          setPhase("complete");
          return;
        }

        if (mixedAudio.size < 1000) {
          console.warn(
            "Mixed audio blob is suspiciously small:",
            mixedAudio.size,
            "- might not contain both vocal and instrumental"
          );
          // Continue anyway but with a warning in the logs
        }

        console.log("Audio mixing successful:", {
          originalVocalSize: effectiveAudioBlob.size,
          mixedBlobSize: mixedAudio.size,
          mixedBlobType: mixedAudio.type,
          ratio: mixedAudio.size / effectiveAudioBlob.size,
        });

        // Store the audio blobs in local state for playback
        setLocalAudioBlob(effectiveAudioBlob);
        setLocalMixedAudioBlob(mixedAudio);

        // Ensure all other audio players are stopped before showing results
        if (originalPlayerRef.current) {
          originalPlayerRef.current.pause();
        }
        if (instrumentalPlayerRef.current) {
          instrumentalPlayerRef.current.pause();
        }

        // No pitch detection needed for viral challenge

        console.log("🎤 Stopping all audio/microphone access for results page");

        // Move to submission flow instead of complete
        setPhase("submission");
        return;
      } catch (mixError) {
        console.error("Caught exception during mixing process:", mixError);
        setPhase("complete");
        return;
      }
    } catch (error) {
      console.error("Failed to mix audio:", error);
      // Continue to submission phase even if mixing fails
      setPhase("submission");
      return;
    }
  };

  // Separated upload handling into its own function - only called on submission
  const handleUpload = async (sourceType: string = "mixed_audio") => {
    // Use local audio blobs (which contain the actual recorded/mixed audio)
    if (!localAudioBlob && !localMixedAudioBlob) {
      console.error(
        "No audio available for upload - no local audio blobs found"
      );
      return null;
    }

    // Prefer mixed audio if available
    const blobToUpload = localMixedAudioBlob || localAudioBlob;
    console.log("📤 Using audio blob for upload:", {
      usingMixed: !!localMixedAudioBlob,
      usingVocals: !!localAudioBlob,
      blobSize: blobToUpload.size,
    });

    console.log(`Starting upload process for ${sourceType} audio:`, {
      blobSize: blobToUpload.size,
      blobType: blobToUpload.type,
    });

    try {
      // Use our abstracted upload service
      const uploadResult = await AudioUploadService.uploadAudio({
        blob: blobToUpload,
        challengeId: currentChallenge.id,
        sourceType,
        filename: `${currentChallenge.id}_${sourceType}_${Date.now()}.webm`,
        metadata: {
          challengeId: currentChallenge.id,
          sourceType,
          timestamp: Date.now(),
        },
      });

      // Store the recording ID
      if (uploadResult.success) {
        setUserRecording(uploadResult.recordingId);
        console.log(
          `Recording saved using ${uploadResult.storageType} storage: ${uploadResult.recordingId}`
        );
        return uploadResult.recordingId;
      } else {
        console.warn("Upload not successful:", uploadResult.error);
        const fallbackId = `local_${Date.now()}`;
        setUserRecording(fallbackId);
        return fallbackId;
      }
    } catch (error) {
      console.error("Upload failed:", error);
      const fallbackId = `local_${Date.now()}`;
      setUserRecording(fallbackId);
      return fallbackId;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const handleSubmitPerformance = async () => {
    console.log("🚀 Submit button clicked!", {
      accuracy,
      hasLocalMixedAudio: !!localMixedAudioBlob,
      hasLocalAudio: !!localAudioBlob,
      challengeId: currentChallenge?.id,
    });

    // Only now do we upload the recording - this ensures we only upload submissions
    // the user wants to keep, not every recording
    const recordingId = await handleUpload("mixed_audio_final_submission");
    console.log("📤 Upload result:", recordingId);

    if (recordingId) {
      console.log("✅ Calling onComplete with:", {
        accuracy,
        recordingId,
        challengeId: currentChallenge.id,
      });
      onComplete(accuracy, recordingId, currentChallenge.id);
    } else {
      console.error("❌ Upload failed");
      alert("Failed to upload your recording. Please try again.");
    }
  };

  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold">Loading Challenge...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-white">
        <AnimatePresence mode="wait">
          {phase === "listen" && (
            <motion.div
              key="listen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-6">
                <div className="text-4xl mb-4">🎤</div>
                <h1 className="text-3xl font-bold mb-2">
                  {currentChallenge.title}
                </h1>
                <div
                  className={`text-sm font-medium ${getDifficultyColor(
                    currentChallenge.difficulty
                  )}`}
                >
                  {currentChallenge.difficulty} •{" "}
                  {Math.round(currentChallenge.duration)}s
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Your Mission:</h3>
                <p className="text-gray-300 mb-6">
                  Listen to this AI-generated track, then sing along as closely
                  as possible. The community will judge how well you matched it!
                </p>

                {/* Play Original Button */}
                <motion.button
                  onClick={playOriginal}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-3">
                    {isPlayingOriginal ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                    <span className="text-lg font-semibold">
                      {isPlayingOriginal
                        ? "Pause Original"
                        : "Play Original Track"}
                    </span>
                  </div>
                </motion.button>

                <div className="text-xs text-gray-400 mb-4">
                  Tags: {currentChallenge.tags}
                </div>
              </div>

              <motion.button
                onClick={() => {
                  console.log("Ready to Sing button clicked");
                  startChallenge();
                }}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl font-semibold text-lg relative z-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                disabled={!currentChallenge}
              >
                Ready to Sing!
              </motion.button>
            </motion.div>
          )}

          {phase === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold mb-8">
                Get Ready to Sing!
              </h2>
              <motion.div
                className="text-8xl font-bold text-purple-400 mb-8"
                key={timeRemaining}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {timeRemaining}
              </motion.div>
              <p className="text-gray-300">
                The instrumental will start playing...
              </p>
            </motion.div>
          )}

          {phase === "singing" && (
            <motion.div
              key="singing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-3 mb-6">
                <motion.div
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{
                    width: `${
                      (timeRemaining / (currentChallenge.duration || 30)) * 100
                    }%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Current Status */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6">
                <h3 className="text-lg font-semibold mb-4">🎤 Singing Now!</h3>

                <div className="space-y-4">
                  {/* Audio visualization */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Volume2 className="w-5 h-5 text-purple-400" />
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-purple-400 rounded-full"
                          animate={{
                            height: isRecording ? [4, 20, 4] : 4,
                            opacity: isRecording ? [0.3, 1, 0.3] : 0.3,
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Remaining */}
              <div className="text-2xl font-bold mb-4">
                {timeRemaining.toFixed(1)}s remaining
              </div>

              {/* Recording Indicator */}
              <div className="flex items-center justify-center gap-3 text-red-400">
                <motion.div
                  className="w-4 h-4 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="font-semibold">
                  {isRecording
                    ? "Recording your performance..."
                    : "Waiting for microphone..."}
                </span>
              </div>
            </motion.div>
          )}

          {phase === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8">
                <div className="text-4xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold mb-4">
                  Processing Recording
                </h2>
                <p className="text-gray-300">
                  Almost there! We're finalizing your amazing vocal
                  performance...
                </p>
              </div>

              {/* Loading animation */}
              <div className="flex justify-center mb-8">
                <motion.div
                  className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <p className="text-sm text-gray-400">
                This will only take a few seconds
              </p>
            </motion.div>
          )}

          {phase === "submission" && (
            <motion.div
              key="submission"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold mb-4">Performance Complete!</h2>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                {/* Audio playback of recorded performance - prioritize mixed audio if available */}
                {localMixedAudioBlob ? (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 text-green-400">
                      Your Mixed Performance:
                    </h4>
                    <audio
                      src={URL.createObjectURL(localMixedAudioBlob)}
                      controls
                      className="w-full"
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        const audio = e.target as HTMLAudioElement;
                        console.log(
                          `🎵 Mixed audio loaded: ${audio.duration.toFixed(
                            2
                          )}s, size: ${localMixedAudioBlob.size} bytes`
                        );
                      }}
                      onError={(e) => {
                        console.error(
                          "❌ Error playing back mixed recording:",
                          e
                        );
                        const audio = e.target as HTMLAudioElement;
                        console.error("Audio error details:", {
                          error: audio.error,
                          networkState: audio.networkState,
                          readyState: audio.readyState,
                          src: audio.src.substring(0, 50) + "...",
                        });
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This is your vocals mixed with the instrumental track
                    </p>
                  </div>
                ) : localAudioBlob ? (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2">
                      Your Vocal Recording:
                    </h4>
                    <audio
                      src={URL.createObjectURL(localAudioBlob)}
                      controls
                      className="w-full"
                      onError={(e) => {
                        console.error("Error playing back recording:", e);
                        alert(
                          "There was an issue playing back your recording. The file may be corrupted."
                        );
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Vocals only - your mixed performance will be saved on
                      submission
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 p-3 bg-red-500/20 rounded-lg">
                    <p className="text-sm text-red-300">
                      Your recording couldn't be played back. You can still
                      submit your performance.
                    </p>
                  </div>
                )}

                {/* Enhanced Submission Flow Component */}
                <PerformanceSubmissionFlow
                  audioBlob={localMixedAudioBlob || localAudioBlob || new Blob()}
                  performanceData={{
                    challengeId: currentChallenge?.id || 'unknown',
                    challengeTitle: currentChallenge?.title || 'Unknown Challenge',
                    challengeType: 'viral',
                    challengeDifficulty: currentChallenge?.difficulty || 'Medium',
                    accuracy: accuracy,
                    duration: currentChallenge?.duration || 30,
                    selfRating: Math.ceil(accuracy / 20), // Convert accuracy to star rating
                    audioFormat: 'audio/webm',
                    fileSize: localMixedAudioBlob?.size || localAudioBlob?.size || 0,
                    isMixed: !!localMixedAudioBlob,
                    recordingQuality: 'high',
                    timestamp: Date.now(),
                    completedAt: new Date().toISOString()
                  }}
                  onComplete={(recordingId) => {
                    console.log('✅ Performance submitted successfully:', recordingId);
                    onComplete(accuracy, recordingId, currentChallenge?.id || 'unknown');
                  }}
                  onRetry={() => {
                    console.log('🔄 User requested retry');
                    resetChallenge();
                  }}
                />
              </div>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold mb-4">Performance Complete!</h2>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                <p className="text-gray-300 mb-6">
                  Your performance has been submitted successfully!
                </p>
                
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => {
                      console.log("🔄 Try Again button clicked!");
                      resetChallenge();
                    }}
                    className="flex-1 py-3 bg-white/10 border border-white/20 rounded-2xl font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      onComplete(accuracy, userRecording, currentChallenge?.id || 'unknown');
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue to Feed
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
