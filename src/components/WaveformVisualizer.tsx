
import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  waveform: number[];
  isActive: boolean;
  className?: string;
}

const WaveformVisualizer = ({ waveform, isActive, className = '' }: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (!isActive || waveform.length === 0) {
      // Draw flat line when inactive
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.8)');
    gradient.addColorStop(0.5, 'rgba(219, 39, 119, 0.8)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw waveform
    ctx.beginPath();
    const sliceWidth = width / waveform.length;
    
    for (let i = 0; i < waveform.length; i++) {
      const x = i * sliceWidth;
      const y = (waveform[i] * height / 2) + height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = isActive ? 'rgba(147, 51, 234, 0.5)' : 'transparent';
    ctx.shadowBlur = 10;
    ctx.stroke();
    
  }, [waveform, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={80}
      className={`rounded-lg ${className}`}
      style={{ width: '100%', height: '80px' }}
    />
  );
};

export default WaveformVisualizer;
