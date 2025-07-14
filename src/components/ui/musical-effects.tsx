"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// Musical Pulse Effect for Active Buttons
interface MusicalPulseProps {
  children: ReactNode;
  isActive?: boolean;
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export function MusicalPulse({ 
  children, 
  isActive = false, 
  intensity = "medium",
  className = "" 
}: MusicalPulseProps) {
  const pulseVariants = {
    low: { scale: [1, 1.01, 1] },
    medium: { scale: [1, 1.02, 1] },
    high: { scale: [1, 1.03, 1] }
  };

  return (
    <motion.div
      className={className}
      animate={isActive ? pulseVariants[intensity] : { scale: 1 }}
      transition={{
        duration: 2.4,
        repeat: isActive ? Infinity : 0,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Festival Glow Effect
interface FestivalGlowProps {
  children: ReactNode;
  color?: "purple" | "pink" | "blue" | "green";
  intensity?: "subtle" | "medium" | "strong";
  className?: string;
}

export function FestivalGlow({ 
  children, 
  color = "purple", 
  intensity = "medium",
  className = "" 
}: FestivalGlowProps) {
  const glowColors = {
    purple: "99, 102, 241", // More muted indigo
    pink: "190, 107, 137", // Muted rose
    blue: "71, 85, 105", // Slate blue
    green: "52, 120, 99" // Muted teal
  };

  const glowIntensity = {
    subtle: { outer: 0.1, inner: 0.02 },
    medium: { outer: 0.15, inner: 0.04 },
    strong: { outer: 0.2, inner: 0.06 }
  };

  const rgb = glowColors[color];
  const { outer, inner } = glowIntensity[intensity];

  return (
    <motion.div
      className={className}
      style={{
        boxShadow: `0 0 20px rgba(${rgb}, ${outer}), 0 0 40px rgba(${rgb}, ${inner})`,
      }}
      animate={{
        boxShadow: [
          `0 0 20px rgba(${rgb}, ${outer}), 0 0 40px rgba(${rgb}, ${inner})`,
          `0 0 30px rgba(${rgb}, ${outer * 1.5}), 0 0 60px rgba(${rgb}, ${inner * 1.5})`,
          `0 0 20px rgba(${rgb}, ${outer}), 0 0 40px rgba(${rgb}, ${inner})`
        ]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Subtle Audio Particles (Refined)
export function SubtleAudioParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/5 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 20,
            opacity: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: -20,
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: Math.random() * 15 + 20, // 20-35 seconds
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}

// Enhanced Button Press Ripple
interface RippleEffectProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function RippleEffect({ children, color = "rgba(255,255,255,0.3)", className = "" }: RippleEffectProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileTap={{
        scale: 0.95,
      }}
      onTapStart={(e, info) => {
        // Create ripple effect at tap point
        const ripple = document.createElement("div");
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = info.point.x - rect.left - size / 2;
        const y = info.point.y - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: ${color};
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;
        
        (e.target as HTMLElement).appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }}
    >
      {children}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </motion.div>
  );
}

// Performance Spotlight Effect
interface SpotlightProps {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}

export function PerformanceSpotlight({ children, isActive = false, className = "" }: SpotlightProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={isActive ? {
        background: [
          "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
          "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 80%)",
          "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)"
        ]
      } : {}}
      transition={{
        duration: 3,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Viral Momentum Bar
interface ViralMomentumProps {
  progress: number; // 0-100
  className?: string;
}

export function ViralMomentumBar({ progress, className = "" }: ViralMomentumProps) {
  const getColor = (progress: number) => {
    if (progress < 30) return "from-blue-500 to-cyan-500";
    if (progress < 60) return "from-yellow-500 to-orange-500";
    if (progress < 90) return "from-orange-500 to-red-500";
    return "from-red-500 to-pink-500";
  };

  const getIntensity = (progress: number) => {
    if (progress < 30) return "low";
    if (progress < 60) return "medium";
    return "high";
  };

  return (
    <div className={`relative w-full h-2 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full bg-gradient-to-r ${getColor(progress)} rounded-full relative`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {progress > 70 && (
          <motion.div
            className="absolute inset-0 bg-white/30 rounded-full"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {progress > 80 && (
        <div className="absolute -top-1 -right-1">
          <motion.div
            className="text-xs"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            🔥
          </motion.div>
        </div>
      )}
    </div>
  );
}