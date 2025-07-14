'use client';

/**
 * AudioPlayerService
 * 
 * Provides reusable audio playback functionality across the application
 */
export class AudioPlayerService {
  private audioElement: HTMLAudioElement | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private isPlaying: boolean = false;
  private onPlayStateChange: ((isPlaying: boolean) => void) | null = null;

  /**
   * Creates a new instance for a specific audio element
   * 
   * @param audioElement - Optional existing audio element to control
   * @param onPlayStateChange - Optional callback when play state changes
   */
  constructor(
    audioElement?: HTMLAudioElement,
    onPlayStateChange?: (isPlaying: boolean) => void
  ) {
    if (audioElement) {
      this.setAudioElement(audioElement);
    }
    this.onPlayStateChange = onPlayStateChange || null;
  }

  /**
   * Set or update the audio element being controlled
   */
  setAudioElement(audioElement: HTMLAudioElement): void {
    this.audioElement = audioElement;
    
    // Set up event listeners
    this.audioElement.onended = () => this.handlePlaybackEnded();
    this.audioElement.onpause = () => this.updatePlayState(false);
    this.audioElement.onplay = () => this.updatePlayState(true);
  }

  /**
   * Set a callback for play state changes
   */
  setPlayStateChangeCallback(callback: (isPlaying: boolean) => void): void {
    this.onPlayStateChange = callback;
  }

  /**
   * Toggle between play and pause
   * 
   * @param maxDuration - Optional maximum playback duration in seconds
   * @returns Current play state after toggle
   */
  togglePlayback(maxDuration?: number): boolean {
    if (!this.audioElement) return false;

    if (this.isPlaying) {
      this.pause();
    } else {
      this.play(maxDuration);
    }

    return this.isPlaying;
  }

  /**
   * Start playback with optional maximum duration
   * 
   * @param maxDuration - Optional maximum playback duration in seconds
   */
  play(maxDuration?: number): void {
    if (!this.audioElement) return;

    // Reset to beginning if needed
    this.audioElement.currentTime = 0;
    
    // Start playback
    this.audioElement.play();
    this.updatePlayState(true);

    // Set up duration limit if specified
    if (maxDuration && maxDuration > 0) {
      this.timeoutId = setTimeout(() => {
        this.pause();
        this.audioElement!.currentTime = 0;
      }, maxDuration * 1000);
    }
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.audioElement) return;
    
    this.audioElement.pause();
    this.updatePlayState(false);
    
    // Clear any timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    if (this.audioElement) {
      this.audioElement.onended = null;
      this.audioElement.onpause = null;
      this.audioElement.onplay = null;
      this.audioElement.pause();
    }
    
    this.audioElement = null;
    this.onPlayStateChange = null;
  }

  /**
   * Handle end of playback
   */
  private handlePlaybackEnded(): void {
    this.updatePlayState(false);
  }

  /**
   * Update internal play state and trigger callback
   */
  private updatePlayState(isPlaying: boolean): void {
    this.isPlaying = isPlaying;
    
    if (this.onPlayStateChange) {
      this.onPlayStateChange(isPlaying);
    }
  }

  /**
   * Create a simple player for a blob or URL
   * 
   * @param source - Blob or URL to play
   * @param onPlayStateChange - Optional callback when play state changes
   * @returns AudioPlayerService instance
   */
  static createPlayer(
    source: Blob | string,
    onPlayStateChange?: (isPlaying: boolean) => void
  ): AudioPlayerService {
    const audio = new Audio();
    
    if (typeof source === 'string') {
      audio.src = source;
    } else {
      audio.src = URL.createObjectURL(source);
    }
    
    return new AudioPlayerService(audio, onPlayStateChange);
  }
}