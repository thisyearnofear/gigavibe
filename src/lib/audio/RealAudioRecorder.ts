'use client';

/**
 * Real Audio Recording Service using Web Audio API
 */
export class RealAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onDataAvailable?: (audioBlob: Blob) => void;
  private onRecordingStart?: () => void;
  private onRecordingStop?: () => void;
  private onError?: (error: string) => void;

  constructor() {}

  /**
   * Initialize audio recording with microphone permissions
   */
  async initialize(): Promise<boolean> {
    try {
      // Request microphone permission
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });

      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        throw new Error('Audio recording not supported in this browser');
      }

      console.log('✅ Audio recording initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio recording:', error);
      this.onError?.('Microphone access denied or not available');
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<boolean> {
    if (!this.audioStream) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      this.audioChunks = [];
      
      this.mediaRecorder = new MediaRecorder(this.audioStream!, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.onDataAvailable?.(audioBlob);
        this.onRecordingStop?.();
        this.isRecording = false;
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.onError?.('Recording failed');
        this.isRecording = false;
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      this.onRecordingStart?.();
      
      console.log('🎤 Recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError?.('Failed to start recording');
      return false;
    }
  }

  /**
   * Stop recording audio
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      console.log('⏹️ Recording stopped');
    }
  }

  /**
   * Get current recording status
   */
  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: {
    onDataAvailable?: (audioBlob: Blob) => void;
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;
    onError?: (error: string) => void;
  }): void {
    this.onDataAvailable = handlers.onDataAvailable;
    this.onRecordingStart = handlers.onRecordingStart;
    this.onRecordingStop = handlers.onRecordingStop;
    this.onError = handlers.onError;
  }

  /**
   * Convert audio blob to base64 for storage
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:audio/webm;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get audio duration from blob
   */
  async getAudioDuration(blob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    
    this.audioChunks = [];
    this.isRecording = false;
    console.log('🧹 Audio recorder cleaned up');
  }

  /**
   * Check if audio recording is supported
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && 
              navigator.mediaDevices.getUserMedia && 
              window.MediaRecorder);
  }

  /**
   * Request microphone permissions without starting recording
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }
}