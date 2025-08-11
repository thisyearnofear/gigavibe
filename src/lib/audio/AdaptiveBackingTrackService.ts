/**
 * Adaptive Backing Track Service
 * Dynamically adjusts backing tracks based on user performance in real-time
 */

import { PitchData } from './LiveAudioAnalysisService';

export interface BackingTrackConfig {
  originalTempo: number;
  originalKey: string;
  allowTempoAdjustment: boolean;
  allowKeyAdjustment: boolean;
  maxTempoDeviation: number; // percentage
  maxKeyDeviation: number; // semitones
}

export interface PerformanceMetrics {
  averageAccuracy: number;
  tempoConsistency: number;
  pitchStability: number;
  confidenceLevel: number;
}

export interface TrackAdjustments {
  tempoMultiplier: number; // 1.0 = original tempo
  keyShift: number; // semitones, positive = higher
  volumeAdjustment: number; // 0-1
  effectsIntensity: number; // 0-1
}

export class AdaptiveBackingTrackService {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private pitchShiftNode: AudioWorkletNode | null = null;
  private originalBuffer: AudioBuffer | null = null;
  
  private config: BackingTrackConfig = {
    originalTempo: 120,
    originalKey: 'C',
    allowTempoAdjustment: true,
    allowKeyAdjustment: true,
    maxTempoDeviation: 20,
    maxKeyDeviation: 3
  };
  
  private currentAdjustments: TrackAdjustments = {
    tempoMultiplier: 1.0,
    keyShift: 0,
    volumeAdjustment: 1.0,
    effectsIntensity: 0.5
  };
  
  private performanceHistory: PerformanceMetrics[] = [];
  private isPlaying = false;
  private adaptationEnabled = true;
  
  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Load pitch shift worklet for real-time key adjustment
      try {
        await this.audioContext.audioWorklet.addModule('/audio-worklets/pitch-shift-processor.js');
      } catch (error) {
        console.warn('Pitch shift worklet not available, key adjustment disabled');
        this.config.allowKeyAdjustment = false;
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async loadBackingTrack(audioUrl: string, config: Partial<BackingTrackConfig> = {}): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    try {
      // Update configuration
      this.config = { ...this.config, ...config };
      
      // Fetch and decode audio
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      this.originalBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Set up audio nodes
      this.setupAudioNodes();
      
    } catch (error) {
      console.error('Failed to load backing track:', error);
      throw error;
    }
  }

  private setupAudioNodes() {
    if (!this.audioContext || !this.originalBuffer) return;

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.currentAdjustments.volumeAdjustment;

    // Create pitch shift node if available
    if (this.config.allowKeyAdjustment) {
      try {
        this.pitchShiftNode = new AudioWorkletNode(this.audioContext, 'pitch-shift-processor');
        this.pitchShiftNode.parameters.get('pitchShift')?.setValueAtTime(
          this.currentAdjustments.keyShift, 
          this.audioContext.currentTime
        );
      } catch (error) {
        console.warn('Pitch shift node creation failed:', error);
        this.pitchShiftNode = null;
      }
    }
  }

  async play(): Promise<void> {
    if (!this.audioContext || !this.originalBuffer || this.isPlaying) return;

    try {
      // Create new source node
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = this.originalBuffer;
      
      // Apply tempo adjustment
      if (this.config.allowTempoAdjustment) {
        this.sourceNode.playbackRate.value = this.currentAdjustments.tempoMultiplier;
      }

      // Connect audio nodes
      let currentNode: AudioNode = this.sourceNode;
      
      if (this.pitchShiftNode) {
        currentNode.connect(this.pitchShiftNode);
        currentNode = this.pitchShiftNode;
      }
      
      if (this.gainNode) {
        currentNode.connect(this.gainNode);
        currentNode = this.gainNode;
      }
      
      currentNode.connect(this.audioContext.destination);

      // Start playback
      this.sourceNode.start();
      this.isPlaying = true;

      // Handle playback end
      this.sourceNode.onended = () => {
        this.isPlaying = false;
      };

    } catch (error) {
      console.error('Failed to play backing track:', error);
      this.isPlaying = false;
    }
  }

