'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Pagination } from 'swiper/modules';
import { usePitchDetection } from '@/hooks/usePitchDetection';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Text } from '@react-three/drei';
import { Mic, Play, Share2, Zap, Volume2, Star, Heart, Flame } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';

// Fun 3D Mascot that reacts to singing
function SingingMascot({ frequency, volume, isListening }: { frequency: number; volume: number; isListening: boolean }) {
  const meshRef = useRef<any>(null);
  
  useEffect(() => {
    if (meshRef.current && isListening) {
      const excitement = Math.min(2, volume / 30);
      const pitch = frequency / 440; // Relative to A4
      meshRef.current.scale.setScalar(1 + excitement * 0.5);
    }
  }, [frequency, volume, isListening]);

  return (
    <Canvas className="w-full h-full">
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <group ref={meshRef}>
        {/* Main body */}
        <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color={isListening ? "#ff6b6b" : "#4ecdc4"}
            attach="material"
            distort={isListening ? 0.6 : 0.2}
            speed={isListening ? 5 : 1}
            roughness={0.1}
            metalness={0.1}
          />
        </Sphere>
        
        {/* Eyes */}
        <Sphere args={[0.15, 16, 16]} position={[-0.3, 0.3, 0.8]}>
          <meshStandardMaterial color="#2c3e50" />
        </Sphere>
        <Sphere args={[0.15, 16, 16]} position={[0.3, 0.3, 0.8]}>
          <meshStandardMaterial color="#2c3e50" />
        </Sphere>
        
        {/* Mouth - changes based on singing */}
        <Sphere args={[0.2, 16, 16]} position={[0, -0.2, 0.8]} scale={[1, isListening ? 1.5 : 0.5, 1]}>
          <meshStandardMaterial color="#e74c3c" />
        </Sphere>
      </group>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
    </Canvas>
  );
}

// Bouncy Progress Ring with Emojis
function FunProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 10);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getEmoji = () => {
    if (progress >= 90) return "🔥";
    if (progress >= 70) return "🎉";
    if (progress >= 50) return "😊";
    if (progress >= 30) return "😐";
    return "😅";
  };

  const getRingColor = () => {
    if (progress >= 80) return "#ff6b6b";
    if (progress >= 60) return "#feca57";
    if (progress >= 40) return "#48dbfb";
    return "#ff9ff3";
  };

  return (
    <motion.div 
      className="relative" 
      style={{ width: size, height: size }}
      animate={{ 
        rotate: progress > 80 ? [0, 5, -5, 0] : 0,
        scale: progress > 90 ? [1, 1.1, 1] : 1
      }}
      transition={{ duration: 0.5, repeat: progress > 80 ? Infinity : 0 }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="8"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          stroke={getRingColor()}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ strokeDasharray }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div 
          className="text-4xl mb-1"
          key={getEmoji()}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          {getEmoji()}
        </motion.div>
        <motion.span 
          className="text-xl font-black text-white"
          key={progress}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ 
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {progress}%
        </motion.span>
      </div>
    </motion.div>
  );
}

// Crazy Floating Emojis
function FloatingEmojis() {
  const emojis = ['🎵', '🎤', '🎶', '🌟', '✨', '🎊', '🎉', '💫', '🔥', '💖'];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          animate={{
            y: [0, -200, 0],
            x: [0, Math.random() * 200 - 100, 0],
            rotate: [0, 360, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </motion.div>
      ))}
    </div>
  );
}

