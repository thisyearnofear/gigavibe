/**
 * Challenge Countdown Step Component
 * Production-ready countdown with audio preparation
 */

"use client";

import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Challenge } from "@/types/challenge.types";
import { audioManager } from "@/services/AudioManager";

interface ChallengeCountdownProps {
  challenge: Challenge;
  onNext: () => void;
  onCancel: () => void;
}

export default function ChallengeCountdown({
  challenge,
  onNext,
  onCancel,
}: ChallengeCountdownProps) {
  const [countdown, setCountdown] = useState(3);
  const [isStarted, setIsStarted] = useState(false);
  const [instrumentalReady, setInstrumentalReady] = useState(false);

  // Auto-start countdown after component mounts
  useEffect(() => {
    // Stop any previous audio when entering countdown
    audioManager.stopAll();

    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, 1000);

    return () => clearTimeout(startTimer);
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!isStarted) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Start instrumental for recording
      startInstrumental();
    }
  }, [countdown, isStarted, onNext]);

  const startInstrumental = async () => {
    try {
      setInstrumentalReady(true);

      // Start instrumental audio for recording
      await audioManager.playAudio(challenge.instrumentalUrl, "instrumental", {
        volume: 0.5, // Lower volume so user can hear themselves
        loop: true, // Loop for longer recordings
        onError: (error) => {
          console.error("Failed to start instrumental:", error);
        },
      });

      // Move to recording after a brief moment
      const recordingTimer = setTimeout(() => {
        onNext();
      }, 500);

      return () => clearTimeout(recordingTimer);
    } catch (error) {
      console.error("Failed to start instrumental:", error);
      // Continue to recording even if audio fails
      setTimeout(onNext, 500);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't stop audio here - let it continue into recording
      // audioManager.stopAll();
    };
  }, []);

  const getCountdownText = () => {
    if (countdown > 0) return countdown.toString();
    if (instrumentalReady) return "SING!";
    return "GO!";
  };

  const getCountdownColor = () => {
    if (countdown > 0) return "text-gigavibe-400";
    return "text-green-400";
  };

  return (
    <div className="text-center space-y-8">
      {/* Countdown Display */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">
          {!isStarted
            ? "Get Ready!"
            : countdown > 0
            ? "Starting in..."
            : "Go Time!"}
        </h2>

        <div className="relative">
          {/* Countdown Circle */}
          <div className="relative w-48 h-48 mx-auto">
            {/* Background Circle */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />

            {/* Progress Circle */}
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                background:
                  countdown > 0
                    ? `conic-gradient(from 0deg, rgb(99, 102, 241) ${
                        ((3 - countdown) / 3) * 360
                      }deg, transparent 0deg)`
                    : "conic-gradient(from 0deg, rgb(34, 197, 94) 360deg, transparent 0deg)",
              }}
            />

            {/* Inner Circle */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center">
              <span className={`text-8xl font-bold ${getCountdownColor()}`}>
                {getCountdownText()}
              </span>
            </div>
          </div>
        </div>

        {/* Status Text */}
        <p className="text-slate-300 text-lg">
          {!isStarted && "Preparing your challenge..."}
          {isStarted &&
            countdown > 0 &&
            "The instrumental will start automatically"}
          {countdown === 0 && !instrumentalReady && "Starting instrumental..."}
          {instrumentalReady && "Sing along now!"}
        </p>
      </div>

      {/* Challenge Info */}
      <div className="space-y-3">
        <div className="text-lg font-semibold text-white">
          {challenge.title}
        </div>
        <div className="text-slate-400">{challenge.artist}</div>

        {/* Audio Indicator */}
        <div className="flex items-center justify-center gap-2 text-gigavibe-400">
          <div>
            {instrumentalReady ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </div>
          <span className="text-sm font-medium">
            {instrumentalReady ? "Instrumental Playing" : "Audio Ready"}
          </span>
        </div>
      </div>

      {/* Cancel Button (only show before countdown starts) */}
      {!isStarted && (
        <div>
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Breathing Animation Background */}
      <div className="fixed inset-0 pointer-events-none" />
    </div>
  );
}
