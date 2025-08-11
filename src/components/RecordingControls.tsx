"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Play, Pause, Mic, MicOff, Volume2, VolumeX, RotateCcw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GestureState {
  isPressed: boolean;
  pressureLevel: number;
  gestureType: 'tap' | 'hold' | 'swipe' | 'pinch' | null;
  direction?: 'up' | 'down' | 'left' | 'right';
}

interface GestureEnhancedControlsProps {
  isRecording?: boolean;
  isPlaying?: boolean;
  volume?: number;
  onRecord?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onVolumeChange?: (volume: number) => void;
  onReset?: () => void;
  className?: string;
  enableHaptics?: boolean;
  pressureSensitive?: boolean;
}

export default function GestureEnhancedControls({
  isRecording = false,
  isPlaying = false,
  volume = 50,
  onRecord,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onReset,
  className,
  enableHaptics = true,
  pressureSensitive = true
}: GestureEnhancedControlsProps) {
  const [gestureState, setGestureState] = useState<GestureState>({
    isPressed: false,
    pressureLevel: 0,
    gestureType: null
  });
  
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastTap, setLastTap] = useState(0);
  
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  
  // Motion values for gesture tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useTransform([x, y], ([latestX, latestY]) => {
    const distance = Math.sqrt(Number(latestX) * Number(latestX) + Number(latestY) * Number(latestY));
    return Math.max(0.8, 1 - distance / 200);
  });

  // Haptic feedback function
  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!enableHaptics || !navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    };
    
    navigator.vibrate(patterns[intensity]);
  };

  // Pressure-sensitive recording button
  const handleRecordPress = (event: React.PointerEvent) => {
    if (!pressureSensitive) {
      handleRecordToggle();
      return;
    }

    const pressure = event.pressure || 0;
    setGestureState(prev => ({
      ...prev,
      isPressed: true,
      pressureLevel: pressure,
      gestureType: 'hold'
    }));

    // Start long press timer
    const timer = setTimeout(() => {
      if (pressure > 0.5) {
        triggerHaptic('heavy');
        onRecord?.();
      }
    }, 200);
    
    setLongPressTimer(timer);
  };

  const handleRecordRelease = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    setGestureState(prev => ({
      ...prev,
      isPressed: false,
      pressureLevel: 0,
      gestureType: null
    }));

    if (isRecording) {
      onStop?.();
    }
  };

  const handleRecordToggle = () => {
    triggerHaptic('medium');
    if (isRecording) {
      onStop?.();
    } else {
      onRecord?.();
    }
  };

  // Double tap detection for play/pause
  const handlePlayTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    if (timeDiff < 300 && timeDiff > 0) {
      // Double tap detected
      triggerHaptic('light');
      onReset?.();
    } else {
      // Single tap
      triggerHaptic('medium');
      if (isPlaying) {
        onPause?.();
      } else {
        onPlay?.();
      }
    }
    
    setLastTap(now);
  };

  // Swipe gesture for volume control
  const handleVolumeSwipe = (info: PanInfo) => {
    const deltaY = info.offset.y;
    const sensitivity = 2;
    const volumeChange = -deltaY / sensitivity;
    const newVolume = Math.max(0, Math.min(100, volume + volumeChange));
    
    if (Math.abs(volumeChange) > 5) {
      triggerHaptic('light');
      onVolumeChange?.(newVolume);
    }
  };

  // Pinch gesture detection
  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      setGestureState(prev => ({ ...prev, gestureType: 'pinch' }));
    }
  };

  return (
    <motion.div 
      className={cn(
        "flex items-center justify-center gap-6 p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10",
        className
      )}
      style={{ scale }}
    >
      {/* Record Button with Pressure Sensitivity */}
      <motion.button
        ref={recordButtonRef}
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
          isRecording 
            ? "bg-red-500 shadow-lg shadow-red-500/25" 
            : "bg-gigavibe-500 hover:bg-gigavibe-600 shadow-lg shadow-gigavibe-500/25"
        )}
        onPointerDown={handleRecordPress}
        onPointerUp={handleRecordRelease}
        onPointerLeave={handleRecordRelease}
        onTouchStart={handleTouchStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: gestureState.isPressed ? 1 + gestureState.pressureLevel * 0.2 : 1,
          boxShadow: gestureState.isPressed 
            ? `0 0 ${20 + gestureState.pressureLevel * 20}px ${isRecording ? 'rgba(239, 68, 68, 0.5)' : 'rgba(139, 92, 246, 0.5)'}`
            : undefined
        }}
      >
        {/* Pressure Ring */}
        {gestureState.isPressed && pressureSensitive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/50"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ 
              scale: 1 + gestureState.pressureLevel * 0.5,
              opacity: gestureState.pressureLevel
            }}
          />
        )}
        
        {isRecording ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MicOff className="w-6 h-6 text-white" />
          </motion.div>
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
        
        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Play/Pause Button with Double Tap */}
      <motion.button
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
          isPlaying 
            ? "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25" 
            : "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25"
        )}
        onClick={handlePlayTap}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </motion.button>

      {/* Volume Control with Swipe Gesture */}
      <motion.div
        ref={volumeSliderRef}
        className="relative w-12 h-32 bg-white/10 rounded-full overflow-hidden cursor-pointer"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => handleVolumeSwipe(info)}
        whileHover={{ scale: 1.05 }}
      >
        {/* Volume Fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gigavibe-400 to-purple-400 rounded-full"
          animate={{ height: `${volume}%` }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Volume Icon */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          {volume > 50 ? (
            <Volume2 className="w-4 h-4 text-white/70" />
          ) : volume > 0 ? (
            <Volume2 className="w-4 h-4 text-white/70" />
          ) : (
            <VolumeX className="w-4 h-4 text-white/70" />
          )}
        </div>
        
        {/* Swipe Indicator */}
        <motion.div
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white/50"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↕
        </motion.div>
      </motion.div>

      {/* Reset Button */}
      <motion.button
        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
        onClick={() => {
          triggerHaptic('medium');
          onReset?.();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RotateCcw className="w-5 h-5 text-white/70" />
      </motion.button>

      {/* Gesture Feedback */}
      {gestureState.gestureType && (
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {gestureState.gestureType === 'hold' && pressureSensitive && 
            `Pressure: ${Math.round(gestureState.pressureLevel * 100)}%`}
          {gestureState.gestureType === 'pinch' && 'Pinch detected'}
        </motion.div>
      )}

      {/* Instructions Overlay */}
      <motion.div
        className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center text-xs text-white/50 max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>Hold to record • Double tap to reset • Swipe volume to adjust</p>
      </motion.div>
    </motion.div>
  );
}