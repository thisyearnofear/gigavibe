"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Upload, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { IPFSAudioService } from "@/lib/storage/IPFSAudioService";
import { useRealAudioRecording } from "@/hooks/useRealAudioRecording";

interface ContinuousUploadProps {
  onUpload: (performance: {
    id: string;
    challengeTitle: string;
    selfRating: number;
    timestamp: Date;
    audioUrl: string;
  }) => Promise<void>;
}

export default function ContinuousUpload({ onUpload }: ContinuousUploadProps) {
  // States
  const [isOpen, setIsOpen] = useState(false);
  const [selfRating, setSelfRating] = useState(4);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");

  // References
  const ipfsServiceRef = useRef<IPFSAudioService>(
    IPFSAudioService.getInstance()
  );

  // Audio recording hook
  const {
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    hasPermission,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    requestPermissions,
  } = useRealAudioRecording();

  // Toggle recording panel
  const togglePanel = () => {
    if (isOpen && isRecording) {
      stopRecording();
    }

    if (!isOpen) {
      setChallengeTitle(`Freestyle Vocal #${Math.floor(Math.random() * 1000)}`);
    }

    setIsOpen(!isOpen);
    setUploadSuccess(false);
  };

  // Initialize recording
  const handleStartRecording = async () => {
    if (!hasPermission) {
      await requestPermissions();
    }

    await startRecording();
  };

  // Handle upload to IPFS
  const handleUpload = async () => {
    if (!audioBlob) return;

    try {
      setIsUploading(true);

      // Create unique performance ID
      const performanceId = `recording-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;

      // Upload audio to IPFS
      const audioResult = await ipfsServiceRef.current.uploadAudio(audioBlob, {
        performanceId,
        challengeTitle: challengeTitle || "Freestyle Vocal",
        duration,
        userAddress: "0x", // This would be the user's actual address in production
      });

      if (!audioResult) {
        throw new Error("Failed to upload audio to IPFS");
      }

      // Create timestamp
      const timestamp = new Date();

      // Upload metadata to IPFS
      const metadataResult = await ipfsServiceRef.current.uploadMetadata({
        performanceId,
        challengeTitle: challengeTitle || "Freestyle Vocal",
        selfRating,
        category: "freestyle",
        duration,
        userAddress: "0x", // This would be the user's actual address in production
        audioIPFS: audioResult.ipfsUrl,
        timestamp: timestamp.toISOString(),
      });

      if (!metadataResult) {
        throw new Error("Failed to upload metadata to IPFS");
      }

      // Prepare performance data
      const performanceData = {
        id: performanceId,
        challengeTitle: challengeTitle || "Freestyle Vocal",
        selfRating,
        timestamp,
        audioUrl: audioResult.gatewayUrl,
      };

      // Notify parent component
      await onUpload(performanceData);

      // Show success and reset
      setUploadSuccess(true);

      // Reset after 2 seconds
      setTimeout(() => {
        clearRecording();
        setUploadSuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Format duration display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      {/* Floating Record Button */}
      <motion.button
        onClick={togglePanel}
        className={`fixed bottom-24 right-6 z-50 rounded-full shadow-lg ${
          isOpen ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
        } p-4`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Recording Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4"
          >
            <Card className="bg-black/80 backdrop-blur-md border border-purple-500/30 text-white rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-4 text-center">
                {isRecording
                  ? "Recording..."
                  : audioBlob
                  ? "Ready to Share"
                  : "Create Recording"}
              </h3>

              {/* Input for challenge title */}
              <input
                type="text"
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                placeholder="Give your performance a title"
                className="w-full bg-white/10 border border-purple-500/30 rounded-lg p-2 mb-4 text-white"
                disabled={isRecording || isUploading}
              />

              {/* Recording Controls */}
              <div className="flex justify-center items-center mb-4 gap-4">
                {!isRecording && !audioBlob && (
                  <Button
                    onClick={handleStartRecording}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-2 px-6"
                  >
                    <Mic className="w-4 h-4" /> Start Recording
                  </Button>
                )}

                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-2 px-6"
                  >
                    <Square className="w-4 h-4" /> Stop (
                    {formatDuration(duration)})
                  </Button>
                )}

                {audioBlob &&
                  !isRecording &&
                  !isUploading &&
                  !uploadSuccess && (
                    <>
                      <Button
                        onClick={clearRecording}
                        className="bg-gray-700 hover:bg-gray-800 text-white rounded-full flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Discard
                      </Button>
                      <Button
                        onClick={handleUpload}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" /> Share
                      </Button>
                    </>
                  )}

                {isUploading && (
                  <Button
                    disabled
                    className="bg-purple-500 text-white rounded-full flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </Button>
                )}

                {uploadSuccess && (
                  <Button
                    disabled
                    className="bg-green-500 text-white rounded-full flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Uploaded!
                  </Button>
                )}
              </div>

              {/* Audio Preview */}
              {audioBlob && !isRecording && !isUploading && (
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-1">Preview:</p>
                  <audio
                    controls
                    src={audioUrl || ""}
                    className="w-full h-10"
                  />
                </div>
              )}

              {/* Self Rating */}
              {audioBlob && !isRecording && !isUploading && !uploadSuccess && (
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-1">
                    How would you rate your performance? {selfRating}⭐
                  </p>
                  <Slider
                    value={[selfRating]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(value) => setSelfRating(value[0])}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Needs Work</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <p className="text-red-400 text-sm text-center mt-2">{error}</p>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="flex justify-center items-center mt-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  <p className="text-sm text-gray-300">
                    Recording: {formatDuration(duration)}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
