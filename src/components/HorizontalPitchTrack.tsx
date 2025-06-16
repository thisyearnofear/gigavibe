
import { useEffect, useRef } from 'react';

interface HorizontalPitchTrackProps {
  currentFrequency: number;
  targetFrequency: number;
  isListening: boolean;
  volume: number;
}

const HorizontalPitchTrack = ({ 
  currentFrequency, 
  targetFrequency, 
  isListening, 
  volume 
}: HorizontalPitchTrackProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Convert frequency to a visual position (logarithmic scale)
  const frequencyToPosition = (freq: number, canvasWidth: number) => {
    if (freq <= 0) return canvasWidth / 2;
    
    // Use a logarithmic scale centered around the target frequency
    const minFreq = targetFrequency * 0.5; // One octave below
    const maxFreq = targetFrequency * 2;   // One octave above
    
    const logMin = Math.log(minFreq);
    const logMax = Math.log(maxFreq);
    const logCurrent = Math.log(Math.max(minFreq, Math.min(maxFreq, freq)));
    
    return ((logCurrent - logMin) / (logMax - logMin)) * canvasWidth;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background track
    ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.fillRect(0, height * 0.4, width, height * 0.2);

    // Draw target zone (green area around target)
    const targetPos = frequencyToPosition(targetFrequency, width);
    const zoneWidth = 40; // pixels for "in tune" zone
    
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.fillRect(
      Math.max(0, targetPos - zoneWidth / 2), 
      height * 0.35, 
      Math.min(width, zoneWidth), 
      height * 0.3
    );

    // Draw target line
    ctx.strokeStyle = 'rgb(34, 197, 94)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(targetPos, height * 0.2);
    ctx.lineTo(targetPos, height * 0.8);
    ctx.stroke();

    // Draw target frequency label
    ctx.fillStyle = 'rgb(34, 197, 94)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${targetFrequency.toFixed(0)} Hz`, 
      targetPos, 
      height * 0.15
    );

    // Draw current pitch indicator
    if (isListening && currentFrequency > 0 && volume > 1) {
      const currentPos = frequencyToPosition(currentFrequency, width);
      
      // Determine color based on accuracy
      const distance = Math.abs(currentPos - targetPos);
      let color;
      if (distance < 20) {
        color = 'rgb(34, 197, 94)'; // Green - in tune
      } else if (distance < 40) {
        color = 'rgb(251, 191, 36)'; // Yellow - close
      } else {
        color = 'rgb(239, 68, 68)'; // Red - off
      }

      // Draw current pitch line with volume-based height
      const lineHeight = Math.min(height * 0.6, (volume / 100) * height * 0.6 + 20);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(currentPos, (height - lineHeight) / 2);
      ctx.lineTo(currentPos, (height + lineHeight) / 2);
      ctx.stroke();

      // Draw current frequency label
      ctx.fillStyle = color;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${currentFrequency.toFixed(0)} Hz`, 
        currentPos, 
        height * 0.9
      );

      // Draw glow effect for better visibility
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw scale markers
    ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    const octaveBelow = targetFrequency / 2;
    const octaveAbove = targetFrequency * 2;
    
    [octaveBelow, targetFrequency, octaveAbove].forEach((freq, index) => {
      const pos = frequencyToPosition(freq, width);
      const label = index === 0 ? '-1 oct' : index === 2 ? '+1 oct' : 'Target';
      
      ctx.fillText(label, pos, height * 0.95);
      
      // Draw small tick marks
      ctx.fillRect(pos - 1, height * 0.85, 2, 10);
    });

  }, [currentFrequency, targetFrequency, isListening, volume]);

  return (
    <div className="w-full bg-white/70 rounded-xl p-4">
      <div className="mb-2">
        <h3 className="text-sm font-medium text-slate-700 text-center">Pitch Track</h3>
      </div>
      <canvas
        ref={canvasRef}
        width={320}
        height={100}
        className="w-full rounded-lg bg-slate-50"
        style={{ height: '100px' }}
      />
      <div className="mt-2 text-center">
        <span className="text-xs text-slate-500">
          {isListening ? 'Listening...' : 'Start singing to see your pitch'}
        </span>
      </div>
    </div>
  );
};

export default HorizontalPitchTrack;
