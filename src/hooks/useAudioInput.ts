import { useState, useEffect, useRef, useCallback } from 'react';
import { PitchDetector } from 'pitchy';

interface AudioData {
  frequency: number;
  clarity?: number; // Added clarity from pitchy
  note: string;
  octave: number;
  cents: number;
  isInTune: boolean;
  volume: number;
  waveform: number[];
}

interface Recording {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
  size: number;
  quality: 'high' | 'medium' | 'low';
}

const useAudioInput = () => {
  const [audioData, setAudioData] = useState<AudioData>({
    frequency: 0,
    clarity: 0,
    note: 'A',
    octave: 4,
    cents: 0,
    isInTune: false,
    volume: 0,
    waveform: new Array(64).fill(0),
  });
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const pitchDetectorRef = useRef<PitchDetector<Float32Array> | null>(null);


  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const frequencyToNote = useCallback((frequency: number) => {
    if (frequency <= 0) return { note: 'A', octave: 4, cents: 0 }; // Return default for 0 or negative frequency
    
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75); // C0 reference
    
    // Ensure frequency is above C0 before processing
    if (frequency > C0) {
      const h = Math.round(12 * Math.log2(frequency / C0));
      const octave = Math.floor(h / 12);
      const n = h % 12;
      const exactNote = 12 * Math.log2(frequency / C0);
      const cents = Math.round((exactNote - h) * 100);
      
      return {
        note: noteNames[n < 0 ? n + 12 : n], // Handle potential negative n from rounding
        octave,
        cents: Math.max(-50, Math.min(50, cents))
      };
    }
    
    return { note: 'A', octave: 4, cents: 0 }; // Default if below C0
  }, []);


  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !pitchDetectorRef.current || !audioContextRef.current) {
      if (isListening) animationRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const pitchDetector = pitchDetectorRef.current;
    const sampleRate = audioContextRef.current.sampleRate;
    
    analyser.getFloatTimeDomainData(dataArray);
    
    let sum = 0;
    // Calculate RMS volume
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const volume = Math.min(100, rms * 350); // Adjusted multiplier for potentially more sensitive volume
    
    const waveform = Array.from(dataArray.slice(0, 64)).map(sample => 
      Math.max(-1, Math.min(1, sample * 3)) // Keep waveform visualization
    );
    
    let frequency = 0;
    let clarity = 0;

    if (volume > 1) { // Only detect pitch if volume is significant
      const [pitch, pitchClarity] = pitchDetector.findPitch(dataArray, sampleRate);
      if (pitch > 0 && pitchClarity > 0.7) { // Use pitchy's clarity; threshold can be adjusted
        frequency = pitch;
        clarity = pitchClarity;
      }
    }
    
    const { note, octave, cents } = frequencyToNote(frequency);
    const isInTune = Math.abs(cents) < 10 && frequency > 0; // Standard in-tune check
    
    setAudioData({
      frequency,
      clarity,
      note,
      octave,
      cents,
      isInTune,
      volume,
      waveform,
    });

    if (isListening) { // Continue animation loop only if still listening
        animationRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [isListening, frequencyToNote]); // Added isListening to dependencies

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    recordingStartTimeRef.current = Date.now();
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
      
      const recording: Recording = {
        id: Date.now().toString(),
        blob,
        duration,
        timestamp: new Date(),
        size: blob.size,
        quality: blob.size > 1000000 ? 'high' : blob.size > 500000 ? 'medium' : 'low'
      };
      
      setRecordings(prev => [recording, ...prev]);
      setCurrentRecording(recording);
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const playRecording = useCallback((recording: Recording) => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    
    const audio = new Audio(URL.createObjectURL(recording.blob));
    audioElementRef.current = audio;
    
    audio.ontimeupdate = () => {
      setPlaybackTime(audio.currentTime);
    };
    
    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    };
    
    audio.play();
    setIsPlaying(true);
    setCurrentRecording(recording);
  }, []);

  const pausePlayback = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekPlayback = useCallback((time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setPlaybackTime(time);
    }
  }, []);

  const exportRecording = useCallback(async (recording: Recording, format: 'wav' | 'mp3' = 'wav') => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${recording.timestamp.toISOString().slice(0, 19)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      
      audioContextRef.current = new AudioContext({ sampleRate: 44100 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096;
      analyserRef.current.smoothingTimeConstant = 0.1; // Less smoothing for more responsiveness
      
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
    
    if (isRecording) {
      stopRecording();
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
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
  }, [isRecording, stopRecording]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    audioData,
    isListening,
    isRecording,
    hasPermission,
    error,
    recordings,
    currentRecording,
    isPlaying,
    playbackTime,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    playRecording,
    pausePlayback,
    seekPlayback,
    exportRecording,
  };
};

export default useAudioInput;
