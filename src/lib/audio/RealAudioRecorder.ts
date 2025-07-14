'use client';

/**
 * Real Audio Recording Service using Web Audio API
 */
export class RealAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private requestDataInterval: NodeJS.Timeout | null = null;
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
      // Clear any previous recording data
      this.audioChunks = [];
      
      // Ensure audio format is supported
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Try alternative formats
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          // Fall back to default if not supported
          mimeType = '';
          console.warn('Preferred audio formats not supported, using browser default');
        }
      }

      // Create a new MediaRecorder with optimal settings
      this.mediaRecorder = new MediaRecorder(this.audioStream!, {
        mimeType,
        audioBitsPerSecond: 128000 // 128kbps - balance between quality and size
      });

      // Set up data capture handler
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`Captured audio chunk: ${event.data.size} bytes`);
          this.audioChunks.push(event.data);
        } else {
          console.warn('Received empty audio chunk');
        }
      };

      // Store interval ID as class property for reliable cleanup
      this.requestDataInterval = setInterval(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          try {
            this.mediaRecorder.requestData();
          } catch (e) {
            console.warn('Failed to request data during recording:', e);
          }
        } else {
          this.clearRequestDataInterval();
        }
      }, 1000); // Request data every second
      
      // Clear the interval when recording stops
      this.mediaRecorder.addEventListener('stop', () => this.clearRequestDataInterval());

      this.mediaRecorder.onstop = () => {
        // Double check we have data
        if (this.audioChunks.length === 0) {
          console.error('No audio chunks recorded');
          this.onError?.('No audio data captured');
          this.isRecording = false;
          return;
        }

        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          
          // Verify blob has content
          if (audioBlob.size > 0) {
            console.log(`✅ Audio recording completed: ${audioBlob.size} bytes`);
            this.onDataAvailable?.(audioBlob);
          } else {
            console.error('Audio blob created but has zero size');
            this.onError?.('Empty audio recording');
          }
        } catch (error) {
          console.error('Error creating audio blob:', error);
          this.onError?.('Failed to process recording');
        }
        
        this.onRecordingStop?.();
        this.isRecording = false;
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.onError?.('Recording failed');
        this.isRecording = false;
      };

      // Request data more frequently (every 100ms) to ensure we get data
      this.mediaRecorder.start(100);
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
   * @returns {Promise<boolean>} - Promise that resolves when recording is fully stopped
   */
  stopRecording(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        console.warn('Stop called but recorder not active');
        resolve(false);
        return;
      }
      
      // Make sure we get final data before stopping
      try {
        // Request any remaining data
        this.mediaRecorder.requestData();
        
        // Request any remaining data again to ensure we have everything
        try {
          this.mediaRecorder.requestData();
        } catch (e) {
          console.warn('Failed to request final data:', e);
        }

        // Stop data collection interval
        this.clearRequestDataInterval();

        // Force the media recorder to generate a blob sooner
        const audioChunksSnapshot = [...this.audioChunks];
        
        // Set a timeout to make sure onstop event fires
        const stopTimeout = setTimeout(() => {
          console.warn('MediaRecorder stop event timeout - forcing blob creation');
          
          // If we have audio chunks but onstop didn't fire, process them anyway
          if (audioChunksSnapshot.length > 0) {
            try {
              const audioBlob = new Blob(audioChunksSnapshot, {
                type: 'audio/webm;codecs=opus'
              });
              console.log(`Created blob manually: ${audioBlob.size} bytes`);
              this.onDataAvailable?.(audioBlob);
              this.onRecordingStop?.();
              this.isRecording = false;
              
              // Force stop all audio tracks
              this.stopAudioTracks();
              
              resolve(true);
            } catch (blobError) {
              console.error('Failed to create blob manually:', blobError);
              this.stopAudioTracks();
              resolve(false);
            }
          } else {
            console.error('No audio chunks available to create blob');
            this.onRecordingStop?.();
            this.isRecording = false;
            
            // Force stop all audio tracks
            this.stopAudioTracks();
            
            resolve(false);
          }
        }, 1000); // Shorter timeout to ensure UI responsiveness
        
        // Setup one-time event listener for stop
        this.mediaRecorder.addEventListener('stop', () => {
          clearTimeout(stopTimeout);
          console.log('⏹️ Recording stopped normally');
          
          // Stop all audio tracks after normal stop too
          this.stopAudioTracks();
          
          resolve(true);
        }, { once: true });
        
        // Now stop the recorder
        this.mediaRecorder.stop();
        console.log('⏹️ Recording stop requested');
      } catch (error) {
        console.error('Error stopping recording:', error);
        this.isRecording = false;
        this.onError?.('Error stopping recording');
        
        // Stop audio tracks even on error
        this.stopAudioTracks();
        
        resolve(false);
      }
    });
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
    try {
      // Clear the data collection interval
      this.clearRequestDataInterval();
      
      // Stop the media recorder if active
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        try {
          this.mediaRecorder.stop();
        } catch (e) {
          console.warn('Error stopping mediaRecorder during cleanup:', e);
        }
      }
      this.mediaRecorder = null;
      
      // Stop all audio tracks explicitly
      this.stopAudioTracks();
      this.audioStream = null;
      
      // Clear memory
      this.audioChunks = [];
      this.isRecording = false;
      
      console.log('🧹 Audio recorder cleaned up completely');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
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

  /**
   * Clear the requestData interval if it exists
   */
  private clearRequestDataInterval(): void {
    if (this.requestDataInterval) {
      clearInterval(this.requestDataInterval);
      this.requestDataInterval = null;
    }
  }

  /**
   * Stop all audio tracks to fully release the microphone
   */
  private stopAudioTracks(): void {
    if (this.audioStream) {
      console.log('🎤 Stopping all audio tracks');
      this.audioStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Track ${track.kind} stopped: ${track.id}`);
      });
    }
  }
}