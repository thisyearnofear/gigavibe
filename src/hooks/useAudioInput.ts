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
    
    for (let lag = 0; lag < bufferLength; lag++) {
      let sum = 0;
      for (let i = 0; i < bufferLength - lag; i++) {
        sum += buffer[i] * buffer[i + lag];
      }
      autocorrelation[lag] = sum;
    }
    
    let maxCorrelation = 0;
    let bestLag = -1;
    
    const minLag = Math.floor(sampleRate / 800);
    const maxLag = Math.floor(sampleRate / 80);
    
    for (let lag = minLag; lag < maxLag && lag < bufferLength; lag++) {
      if (autocorrelation[lag] > maxCorrelation) {
        maxCorrelation = autocorrelation[lag];
        bestLag = lag;
      }
    }
    
    if (bestLag === -1) return 0;
    
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
    
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const sample = Math.abs(dataArray[i]);
      sum += sample * sample;
      peak = Math.max(peak, sample);
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const volume = Math.min(100, rms * 500);
    
    const waveform = Array.from(dataArray.slice(0, 64)).map(sample => 
      Math.max(-1, Math.min(1, sample * 3))
    );
    
    let frequency = 0;
    if (volume > 1) {
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
      volume,
      waveform,
    });

    animationRef.current = requestAnimationFrame(analyzeAudio);
  }, [getPitch, frequencyToNote]);

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
