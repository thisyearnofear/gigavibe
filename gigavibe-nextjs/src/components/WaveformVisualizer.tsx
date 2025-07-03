
import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  waveform: number[];
  isActive: boolean;
  volume?: number;
  className?: string;
}

const WaveformVisualizer = ({ waveform, isActive, volume = 0, className = '' }: WaveformVisualizerProps) => {
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
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    // Dynamic gradient based on volume
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    const intensity = Math.min(1, volume / 50);
    
    gradient.addColorStop(0, `rgba(99, 102, 241, ${0.5 + intensity * 0.3})`);
    gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.6 + intensity * 0.3})`);
    gradient.addColorStop(1, `rgba(236, 72, 153, ${0.4 + intensity * 0.4})`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(2, Math.min(4, 2 + intensity));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw waveform with dynamic scaling
    ctx.beginPath();
    const sliceWidth = width / waveform.length;
    
    for (let i = 0; i < waveform.length; i++) {
      const x = i * sliceWidth;
      // Apply volume-based scaling to waveform amplitude
      const scaledSample = waveform[i] * (1 + intensity * 0.5);
      const y = (scaledSample * height / 2) + height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();

    // Add volume-responsive glow effect
    ctx.shadowColor = `rgba(99, 102, 241, ${intensity * 0.5})`;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.stroke();
    
  }, [waveform, isActive, volume]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={60}
      className={`rounded-lg ${className}`}
      style={{ width: '100%', height: '60px' }}
    />
  );
};

export default WaveformVisualizer;
