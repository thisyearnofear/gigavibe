'use client';

/**
 * AudioMixerService
 * 
 * Provides functionality for mixing and processing audio tracks
 */
export class AudioMixerService {
  
  /**
   * Mix vocal recording with instrumental background
   * 
   * @param vocalsBlob - The user's vocal recording as Blob
   * @param instrumentalUrl - URL to the instrumental track
   * @returns Promise resolving to mixed audio Blob or null if mixing fails
   */
  static async mixVocalsWithInstrumental(
    vocalsBlob: Blob,
    instrumentalUrl: string
  ): Promise<Blob | null> {
    console.log("Attempting to mix vocals with instrumental track...");
    
    try {
      // Create audio context with proper TypeScript typing
      const AudioContextClass: typeof AudioContext = 
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      if (!instrumentalUrl) {
        throw new Error("No instrumental track available for mixing");
      }
      
      // Load instrumental
      const instrumentalResponse = await fetch(instrumentalUrl);
      const instrumentalArrayBuffer = await instrumentalResponse.arrayBuffer();
      const instrumentalBuffer = await audioContext.decodeAudioData(instrumentalArrayBuffer);
      
      // Load vocals
      const vocalsArrayBuffer = await vocalsBlob.arrayBuffer();
      const vocalsBuffer = await audioContext.decodeAudioData(vocalsArrayBuffer);
      
      // Create an offline audio context for mixing
      // Use the vocal recording duration to create a clip that matches the user's performance
      const duration = vocalsBuffer.duration;
      const offlineContext = new OfflineAudioContext(
        2, // stereo output
        audioContext.sampleRate * duration,
        audioContext.sampleRate
      );

      console.log(`Mixing audio: vocals=${vocalsBuffer.duration.toFixed(2)}s, using duration=${duration.toFixed(2)}s`);
      
      // Create sources
      const instrumentalSource = offlineContext.createBufferSource();
      instrumentalSource.buffer = instrumentalBuffer;
      
      const vocalsSource = offlineContext.createBufferSource();
      vocalsSource.buffer = vocalsBuffer;
      
      // Create gain nodes for volume control
      const instrumentalGain = offlineContext.createGain();
      instrumentalGain.gain.value = 0.6; // Reduce instrumental volume
      
      const vocalsGain = offlineContext.createGain();
      vocalsGain.gain.value = 1.0; // Keep vocals at full volume
      
      // Connect nodes
      instrumentalSource.connect(instrumentalGain);
      vocalsSource.connect(vocalsGain);
      
      instrumentalGain.connect(offlineContext.destination);
      vocalsGain.connect(offlineContext.destination);
      
      // Start playback at time 0
      instrumentalSource.start(0);
      vocalsSource.start(0);
      
      // Render the mixed audio
      console.log("Rendering mixed audio...");
      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert buffer to WAV
      const mixedBlob = this.audioBufferToWav(renderedBuffer);
      console.log(`Mixed audio created: ${mixedBlob.size} bytes`);
      
      return mixedBlob;
    } catch (error) {
      console.error("Failed to mix audio:", error);
      return null;
    }
  }

  /**
   * Convert AudioBuffer to WAV format Blob
   * 
   * @param buffer - The AudioBuffer to convert
   * @returns Blob containing WAV audio data
   */
  private static audioBufferToWav(buffer: AudioBuffer): Blob {
    // Simple WAV encoder - in production, use a proper library
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2; // 16-bit samples
    const sampleRate = buffer.sampleRate;
    
    // Create the buffer with enough space for the WAV header
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + length, true);
    this.writeString(view, 8, "WAVE");
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // PCM format
    view.setUint16(20, 1, true); // PCM format code
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChannels * 2, true); // Byte rate
    view.setUint16(32, numOfChannels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    this.writeString(view, 36, "data");
    view.setUint32(40, length, true);
    
    // Write the PCM samples
    const data = new Float32Array(buffer.length * numOfChannels);
    
    // Interleave channels
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channel = buffer.getChannelData(i);
      for (let j = 0; j < channel.length; j++) {
        data[j * numOfChannels + i] = channel[j];
      }
    }
    
    // Convert to 16-bit PCM
    let index = 44;
    const volume = 0.9; // Adjust volume to avoid clipping
    for (let i = 0; i < data.length; i++) {
      // Convert float to 16-bit signed integer
      const sample = Math.max(-1, Math.min(1, data[i])) * volume;
      const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(index, value, true);
      index += 2;
    }
    
    return new Blob([view], { type: "audio/wav" });
  }
  
  /**
   * Helper to write a string to a DataView
   */
  private static writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  
  /**
   * Create an empty placeholder audio blob
   * 
   * @returns A minimal valid audio Blob
   */
  static createEmptyAudioPlaceholder(): Blob {
    // Create a minimal valid WebM container
    return new Blob([new Uint8Array([0x1a, 0x45, 0xdf, 0xa3])], { 
      type: "audio/webm" 
    });
  }
}