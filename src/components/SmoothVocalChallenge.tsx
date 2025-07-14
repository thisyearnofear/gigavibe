"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import {
  Mic,
  Share2,
  Heart,
  X,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StructuredChallenge from "./StructuredChallenge";
import ViralChallenge from "./ViralChallenge";
import {
  MusicalPulse,
  FestivalGlow,
  SubtleAudioParticles,
} from "@/components/ui/musical-effects";

// Smooth 3D Audio Visualizer
function AudioVisualizer({
  frequency,
  volume,
  isListening,
}: {
  frequency: number;
  volume: number;
  isListening: boolean;
}) {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (meshRef.current && isListening) {
      const intensity = Math.min(1, volume / 40);
      const pitch = frequency / 440;
      meshRef.current.scale.setScalar(0.8 + intensity * 0.4);
    }
  }, [frequency, volume, isListening]);

  return (
    <Canvas className="w-full h-full">
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={0.8}>
        <MeshDistortMaterial
          color={isListening ? "#6366f1" : "#8b5cf6"}
          attach="material"
          distort={isListening ? 0.4 : 0.1}
          speed={isListening ? 3 : 1}
          roughness={0.1}
          metalness={0.2}
        />
      </Sphere>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}

// Tinder-style Swipeable Card
function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  className = "",
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]); // Reduced rotation for smoother feel
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Add color feedback during swipe
  const backgroundColor = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    [
      "rgba(239, 68, 68, 0.1)",
      "rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0)",
      "rgba(34, 197, 94, 0.1)",
      "rgba(34, 197, 94, 0.2)",
    ]
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 75; // Reduced for more responsive swiping
    const velocity = Math.abs(info.velocity.x) + Math.abs(info.velocity.y);
    const velocityThreshold = 500; // Consider velocity for quick swipes

    // Check for quick swipes (lower distance threshold if high velocity)
    const effectiveThreshold =
      velocity > velocityThreshold ? threshold * 0.6 : threshold;

    if (info.offset.x > effectiveThreshold && onSwipeRight) {
      // Haptic feedback on mobile
      if ("vibrate" in navigator) navigator.vibrate(50);
      onSwipeRight();
    } else if (info.offset.x < -effectiveThreshold && onSwipeLeft) {
      if ("vibrate" in navigator) navigator.vibrate(50);
      onSwipeLeft();
    } else if (info.offset.y < -effectiveThreshold && onSwipeUp) {
      if ("vibrate" in navigator) navigator.vibrate(50);
      onSwipeUp();
    } else {
      // Smooth snap back with spring animation
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 cursor-grab active:cursor-grabbing ${className}`}
      style={{ x, y, rotate, opacity, backgroundColor }}
      drag
      dragConstraints={{ left: -300, right: 300, top: -300, bottom: 50 }}
      dragElastic={0.3}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ scale: 1.02, zIndex: 10 }}
    >
      {children}
    </motion.div>
  );
}

// Smooth Progress Ring
function ProgressRing({
  progress,
  size = 120,
}: {
  progress: number;
  size?: number;
}) {
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="url(#gradient)"
          strokeWidth="4"
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ strokeDasharray }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-2xl font-semibold text-white"
          key={progress}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  );
}

// Smooth Button Component
function SmoothButton({
  children,
  onClick,
  variant = "primary",
  size = "lg",
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg",
    secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-white",
    ghost: "bg-transparent text-white hover:bg-white/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm min-h-[44px]",
    md: "px-6 py-3 text-base min-h-[44px]",
    lg: "px-8 py-4 text-lg min-h-[44px]",
  };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-2xl font-medium
        transition-all duration-200
        touch-manipulation
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      whileHover={{
        scale: 1.02,
        boxShadow:
          variant === "primary"
            ? "0 20px 40px rgba(99, 102, 241, 0.3)"
            : undefined,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}

interface SmoothVocalChallengeProps {
  onChallengeComplete?: (
    challengeTitle: string,
    audioUrl: string,
    challengeId?: string
  ) => void;
  isLoading?: boolean;
}

export default function SmoothVocalChallenge({
  onChallengeComplete,
  isLoading = false,
}: SmoothVocalChallengeProps) {
  // Only use pitch detection for structured challenges, not viral challenges
  const pitchDetection = usePitchDetection();
  const {
    pitchData,
    isListening,
    startListening,
    stopListening,
    error,
    hasPermission,
  } = pitchDetection;
  const [accuracy, setAccuracy] = useState(0);
  const [phase, setPhase] = useState<"intro" | "challenge" | "results">(
    "intro"
  );
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [selectedChallengeTitle, setSelectedChallengeTitle] =
    useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");
  const [actionFeedback, setActionFeedback] = useState<string>("");

  // Show action feedback and auto-hide
  const showActionFeedback = (message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(""), 2000);
  };

  // Stop pitch detection when switching to viral challenges (they don't need it)
  useEffect(() => {
    if (
      phase === "challenge" &&
      challenges[currentChallenge]?.type === "viral"
    ) {
      if (isListening) {
        console.log("🔇 Stopping pitch detection for viral challenge");
        stopListening();
      }
    }
  }, [phase, currentChallenge, isListening, stopListening]);

  useEffect(() => {
    if (isListening && pitchData.frequency > 0) {
      const newAccuracy = Math.max(0, 100 - Math.abs(pitchData.cents));
      setAccuracy(Math.round(newAccuracy));
    }
  }, [pitchData, isListening]);

  const challenges = [
    {
      title: "Viral Challenge",
      description: "Copy an AI-generated track and see how you really sound",
      difficulty: "Fun Mode",
      duration: "30s",
      color: "from-purple-500 to-pink-600",
      type: "viral",
    },
    {
      title: "Vocal Range Test",
      description: "Find out if you're secretly Mariah Carey",
      difficulty: "Training",
      duration: "2 min",
      color: "from-blue-500 to-indigo-600",
      type: "structured",
    },
    {
      title: "Show Off Mode",
      description: "Time to prove you've got the goods",
      difficulty: "Advanced",
      duration: "5 min",
      color: "from-pink-500 to-red-600",
      type: "structured",
    },
  ];

  // Permission screen - Clean and sophisticated
  if (!hasPermission && !isListening) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        <motion.div
          className="flex flex-col items-center justify-center min-h-screen p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="w-32 h-32 mb-12 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <Mic className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <motion.div
            className="text-center space-y-6 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold">
              Ready to find out how you really sound?
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We need microphone access to analyze your voice. Don't worry,
              we've heard worse.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12"
          >
            <SmoothButton onClick={startListening} size="lg">
              Grant Access
            </SmoothButton>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main interface - Tinder-style card stack
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Subtle Audio Particles */}
      <SubtleAudioParticles />

      {/* Enhanced animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10"
        animate={{
          opacity: isListening ? [0.1, 0.3, 0.1] : 0.1,
          background: isListening
            ? [
                "linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))",
                "linear-gradient(to bottom right, rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.15), rgba(99, 102, 241, 0.15))",
                "linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))",
              ]
            : "linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))",
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Clean Header */}
      <motion.div
        className="relative z-10 flex items-center justify-between p-6 backdrop-blur-md bg-white/5"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <MusicalPulse isActive={isListening} intensity="low">
            <FestivalGlow color="purple" intensity="subtle">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <motion.div
                  animate={{ rotate: isListening ? 360 : 0 }}
                  transition={{
                    duration: 2,
                    repeat: isListening ? Infinity : 0,
                    ease: "linear",
                  }}
                >
                  <Mic className="w-5 h-5 text-white" />
                </motion.div>
              </div>
            </FestivalGlow>
          </MusicalPulse>
          <span className="font-semibold text-xl text-white">GIGAVIBE</span>
        </div>

        <SmoothButton onClick={() => {}} variant="ghost" size="sm">
          <Share2 className="w-5 h-5" />
        </SmoothButton>
      </motion.div>

      {phase === "intro" && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] p-6">
          <motion.h2
            className="text-3xl font-bold text-white text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Choose Your Challenge
          </motion.h2>

          {/* Tinder-style card stack */}
          <div className="relative w-full max-w-sm h-96">
            <AnimatePresence>
              {challenges.map((challenge, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{
                    scale: index === currentChallenge ? 1 : 0.95,
                    opacity: index === currentChallenge ? 1 : 0.7,
                    y: index === currentChallenge ? 0 : 20,
                    zIndex: challenges.length - index,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <SwipeableCard
                    onSwipeRight={() => {
                      console.log("➡️ Swiped right - Starting challenge!");
                      setSelectedChallengeTitle(challenge.title);
                      setPhase("challenge");
                    }}
                    onSwipeLeft={() => {
                      console.log(
                        "⬅️ Swiped left - Skipping to next challenge"
                      );
                      setCurrentChallenge(
                        (prev) => (prev + 1) % challenges.length
                      );
                    }}
                    onSwipeUp={() => {
                      console.log("⬆️ Swiped up - Quick start!");
                      setSelectedChallengeTitle(challenge.title);
                      setPhase("challenge");
                    }}
                  >
                    <FestivalGlow color="purple" intensity="subtle">
                      <div
                        className={`w-full h-full bg-gradient-to-br ${challenge.color} rounded-3xl p-8 flex flex-col justify-between text-white shadow-2xl backdrop-blur-md border border-white/20`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                              {challenge.difficulty}
                            </span>
                            <span className="text-sm opacity-80">
                              {challenge.duration}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold mb-4">
                            {challenge.title}
                          </h3>
                          <p className="text-lg opacity-90 leading-relaxed">
                            {challenge.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-8 mt-8">
                          <motion.button
                            className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border border-red-400/30"
                            whileHover={{
                              scale: 1.1,
                              backgroundColor: "rgba(239, 68, 68, 0.3)",
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              console.log("❌ Skip challenge");
                              showActionFeedback("Skipped! 👋");
                              if ("vibrate" in navigator)
                                navigator.vibrate(100);
                              setCurrentChallenge(
                                (prev) => (prev + 1) % challenges.length
                              );
                            }}
                          >
                            <X className="w-6 h-6 text-red-400" />
                          </motion.button>
                          <motion.button
                            className="w-16 h-16 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-full flex items-center justify-center border border-pink-400/50"
                            whileHover={{
                              scale: 1.1,
                              boxShadow: "0 0 20px rgba(236, 72, 153, 0.5)",
                              backgroundColor: "rgba(236, 72, 153, 0.4)",
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              console.log("❤️ Start challenge with love!");
                              showActionFeedback("Let's sing! 🎤✨");
                              if ("vibrate" in navigator)
                                navigator.vibrate([50, 50, 100]);
                              setSelectedChallengeTitle(challenge.title);
                              setPhase("challenge");
                            }}
                          >
                            <Heart className="w-8 h-8 text-pink-300" />
                          </motion.button>
                        </div>
                      </div>
                    </FestivalGlow>
                  </SwipeableCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Enhanced Swipe hints with animations */}
          <motion.div
            className="flex flex-col items-center gap-3 mt-8 text-white/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="flex items-center gap-6">
              <motion.div
                className="flex items-center gap-2"
                animate={{ x: [0, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ChevronLeft className="w-4 h-4 text-red-400" />
                <span className="text-sm">Swipe left or tap ❌ to skip</span>
              </motion.div>

              <motion.div
                className="flex items-center gap-2"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <span className="text-sm">Swipe right to start</span>
                <ChevronRight className="w-4 h-4 text-green-400" />
              </motion.div>
            </div>

            <motion.div
              className="flex items-center gap-4"
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <ChevronUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm">
                Swipe up or tap ❤️ for instant start
              </span>
              <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
            </motion.div>
          </motion.div>

          {/* Action Feedback Toast */}
          <AnimatePresence>
            {actionFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 text-white font-semibold shadow-lg border border-white/30 z-50"
              >
                {actionFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {phase === "challenge" && (
        <>
          {challenges[currentChallenge]?.type === "viral" ? (
            <ViralChallenge
              onComplete={(accuracy, recording, challengeId) => {
                setAccuracy(accuracy);
                setRecordingUrl(recording);
                setPhase("results");
              }}
            />
          ) : (
            <StructuredChallenge
              onComplete={(accuracy, recording, id) => {
                setAccuracy(accuracy);
                setRecordingUrl(recording);
                if (id) setChallengeId(id);
                setPhase("results");
              }}
            />
          )}
        </>
      )}

      {phase === "results" && (
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="text-6xl mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            ✨
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-8">
            Challenge Complete
          </h2>

          <ProgressRing progress={accuracy} size={200} />

          <div className="flex gap-4 mt-12">
            <SmoothButton
              onClick={() => {
                if (onChallengeComplete && recordingUrl) {
                  onChallengeComplete(
                    selectedChallengeTitle,
                    recordingUrl,
                    challengeId || "default-id"
                  );
                }
              }}
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Continue to Rating"}
            </SmoothButton>

            <SmoothButton onClick={() => setPhase("intro")} variant="secondary">
              Try Another
            </SmoothButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}
