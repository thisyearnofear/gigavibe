"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, Mic } from "lucide-react";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useRealAudioRecording } from "@/hooks/useRealAudioRecording";
import { SunoService, ViralChallenge } from "@/lib/audio/SunoService";

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
  const { pitchData, isListening, startListening, stopListening } =
    usePitchDetection();
  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
    hasRecording,
  } = useRealAudioRecording();
  const [phase, setPhase] = useState<
    "loading" | "listen" | "countdown" | "singing" | "complete"
  >("loading");
  const [currentChallenge, setCurrentChallenge] =
    useState<ViralChallenge | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingInstrumental, setIsPlayingInstrumental] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [userRecording, setUserRecording] = useState<string>("");

  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const instrumentalAudioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);

  useEffect(() => {
    if (challenge) {
      setCurrentChallenge(challenge);
      setPhase("listen");
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
            setCurrentChallenge(data.challenges[0]);
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
  }, [challenge]);

  useEffect(() => {
    // Calculate accuracy based on pitch data
    if (
      phase === "singing" &&
      isListening &&
      pitchData.frequency > 0 &&
      currentChallenge
    ) {
      // Compare user's pitch with the expected pitch at this point in the song
      // This is a simplified version - a real implementation would use more sophisticated
      // audio analysis to compare with the original vocals

      const elapsed = (Date.now() - recordingStartTime.current) / 1000;
      const audioDuration = currentChallenge.duration;

      // Calculate progress percentage
      const progress = Math.min(1, elapsed / audioDuration);

      // Get current pitch data from user
      const userFrequency = pitchData.frequency;
      const userNote = pitchData.note;
      const userOctave = pitchData.octave;

      // Analyze accuracy (simplified - in a real implementation, we'd compare to
      // the actual expected notes at this timestamp)
      let calculatedAccuracy = 0;

      // The following is a simplified version that uses timing-based comparison
      // A real implementation would extract melody data from the original vocals
      // and compare the user's pitch to the expected pitch at each point in time

      // For demo purposes, we'll calculate a weighted accuracy based on:
      // 1. Pitch stability (are they holding a steady note)
      // 2. Volume/amplitude (are they singing loudly enough)
      // 3. Random factor to simulate comparison with original (would be replaced with real comparison)

      const pitchStability = Math.min(100, 100 - Math.random() * 20); // Simulated stability
      const volumeScore = Math.min(100, 80 + Math.random() * 20); // Simulated volume score
      const melodyMatch = Math.min(100, 50 + Math.random() * 50); // This would be real comparison in production

      // Weight the factors
      calculatedAccuracy =
        pitchStability * 0.3 + volumeScore * 0.2 + melodyMatch * 0.5;

      // Ensure we're in range
      calculatedAccuracy = Math.max(20, Math.min(95, calculatedAccuracy));

      setAccuracy(Math.round(calculatedAccuracy));
    }
  }, [pitchData, phase, isListening, currentChallenge]);

  const playOriginal = () => {
    if (originalAudioRef.current) {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      } else {
        // Reset time to beginning if needed
        originalAudioRef.current.currentTime = 0;
        originalAudioRef.current.play();
        setIsPlayingOriginal(true);

        // Limit playback to 30 seconds
        setTimeout(() => {
          if (
            originalAudioRef.current &&
            originalAudioRef.current.currentTime >= 30
          ) {
            originalAudioRef.current.pause();
            setIsPlayingOriginal(false);
          }
        }, 30000);
      }
    }
  };

  const playInstrumental = () => {
    if (instrumentalAudioRef.current) {
      if (isPlayingInstrumental) {
        instrumentalAudioRef.current.pause();
        setIsPlayingInstrumental(false);
      } else {
        // Reset time to beginning if needed
        instrumentalAudioRef.current.currentTime = 0;
        instrumentalAudioRef.current.play();
        setIsPlayingInstrumental(true);

        // Limit playback to 30 seconds
        setTimeout(() => {
          if (
            instrumentalAudioRef.current &&
            instrumentalAudioRef.current.currentTime >= 30
          ) {
            instrumentalAudioRef.current.pause();
            setIsPlayingInstrumental(false);
          }
        }, 30000);
      }
    }
  };

  // Reset challenge to initial state
  const resetChallenge = () => {
    setPhase("listen");
    setTimeRemaining(0);
    setAccuracy(0);
    setUserRecording("");

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    stopListening();
    stopRecording();
    clearRecording();

    if (originalAudioRef.current) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    }

    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.pause();
      setIsPlayingInstrumental(false);
    }
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
      await startListening();
      await startRecording();
      console.log("Microphone access granted, starting recording and analysis");

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
          completeChallenge();
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

  const completeChallenge = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    stopListening();
    stopRecording();

    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.pause();
      setIsPlayingInstrumental(false);
    }

    // Get recorded audio blob from the real audio recording hook
    if (!audioBlob) {
      console.error("No audio recording available");
      alert("Failed to record your performance. Please try again.");
      setPhase("listen");
      return;
    }

    // Upload recording to IPFS
    const uploadRecording = async () => {
      try {
        // First convert the audioBlob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        reader.onloadend = async () => {
          try {
            // Get base64 data (remove the data:audio/webm;base64, prefix)
            const base64Data = reader.result?.toString().split(",")[1];

            const ipfsHash = await fetch("/api/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                filename: `${currentChallenge.id}_${Date.now()}.webm`,
                data: base64Data,
              }),
            })
              .then((res) => res.json())
              .then((data) => data.ipfsHash);

            setUserRecording(ipfsHash);
          } catch (error) {
            console.error("Failed to process recording:", error);
            // Fallback to a local identifier if upload fails
            setUserRecording(`local_${Date.now()}`);
          }
        };
      } catch (error) {
        console.error("Failed to upload recording:", error);
        // Fallback to a local identifier if upload fails
        setUserRecording(`local_${Date.now()}`);
      }
    };

    uploadRecording();

    setPhase("complete");
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
        {/* Hidden audio elements */}
        <audio
          ref={originalAudioRef}
          src={currentChallenge.originalAudio}
          onEnded={() => setIsPlayingOriginal(false)}
          onTimeUpdate={() => {
            if (
              originalAudioRef.current &&
              originalAudioRef.current.currentTime >= 30
            ) {
              originalAudioRef.current.pause();
              originalAudioRef.current.currentTime = 0;
              setIsPlayingOriginal(false);
            }
          }}
          onLoadedData={() => console.log("Original audio loaded")}
        />
        <audio
          ref={instrumentalAudioRef}
          src={currentChallenge.instrumentalAudio}
          onEnded={() => setIsPlayingInstrumental(false)}
          onTimeUpdate={() => {
            if (
              instrumentalAudioRef.current &&
              instrumentalAudioRef.current.currentTime >= 30
            ) {
              instrumentalAudioRef.current.pause();
              instrumentalAudioRef.current.currentTime = 0;
              setIsPlayingInstrumental(false);
            }
          }}
          onLoadedData={() => console.log("Instrumental audio loaded")}
        />

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
                            height: isListening ? [4, 20, 4] : 4,
                            opacity: isListening ? [0.3, 1, 0.3] : 0.3,
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
                <h3 className="text-lg font-semibold mb-4">How did you do?</h3>
                <p className="text-gray-300 mb-6">
                  Rate your own performance before letting the community judge
                  it!
                </p>

                {/* Audio playback of recorded performance */}
                {audioBlob && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2">
                      Your Recording:
                    </h4>
                    <audio
                      src={URL.createObjectURL(audioBlob)}
                      controls
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex justify-between mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => setAccuracy(star * 20)} // Convert 1-5 stars to percentage
                      className={`text-3xl ${
                        star * 20 <= accuracy
                          ? "text-yellow-400"
                          : "text-gray-600"
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ⭐
                    </motion.button>
                  ))}
                </div>

                <div className="text-sm text-gray-400">
                  The community will judge your performance next!
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={resetChallenge}
                  className="flex-1 py-3 bg-white/10 border border-white/20 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </motion.button>

                <motion.button
                  onClick={() =>
                    onComplete(accuracy, userRecording, currentChallenge.id)
                  }
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={
                    accuracy === 0 || !hasRecording || userRecording === ""
                  }
                >
                  Submit Performance
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
