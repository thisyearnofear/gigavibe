'use client';

/**
 * Real Audio Service for recording, processing, and storing vocal performances
 */
export class RealAudioService {
  private static instance: RealAudioService;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;

  constructor() {}

  static getInstance(): RealAudioService {
    if (!RealAudioService.instance) {
      RealAudioService.instance = new RealAudioService();
    }
    return RealAudioService.instance;
  }

  /**
   * Initialize audio system and request microphone permissions
   */
  async initializeAudio(): Promise<boolean> {
    try {
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      // Create audio context for analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Create analyser for real-time audio analysis
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      console.log('✅ Audio system initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<boolean> {
    try {
      if (!this.stream) {
        const initialized = await this.initializeAudio();
        if (!initialized) return false;
      }

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream!, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.recordedChunks = [];
      this.isRecording = true;

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log('🎤 Recording started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.isRecording = false;
        console.log('🎤 Recording stopped, blob size:', audioBlob.size);
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Get real-time audio analysis data
   */
  getAudioAnalysis(): {
    volume: number;
    frequency: number;
    waveform: Uint8Array;
  } | null {
    if (!this.analyser) return null;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const volume = Math.sqrt(sum / bufferLength) / 255;

    // Find dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    
    const frequency = (maxIndex * this.audioContext!.sampleRate) / (2 * bufferLength);

    return {
      volume,
      frequency,
      waveform: dataArray
    };
  }

  /**
   * Convert audio blob to different formats
   */
  async convertAudioFormat(blob: Blob, targetFormat: 'mp3' | 'wav' = 'mp3'): Promise<Blob> {
    // For now, return the original blob
    // In production, you might want to use a library like lamejs for MP3 conversion
    return blob;
  }

  /**
   * Analyze audio quality and characteristics
   */
  async analyzeAudioQuality(blob: Blob): Promise<{
    duration: number;
    averageVolume: number;
    peakVolume: number;
    silenceRatio: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  }> {
    try {
      const audioBuffer = await this.blobToAudioBuffer(blob);
      const channelData = audioBuffer.getChannelData(0);
      
      const duration = audioBuffer.duration;
      let sum = 0;
      let peak = 0;
      let silentSamples = 0;
      const silenceThreshold = 0.01;

      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.abs(channelData[i]);
        sum += sample;
        peak = Math.max(peak, sample);
        
        if (sample < silenceThreshold) {
          silentSamples++;
        }
      }

      const averageVolume = sum / channelData.length;
      const silenceRatio = silentSamples / channelData.length;

      // Determine quality based on various factors
      let quality: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
      if (averageVolume > 0.1 && silenceRatio < 0.3 && duration > 3) {
        quality = 'excellent';
      } else if (averageVolume > 0.05 && silenceRatio < 0.5) {
        quality = 'good';
      } else if (averageVolume > 0.02) {
        quality = 'fair';
      }

      return {
        duration,
        averageVolume,
        peakVolume: peak,
        silenceRatio,
        quality
      };
    } catch (error) {
      console.error('Failed to analyze audio quality:', error);
      return {
        duration: 0,
        averageVolume: 0,
        peakVolume: 0,
        silenceRatio: 1,
        quality: 'poor'
      };
    }
  }

  /**
   * Convert blob to AudioBuffer for analysis
   */
  private async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * Check if recording is currently active
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get recording duration in seconds
   */
  getRecordingDuration(): number {
    if (!this.isRecording || !this.mediaRecorder) return 0;
    return (Date.now() - (this.mediaRecorder as any).startTime) / 1000;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }
}