/**
 * Adaptive Audio Service
 * Dynamically adjusts backing tracks based on user performance
 */

export interface PerformanceMetrics {
  averagePitchAccuracy: number;
  tempoConsistency: number;
  volumeStability: number;
  overallScore: number;
}

export interface AudioAdaptation {
  tempoAdjustment: number; // -20% to +20%
  keyAdjustment: number; // semitones -2 to +2
  volumeAdjustment: number; // -10dB to +10dB
  effectsIntensity: number; // 0 to 1
}

export interface AdaptiveTrackConfig {
  enableTempoAdaptation: boolean;
  enableKeyAdaptation: boolean;
  enableVolumeAdaptation: boolean;
  enableEffects: boolean;
  adaptationSensitivity: number; // 1-10
}

export class AdaptiveAudioService {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private pitchShiftNode: AudioWorkletNode | null = null;
  private tempoNode: AudioWorkletNode | null = null;
  private effectsChain: AudioNode[] = [];
  
  private originalBuffer: AudioBuffer | null = null;
  private isPlaying = false;
  private config: AdaptiveTrackConfig;
  private currentAdaptation: AudioAdaptation;
  
  // Performance tracking
  private performanceHistory: PerformanceMetrics[] = [];
  private adaptationCallbacks: ((adaptation: AudioAdaptation) => void)[] = [];

