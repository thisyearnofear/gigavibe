'use client';

import { AudioMixerService } from './AudioMixerService';

/**
 * Describes the state of a recording
 */
export interface RecordingState {
  isRecording: boolean;
  hasRecording: boolean;
  audioBlob: Blob | null;
  mixedAudioBlob: Blob | null;
  duration: number;
}

/**
 * Events that can be emitted by the AudioRecordingService
 */
export enum AudioRecordingEvent {
  RECORDING_START = 'recordingStart',
  RECORDING_STOP = 'recordingStop',
  RECORDING_AVAILABLE = 'recordingAvailable',
  MIXED_AUDIO_AVAILABLE = 'mixedAudioAvailable',
  RECORDING_ERROR = 'recordingError'
}

/**
 * AudioRecordingService
 * 
 * Provides reusable audio recording functionality across the application
 */
export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private audioBlob: Blob | null = null;
  private mixedAudioBlob: Blob | null = null;
  private isRecording: boolean = false;
  private eventListeners: Map<AudioRecordingEvent, Function[]> = new Map();
  
  /**
   * Start recording audio from the user's microphone
   * 
   * @returns Promise that resolves when recording starts
   */
  async startRecording(): Promise<boolean> {
    if (this.isRecording) {
      console.warn('Recording already in progress');
      return false;
    }
    
    try {
      this.audioChunks = [];
      this.audioBlob = null;
      this.mixedAudioBlob = null;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        this.processRecording();
      };
      
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.emit(AudioRecordingEvent.RECORDING_ERROR, new Error('MediaRecorder error'));
      };
      
      this.mediaRecorder.start();
      this.startTime = Date.now();
      this.isRecording = true;
      
      this.emit(AudioRecordingEvent.RECORDING_START);
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.emit(AudioRecordingEvent.RECORDING_ERROR, error);
      return false;
    }
  }
  
  /**
   * Stop the current recording
   * 
   * @returns Promise that resolves when recording is processed
   */
  async stopRecording(): Promise<boolean> {
    if (!this.isRecording || !this.mediaRecorder) {
      console.warn('No recording in progress');
      return false;
    }
    
    return new Promise<boolean>((resolve) => {
      if (!this.mediaRecorder) {
        resolve(false);
        return;
      }
      
      // Handle the stop event
      const originalOnStop = this.mediaRecorder.onstop;
      this.mediaRecorder.onstop = (event) => {
        // Call original handler
        if (originalOnStop) {
          originalOnStop.call(this.mediaRecorder, event);
        }
        
        // Close all media tracks
        if (this.mediaRecorder && this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        this.isRecording = false;
        this.emit(AudioRecordingEvent.RECORDING_STOP);
        resolve(true);
      };
      
      // Stop the recorder
      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        } else {
          console.warn('MediaRecorder already inactive');
          this.isRecording = false;
          this.emit(AudioRecordingEvent.RECORDING_STOP);
          resolve(false);
        }
      } catch (error) {
        console.error('Error stopping MediaRecorder:', error);
        this.isRecording = false;
        this.emit(AudioRecordingEvent.RECORDING_STOP);
        resolve(false);
      }
    });
  }
  
  /**
   * Clear any saved recording data
   */
  clearRecording(): void {
    this.audioChunks = [];
    this.audioBlob = null;
    this.mixedAudioBlob = null;
  }
  
  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }
  
  /**
   * Check if there's a recording available
   */
  getHasRecording(): boolean {
    return this.audioBlob !== null;
  }
  
  /**
   * Get the current recording blob
   */
  getAudioBlob(): Blob | null {
    return this.audioBlob;
  }
  
  /**
   * Get the mixed audio blob if available
   */
  getMixedAudioBlob(): Blob | null {
    return this.mixedAudioBlob;
  }
  
  /**
   * Get the duration of the recording in seconds
   */
  getRecordingDuration(): number {
    if (this.startTime === 0) return 0;
    return (Date.now() - this.startTime) / 1000;
  }
  
  /**
   * Get the current recording state
   */
  getRecordingState(): RecordingState {
    return {
      isRecording: this.isRecording,
      hasRecording: this.getHasRecording(),
      audioBlob: this.audioBlob,
      mixedAudioBlob: this.mixedAudioBlob,
      duration: this.getRecordingDuration()
    };
  }
  
  /**
   * Mix the current vocal recording with an instrumental track
   * 
   * @param instrumentalUrl - URL to the instrumental track
   * @returns Promise that resolves to a boolean indicating success
   */
  async mixWithInstrumental(instrumentalUrl: string): Promise<boolean> {
    if (!this.audioBlob) {
      console.warn('No recording available to mix');
      return false;
    }
    
    try {
      const mixedBlob = await AudioMixerService.mixVocalsWithInstrumental(
        this.audioBlob,
        instrumentalUrl
      );
      
      if (!mixedBlob) {
        console.error('Mixing failed to produce output');
        return false;
      }
      
      this.mixedAudioBlob = mixedBlob;
      this.emit(AudioRecordingEvent.MIXED_AUDIO_AVAILABLE, mixedBlob);
      return true;
    } catch (error) {
      console.error('Error mixing audio:', error);
      return false;
    }
  }
  
  /**
   * Add an event listener
   * 
   * @param event - The event to listen for
   * @param callback - Function to call when event occurs
   */
  addEventListener(event: AudioRecordingEvent, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)!.push(callback);
  }
  
  /**
   * Remove an event listener
   * 
   * @param event - The event to stop listening for
   * @param callback - The callback to remove
   */
  removeEventListener(event: AudioRecordingEvent, callback: Function): void {
    if (!this.eventListeners.has(event)) return;
    
    const callbacks = this.eventListeners.get(event)!;
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
  
  /**
   * Process the recorded audio chunks into a blob
   */
  private processRecording(): void {
    if (this.audioChunks.length === 0) {
      console.warn('No audio chunks recorded');
      return;
    }
    
    try {
      this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      console.log(`Recording processed: ${this.audioBlob.size} bytes`);
      
      this.emit(AudioRecordingEvent.RECORDING_AVAILABLE, this.audioBlob);
    } catch (error) {
      console.error('Error processing audio chunks:', error);
    }
  }
  
  /**
   * Emit an event to all listeners
   *
   * @param event - The event to emit
   * @param data - Optional data to pass to listeners
   */
  private emit(event: AudioRecordingEvent, data?: any): void {
    if (!this.eventListeners.has(event)) return;

    this.eventListeners.get(event)!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }
  
  /**
   * Create a singleton instance
   */
  private static instance: AudioRecordingService | null = null;
  
  /**
   * Get the singleton instance
   */
  static getInstance(): AudioRecordingService {
    if (!this.instance) {
      this.instance = new AudioRecordingService();
    }
    
    return this.instance;
  }
}