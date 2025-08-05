"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Music, CheckCircle2 } from 'lucide-react';

interface UnifiedAudioVisualizerProps {
  // Audio data
  waveform?: number[];
  pitch?: {
    note: string;
    octave: number;
    cents: number;
    frequency: number;
  };
  volume?: number;
  
  // Recording state
  isRecording?: boolean;
  isListening?: boolean;
  hasRecording?: boolean;
  
  // Visual preferences
  size?: 'sm' | 'md' | 'lg' | 'xl';
  primaryColor?: string;
  secondaryColor?: string;
  animationIntensity?: number;
  showPitchWheel?: boolean;
  showWaveform?: boolean;
  
  // Interaction callbacks
  onVisualizerClick?: () => void;
}

/**
 * UnifiedAudioVisualizer
 * 
 * A component that combines waveform visualization and pitch wheel
 * to provide a beautiful, interactive audio visualization experience.
 */
const UnifiedAudioVisualizer: React.FC<UnifiedAudioVisualizerProps> = ({
  waveform = [],
  pitch = { note: 'A', octave: 4, cents: 0, frequency: 440 },
  volume = 0,
  isRecording = false,
  isListening = false,
  hasRecording = false,
  size = 'lg',
  primaryColor = 'rgba(139, 92, 246, 1)', // Purple
  secondaryColor = 'rgba(236, 72, 153, 1)', // Pink
  animationIntensity = 1,
  showPitchWheel = true,
  showWaveform = true,
  onVisualizerClick
}) => {
  // Refs for canvas elements
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const pitchWheelCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for animation values
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [isInTune, setIsInTune] = useState(false);
  
  // Size mapping
  const sizeMap = {
    sm: { container: 'w-64 h-64', waveform: 'h-16' },
    md: { container: 'w-80 h-80', waveform: 'h-20' },
    lg: { container: 'w-96 h-96', waveform: 'h-24' },
    xl: { container: 'w-[32rem] h-[32rem]', waveform: 'h-32' }
  };
  
  // Note names for the pitch wheel
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Calculate accuracy score based on cents deviation
  useEffect(() => {
    if (!isListening || pitch.frequency === 0) {
      setAccuracyScore(0);
      setIsInTune(false);
      return;
    }
    
    // Calculate accuracy (0-100) based on cents deviation
    const accuracy = Math.max(0, 100 - Math.abs(pitch.cents) * 2);
    setAccuracyScore(accuracy);
    
    // Determine if in tune (within 10 cents)
    setIsInTune(Math.abs(pitch.cents) < 10);
    
    // Calculate confidence based on volume
    setConfidenceLevel(Math.min(100, volume * 2));
  }, [pitch.cents, pitch.frequency, volume, isListening]);
  
  // Draw waveform visualization
  useEffect(() => {
    if (!showWaveform || !waveformCanvasRef.current) return;
    
    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (!isListening || waveform.length === 0) {
      // Draw flat line when inactive
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }
    
    // Create dynamic gradient based on recording state and volume
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    const intensity = Math.min(1, volume / 50) * animationIntensity;
    
    if (isRecording) {
      // Recording gradient (more vibrant)
      gradient.addColorStop(0, `rgba(236, 72, 153, ${0.6 + intensity * 0.4})`); // Pink
      gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.7 + intensity * 0.3})`); // Purple
      gradient.addColorStop(1, `rgba(59, 130, 246, ${0.5 + intensity * 0.5})`); // Blue
    } else {
      // Playback gradient (more subtle)
      gradient.addColorStop(0, `rgba(99, 102, 241, ${0.5 + intensity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.6 + intensity * 0.3})`);
      gradient.addColorStop(1, `rgba(236, 72, 153, ${0.4 + intensity * 0.4})`);
    }
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(2, Math.min(4, 2 + intensity));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw waveform with dynamic scaling
    const sliceWidth = width / waveform.length;
    let x = 0;
    
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    
    for (let i = 0; i < waveform.length; i++) {
      const y = (waveform[i] * height * 0.5 * (0.5 + intensity * 0.5)) + (height / 2);
      ctx.lineTo(x, y);
      x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Add glow effect for recording
    if (isRecording) {
      ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
      ctx.shadowBlur = 10 * intensity;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [waveform, isRecording, isListening, volume, animationIntensity, showWaveform]);
  
  // Draw pitch wheel visualization
  useEffect(() => {
    if (!showPitchWheel || !pitchWheelCanvasRef.current) return;
    
    const canvas = pitchWheelCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw outer circle
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw note markers
    noteNames.forEach((noteName, index) => {
      const angle = (index / noteNames.length) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.fillStyle = noteName === pitch.note ? primaryColor : 'rgba(148, 163, 184, 0.6)';
      ctx.font = noteName === pitch.note ? 'bold 16px sans-serif' : '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(noteName, x, y);
    });
    
    if (!isListening || pitch.frequency === 0) return;
    
    // Draw accuracy zones
    const zoneWidth = Math.PI / 6; // 30 degrees
    
    // Calculate angle based on current note
    const noteIndex = noteNames.indexOf(pitch.note);
    const baseAngle = (noteIndex / noteNames.length) * Math.PI * 2 - Math.PI / 2;
    
    // Draw accuracy zones
    ctx.globalAlpha = 0.3;
    
    // Perfect zone (green)
    ctx.fillStyle = 'rgba(74, 222, 128, 0.5)'; // Green
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, baseAngle - zoneWidth * 0.2, baseAngle + zoneWidth * 0.2);
    ctx.arc(centerX, centerY, radius * 0.6, baseAngle + zoneWidth * 0.2, baseAngle - zoneWidth * 0.2, true);
    ctx.closePath();
    ctx.fill();
    
    // Good zone (yellow)
    ctx.fillStyle = 'rgba(250, 204, 21, 0.5)'; // Yellow
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, baseAngle - zoneWidth * 0.5, baseAngle - zoneWidth * 0.2);
    ctx.arc(centerX, centerY, radius * 0.6, baseAngle - zoneWidth * 0.2, baseAngle - zoneWidth * 0.5, true);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, baseAngle + zoneWidth * 0.2, baseAngle + zoneWidth * 0.5);
    ctx.arc(centerX, centerY, radius * 0.6, baseAngle + zoneWidth * 0.5, baseAngle + zoneWidth * 0.2, true);
    ctx.closePath();
    ctx.fill();
    
    ctx.globalAlpha = 1;
    
    // Draw needle
    const needleLength = radius * 0.7;
    const needleAngle = baseAngle + (pitch.cents / 100) * zoneWidth;
    
    ctx.strokeStyle = isInTune ? 'rgba(74, 222, 128, 1)' : 'rgba(250, 204, 21, 1)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * needleLength,
      centerY + Math.sin(needleAngle) * needleLength
    );
    ctx.stroke();
    
    // Draw center circle
    ctx.fillStyle = isInTune ? 'rgba(74, 222, 128, 1)' : 'rgba(250, 204, 21, 1)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    
  }, [pitch, isListening, noteNames, primaryColor, showPitchWheel, isInTune]);
  
  return (
    <div 
      className={`relative ${sizeMap[size].container} mx-auto`}
      onClick={onVisualizerClick}
    >
      {/* Main container with gradient background */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden"
        animate={{
          boxShadow: isRecording 
            ? [
                '0 0 0 rgba(236, 72, 153, 0)',
                '0 0 20px rgba(236, 72, 153, 0.5)',
                '0 0 0 rgba(236, 72, 153, 0)'
              ]
            : '0 0 0 rgba(236, 72, 153, 0)'
        }}
        transition={{
          repeat: isRecording ? Infinity : 0,
          duration: 2,
          ease: "easeInOut"
        }}
      >
        {/* Pitch wheel visualization */}
        {showPitchWheel && (
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: isListening ? 1 : 0.4,
              scale: isListening ? 1 : 0.95
            }}
            transition={{ duration: 0.5 }}
          >
            <canvas 
              ref={pitchWheelCanvasRef}
              width={500}
              height={500}
              className="w-full h-full"
            />
          </motion.div>
        )}
        
        {/* Current note display */}
        <AnimatePresence>
          {isListening && pitch.frequency > 0 && (
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="text-4xl font-bold"
                animate={{ 
                  color: isInTune ? 'rgb(74, 222, 128)' : 'rgb(250, 204, 21)'
                }}
              >
                {pitch.note}
                <span className="text-2xl">{pitch.octave}</span>
              </motion.div>
              <motion.div 
                className="text-sm opacity-70"
                animate={{ 
                  color: isInTune ? 'rgb(74, 222, 128)' : 'rgb(250, 204, 21)'
                }}
              >
                {pitch.frequency.toFixed(1)} Hz
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Confidence meter ring */}
        <motion.div 
          className="absolute inset-0"
          style={{
            background: `conic-gradient(${primaryColor} ${confidenceLevel}%, transparent 0%)`,
            opacity: isListening ? 0.15 : 0
          }}
        />
        
        {/* Status indicators */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-3">
          <motion.div
            animate={{ 
              scale: isRecording ? [1, 1.2, 1] : 1,
              opacity: isRecording ? 1 : 0.5
            }}
            transition={{ 
              repeat: isRecording ? Infinity : 0, 
              duration: 1.5 
            }}
            className="flex items-center gap-1"
          >
            <Mic className={isRecording ? "text-pink-500" : "text-slate-400"} size={18} />
            <span className={`text-xs ${isRecording ? "text-pink-500" : "text-slate-400"}`}>
              {isRecording ? "Recording" : "Mic"}
            </span>
          </motion.div>
          
          <motion.div
            animate={{ 
              opacity: isListening && volume > 10 ? 1 : 0.5,
              scale: isListening && volume > 20 ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              repeat: isListening && volume > 20 ? Infinity : 0, 
              duration: 1 
            }}
            className="flex items-center gap-1"
          >
            <Volume2 
              className={isListening && volume > 10 ? "text-blue-400" : "text-slate-400"} 
              size={18} 
            />
            <span className={`text-xs ${isListening && volume > 10 ? "text-blue-400" : "text-slate-400"}`}>
              {Math.round(volume)}%
            </span>
          </motion.div>
          
          <AnimatePresence>
            {isInTune && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="text-green-400" size={18} />
                <span className="text-xs text-green-400">In tune</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Waveform visualization at the bottom */}
      {showWaveform && (
        <motion.div 
          className={`absolute bottom-0 left-0 right-0 ${sizeMap[size].waveform} overflow-hidden rounded-b-full`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isListening || hasRecording ? 1 : 0.3,
            y: 0
          }}
          transition={{ duration: 0.5 }}
        >
          <canvas
            ref={waveformCanvasRef}
            width={500}
            height={100}
            className="w-full h-full"
          />
        </motion.div>
      )}
      
      {/* Accuracy indicator */}
      <motion.div 
        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-32 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isListening ? 1 : 0 }}
      >
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-400 via-yellow-400 to-red-400"
          animate={{ height: `${accuracyScore}%` }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
      
      {/* Center icon when not recording/listening */}
      <AnimatePresence>
        {!isListening && !isRecording && (
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <Music size={48} className="text-slate-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedAudioVisualizer;
