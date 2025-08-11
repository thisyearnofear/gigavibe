/**
 * Live Audio Analysis Service
 * Provides real-time pitch detection and audio analysis for enhanced user feedback
 */

export interface PitchData {
  note: string;
  octave: number;
  frequency: number;
  cents: number;
  confidence: number;
  timestamp: number;
}

export interface AudioAnalysisData {
  pitch: PitchData;
  volume: number;
  waveform: Float32Array;
  spectralData: Float32Array;
  isVoiceDetected: boolean;
}

export interface TargetNote {
  note: string;
  octave: number;
  frequency: number;
}

export class LiveAudioAnalysisService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private frequencyData: Float32Array | null = null;
  private isAnalyzing = false;
  private animationFrame: number | null = null;
  
  // Pitch detection using autocorrelation
  private sampleRate = 44100;
  private bufferSize = 4096;
  private pitchBuffer: Float32Array | null = null;
  
  // Callbacks
  private onAnalysisUpdate?: (data: AudioAnalysisData) => void;
  private onPitchDetected?: (pitch: PitchData) => void;
  
  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.sampleRate = this.audioContext.sampleRate;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async startAnalysis(targetNote?: TargetNote): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: this.sampleRate
        } 
      });

      // Create audio nodes
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = this.bufferSize;
      this.analyser.smoothingTimeConstant = 0.3;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      // Connect nodes
      this.microphone.connect(this.analyser);

      // Initialize data arrays
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.frequencyData = new Float32Array(this.analyser.frequencyBinCount);
      this.pitchBuffer = new Float32Array(this.bufferSize);

      this.isAnalyzing = true;
      this.analyzeAudio();

    } catch (error) {
      console.error('Failed to start audio analysis:', error);
      throw error;
    }
  }

  stopAnalysis(): void {
    this.isAnalyzing = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
  }

  private analyzeAudio = () => {
    if (!this.isAnalyzing || !this.analyser || !this.dataArray || !this.frequencyData || !this.pitchBuffer) {
      return;
    }

    // Get frequency and time domain data
    this.analyser.getByteFrequencyData(this.dataArray);
    this.analyser.getFloatFrequencyData(this.frequencyData);
    this.analyser.getFloatTimeDomainData(this.pitchBuffer);

    // Calculate volume (RMS)
    const volume = this.calculateVolume(this.pitchBuffer);
    
    // Detect voice activity
    const isVoiceDetected = this.detectVoice(volume, this.frequencyData);

    // Detect pitch if voice is present
    let pitch: PitchData | null = null;
    if (isVoiceDetected) {
      pitch = this.detectPitch(this.pitchBuffer);
    }

    // Create waveform data for visualization
    const waveform = new Float32Array(this.pitchBuffer);

    // Create spectral data for visualization
    const spectralData = new Float32Array(this.frequencyData);

    // Emit analysis data
    if (this.onAnalysisUpdate && pitch) {
      this.onAnalysisUpdate({
        pitch,
        volume,
        waveform,
        spectralData,
        isVoiceDetected
      });
    }

    if (this.onPitchDetected && pitch) {
      this.onPitchDetected(pitch);
    }

    // Continue analysis
    this.animationFrame = requestAnimationFrame(this.analyzeAudio);
  };

  private calculateVolume(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length) * 100;
  }

  private detectVoice(volume: number, frequencyData: Float32Array): boolean {
    // Simple voice activity detection
    const volumeThreshold = 1; // Adjust based on testing
    const spectralCentroid = this.calculateSpectralCentroid(frequencyData);
    
    // Voice typically has energy in 80-1000 Hz range
    return volume > volumeThreshold && spectralCentroid > 80 && spectralCentroid < 1000;
  }

  private calculateSpectralCentroid(frequencyData: Float32Array): number {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const frequency = (i * this.sampleRate) / (2 * frequencyData.length);
      const magnitude = Math.pow(10, frequencyData[i] / 20); // Convert dB to linear
      
      numerator += frequency * magnitude;
      denominator += magnitude;
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  private detectPitch(buffer: Float32Array): PitchData | null {
    // Autocorrelation-based pitch detection
    const autocorrelation = this.autocorrelate(buffer);
    const fundamentalFreq = this.findFundamentalFrequency(autocorrelation);
    
    if (!fundamentalFreq || fundamentalFreq < 80 || fundamentalFreq > 1000) {
      return null; // Outside typical vocal range
    }

    const noteInfo = this.frequencyToNote(fundamentalFreq);
    
    return {
      ...noteInfo,
      frequency: fundamentalFreq,
      confidence: this.calculatePitchConfidence(autocorrelation, fundamentalFreq),
      timestamp: Date.now()
    };
  }

  private autocorrelate(buffer: Float32Array): Float32Array {
    const result = new Float32Array(buffer.length);
    
    for (let lag = 0; lag < buffer.length; lag++) {
      let sum = 0;
      for (let i = 0; i < buffer.length - lag; i++) {
        sum += buffer[i] * buffer[i + lag];
      }
      result[lag] = sum / (buffer.length - lag);
    }
    
    return result;
  }

  private findFundamentalFrequency(autocorrelation: Float32Array): number | null {
    // Find the first peak after the initial peak
    let maxValue = 0;
    let maxIndex = 0;
    
    // Skip the first few samples to avoid the initial peak
    const startIndex = Math.floor(this.sampleRate / 1000); // Skip first 1ms
    
    for (let i = startIndex; i < autocorrelation.length / 2; i++) {
      if (autocorrelation[i] > maxValue) {
        maxValue = autocorrelation[i];
        maxIndex = i;
      }
    }
    
    if (maxIndex === 0) return null;
    
    // Convert lag to frequency
    return this.sampleRate / maxIndex;
  }

  private calculatePitchConfidence(autocorrelation: Float32Array, frequency: number): number {
    const lag = Math.round(this.sampleRate / frequency);
    if (lag >= autocorrelation.length) return 0;
    
    const peakValue = autocorrelation[lag];
    const maxValue = Math.max(...autocorrelation);
    
    return maxValue > 0 ? peakValue / maxValue : 0;
  }

  private frequencyToNote(frequency: number): { note: string; octave: number; cents: number } {
    const A4 = 440;
    const semitoneRatio = Math.pow(2, 1/12);
    
    // Calculate semitones from A4
    const semitones = Math.round(12 * Math.log2(frequency / A4));
    const cents = Math.round(1200 * Math.log2(frequency / A4) - semitones * 100);
    
    // Calculate octave and note
    const noteIndex = (semitones + 9) % 12; // A=0, A#=1, B=2, C=3, etc.
    const octave = Math.floor((semitones + 9) / 12) + 4;
    
    const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    const note = noteNames[noteIndex];
    
    return { note, octave, cents };
  }

  // Public methods for setting callbacks
  setAnalysisCallback(callback: (data: AudioAnalysisData) => void): void {
    this.onAnalysisUpdate = callback;
  }

  setPitchCallback(callback: (pitch: PitchData) => void): void {
    this.onPitchDetected = callback;
  }

  // Utility methods
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.AudioContext);
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }
}