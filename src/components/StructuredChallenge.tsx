"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { usePitchDetection } from "@/hooks/usePitchDetection";

interface ChallengeNote {
  note: string;
  octave: number;
  frequency: number;
  duration: number; // in seconds
  startTime: number; // when to start this note
}

interface StructuredChallengeProps {
  onComplete: (
    accuracy: number,
    recording: string,
    challengeId?: string
  ) => void;
}

export default function StructuredChallenge({
  onComplete,
}: StructuredChallengeProps) {
  const { pitchData, isListening, startListening, stopListening } =
    usePitchDetection();
  const [phase, setPhase] = useState<
    "ready" | "countdown" | "singing" | "complete"
  >("ready");
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [noteAccuracies, setNoteAccuracies] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const challengeStartTime = useRef<number>(0);

  // Simple 4-note challenge: C4 -> D4 -> E4 -> F4
  const challengeNotes: ChallengeNote[] = [
    { note: "C", octave: 4, frequency: 261.63, duration: 2, startTime: 0 },
    { note: "D", octave: 4, frequency: 293.66, duration: 2, startTime: 2 },
    { note: "E", octave: 4, frequency: 329.63, duration: 2, startTime: 4 },
    { note: "F", octave: 4, frequency: 349.23, duration: 2, startTime: 6 },
  ];

  const totalDuration =
    challengeNotes[challengeNotes.length - 1].startTime +
    challengeNotes[challengeNotes.length - 1].duration;

  useEffect(() => {
    if (phase === "singing" && isListening) {
      const currentNote = challengeNotes[currentNoteIndex];
      if (currentNote && pitchData.frequency > 0) {
        // Calculate accuracy for current note
        const targetFreq = currentNote.frequency;
        const userFreq = pitchData.frequency;
        const semitoneError = Math.abs(12 * Math.log2(userFreq / targetFreq));
        const noteAccuracy = Math.max(0, 100 - semitoneError * 20); // 20% penalty per semitone

        setAccuracy(noteAccuracy);
      }
    }
  }, [pitchData, phase, currentNoteIndex, isListening]);

  const startChallenge = async () => {
    setPhase("countdown");
    setCurrentNoteIndex(0);
    setNoteAccuracies([]);

    // 3-second countdown
    for (let i = 3; i > 0; i--) {
      setTimeRemaining(i);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setPhase("singing");
    challengeStartTime.current = Date.now();
    await startListening();

    // Start the challenge timer
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - challengeStartTime.current) / 1000;
      const remaining = Math.max(0, totalDuration - elapsed);
      setTimeRemaining(remaining);

      // Update current note based on time
      const currentNote = challengeNotes.findIndex(
        (note) =>
          elapsed >= note.startTime && elapsed < note.startTime + note.duration
      );

      if (currentNote !== -1 && currentNote !== currentNoteIndex) {
        setCurrentNoteIndex(currentNote);
        // Save accuracy for previous note
        if (currentNoteIndex < challengeNotes.length) {
          setNoteAccuracies((prev) => [...prev, accuracy]);
        }
      }

      if (remaining <= 0) {
        completeChallenge();
      }
    }, 100);
  };

  const completeChallenge = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopListening();

    // Calculate final accuracy
    const finalAccuracies = [...noteAccuracies, accuracy];
    const avgAccuracy =
      finalAccuracies.reduce((sum, acc) => sum + acc, 0) /
      finalAccuracies.length;

    // Get recorded audio and save it
    // This would get the actual recording from the pitch detection system
    const saveRecording = async () => {
      try {
        // In a real implementation, this would get the actual recording
        // from the pitch detection system and save it
        const response = await fetch("/api/recordings/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: challengeNotes.map((note, index) => ({
              ...note,
              accuracy:
                index < noteAccuracies.length
                  ? noteAccuracies[index]
                  : accuracy,
            })),
            overallAccuracy: Math.round(avgAccuracy),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save recording");
        }

        const data = await response.json();
        const recordingId = data.recordingId;
        const challengeId = data.challengeId || `challenge_${Date.now()}`;

        setPhase("complete");
        onComplete(Math.round(avgAccuracy), recordingId, challengeId);
      } catch (error) {
        console.error("Failed to save recording:", error);
        // Even if saving fails, we'll complete the challenge
        setPhase("complete");
        const fallbackRecordingId = `local_recording_${Date.now()}`;
        const fallbackChallengeId = `challenge_${Date.now()}`;
        onComplete(
          Math.round(avgAccuracy),
          fallbackRecordingId,
          fallbackChallengeId
        );
      }
    };

    saveRecording();
  };

  const resetChallenge = () => {
    setPhase("ready");
    setCurrentNoteIndex(0);
    setTimeRemaining(0);
    setAccuracy(0);
    setNoteAccuracies([]);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopListening();
  };

  const getCurrentNote = () => challengeNotes[currentNoteIndex];
  const getProgressPercentage = () =>
    ((totalDuration - timeRemaining) / totalDuration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-white">
        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold mb-6">Vocal Scale Challenge</h1>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Your Mission:</h3>
                <div className="flex justify-center gap-4 mb-4">
                  {challengeNotes.map((note, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center mb-2">
                        <span className="font-bold">
                          {note.note}
                          {note.octave}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {note.duration}s
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-gray-300 text-sm">
                  Sing each note clearly for {challengeNotes[0].duration}{" "}
                  seconds. Follow the progression!
                </p>
              </div>

              <motion.button
                onClick={startChallenge}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Challenge
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
              <h2 className="text-2xl font-semibold mb-8">Get Ready!</h2>
              <motion.div
                className="text-8xl font-bold text-purple-400 mb-8"
                key={timeRemaining}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {timeRemaining}
              </motion.div>
              <p className="text-gray-300">Challenge starts in...</p>
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
              <div className="w-full bg-white/10 rounded-full h-2 mb-6">
                <motion.div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Current Target Note */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6">
                <h3 className="text-lg font-semibold mb-4">Sing This Note:</h3>
                <motion.div
                  className="text-6xl font-bold text-purple-400 mb-4"
                  key={currentNoteIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {getCurrentNote()?.note}
                  {getCurrentNote()?.octave}
                </motion.div>
                <div className="text-sm text-gray-400 mb-4">
                  Target: {getCurrentNote()?.frequency.toFixed(1)} Hz
                </div>

                {/* Real-time feedback */}
                <div className="space-y-2">
                  <div className="text-2xl font-semibold">
                    Accuracy: {Math.round(accuracy)}%
                  </div>
                  <div className="text-sm text-gray-300">
                    You:{" "}
                    {pitchData.frequency > 0
                      ? `${pitchData.note}${
                          pitchData.octave
                        } (${pitchData.frequency.toFixed(1)} Hz)`
                      : "Listening..."}
                  </div>
                </div>
              </div>

              {/* Time Remaining */}
              <div className="text-xl font-semibold mb-4">
                Time: {timeRemaining.toFixed(1)}s
              </div>

              {/* Note Progress */}
              <div className="flex justify-center gap-2">
                {challengeNotes.map((note, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      index < currentNoteIndex
                        ? "bg-green-500"
                        : index === currentNoteIndex
                        ? "bg-purple-500"
                        : "bg-gray-600"
                    }`}
                  />
                ))}
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
              <h2 className="text-3xl font-bold mb-4">Challenge Complete!</h2>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {Math.round(accuracy)}%
                </div>
                <p className="text-gray-300">Overall Accuracy</p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={resetChallenge}
                  className="flex-1 py-3 bg-white/10 border border-white/20 rounded-2xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="w-5 h-5 mx-auto" />
                </motion.button>

                <motion.button
                  onClick={() =>
                    onComplete(
                      accuracy,
                      `recording_${Date.now()}`,
                      `challenge_${Date.now()}`
                    )
                  }
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
