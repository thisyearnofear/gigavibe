/**
 * Enhanced Audio Recording Service
 * Production-ready audio recording with mixing and upload capabilities
 */

import { GroveService } from '@/lib/storage/GroveService';
import { AudioUploadService } from '@/lib/audio/AudioUploadService';
import { AudioMixerService } from '@/lib/audio/AudioMixerService';

interface RecordingOptions {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

interface RecordingResult {
  audioBlob: Blob;
  duration: number;
  sampleRate: number;
  channelCount: number;
  size: number;
}

interface MixingResult {
  mixedBlob: Blob;
  vocalOnlyBlob: Blob;
  instrumentalBlob: Blob;
  duration: number;
}

class EnhancedAudioRecordingService {
  private static instance: EnhancedAudioRecordingService;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private isRecording = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private eventListeners: Map<AudioRecordingEvent, Function[]> = new Map();

  static getInstance(): EnhancedAudioRecordingService {
    if (!EnhancedAudioRecordingService.instance) {
      EnhancedAudioRecordingService.instance = new EnhancedAudioRecordingService();
    }
    return EnhancedAudioRecordingService.instance;
  }

  /**
   * Request microphone permission and initialize audio context
   */
  async requestPermission(options: RecordingOptions = {}): Promise<boolean> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          sampleRate: options.sampleRate || 44100,
          channelCount: options.channelCount || 1,
          echoCancellation: options.echoCancellation ?? true,
          noiseSuppression: options.noiseSuppression ?? true,
          autoGainControl: options.autoGainControl ?? true,
        }
      };

      this.audioStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Initialize audio context for analysis
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.audioStream);
      
      this.analyser.fftSize = 2048;
      this.microphone.connect(this.analyser);

      console.log('✅ Audio permission granted and context initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to get audio permission:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    if (!this.audioStream) {
      throw new Error('Audio stream not initialized. Call requestPermission() first.');
    }

    if (this.isRecording) {
      console.warn('Recording already in progress');
      return;
    }

    try {
      // Clear previous chunks
      this.audioChunks = [];

      // Create media recorder with optimal settings
      const options: MediaRecorderOptions = {
        mimeType: this.getSupportedMimeType(),
        audioBitsPerSecond: 128000, // 128 kbps for good quality
      };

      this.mediaRecorder = new MediaRecorder(this.audioStream, options);

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('📹 Recording stopped');
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('❌ Recording error:', event);
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.startTime = Date.now();
      this.isRecording = true;

      console.log('🎤 Recording started');
      this.emit(AudioRecordingEvent.RECORDING_START);
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return result
   */
  async stopRecording(): Promise<RecordingResult> {
    if (!this.mediaRecorder || !this.isRecording) {
      throw new Error('No active recording to stop');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not available'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const duration = (Date.now() - this.startTime) / 1000;
          const audioBlob = new Blob(this.audioChunks, { 
            type: this.getSupportedMimeType() 
          });

          const result: RecordingResult = {
            audioBlob,
            duration,
            sampleRate: 44100, // Default, could be extracted from stream
            channelCount: 1,
            size: audioBlob.size
          };

          this.isRecording = false;
          console.log('✅ Recording completed:', result);
          this.emit(AudioRecordingEvent.RECORDING_STOP);
          this.emit(AudioRecordingEvent.RECORDING_AVAILABLE, audioBlob);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Get current audio level for visualization
   */
  getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    return average;
  }

  /**
   * Get frequency data for visualization
   */
  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Mix recorded vocals with instrumental track
   */
  async mixWithInstrumental(
    vocalBlob: Blob, 
    instrumentalUrl: string,
    vocalVolume: number = 0.8,
    instrumentalVolume: number = 0.6
  ): Promise<MixingResult> {
    try {
      console.log('🎵 Starting audio mixing...');

      // Use existing AudioMixerService static method
      const mixedBlob = await AudioMixerService.mixVocalsWithInstrumental(
        vocalBlob,
        instrumentalUrl
      );

      if (!mixedBlob) {
        throw new Error('Failed to mix audio tracks');
      }

      // Fetch instrumental track for separate blob
      const instrumentalResponse = await fetch(instrumentalUrl);
      const instrumentalBuffer = await instrumentalResponse.arrayBuffer();
      const instrumentalBlob = new Blob([instrumentalBuffer], { type: 'audio/wav' });

      // Calculate duration (approximate from mixed blob size)
      const duration = mixedBlob.size / (44100 * 2 * 2); // Rough estimate

      const result: MixingResult = {
        mixedBlob,
        vocalOnlyBlob: vocalBlob,
        instrumentalBlob,
        duration
      };

      console.log('✅ Audio mixing completed');
      return result;
    } catch (error) {
      console.error('❌ Failed to mix audio:', error);
      throw error;
    }
  }

  /**
   * Upload recording to storage
   */
  async uploadRecording(
    audioBlob: Blob,
    challengeId: string,
    userId: string,
    metadata?: any
  ): Promise<string> {
    try {
      console.log('☁️ Uploading recording...');

      // Try Grove service first, fallback to AudioUploadService
      try {
        const groveService = GroveService.getInstance();
        
        if (groveService && GroveService.isSupported()) {
          const filename = `${challengeId}_${userId}_${Date.now()}.webm`;
          const uploadResult = await groveService.uploadFile(audioBlob, filename);
          
          if (uploadResult && uploadResult.gatewayUrl) {
            console.log('✅ Recording uploaded to Grove:', uploadResult.gatewayUrl);
            return uploadResult.gatewayUrl;
          }
        }
      } catch (error) {
        console.warn('Grove service upload failed, trying fallback:', error);
      }

      // Fallback to AudioUploadService
      try {
        const uploadResult = await AudioUploadService.uploadAudio({
          blob: audioBlob,
          challengeId,
          sourceType: 'recording',
          filename: `${challengeId}_${userId}_${Date.now()}.webm`,
          metadata: {
            userId,
            ...metadata
          }
        });

        if (uploadResult.success && uploadResult.url) {
          console.log('✅ Recording uploaded:', uploadResult.url);
          return uploadResult.url;
        } else {
          throw new Error(uploadResult.error?.message || 'Upload failed');
        }
      } catch (error) {
        console.error('All upload methods failed:', error);
        throw new Error('Failed to upload recording to any service');
      }
    } catch (error) {
      console.error('❌ Failed to upload recording:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.microphone = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;

    console.log('🧹 Audio recording service cleaned up');
  }

  /**
   * Get supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  /**
   * Check if currently recording
   */
  get recording(): boolean {
    return this.isRecording;
  }

  /**
   * Get recording duration in seconds
   */
  get duration(): number {
    if (!this.isRecording) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * Get current recording state for compatibility with hooks
   */
  getRecordingState(): RecordingState {
    return {
      isRecording: this.isRecording,
      hasRecording: this.audioChunks.length > 0,
      audioBlob: this.audioChunks.length > 0 ? new Blob(this.audioChunks, { type: this.getSupportedMimeType() }) : null,
      mixedAudioBlob: null, // Mixed audio is handled separately
      duration: this.duration,
      error: null
    };
  }

  /**
   * Clear recording data for compatibility with hooks
   */
  clearRecording(): void {
    this.audioChunks = [];
    if (this.isRecording && this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
    console.log('🧹 Recording data cleared');
  }

  /**
   * Add event listener for compatibility with hooks
   */
  addEventListener(event: AudioRecordingEvent, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener for compatibility with hooks
   */
  removeEventListener(event: AudioRecordingEvent, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: AudioRecordingEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

// Export types for compatibility
export enum AudioRecordingEvent {
  RECORDING_START = 'recording_start',
  RECORDING_STOP = 'recording_stop',
  RECORDING_AVAILABLE = 'recording_available',
  MIXED_AUDIO_AVAILABLE = 'mixed_audio_available',
  RECORDING_ERROR = 'recording_error'
}

export interface RecordingState {
  isRecording: boolean;
  hasRecording: boolean;
  audioBlob: Blob | null;
  mixedAudioBlob: Blob | null;
  duration: number;
  error: string | null;
}

// Export class and instance
export const AudioRecordingService = EnhancedAudioRecordingService;
export const audioRecordingService = EnhancedAudioRecordingService.getInstance();
export default EnhancedAudioRecordingService;