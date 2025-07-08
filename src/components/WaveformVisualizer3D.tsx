'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedWaveform({ waveform, isActive }: { waveform: number[]; isActive: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useRef<Float32Array | undefined>(undefined);

  useEffect(() => {
    if (!waveform.length) return;
    
    const points = new Float32Array(waveform.length * 3);
    
    waveform.forEach((value, i) => {
      const x = (i / waveform.length) * 4 - 2; // Spread across -2 to 2
      const y = value * 2; // Scale amplitude
      const z = Math.sin(i * 0.1) * 0.5; // Add some depth variation
      
      points[i * 3] = x;
      points[i * 3 + 1] = y;
      points[i * 3 + 2] = z;
    });
    
    positions.current = points;
  }, [waveform]);

  useFrame((state) => {
    if (pointsRef.current && positions.current && isActive) {
      pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  if (!positions.current) return null;

  return (
    <Points ref={pointsRef} positions={positions.current} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={isActive ? "#8b5cf6" : "#6366f1"}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function WaveformVisualizer3D({ 
  waveform, 
  isActive, 
  className = '' 
}: { 
  waveform: number[]; 
  isActive: boolean; 
  className?: string; 
}) {
  return (
    <div className={`w-full h-32 ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedWaveform waveform={waveform} isActive={isActive} />
      </Canvas>
    </div>
  );
}