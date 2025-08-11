"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCrossTab } from "@/contexts/CrossTabContext";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";
import SmoothVocalChallenge from "./SmoothVocalChallenge";
import SelfRating from "./SelfRating";
import RealityReveal from "./RealityReveal";
import PostChallengeGuidance from "./PostChallengeGuidance";
import { FullScreenLoading } from "./ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from 'lucide-react';

// Enhanced Audio Components

import UnifiedAudioVisualizer from "./audio/UnifiedAudioVisualizer";
import RecordingControls from "./RecordingControls";

// Services
import { LiveAudioAnalysisService, PitchData } from "@/lib/audio/LiveAudioAnalysisService";
import { AdaptiveBackingTrackService, PerformanceMetrics } from "@/lib/audio/AdaptiveBackingTrackService";
import { useFeatureFlags } from "@/lib/features/FeatureFlags";

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

// From CollaborativeChallenges
export interface Participant {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  role?: 'lead' | 'harmony' | 'backing';
  hasRecorded?: boolean;
  audioUrl?: string;
  joinedAt: Date;
}

interface UnifiedChallengeFlowProps {
  onComplete?: () => void;
  initialChallenge?: string;
  challengeData?: {
    title: string;
    artist: string;
    audioUrl: string;
    targetNote?: { note: string; octave: number };
  };
  challengeType?: 'individual' | 'duet' | 'harmony' | 'group' | 'relay';
  participants?: Participant[];
}

export default function UnifiedChallengeFlow({
  onComplete,
  initialChallenge,
  challengeData,
  challengeType = 'individual',
  participants = []
}: UnifiedChallengeFlowProps) {
  const [phase, setPhase] = useState<FlowPhase>("challenge");
  const [userSubmission, setUserSubmission] = useState<UserSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { navigateWithContext, updateVotingProgress } = useCrossTab();
  const { userInfo, signerUuid } = useFarcasterIntegration();

  const apiEndpoint = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  // ... (all the state and hooks from before)
  const [currentPitch, setCurrentPitch] = useState<PitchData | null>(null);
  const [audioData, setAudioData] = useState<Float32Array>(new Float32Array(0));
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingTrack, setIsPlayingTrack] = useState(false);
  const [volume, setVolume] = useState(50);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({ averageAccuracy: 0, tempoConsistency: 0, pitchStability: 0, confidenceLevel: 0 });
  const audioAnalysisRef = useRef<LiveAudioAnalysisService | null>(null);
  const backingTrackRef = useRef<AdaptiveBackingTrackService | null>(null);
  const accuracyHistoryRef = useRef<number[]>([]);
  const { flags, getAudioFeatures, shouldUseHighQualityVisuals } = useFeatureFlags();
  const audioFeatures = getAudioFeatures();
  const hasEnhancedFeatures = audioFeatures.immersiveVisuals || audioFeatures.gestureControls;

  // ... (all the useEffects and handlers from before)

  const renderCollaborativeUI = () => {
    if (challengeType === 'individual' || participants.length === 0) return null;

    return (
      <Card className="bg-black/20 backdrop-blur-sm border-white/10 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white/70" />
              <h3 className="text-white font-semibold">Collaborative Challenge</h3>
            </div>
            <div className="flex items-center">
              {participants.map(p => (
                <Avatar key={p.fid} className="w-8 h-8 border-2 border-black -ml-2">
                  <AvatarImage src={p.pfpUrl} />
                  <AvatarFallback>{p.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
          {challengeType === 'duet' && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-lg aspect-video p-2">
                <p className="text-white/70 text-sm text-center">{participants[0]?.displayName || 'Partner'}</p>
                {/* Placeholder for partner's video/audio visualization */}
              </div>
              <div className="bg-black/30 rounded-lg aspect-video p-2 border-2 border-gigavibe-500">
                <p className="text-white/70 text-sm text-center">You</p>
                {/* Placeholder for user's video/audio visualization */}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gigavibe-mesh relative">
      {/* ... (error and loading UI) */}

      <AnimatePresence mode="wait">
        {phase === "challenge" && (
          <motion.div key="challenge-phase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderCollaborativeUI()}
            {hasEnhancedFeatures ? (
              <motion.div
                key="enhanced-challenge"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 space-y-6 h-full"
              >
                {/* ... (enhanced challenge UI) */}
              </motion.div>
            ) : (
              <SmoothVocalChallenge
                key="challenge"
                onChallengeComplete={() => {}}
                isLoading={isLoading}
              />
            )}
          </motion.div>
        )}

        {/* ... (other phases: selfRating, judging, etc.) */}
      </AnimatePresence>
    </div>
  );
}