  stop(): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    this.isPlaying = false;
  }

  pause(): void {
    if (this.audioContext && this.isPlaying) {
      this.audioContext.suspend();
    }
  }

  resume(): void {
    if (this.audioContext && this.isPlaying) {
      this.audioContext.resume();
    }
  }

  // Real-time adaptation based on user performance
  adaptToPerformance(pitchData: PitchData, performanceMetrics: PerformanceMetrics): void {
    if (!this.adaptationEnabled || !this.audioContext) return;

    // Store performance metrics
    this.performanceHistory.push(performanceMetrics);
    if (this.performanceHistory.length > 50) {
      this.performanceHistory.shift(); // Keep last 50 measurements
    }

    // Calculate adaptations
    const newAdjustments = this.calculateAdaptations(pitchData, performanceMetrics);
    
    // Apply adjustments smoothly
    this.applyAdjustments(newAdjustments);
  }

  private calculateAdaptations(pitchData: PitchData, metrics: PerformanceMetrics): TrackAdjustments {
    const recentMetrics = this.performanceHistory.slice(-10); // Last 10 measurements
    const avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.averageAccuracy, 0) / recentMetrics.length;
    const avgTempo = recentMetrics.reduce((sum, m) => sum + m.tempoConsistency, 0) / recentMetrics.length;

    let tempoMultiplier = this.currentAdjustments.tempoMultiplier;
    let keyShift = this.currentAdjustments.keyShift;
    let volumeAdjustment = this.currentAdjustments.volumeAdjustment;
    let effectsIntensity = this.currentAdjustments.effectsIntensity;

    // Tempo adaptation based on user's tempo consistency
    if (this.config.allowTempoAdjustment && recentMetrics.length >= 5) {
      if (avgTempo < 0.7) {
        // User is struggling with tempo, slow down slightly
        tempoMultiplier = Math.max(
          1 - this.config.maxTempoDeviation / 100,
          tempoMultiplier - 0.02
        );
      } else if (avgTempo > 0.9 && avgAccuracy > 0.8) {
        // User is doing well, can handle original or slightly faster tempo
        tempoMultiplier = Math.min(
          1 + this.config.maxTempoDeviation / 100,
          tempoMultiplier + 0.01
        );
      }
    }

    // Key adaptation based on pitch accuracy
    if (this.config.allowKeyAdjustment && pitchData.confidence > 0.7) {
      const targetFreq = this.noteToFrequency(this.config.originalKey + '4');
      const userAvgFreq = pitchData.frequency;
      const semitonesDiff = Math.round(12 * Math.log2(userAvgFreq / targetFreq));
      
      if (Math.abs(semitonesDiff) <= this.config.maxKeyDeviation && avgAccuracy < 0.6) {
        // Adjust key to better match user's natural range
        keyShift = Math.max(-this.config.maxKeyDeviation, 
                   Math.min(this.config.maxKeyDeviation, semitonesDiff));
      }
    }

    // Volume adaptation based on confidence
    if (metrics.confidenceLevel < 0.5) {
      // Lower backing track volume when user lacks confidence
      volumeAdjustment = Math.max(0.3, volumeAdjustment - 0.05);
    } else if (metrics.confidenceLevel > 0.8) {
      // Restore normal volume when user is confident
      volumeAdjustment = Math.min(1.0, volumeAdjustment + 0.05);
    }

    // Effects intensity based on overall performance
    effectsIntensity = Math.max(0.1, Math.min(1.0, avgAccuracy));

    return {
      tempoMultiplier,
      keyShift,
      volumeAdjustment,
      effectsIntensity
    };
  }

  private applyAdjustments(newAdjustments: TrackAdjustments): void {
    if (!this.audioContext || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const rampTime = 0.5; // Smooth transition over 0.5 seconds

    // Apply tempo changes
    if (this.sourceNode && this.config.allowTempoAdjustment) {
      this.sourceNode.playbackRate.exponentialRampToValueAtTime(
        newAdjustments.tempoMultiplier,
        currentTime + rampTime
      );
    }

    // Apply volume changes
    if (this.gainNode) {
      this.gainNode.gain.exponentialRampToValueAtTime(
        Math.max(0.01, newAdjustments.volumeAdjustment),
        currentTime + rampTime
      );
    }

    // Apply pitch shift
    if (this.pitchShiftNode && this.config.allowKeyAdjustment) {
      const pitchShiftParam = this.pitchShiftNode.parameters.get('pitchShift');
      if (pitchShiftParam) {
        pitchShiftParam.exponentialRampToValueAtTime(
          Math.pow(2, newAdjustments.keyShift / 12),
          currentTime + rampTime
        );
      }
    }

    this.currentAdjustments = newAdjustments;
  }

  private noteToFrequency(note: string): number {
    const noteMap: { [key: string]: number } = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };
    
    const noteName = note.replace(/\d/, '');
    const octave = parseInt(note.replace(/[A-G#]/, '')) || 4;
    const baseFreq = noteMap[noteName] || 440;
    
    return baseFreq * Math.pow(2, octave - 4);
  }

  // Public control methods
  setAdaptationEnabled(enabled: boolean): void {
    this.adaptationEnabled = enabled;
  }

  getCurrentAdjustments(): TrackAdjustments {
    return { ...this.currentAdjustments };
  }

  resetAdjustments(): void {
    this.currentAdjustments = {
      tempoMultiplier: 1.0,
      keyShift: 0,
      volumeAdjustment: 1.0,
      effectsIntensity: 0.5
    };
    
    if (this.isPlaying) {
      this.applyAdjustments(this.currentAdjustments);
    }
  }

  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // Cleanup
  dispose(): void {
    this.stop();
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    
    if (this.pitchShiftNode) {
      this.pitchShiftNode.disconnect();
      this.pitchShiftNode = null;
    }
    
    this.performanceHistory = [];
  }
}