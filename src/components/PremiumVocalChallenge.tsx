'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Pagination } from 'swiper/modules';
import { usePitchDetection } from '@/hooks/usePitchDetection';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Mic, Play, Share2, Zap, Volume2 } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';

// 3D Audio Visualizer Component
function AudioVisualizer({ frequency, volume, isListening }: { frequency: number; volume: number; isListening: boolean }) {
  const meshRef = useRef<any>(null);
  
  useEffect(() => {
    if (meshRef.current && isListening) {
      const distort = Math.min(1, volume / 50);
      const speed = frequency / 440; // Relative to A4
      meshRef.current.distort = distort;
      meshRef.current.speed = speed;
    }
  }, [frequency, volume, isListening]);

  return (
    <Canvas className="w-full h-full">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Sphere ref={meshRef} args={[1, 100, 200]} scale={isListening ? 2 : 1.5}>
        <MeshDistortMaterial
          color={isListening ? "#8b5cf6" : "#6366f1"}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
        />
      </Sphere>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
}

// Animated Progress Ring
function ProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 10);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ strokeDasharray }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-2xl font-bold text-white"
          key={progress}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  );
}

// Floating Particles Background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20"
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

export default function PremiumVocalChallenge() {
  const { pitchData, isListening, startListening, stopListening, error, hasPermission } = usePitchDetection();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'challenge' | 'results'>('intro');
  
  // Smooth accuracy animation
  const springAccuracy = useSpring(accuracy, { stiffness: 300, damping: 30 });
  
  useEffect(() => {
    if (isListening && pitchData.frequency > 0) {
      const newAccuracy = Math.max(0, 100 - Math.abs(pitchData.cents));
      setAccuracy(Math.round(newAccuracy));
    }
  }, [pitchData, isListening]);

  const challenges = [
    {
      title: "Vocal Range Test",
      description: "Sing from your lowest to highest note",
      difficulty: "Beginner",
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Perfect Pitch Challenge", 
      description: "Match this AI-generated melody",
      difficulty: "Intermediate",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Vibrato Master",
      description: "Show off your vocal control",
      difficulty: "Advanced", 
      color: "from-pink-500 to-red-600"
    }
  ];

  // Permission screen with advanced animations
  if (!hasPermission && !isListening) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
        <FloatingParticles />
        
        <motion.div 
          className="flex flex-col items-center justify-center min-h-screen p-6 text-white relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* 3D Microphone Icon */}
          <motion.div 
            className="w-32 h-32 mb-8 relative"
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <Mic className="w-16 h-16 text-white" />
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Ready to discover your voice?
            </h1>
            <p className="text-xl text-purple-200 max-w-md">
              We need microphone access to analyze your vocal superpowers
            </p>
          </motion.div>
          
          <motion.button
            onClick={startListening}
            className="mt-8 px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xl font-bold text-white shadow-2xl"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Let's Go! 🎤
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Main challenge interface
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic background based on audio */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30"
        animate={{
          opacity: isListening ? [0.3, 0.6, 0.3] : 0.3
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <FloatingParticles />

      {/* Header with glass morphism */}
      <motion.div 
        className="relative z-10 flex items-center justify-between p-6 backdrop-blur-md bg-white/5 border-b border-white/10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <span className="font-bold text-xl text-white">GIGAVIBE</span>
        </div>
        
        <motion.button 
          className="p-3 rounded-full bg-white/10 backdrop-blur-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Share2 className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>

      {phase === 'intro' && (
        <div className="relative z-10 p-6">
          {/* Challenge Selector with Swiper */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Choose Your Challenge
            </h2>
            
            <Swiper
              effect={'cards'}
              grabCursor={true}
              modules={[EffectCards, Pagination]}
              className="w-full max-w-sm mx-auto h-96"
              onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
            >
              {challenges.map((challenge, index) => (
                <SwiperSlide key={index}>
                  <motion.div 
                    className={`w-full h-full bg-gradient-to-br ${challenge.color} rounded-3xl p-8 flex flex-col justify-between text-white shadow-2xl`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div>
                      <div className="text-sm opacity-80 mb-2">{challenge.difficulty}</div>
                      <h3 className="text-2xl font-bold mb-4">{challenge.title}</h3>
                      <p className="text-lg opacity-90">{challenge.description}</p>
                    </div>
                    
                    <motion.button
                      onClick={() => setPhase('challenge')}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl py-4 px-6 font-semibold"
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Challenge
                    </motion.button>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>
      )}

      {phase === 'challenge' && (
        <motion.div 
          className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* 3D Audio Visualizer */}
          <div className="w-64 h-64 mb-8">
            <AudioVisualizer 
              frequency={pitchData.frequency} 
              volume={pitchData.volume} 
              isListening={isListening}
            />
          </div>

          {/* Note Display with Advanced Typography */}
          <motion.div 
            className="text-center mb-8"
            key={pitchData.note + pitchData.octave}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-8xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {pitchData.frequency > 0 ? `${pitchData.note}${pitchData.octave}` : '—'}
            </div>
            <div className="text-xl text-purple-300 mt-2">
              {pitchData.frequency > 0 ? `${pitchData.frequency.toFixed(0)} Hz` : 'Sing now!'}
            </div>
          </motion.div>

          {/* Advanced Progress Ring */}
          <ProgressRing progress={accuracy} size={150} />

          {/* Recording Indicator with Pulse Animation */}
          {isListening && (
            <motion.div 
              className="flex items-center gap-3 mt-8 text-red-400"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              <span className="font-semibold text-lg">Recording your voice...</span>
            </motion.div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-4 mt-8">
            <motion.button
              onClick={() => {
                if (isListening) {
                  stopListening();
                  setPhase('results');
                } else {
                  startListening();
                }
              }}
              className={`px-8 py-4 rounded-2xl font-bold text-lg ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              } text-white shadow-2xl`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isListening ? 'Finish' : 'Start Singing'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {phase === 'results' && (
        <motion.div 
          className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] p-6 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="text-8xl mb-6"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎉
          </motion.div>
          
          <h2 className="text-4xl font-bold text-white mb-4">Amazing Performance!</h2>
          
          <ProgressRing progress={accuracy} size={200} />
          
          <div className="flex gap-4 mt-8">
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Share Result 🔥
            </motion.button>
            
            <motion.button
              onClick={() => setPhase('intro')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}