  constructor(config: Partial<AdaptiveTrackConfig> = {}) {
    this.config = {
      enableTempoAdaptation: true,
      enableKeyAdaptation: true,
      enableVolumeAdaptation: true,
      enableEffects: true,
      adaptationSensitivity: 5,
      ...config
    };

    this.currentAdaptation = {
      tempoAdjustment: 0,
      keyAdjustment: 0,
      volumeAdjustment: 0,
      effectsIntensity: 0.5
    };

    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Load audio worklets for advanced processing
      await this.loadAudioWorklets();
      
      // Create basic audio nodes
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      
    } catch (error) {
      console.error('Failed to initialize adaptive audio context:', error);
    }
  }

  private async loadAudioWorklets() {
    if (!this.audioContext) return;

    try {
      // In a real implementation, these would be separate worklet files
      // For now, we'll use basic Web Audio API nodes
      console.log('Audio worklets would be loaded here for advanced pitch/tempo shifting');
    } catch (error) {
      console.warn('Advanced audio worklets not available, using fallback processing');
    }
  }

  async loadTrack(audioBuffer: AudioBuffer): Promise<void> {
    this.originalBuffer = audioBuffer;
    await this.setupAudioChain();
  }

  async loadTrackFromUrl(url: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      await this.loadTrack(audioBuffer);
    } catch (error) {
      console.error('Failed to load track:', error);
      throw error;
    }
  }

  private async setupAudioChain() {
    if (!this.audioContext || !this.originalBuffer || !this.gainNode) return;

    // Clean up existing nodes
    this.cleanupAudioNodes();

    // Create new source
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.originalBuffer;

    // Create effects chain
    this.effectsChain = [];
    let currentNode: AudioNode = this.sourceNode;

    // Add pitch shift (key adaptation)
    if (this.config.enableKeyAdaptation) {
      const pitchShift = this.createPitchShiftNode();
      if (pitchShift) {
        currentNode.connect(pitchShift);
        currentNode = pitchShift;
        this.effectsChain.push(pitchShift);
      }
    }

    // Add tempo adjustment (would need advanced processing)
    if (this.config.enableTempoAdaptation) {
      // Tempo adjustment requires more complex processing
      // In a real implementation, this would use time-stretching algorithms
      this.sourceNode.playbackRate.value = 1 + this.currentAdaptation.tempoAdjustment;
    }

    // Add reverb/effects
    if (this.config.enableEffects) {
      const reverb = this.createReverbNode();
      if (reverb) {
        currentNode.connect(reverb);
        currentNode = reverb;
        this.effectsChain.push(reverb);
      }
    }

    // Connect to gain and output
    currentNode.connect(this.gainNode);
  }

  private createPitchShiftNode(): AudioNode | null {
    if (!this.audioContext) return null;

    // Simple pitch shift using playback rate (affects tempo too)
    // In a real implementation, this would use a proper pitch shift algorithm
    const pitchShift = this.audioContext.createGain();
    return pitchShift;
  }

  private createReverbNode(): AudioNode | null {
    if (!this.audioContext) return null;

    try {
      const convolver = this.audioContext.createConvolver();
      const reverbGain = this.audioContext.createGain();
      const dryGain = this.audioContext.createGain();
      const wetGain = this.audioContext.createGain();

      // Create impulse response for reverb
      const impulseBuffer = this.createImpulseResponse();
      convolver.buffer = impulseBuffer;

      // Set up wet/dry mix
      reverbGain.connect(dryGain);
      reverbGain.connect(convolver);
      convolver.connect(wetGain);

      const merger = this.audioContext.createChannelMerger(2);
      dryGain.connect(merger, 0, 0);
      wetGain.connect(merger, 0, 1);

      // Adjust wet/dry based on effects intensity
      const intensity = this.currentAdaptation.effectsIntensity;
      dryGain.gain.value = 1 - intensity * 0.5;
      wetGain.gain.value = intensity * 0.3;

      return reverbGain;
    } catch (error) {
      console.warn('Failed to create reverb node:', error);
      return null;
    }
  }

  private createImpulseResponse(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available');

    const length = this.audioContext.sampleRate * 2; // 2 seconds
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    return impulse;
  }

  async play(): Promise<void> {
    if (!this.sourceNode || this.isPlaying) return;

    try {
      this.sourceNode.start();
      this.isPlaying = true;
    } catch (error) {
      console.error('Failed to play adaptive track:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.sourceNode && this.isPlaying) {
      try {
        this.sourceNode.stop();
      } catch (error) {
        // Node might already be stopped
      }
      this.isPlaying = false;
    }
  }

  adaptToPerformance(metrics: PerformanceMetrics): void {
    // Add to performance history
    this.performanceHistory.push(metrics);
    if (this.performanceHistory.length > 10) {
      this.performanceHistory.shift(); // Keep last 10 measurements
    }

    // Calculate adaptations based on performance
    const adaptation = this.calculateAdaptations(metrics);
    this.applyAdaptations(adaptation);
  }

  private calculateAdaptations(metrics: PerformanceMetrics): AudioAdaptation {
    const sensitivity = this.config.adaptationSensitivity / 10;
    const adaptation: AudioAdaptation = { ...this.currentAdaptation };

    // Tempo adaptation based on consistency
    if (this.config.enableTempoAdaptation) {
      if (metrics.tempoConsistency < 0.7) {
        // Slow down if user is struggling with tempo
        adaptation.tempoAdjustment = Math.max(-0.2, adaptation.tempoAdjustment - 0.05 * sensitivity);
      } else if (metrics.tempoConsistency > 0.9) {
        // Speed up if user is doing well
        adaptation.tempoAdjustment = Math.min(0.2, adaptation.tempoAdjustment + 0.02 * sensitivity);
      }
    }

    // Key adaptation based on pitch accuracy
    if (this.config.enableKeyAdaptation) {
      if (metrics.averagePitchAccuracy < 0.6) {
        // Adjust key to better suit user's range
        const avgHistory = this.performanceHistory.slice(-5)
          .reduce((sum, m) => sum + m.averagePitchAccuracy, 0) / Math.min(5, this.performanceHistory.length);
        
        if (avgHistory < 0.5) {
          // Lower the key if consistently struggling
          adaptation.keyAdjustment = Math.max(-2, adaptation.keyAdjustment - 0.5);
        }
      }
    }

    // Volume adaptation based on volume stability
    if (this.config.enableVolumeAdaptation) {
      if (metrics.volumeStability < 0.7) {
        // Increase backing track volume to help user hear better
        adaptation.volumeAdjustment = Math.min(10, adaptation.volumeAdjustment + 2);
      } else if (metrics.volumeStability > 0.9) {
        // Decrease volume if user is stable
        adaptation.volumeAdjustment = Math.max(-10, adaptation.volumeAdjustment - 1);
      }
    }

    // Effects adaptation based on overall performance
    if (this.config.enableEffects) {
      if (metrics.overallScore > 0.8) {
        // Add more effects for good performance
        adaptation.effectsIntensity = Math.min(1, adaptation.effectsIntensity + 0.1);
      } else if (metrics.overallScore < 0.5) {
        // Reduce effects for struggling users
        adaptation.effectsIntensity = Math.max(0, adaptation.effectsIntensity - 0.1);
      }
    }

    return adaptation;
  }

  private async applyAdaptations(adaptation: AudioAdaptation): Promise<void> {
    this.currentAdaptation = adaptation;

    // Apply tempo adjustment
    if (this.sourceNode && this.config.enableTempoAdaptation) {
      this.sourceNode.playbackRate.value = 1 + adaptation.tempoAdjustment;
    }

    // Apply volume adjustment
    if (this.gainNode && this.config.enableVolumeAdaptation) {
      const volumeMultiplier = Math.pow(10, adaptation.volumeAdjustment / 20); // Convert dB to linear
      this.gainNode.gain.setTargetAtTime(volumeMultiplier, this.audioContext?.currentTime || 0, 0.1);
    }

    // Notify listeners of adaptation changes
    this.adaptationCallbacks.forEach(callback => callback(adaptation));

    // If significant changes, restart the audio chain
    if (Math.abs(adaptation.keyAdjustment) > 0.5 || Math.abs(adaptation.effectsIntensity - 0.5) > 0.3) {
      if (this.isPlaying) {
        this.stop();
        await this.setupAudioChain();
        await this.play();
      } else {
        await this.setupAudioChain();
      }
    }
  }

  private cleanupAudioNodes(): void {
    this.effectsChain.forEach(node => {
      try {
        node.disconnect();
      } catch (error) {
        // Node might already be disconnected
      }
    });
    this.effectsChain = [];

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (error) {
        // Node might already be disconnected
      }
      this.sourceNode = null;
    }
  }

  // Public API methods
  getCurrentAdaptation(): AudioAdaptation {
    return { ...this.currentAdaptation };
  }

  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  onAdaptationChange(callback: (adaptation: AudioAdaptation) => void): void {
    this.adaptationCallbacks.push(callback);
  }

  updateConfig(newConfig: Partial<AdaptiveTrackConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  reset(): void {
    this.currentAdaptation = {
      tempoAdjustment: 0,
      keyAdjustment: 0,
      volumeAdjustment: 0,
      effectsIntensity: 0.5
    };
    this.performanceHistory = [];
  }

  dispose(): void {
    this.stop();
    this.cleanupAudioNodes();
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}