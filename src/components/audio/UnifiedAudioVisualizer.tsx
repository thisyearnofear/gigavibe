"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Music, CheckCircle2, Zap, Eye } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useFeatureFlags } from '@/lib/features/FeatureFlags';

interface UnifiedAudioVisualizerProps {
  // Audio data
  waveform?: number[];
  audioData?: Float32Array;
  pitch?: {
    note: string;
    octave: number;
    cents: number;
    frequency: number;
    accuracy?: number;
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
  immersiveMode?: boolean;
  
  // Mobile optimizations
  isMobile?: boolean;
  reducedMotion?: boolean;
  
  // Interaction callbacks
  onVisualizerClick?: () => void;
}

// 3D Audio Particle System Component (from ImmersiveAudioVisualizer)
function AudioParticleSystem({ 
  audioData, 
  pitchData, 
  isActive, 
  intensity, 
  isMobile 
}: { 
  audioData: Float32Array; 
  pitchData?: any; 
  isActive: boolean; 
  intensity: number;
  isMobile: boolean;
}) {
  const meshRef = useRef<THREE.Points>(null);
  const particleCount = isMobile ? 100 : 200; // Adjusted particles
  const positions = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);
  const colors = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);
  const sizes = useMemo(() => new Float32Array(particleCount), [particleCount]);

  useFrame((state) => {
    if (!meshRef.current || !isActive) return;

    const time = state.clock.getElapsedTime();
    const avgAmplitude = audioData.length > 0 
      ? audioData.reduce((sum, val) => sum + Math.abs(val), 0) / audioData.length 
      : 0;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      const audioIndex = Math.floor((i / particleCount) * audioData.length);
      const audioValue = audioData[audioIndex] || 0;
      const normalizedAudio = Math.abs(audioValue) * intensity;

      // Create spiral pattern based on audio
      const angle = (i / particleCount) * Math.PI * 4 + time * 0.5;
      const radius = 2 + normalizedAudio * 3;
      const height = Math.sin(time + i * 0.1) * normalizedAudio * 2;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Color based on pitch accuracy if available
      if (pitchData?.accuracy !== undefined) {
        const accuracy = pitchData.accuracy / 100;
        colors[i3] = accuracy;
        colors[i3 + 1] = accuracy * 0.8 + 0.2;
        colors[i3 + 2] = 1 - accuracy * 0.5;
      } else {
        colors[i3] = 0.5 + normalizedAudio * 0.5;
        colors[i3 + 1] = 0.2 + normalizedAudio * 0.3;
        colors[i3 + 2] = 0.9;
      }
      
      sizes[i] = 0.5 + normalizedAudio * 2;
    }

    if (meshRef.current.geometry.attributes.position) {
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.attributes.color.needsUpdate = true;
      // @ts-ignore
      meshRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    // @ts-ignore
    <Points ref={meshRef} positions={positions} colors={colors} sizes={sizes}>
      <PointMaterial
        transparent
        vertexColors
        size={isMobile ? 1.5 : 2}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Central Orb from ImmersiveAudioVisualizer
function CentralOrb({ isActive, pitchData }: { isActive: boolean; pitchData?: any }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    
    if (isActive) {
      meshRef.current.rotation.x = time * 0.5;
      meshRef.current.rotation.y = time * 0.3;
      
      const scale = pitchData 
        ? 1 + (pitchData.accuracy / 100) * 0.5
        : 1 + Math.sin(time * 2) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.5, 32, 32]}>
      <meshStandardMaterial
        color={pitchData ? 
          `hsl(${120 * (pitchData.accuracy / 100)}, 70%, 60%)` : 
          "#8b5cf6"
        }
        transparent
        opacity={0.8}
        emissive={pitchData ? 
          `hsl(${120 * (pitchData.accuracy / 100)}, 50%, 30%)` : 
          "#4c1d95"
        }
      />
    </Sphere>
  );
}


