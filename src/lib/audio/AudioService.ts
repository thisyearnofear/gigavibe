import { PitchData, AudioConfig, AudioAnalysis } from '@/types';

export class AudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private dataArray: Float32Array | null = null;
  
  private config: AudioConfig = {
    sampleRate: 44100,
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minVolume: 0.01,
    maxVolume: 1.0,
  };

  private noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private pitchHistory: number[] = [];
  private volumeHistory: number[] = [];
  private sessionStartTime: number = 0;

  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          sampleRate: this.config.sampleRate,
        }
      });

      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;

      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);

      this.dataArray = new Float32Array(this.analyser.fftSize);
      this.sessionStartTime = Date.now();
      
    } catch (error) {
      throw new Error(`Failed to initialize audio: ${error}`);
    }
  }

  startAnalysis(callback: (pitchData: PitchData) => void): void {
    if (!this.analyser || !this.dataArray || !this.audioContext) {
      throw new Error('Audio service not initialized');
    }

    const analyze = () => {
      if (!this.analyser || !this.dataArray || !this.audioContext) return;

      this.analyser.getFloatTimeDomainData(this.dataArray);
      
      const volume = this.calculateVolume(this.dataArray);
      const frequency = this.detectPitch(this.dataArray, this.audioContext.sampleRate);
      
      // Update history for analysis
      this.pitchHistory.push(frequency);
      this.volumeHistory.push(volume);
      
      // Keep only last 100 samples (2-3 seconds at 50ms intervals)
      if (this.pitchHistory.length > 100) {
        this.pitchHistory.shift();
        this.volumeHistory.shift();
      }

      const pitchData: PitchData = {
        frequency,
        ...this.frequencyToNote(frequency),
        volume: volume * 100,
        confidence: this.calculateConfidence(frequency, volume),
        timestamp: Date.now(),
      };

      callback(pitchData);
      this.animationFrame = requestAnimationFrame(analyze);
    };

    analyze();
  }

  stopAnalysis(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  cleanup(): void {
    this.stopAnalysis();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
    this.pitchHistory = [];
    this.volumeHistory = [];
  }

  getAnalysis(): AudioAnalysis {
    const validPitches = this.pitchHistory.filter(f => f > 0);
    const avgPitch = validPitches.length > 0 
      ? validPitches.reduce((sum, f) => sum + f, 0) / validPitches.length 
      : 0;
    
    const deviations = validPitches.map(f => Math.abs(f - avgPitch));
    const averageDeviation = deviations.length > 0 
      ? deviations.reduce((sum, d) => sum + d, 0) / deviations.length 
      : 0;
    
    const stabilityScore = Math.max(0, 100 - (averageDeviation / avgPitch) * 100);

    return {
      pitchHistory: [...this.pitchHistory],
      volumeHistory: [...this.volumeHistory],
      stabilityScore,
      averageDeviation,
      sessionDuration: Date.now() - this.sessionStartTime,
    };
  }

  private calculateVolume(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  private detectPitch(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;
    let foundGoodCorrelation = false;
    const GOOD_ENOUGH_CORRELATION = 0.9;

    // Calculate RMS
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    // Not enough signal
    if (rms < this.config.minVolume) return 0;

    // Autocorrelation
    let lastCorrelation = 1;
    for (let offset = 1; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;

      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset]);
      }
      correlation = 1 - (correlation / MAX_SAMPLES);

      if (correlation > GOOD_ENOUGH_CORRELATION && correlation > lastCorrelation) {
        foundGoodCorrelation = true;
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestOffset = offset;
        }
      } else if (foundGoodCorrelation) {
        break;
      }
      lastCorrelation = correlation;
    }

    if (bestCorrelation > 0.01) {
      return sampleRate / bestOffset;
    }
    return 0;
  }

  private frequencyToNote(frequency: number): {
    note: string;
    octave: number;
    cents: number;
    isInTune: boolean;
  } {
    if (frequency === 0) {
      return { note: 'A', octave: 4, cents: 0, isInTune: false };
    }
    
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    
    if (frequency > C0) {
      const h = Math.round(12 * Math.log2(frequency / C0));
      const octave = Math.floor(h / 12);
      const n = h % 12;
      const exactNote = 12 * Math.log2(frequency / C0);
      const cents = Math.round((exactNote - h) * 100);
      
      return {
        note: this.noteNames[n],
        octave,
        cents: Math.max(-50, Math.min(50, cents)),
        isInTune: Math.abs(cents) < 10,
      };
    }
    
    return { note: 'A', octave: 4, cents: 0, isInTune: false };
  }

  private calculateConfidence(frequency: number, volume: number): number {
    if (frequency === 0) return 0;
    
    // Simple confidence based on volume and frequency stability
    const volumeConfidence = Math.min(1, volume / 0.1);
    const stabilityConfidence = this.pitchHistory.length > 5 
      ? this.calculateStabilityConfidence() 
      : 0.5;
    
    return Math.min(1, volumeConfidence * stabilityConfidence);
  }

  private calculateStabilityConfidence(): number {
    if (this.pitchHistory.length < 5) return 0.5;
    
    const recentPitches = this.pitchHistory.slice(-5).filter(f => f > 0);
    if (recentPitches.length < 3) return 0.3;
    
    const avg = recentPitches.reduce((sum, f) => sum + f, 0) / recentPitches.length;
    const variance = recentPitches.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / recentPitches.length;
    const stability = Math.max(0, 1 - (variance / (avg * avg)));
    
    return stability;
  }

  // Static utility methods
  static noteToFrequency(note: string, octave: number): number {
    const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
    if (noteIndex === -1) return 0;
    
    const A4 = 440;
    const semitoneOffset = (octave - 4) * 12 + (noteIndex - 9); // A is index 9
    return A4 * Math.pow(2, semitoneOffset / 12);
  }

  static frequencyToNote(frequency: number): { note: string; octave: number } {
    if (frequency === 0) return { note: 'A', octave: 4 };
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    
    if (frequency > C0) {
      const h = Math.round(12 * Math.log2(frequency / C0));
      const octave = Math.floor(h / 12);
      const n = h % 12;
      
      return {
        note: noteNames[n],
        octave,
      };
    }
    
    return { note: 'A', octave: 4 };
  }
}
