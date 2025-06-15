
import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioData {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
  isInTune: boolean;
  volume: number;
  waveform: number[];
}

const useAudioInput = () => {
  const [audioData, setAudioData] = useState<AudioData>({
    frequency: 0,
    note: 'A',
    octave: 4,
    cents: 0,
    isInTune: false,
    volume: 0,
    waveform: new Array(64).fill(0),
  });
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const frequencyToNote = useCallback((frequency: number) => {
    if (frequency === 0) return { note: 'A', octave: 4, cents: 0 };
    
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    
    if (frequency > C0) {
      const h = Math.round(12 * Math.log2(frequency / C0));
      const octave = Math.floor(h / 12);
      const n = h % 12;
      const exactNote = 12 * Math.log2(frequency / C0);
      const cents = Math.round((exactNote - h) * 100);
      
      return {
        note: noteNames[n],
        octave,
        cents: Math.max(-50, Math.min(50, cents))
      };
    }
    
    return { note: 'A', octave: 4, cents: 0 };
  }, []);

  const getPitch = useCallback((buffer: Float32Array, sampleRate: number): number => {
    const bufferLength = buffer.length;
    const autocorrelation = new Float32Array(bufferLength);
    
    // Autocorrelation
    for (let lag = 0; lag < bufferLength; lag++) {
      let sum = 0;
      for (let i = 0; i < bufferLength - lag; i++) {
        sum += buffer[i] * buffer[i + lag];
      }
      autocorrelation[lag] = sum;
    }
    
    // Find the first peak after the initial peak
    let maxCorrelation = 0;
    let bestLag = -1;
    
    // Start searching after a minimum frequency threshold
    const minLag = Math.floor(sampleRate / 800); // 800 Hz max
    const maxLag = Math.floor(sampleRate / 80);  // 80 Hz min
    
    for (let lag = minLag; lag < maxLag && lag < bufferLength; lag++) {
      if (autocorrelation[lag] > maxCorrelation) {
        maxCorrelation = autocorrelation[lag];
        bestLag = lag;
      }
    }
    
    if (bestLag === -1) return 0;
    
    // Interpolate for better accuracy
    const y1 = autocorrelation[bestLag - 1] || 0;
    const y2 = autocorrelation[bestLag];
    const y3 = autocorrelation[bestLag + 1] || 0;
    
    const a = (y1 - 2 * y2 + y3) / 2;
    const b = (y3 - y1) / 2;
    
    let adjustedLag = bestLag;
    if (a !== 0) {
      adjustedLag = bestLag - b / (2 * a);
    }
    
    return sampleRate / adjustedLag;
  }, []);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    analyser.getFloatTimeDomainData(dataArray);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const volume = Math.sqrt(sum / dataArray.length);
    
    // Get waveform data for visualization
    const waveform = Array.from(dataArray.slice(0, 64));
    
    // Get pitch only if volume is above threshold
    let frequency = 0;
    if (volume > 0.01) {
      frequency = getPitch(dataArray, audioContextRef.current!.sampleRate);
    }
    
    const { note, octave, cents } = frequencyToNote(frequency);
    const isInTune = Math.abs(cents) < 10 && frequency > 0;
    
    setAudioData({
      frequency,
      note,
      octave,
      cents,
      isInTune,
      volume: volume * 100,
      waveform,
    });

    animationRef.current = requestAnimationFrame(analyzeAudio);
  }, [getPitch, frequencyToNote]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096;
      analyserRef.current.smoothingTimeConstant = 0.3;
      
      dataArrayRef.current = new Float32Array(analyserRef.current.fftSize);
      
      source.connect(analyserRef.current);
      
      setIsListening(true);
      analyzeAudio();
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied or unavailable');
      setHasPermission(false);
    }
  }, [analyzeAudio]);

  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    audioData,
    isListening,
    hasPermission,
    error,
    startListening,
    stopListening,
  };
};

export default useAudioInput;