const UnifiedAudioVisualizer: React.FC<UnifiedAudioVisualizerProps> = ({
  waveform = [],
  audioData = new Float32Array(0),
  pitch = { note: 'A', octave: 4, cents: 0, frequency: 440, accuracy: 0 },
  volume = 0,
  isRecording = false,
  isListening = false,
  hasRecording = false,
  size = 'lg',
  primaryColor = 'rgba(139, 92, 246, 1)',
  secondaryColor = 'rgba(236, 72, 153, 1)',
  animationIntensity = 1,
  showPitchWheel = true,
  showWaveform = true,
  immersiveMode = false,
  isMobile = false,
  reducedMotion = false,
  onVisualizerClick
}) => {
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const pitchWheelCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const { shouldUseHighQualityVisuals, getRecommendedParticleCount } = useFeatureFlags();
  const isActive = isRecording || isListening;
  const normalizedVolume = Math.min(volume / 50, 1);
  
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [isInTune, setIsInTune] = useState(false);
  
  const sizeMap = {
    sm: { container: 'w-64 h-64', waveform: 'h-16' },
    md: { container: 'w-80 h-80', waveform: 'h-20' },
    lg: { container: 'w-96 h-96', waveform: 'h-24' },
    xl: { container: 'w-[32rem] h-[32rem]', waveform: 'h-32' }
  };
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  useEffect(() => {
    if (!isListening || pitch.frequency === 0) {
      setAccuracyScore(0);
      setIsInTune(false);
      return;
    }
    
    const accuracy = Math.max(0, 100 - Math.abs(pitch.cents) * 2);
    setAccuracyScore(accuracy);
    setIsInTune(Math.abs(pitch.cents) < 10);
    setConfidenceLevel(Math.min(100, volume * 2));
  }, [pitch.cents, pitch.frequency, volume, isListening]);
  
  useEffect(() => {
    if (immersiveMode || !showWaveform || !waveformCanvasRef.current) return;
    
    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    if (!isListening || waveform.length === 0) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    const intensity = Math.min(1, volume / 50) * animationIntensity;
    
    if (isRecording) {
      gradient.addColorStop(0, `rgba(236, 72, 153, ${0.6 + intensity * 0.4})`);
      gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.7 + intensity * 0.3})`);
      gradient.addColorStop(1, `rgba(59, 130, 246, ${0.5 + intensity * 0.5})`);
    } else {
      gradient.addColorStop(0, `rgba(99, 102, 241, ${0.5 + intensity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.6 + intensity * 0.3})`);
      gradient.addColorStop(1, `rgba(236, 72, 153, ${0.4 + intensity * 0.4})`);
    }
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(2, Math.min(4, 2 + intensity));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
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
    
    if (isRecording) {
      ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
      ctx.shadowBlur = 10 * intensity;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [waveform, isRecording, isListening, volume, animationIntensity, showWaveform, immersiveMode]);
  
  useEffect(() => {
    if (immersiveMode || !showPitchWheel || !pitchWheelCanvasRef.current) return;
    
    const canvas = pitchWheelCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
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
    
    const zoneWidth = Math.PI / 6;
    const noteIndex = noteNames.indexOf(pitch.note);
    const baseAngle = (noteIndex / noteNames.length) * Math.PI * 2 - Math.PI / 2;
    
    ctx.globalAlpha = 0.3;
    
    ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, baseAngle - zoneWidth * 0.2, baseAngle + zoneWidth * 0.2);
    ctx.arc(centerX, centerY, radius * 0.6, baseAngle + zoneWidth * 0.2, baseAngle - zoneWidth * 0.2, true);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'rgba(250, 204, 21, 0.5)';
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
    
    ctx.fillStyle = isInTune ? 'rgba(74, 222, 128, 1)' : 'rgba(250, 204, 21, 1)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    
  }, [pitch, isListening, noteNames, primaryColor, showPitchWheel, isInTune, immersiveMode]);

  if (immersiveMode) {
    return (
      <div 
        className={`relative ${sizeMap[size].container} mx-auto rounded-2xl overflow-hidden bg-black/20`}
        onClick={onVisualizerClick}
      >
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          className="cursor-pointer"
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#8b5cf6" />
          
          <AudioParticleSystem
            audioData={audioData}
            pitchData={pitch}
            isActive={isActive}
            intensity={animationIntensity * normalizedVolume}
            isMobile={isMobile}
          />
          
          <CentralOrb isActive={isActive} pitchData={pitch} />
        </Canvas>
        {/* Accuracy Glow Effect */}
        {pitch && pitch.accuracy && pitch.accuracy >= 90 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 20px rgba(34, 197, 94, 0.3)',
                '0 0 40px rgba(34, 197, 94, 0.5)',
                '0 0 20px rgba(34, 197, 94, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
    );
  }
  
  return (
    <div 
      className={`relative ${sizeMap[size].container} mx-auto`}
      onClick={onVisualizerClick}
    >
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
        
        <motion.div 
          className="absolute inset-0"
          style={{
            background: `conic-gradient(${primaryColor} ${confidenceLevel}%, transparent 0%)`,
            opacity: isListening ? 0.15 : 0
          }}
        />
        
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
            <span className={`text-xs ${isRecording ? "text-pink-500" : "text-slate-400"}`}>{isRecording ? "Recording" : "Mic"}</span>
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
            <span className={`text-xs ${isListening && volume > 10 ? "text-blue-400" : "text-slate-400"}`}>{Math.round(volume)}%</span>
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