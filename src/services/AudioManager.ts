/**
 * Centralized Audio Manager
 * Prevents audio bleeding and manages all audio playback across the app
 */

class AudioManager {
  private static instance: AudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private currentType: 'preview' | 'instrumental' | 'recording' | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Play audio with automatic cleanup of previous audio
   */
  async playAudio(
    url: string, 
    type: 'preview' | 'instrumental' | 'recording',
    options: {
      volume?: number;
      loop?: boolean;
      onEnded?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<HTMLAudioElement> {
    try {
      // Stop any currently playing audio
      this.stopAll();

      // Get or create audio element
      let audio = this.audioCache.get(url);
      if (!audio) {
        audio = new Audio(url);
        audio.preload = 'auto';
        this.audioCache.set(url, audio);
      }

      // Configure audio
      audio.volume = options.volume ?? 0.8;
      audio.loop = options.loop ?? false;
      audio.currentTime = 0;

      // Set up event listeners
      audio.onended = () => {
        this.currentAudio = null;
        this.currentType = null;
        options.onEnded?.();
      };

      audio.onerror = () => {
        const error = new Error(`Failed to load audio: ${url}`);
        console.error('Audio playback error:', error);
        this.currentAudio = null;
        this.currentType = null;
        options.onError?.(error);
      };

      // Play audio
      await audio.play();
      
      this.currentAudio = audio;
      this.currentType = type;

      console.log(`🎵 Playing ${type} audio:`, url);
      return audio;

    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * Stop currently playing audio
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.currentType = null;
      console.log('🔇 Audio stopped');
    }
  }

  /**
   * Stop all audio and clear cache
   */
  stopAll(): void {
    // Stop current audio
    this.stop();

    // Stop all cached audio
    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    console.log('🔇 All audio stopped');
  }

  /**
   * Pause current audio without resetting position
   */
  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      console.log('⏸️ Audio paused');
    }
  }

  /**
   * Resume paused audio
   */
  async resume(): Promise<void> {
    if (this.currentAudio && this.currentAudio.paused) {
      try {
        await this.currentAudio.play();
        console.log('▶️ Audio resumed');
      } catch (error) {
        console.error('Failed to resume audio:', error);
        throw error;
      }
    }
  }

  /**
   * Set volume for current audio
   */
  setVolume(volume: number): void {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current playback state
   */
  getState(): {
    isPlaying: boolean;
    type: string | null;
    currentTime: number;
    duration: number;
    volume: number;
  } {
    if (!this.currentAudio) {
      return {
        isPlaying: false,
        type: null,
        currentTime: 0,
        duration: 0,
        volume: 0
      };
    }

    return {
      isPlaying: !this.currentAudio.paused,
      type: this.currentType,
      currentTime: this.currentAudio.currentTime,
      duration: this.currentAudio.duration || 0,
      volume: this.currentAudio.volume
    };
  }

  /**
   * Check if specific type is playing
   */
  isPlaying(type?: 'preview' | 'instrumental' | 'recording'): boolean {
    if (!this.currentAudio || this.currentAudio.paused) return false;
    if (type) return this.currentType === type;
    return true;
  }

  /**
   * Preload audio for faster playback
   */
  async preload(url: string): Promise<void> {
    if (this.audioCache.has(url)) return;

    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      
      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
        audio.load();
      });

      this.audioCache.set(url, audio);
      console.log('🎵 Audio preloaded:', url);
    } catch (error) {
      console.warn('Failed to preload audio:', url, error);
    }
  }

  /**
   * Clear audio cache to free memory
   */
  clearCache(): void {
    this.stopAll();
    this.audioCache.clear();
    console.log('🧹 Audio cache cleared');
  }

  /**
   * Fade out current audio
   */
  async fadeOut(duration: number = 1000): Promise<void> {
    if (!this.currentAudio) return;

    const audio = this.currentAudio;
    const startVolume = audio.volume;
    const fadeStep = startVolume / (duration / 50);

    return new Promise((resolve) => {
      const fadeInterval = setInterval(() => {
        if (audio.volume > fadeStep) {
          audio.volume -= fadeStep;
        } else {
          audio.volume = 0;
          this.stop();
          clearInterval(fadeInterval);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * Fade in audio
   */
  async fadeIn(
    url: string, 
    type: 'preview' | 'instrumental' | 'recording',
    targetVolume: number = 0.8,
    duration: number = 1000
  ): Promise<void> {
    const audio = await this.playAudio(url, type, { volume: 0 });
    const fadeStep = targetVolume / (duration / 50);

    return new Promise((resolve) => {
      const fadeInterval = setInterval(() => {
        if (audio.volume < targetVolume - fadeStep) {
          audio.volume += fadeStep;
        } else {
          audio.volume = targetVolume;
          clearInterval(fadeInterval);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * Cross-fade between two audio sources
   */
  async crossFade(
    fromType: 'preview' | 'instrumental' | 'recording',
    toUrl: string,
    toType: 'preview' | 'instrumental' | 'recording',
    duration: number = 1000
  ): Promise<void> {
    const fadeOutPromise = this.fadeOut(duration);
    
    // Start fade in after half the duration
    setTimeout(async () => {
      await this.fadeIn(toUrl, toType, 0.8, duration / 2);
    }, duration / 2);

    await fadeOutPromise;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
export default AudioManager;