// Bouncy Button Component
function BouncyButton({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary" 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const variants = {
    primary: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500",
    secondary: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        ${variants[variant]}
        text-white font-black text-xl px-8 py-4 rounded-full
        shadow-2xl transform-gpu
        ${className}
      `}
      style={{ 
        fontFamily: 'Comic Sans MS, cursive',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}
      whileHover={{ 
        scale: 1.1, 
        rotate: [0, -5, 5, 0],
        boxShadow: "0 20px 40px rgba(255, 105, 180, 0.6)"
      }}
      whileTap={{ 
        scale: 0.9,
        rotate: 0
      }}
      animate={{
        boxShadow: [
          "0 10px 20px rgba(255, 105, 180, 0.3)",
          "0 15px 30px rgba(255, 105, 180, 0.5)",
          "0 10px 20px rgba(255, 105, 180, 0.3)"
        ]
      }}
      transition={{ 
        boxShadow: { duration: 2, repeat: Infinity },
        default: { type: "spring", stiffness: 400, damping: 10 }
      }}
    >
      {children}
    </motion.button>
  );
}

export default function FunVocalChallenge() {
  const { pitchData, isListening, startListening, stopListening, error, hasPermission } = usePitchDetection();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'challenge' | 'results'>('intro');
  const [streak, setStreak] = useState(0);
  
  useEffect(() => {
    if (isListening && pitchData.frequency > 0) {
      const newAccuracy = Math.max(0, 100 - Math.abs(pitchData.cents));
      setAccuracy(Math.round(newAccuracy));
      
      if (newAccuracy > 80) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }
    }
  }, [pitchData, isListening]);

  const challenges = [
    {
      title: "Karaoke Superstar! 🎤",
      description: "Sing your heart out and become the next viral sensation!",
      difficulty: "Fun Mode",
      color: "from-pink-400 via-purple-500 to-indigo-600",
      emoji: "🌟"
    },
    {
      title: "Vocal Ninja! 🥷", 
      description: "Master the art of perfect pitch with stealth and style!",
      difficulty: "Challenge Mode",
      color: "from-green-400 via-blue-500 to-purple-600",
      emoji: "⚡"
    },
    {
      title: "Rockstar Legend! 🎸",
      description: "Unleash your inner rockstar and blow everyone's minds!",
      difficulty: "Epic Mode",
      color: "from-red-400 via-pink-500 to-orange-500",
      emoji: "🔥"
    }
  ];

  // Permission screen - Super fun and inviting
  if (!hasPermission && !isListening) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 relative overflow-hidden">
        <FloatingEmojis />
        
        <motion.div 
          className="flex flex-col items-center justify-center min-h-screen p-6 text-white relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Bouncy 3D Microphone */}
          <motion.div 
            className="w-40 h-40 mb-8 relative"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl transform-gpu">
              <Mic className="w-20 h-20 text-white" />
              <motion.div
                className="absolute -top-2 -right-2 text-4xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ✨
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 
              className="text-6xl font-black bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
              style={{ 
                fontFamily: 'Comic Sans MS, cursive',
                textShadow: '4px 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              Let's SING! 🎵
            </h1>
            <p 
              className="text-2xl text-yellow-200 max-w-md font-bold"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              Ready to discover your AMAZING voice? Let's make some musical magic! ✨
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8"
          >
            <BouncyButton onClick={startListening}>
              🎤 LET'S GOOO! 🚀
            </BouncyButton>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main challenge interface - Fun and energetic
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"
        animate={{
          background: isListening 
            ? [
                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))",
                "linear-gradient(45deg, rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))",
                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))"
              ]
            : "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))"
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <FloatingEmojis />

      {/* Fun Header */}
      <motion.div 
        className="relative z-10 flex items-center justify-between p-6 backdrop-blur-md bg-white/10 border-b border-white/20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <span 
            className="font-black text-2xl text-white"
            style={{ 
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            GIGAVIBE 🎵
          </span>
        </div>
        
        {streak > 0 && (
          <motion.div
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <Flame className="w-5 h-5 text-white" />
            <span className="font-black text-white">{streak} streak!</span>
          </motion.div>
        )}
      </motion.div>

      {phase === 'intro' && (
        <div className="relative z-10 p-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 
              className="text-4xl font-black text-white text-center mb-8"
              style={{ 
                fontFamily: 'Comic Sans MS, cursive',
                textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
              }}
            >
              Pick Your Adventure! 🎯
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
                    className={`w-full h-full bg-gradient-to-br ${challenge.color} rounded-3xl p-8 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden`}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Fun background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-6xl"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
                        >
                          {challenge.emoji}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="text-lg font-bold opacity-90 mb-2">{challenge.difficulty}</div>
                      <h3 
                        className="text-3xl font-black mb-4"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        {challenge.title}
                      </h3>
                      <p className="text-lg opacity-90">{challenge.description}</p>
                    </div>
                    
                    <BouncyButton
                      onClick={() => setPhase('challenge')}
                      variant="secondary"
                      className="relative z-10"
                    >
                      🚀 START NOW!
                    </BouncyButton>
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
          {/* 3D Singing Mascot */}
          <div className="w-64 h-64 mb-8">
            <SingingMascot 
              frequency={pitchData.frequency} 
              volume={pitchData.volume} 
              isListening={isListening}
            />
          </div>

          {/* Fun Note Display */}
          <motion.div 
            className="text-center mb-8"
            key={pitchData.note + pitchData.octave}
            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div 
              className="text-9xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{ 
                fontFamily: 'Comic Sans MS, cursive',
                textShadow: '4px 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              {pitchData.frequency > 0 ? `${pitchData.note}${pitchData.octave}` : '🎵'}
            </div>
            <div 
              className="text-2xl text-yellow-300 mt-2 font-bold"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {pitchData.frequency > 0 ? `${pitchData.frequency.toFixed(0)} Hz` : 'Sing your heart out!'}
            </div>
          </motion.div>

          {/* Fun Progress Ring */}
          <FunProgressRing progress={accuracy} size={180} />

          {/* Recording Indicator */}
          {isListening && (
            <motion.div 
              className="flex items-center gap-3 mt-8 text-red-400"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [1, 0.7, 1] 
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="w-6 h-6 bg-red-500 rounded-full" />
              <span 
                className="font-black text-xl"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                🎤 Recording your AMAZING voice! 
              </span>
            </motion.div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-4 mt-8">
            <BouncyButton
              onClick={() => {
                if (isListening) {
                  stopListening();
                  setPhase('results');
                } else {
                  startListening();
                }
              }}
              variant={isListening ? "secondary" : "primary"}
            >
              {isListening ? '🏁 FINISH!' : '🎤 START SINGING!'}
            </BouncyButton>
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
            className="text-9xl mb-6"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎉
          </motion.div>
          
          <h2 
            className="text-5xl font-black text-white mb-8"
            style={{ 
              fontFamily: 'Comic Sans MS, cursive',
              textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
            }}
          >
            YOU'RE A SUPERSTAR! ⭐
          </h2>
          
          <FunProgressRing progress={accuracy} size={220} />
          
          <div className="flex gap-4 mt-8">
            <BouncyButton onClick={() => {}}>
              🔥 SHARE THIS EPIC PERFORMANCE!
            </BouncyButton>
            
            <BouncyButton
              onClick={() => setPhase('intro')}
              variant="secondary"
            >
              🎵 SING AGAIN!
            </BouncyButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}