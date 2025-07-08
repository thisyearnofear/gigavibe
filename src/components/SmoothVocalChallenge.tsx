'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { usePitchDetection } from '@/hooks/usePitchDetection';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Mic, Share2, Heart, X, ChevronUp } from 'lucide-react';
import StructuredChallenge from './StructuredChallenge';
import ViralChallenge from './ViralChallenge';

// Smooth 3D Audio Visualizer
function AudioVisualizer({ frequency, volume, isListening }: { frequency: number; volume: number; isListening: boolean }) {
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
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}

// Tinder-style Swipeable Card
function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp,
  className = "" 
}: { 
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.y < -threshold && onSwipeUp) {
      onSwipeUp();
    } else {
      // Snap back
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 cursor-grab active:cursor-grabbing ${className}`}
      style={{ x, y, rotate, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}

// Smooth Progress Ring
function ProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
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
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg",
    secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-white",
    ghost: "bg-transparent text-white hover:bg-white/10"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base", 
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-2xl font-medium
        transition-all duration-200
        ${className}
      `}
      whileHover={{ 
        scale: 1.02,
        boxShadow: variant === "primary" ? "0 20px 40px rgba(99, 102, 241, 0.3)" : undefined
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}

export default function SmoothVocalChallenge({ onChallengeComplete }: { onChallengeComplete?: (challengeTitle: string, audioUrl: string) => void }) {
  const { pitchData, isListening, startListening, stopListening, error, hasPermission } = usePitchDetection();
  const [accuracy, setAccuracy] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'challenge' | 'results'>('intro');
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [selectedChallengeTitle, setSelectedChallengeTitle] = useState<string>('');
  
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
      type: "viral"
    },
    {
      title: "Vocal Range Test",
      description: "Find out if you're secretly Mariah Carey",
      difficulty: "Training",
      duration: "2 min",
      color: "from-blue-500 to-indigo-600",
      type: "structured"
    },
    {
      title: "Show Off Mode",
      description: "Time to prove you've got the goods",
      difficulty: "Advanced", 
      duration: "5 min",
      color: "from-pink-500 to-red-600",
      type: "structured"
    }
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
              We need microphone access to analyze your voice. Don't worry, we've heard worse.
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
      {/* Subtle animated background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10"
        animate={{
          opacity: isListening ? [0.1, 0.2, 0.1] : 0.1
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
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: isListening ? 360 : 0 }}
              transition={{ duration: 2, repeat: isListening ? Infinity : 0, ease: "linear" }}
            >
              <Mic className="w-5 h-5 text-white" />
            </motion.div>
          </div>
          <span className="font-semibold text-xl text-white">GIGAVIBE</span>
        </div>
        
        <SmoothButton onClick={() => {}} variant="ghost" size="sm">
          <Share2 className="w-5 h-5" />
        </SmoothButton>
      </motion.div>

      {phase === 'intro' && (
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
                    zIndex: challenges.length - index
                  }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  <SwipeableCard
                    onSwipeRight={() => {
                      setSelectedChallengeTitle(challenge.title);
                      setPhase('challenge');
                    }}
                    onSwipeLeft={() => {
                      setCurrentChallenge((prev) => (prev + 1) % challenges.length);
                    }}
                    onSwipeUp={() => {
                      setSelectedChallengeTitle(challenge.title);
                      setPhase('challenge');
                    }}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${challenge.color} rounded-3xl p-8 flex flex-col justify-between text-white shadow-2xl backdrop-blur-md`}>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                            {challenge.difficulty}
                          </span>
                          <span className="text-sm opacity-80">
                            {challenge.duration}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{challenge.title}</h3>
                        <p className="text-lg opacity-90 leading-relaxed">{challenge.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-8 mt-8">
                        <motion.div
                          className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-6 h-6" />
                        </motion.div>
                        <motion.div
                          className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className="w-8 h-8" />
                        </motion.div>
                      </div>
                    </div>
                  </SwipeableCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Swipe hints */}
          <motion.div 
            className="flex items-center gap-4 mt-8 text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm">Swipe up to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Tap heart to begin</span>
            </div>
          </motion.div>
        </div>
      )}

      {phase === 'challenge' && (
        <>
          {challenges[currentChallenge]?.type === 'viral' ? (
            <ViralChallenge
              onComplete={(accuracy, recording, challengeId) => {
                setAccuracy(accuracy);
                setRecordingUrl(recording);
                setPhase('results');
              }}
            />
          ) : (
            <StructuredChallenge
              onComplete={(accuracy, recording) => {
                setAccuracy(accuracy);
                setRecordingUrl(recording);
                setPhase('results');
              }}
            />
          )}
        </>
      )}

      {phase === 'results' && (
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
                  onChallengeComplete(selectedChallengeTitle, recordingUrl);
                }
              }} 
              variant="primary"
            >
              Continue to Rating
            </SmoothButton>
            
            <SmoothButton
              onClick={() => setPhase('intro')}
              variant="secondary"
            >
              Try Another
            </SmoothButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}