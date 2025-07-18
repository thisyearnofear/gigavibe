import { EventEmitter } from 'events';

// Define types for audio operations
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'webm';
export type AudioQuality = 'low' | 'medium' | 'high';

export interface AudioRecordingOptions {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  autoGainControl?: boolean;
  noiseSuppression?: boolean;
  latency?: number;
  deviceId?: string;
}

export interface AudioMixingOptions {
  vocalGain?: number;
  instrumentalGain?: number;
  masterGain?: number;
  applyCompression?: boolean;
  applyReverb?: boolean;
  reverbAmount?: number;
}

export interface AudioUploadOptions {
  format?: AudioFormat;
  quality?: AudioQuality;
  metadata?: Record<string, string>;
  chunkSize?: number; // For progressive upload
  onProgress?: (progress: number) => void;
}

export interface AudioPlaybackOptions {
  loop?: boolean;
  volume?: number;
  playbackRate?: number;
  startTime?: number;
  endTime?: number;
  progressInterval?: number; // How often to emit progress events in ms
}

export interface CachedAudioBuffer {
  buffer: AudioBuffer;
  url?: string;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
}

export interface RecordingResult {
  audioBlob: Blob;
  duration: number;
  waveformData?: Float32Array;
  peakData?: Float32Array;
}

export interface UploadResult {
  url: string;
  format: AudioFormat;
  duration: number;
  size: number;
  metadata?: Record<string, string>;
}

// Define events that can be emitted by the manager
export enum AudioEvents {
  RECORDING_START = 'recording:start',
  RECORDING_STOP = 'recording:stop',
  RECORDING_PAUSE = 'recording:pause',
  RECORDING_RESUME = 'recording:resume',
  RECORDING_ERROR = 'recording:error',
  
  PLAYBACK_START = 'playback:start',
  PLAYBACK_STOP = 'playback:stop',
  PLAYBACK_PAUSE = 'playback:pause',
  PLAYBACK_RESUME = 'playback:resume',
  PLAYBACK_COMPLETE = 'playback:complete',
  PLAYBACK_ERROR = 'playback:error',
  PLAYBACK_PROGRESS = 'playback:progress',
  
  UPLOAD_START = 'upload:start',
  UPLOAD_PROGRESS = 'upload:progress',
  UPLOAD_COMPLETE = 'upload:complete',
  UPLOAD_ERROR = 'upload:error',
  
  MIXING_COMPLETE = 'mixing:complete',
  MIXING_ERROR = 'mixing:error',
  
  AUDIO_LOADED = 'audio:loaded',
  AUDIO_LOAD_ERROR = 'audio:load:error',
  
  MEMORY_WARNING = 'memory:warning',
  RESOURCE_CLEANUP = 'resource:cleanup'
}

/**
 * AudioServiceManager - Unified manager for all audio operations
 * 
 * This class implements the singleton pattern to ensure only one audio context
 * exists throughout the application, preventing memory leaks and audio conflicts.
 * It handles recording, playback, mixing, and uploading audio with proper
 * resource management and error handling.
 */
class AudioServiceManager extends EventEmitter {
  private static instance: AudioServiceManager;
  
  // Core Web Audio API components
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private convolver: ConvolverNode | null = null; // For reverb
  
  // Audio players management
  private activePlayers: Map<string, {
    source: AudioBufferSourceNode,
    gainNode: GainNode,
    startTime: number,
    options: AudioPlaybackOptions,
    progressInterval?: NodeJS.Timeout
  }> = new Map();
  
  // Audio buffers cache
  private audioBufferCache: Map<string, CachedAudioBuffer> = new Map();
  
  // Recording state
  private recordingChunks: Blob[] = [];
  private isRecording: boolean = false;
  private isPaused: boolean = false;
  private recordingStartTime: number = 0;
  private recordingDuration: number = 0;
  private recordingInterval: NodeJS.Timeout | null = null;
  
  // Waveform and analysis data
  private waveformData: Float32Array | null = null;
  private peakData: Float32Array | null = null;
  
  // Progressive loading state
  private fetchControllers: Map<string, AbortController> = new Map();
  
  // Memory management
  private memoryUsageInterval: NodeJS.Timeout | null = null;
  private maxMemoryThreshold: number = 100 * 1024 * 1024; // 100MB default
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    super();
    
    // Initialize memory monitoring
    this.startMemoryMonitoring();
    
    // Handle cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.cleanup.bind(this));
    }
  }
  
  /**
   * Get the singleton instance of AudioServiceManager
   */
  public static getInstance(): AudioServiceManager {
    if (!AudioServiceManager.instance) {
      AudioServiceManager.instance = new AudioServiceManager();
    }
    return AudioServiceManager.instance;
  }
  
  /**
   * Initialize the audio context and essential nodes
   * Lazy initialization to comply with browser autoplay policies
   */
  private async initAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      // Use the Web Audio API with fallbacks for different browsers
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in this browser');
      }
      
      this.audioContext = new AudioContextClass({
        latencyHint: 'interactive',
        sampleRate: 48000
      });
      
      // Create essential nodes
      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      
      // Set up default analyzer configuration
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;
      
      // Connect the base audio graph
      this.gainNode.connect(this.compressorNode);
      this.compressorNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
      
      // Resume audio context if it's suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    }
    
    return this.audioContext;
  }
  
  /**
   * Start audio recording with specified options
   */
  public async startRecording(options: AudioRecordingOptions = {}): Promise<void> {
    try {
      // Initialize audio context if needed
      await this.initAudioContext();
      
      if (this.isRecording) {
        throw new Error('Recording is already in progress');
      }
      
      // Default recording options
      const defaultOptions: AudioRecordingOptions = {
        sampleRate: 48000,
        channelCount: 2,
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true,
      };
      
      const recordingOptions = { ...defaultOptions, ...options };
      
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: recordingOptions.echoCancellation,
          autoGainControl: recordingOptions.autoGainControl,
          noiseSuppression: recordingOptions.noiseSuppression,
          sampleRate: { ideal: recordingOptions.sampleRate },
          channelCount: { ideal: recordingOptions.channelCount },
          deviceId: recordingOptions.deviceId ? { exact: recordingOptions.deviceId } : undefined
        }
      });
      
      // Connect the media stream to the audio context
      if (this.audioContext) {
        this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.sourceNode.connect(this.analyserNode!);
      }
      
      // Initialize the media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
        audioBitsPerSecond: recordingOptions.sampleRate! * 16 * recordingOptions.channelCount!
      });
      
      // Set up recorder event handlers
      this.recordingChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data);
        }
      };
      
      // Start recording
      this.mediaRecorder.start(100); // Collect data in 100ms chunks
      this.isRecording = true;
      this.isPaused = false;
      this.recordingStartTime = Date.now();
      
      // Set up waveform analysis interval
      this.startWaveformAnalysis();
      
      // Emit recording start event
      this.emit(AudioEvents.RECORDING_START);
    } catch (error) {
      this.emit(AudioEvents.RECORDING_ERROR, error);
      throw error;
    }
  }
  
  /**
   * Stop the current recording and return the result
   */
  public async stopRecording(): Promise<RecordingResult> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No active recording to stop');
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Set up the recorder's stop event handler
        this.mediaRecorder!.onstop = async () => {
          try {
            // Calculate total duration
            this.recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
            
            // Combine all chunks into a single blob
            const audioBlob = new Blob(this.recordingChunks, { 
              type: this.mediaRecorder!.mimeType 
            });
            
            // Clean up resources
            this.stopWaveformAnalysis();
            this.releaseMediaResources();
            
            // Create the result object
            const result: RecordingResult = {
              audioBlob,
              duration: this.recordingDuration,
              waveformData: this.waveformData || undefined,
              peakData: this.peakData || undefined
            };
            
            // Reset state
            this.isRecording = false;
            this.recordingChunks = [];
            
            // Emit recording stop event
            this.emit(AudioEvents.RECORDING_STOP, result);
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        
        // Stop the media recorder
        this.mediaRecorder!.stop();
      } catch (error) {
        this.emit(AudioEvents.RECORDING_ERROR, error);
        reject(error);
      }
    });
  }
  
  /**
   * Pause the current recording
   */
  public pauseRecording(): void {
    if (!this.isRecording || this.isPaused || !this.mediaRecorder) {
      throw new Error('Cannot pause recording: No active recording or already paused');
    }
    
    try {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.emit(AudioEvents.RECORDING_PAUSE);
    } catch (error) {
      this.emit(AudioEvents.RECORDING_ERROR, error);
      throw error;
    }
  }
  
  /**
   * Resume a paused recording
   */
  public resumeRecording(): void {
    if (!this.isRecording || !this.isPaused || !this.mediaRecorder) {
      throw new Error('Cannot resume recording: No active paused recording');
    }
    
    try {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.emit(AudioEvents.RECORDING_RESUME);
    } catch (error) {
      this.emit(AudioEvents.RECORDING_ERROR, error);
      throw error;
    }
  }
  
  /**
   * Load audio from URL with progressive loading support
   */
  public async loadAudio(url: string, progressCallback?: (percent: number) => void): Promise<AudioBuffer> {
    try {
      // Check cache first
      if (this.audioBufferCache.has(url)) {
        return this.audioBufferCache.get(url)!.buffer;
      }
      
      // Initialize audio context if needed
      await this.initAudioContext();
      
      // Create abort controller for cancelable fetch
      const controller = new AbortController();
      this.fetchControllers.set(url, controller);
      
      // Fetch the audio file with progress tracking
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 'Range': 'bytes=0-' } // Support partial content
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.status} ${response.statusText}`);
      }
      
      // Get content length for progress calculation
      const contentLength = response.headers.get('Content-Length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      
      // Use streams for progressive loading
      const reader = response.body!.getReader();
      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;
      
      // Read the stream chunks
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedBytes += value.length;
        
        // Report progress
        if (progressCallback && totalBytes > 0) {
          const percent = Math.round((receivedBytes / totalBytes) * 100);
          progressCallback(percent);
        }
      }
      
      // Combine chunks into a single array
      const allChunks = new Uint8Array(receivedBytes);
      let position = 0;
      
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }
      
      // Decode audio data
      const audioBuffer = await this.audioContext!.decodeAudioData(allChunks.buffer);
      
      // Cache the decoded buffer
      this.audioBufferCache.set(url, {
        buffer: audioBuffer,
        url,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels
      });
      
      // Clean up
      this.fetchControllers.delete(url);
      
      // Emit loaded event
      this.emit(AudioEvents.AUDIO_LOADED, url);
      
      return audioBuffer;
    } catch (error) {
      // Handle abort errors separately (user canceled)
      if ((error as any).name === 'AbortError') {
        console.log('Audio loading was canceled');
        return Promise.reject(new Error('Audio loading was canceled'));
      }
      
      this.emit(AudioEvents.AUDIO_LOAD_ERROR, { url, error });
      throw error;
    }
  }
  
  /**
   * Cancel loading of audio from URL
   */
  public cancelLoadAudio(url: string): void {
    const controller = this.fetchControllers.get(url);
    if (controller) {
      controller.abort();
      this.fetchControllers.delete(url);
    }
  }
  
  /**
   * Play audio from buffer or URL
   */
  public async playAudio(
    source: AudioBuffer | string,
    options: AudioPlaybackOptions = {}
  ): Promise<string> {
    try {
      // Initialize audio context if needed
      await this.initAudioContext();
      
      // Default options
      const defaultOptions: AudioPlaybackOptions = {
        loop: false,
        volume: 1.0,
        playbackRate: 1.0,
        startTime: 0,
        progressInterval: 100
      };
      
      const playbackOptions = { ...defaultOptions, ...options };
      
      // Get audio buffer (load from URL if string provided)
      let audioBuffer: AudioBuffer;
      
      if (typeof source === 'string') {
        audioBuffer = await this.loadAudio(source);
      } else {
        audioBuffer = source;
      }
      
      // Create source node
      const sourceNode = this.audioContext!.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.loop = playbackOptions.loop || false;
      sourceNode.playbackRate.value = playbackOptions.playbackRate || 1.0;
      
      // Create gain node for this player
      const playerGainNode = this.audioContext!.createGain();
      playerGainNode.gain.value = playbackOptions.volume || 1.0;
      
      // Connect nodes
      sourceNode.connect(playerGainNode);
      playerGainNode.connect(this.gainNode!);
      
      // Generate unique ID for this playback
      const playbackId = `playback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Start playback
      const startTime = playbackOptions.startTime || 0;
      const endTime = playbackOptions.endTime;
      
      if (endTime !== undefined && endTime > startTime) {
        // Play only a portion of the audio
        sourceNode.start(0, startTime, endTime - startTime);
      } else {
        // Play from startTime to the end
        sourceNode.start(0, startTime);
      }
      
      // Store player reference
      this.activePlayers.set(playbackId, {
        source: sourceNode,
        gainNode: playerGainNode,
        startTime: this.audioContext!.currentTime,
        options: playbackOptions
      });
      
      // Set up progress reporting
      if (playbackOptions.progressInterval) {
        this.startProgressReporting(playbackId, audioBuffer.duration, playbackOptions.progressInterval);
      }
      
      // Handle playback completion
      sourceNode.onended = () => {
        this.cleanupPlayer(playbackId);
        this.emit(AudioEvents.PLAYBACK_COMPLETE, playbackId);
      };
      
      // Emit playback start event
      this.emit(AudioEvents.PLAYBACK_START, {
        id: playbackId,
        duration: audioBuffer.duration,
        options: playbackOptions
      });
      
      return playbackId;
    } catch (error) {
      this.emit(AudioEvents.PLAYBACK_ERROR, error);
      throw error;
    }
  }
  
  /**
   * Stop audio playback
   */
  public stopAudio(playbackId: string): void {
    const player = this.activePlayers.get(playbackId);
    
    if (!player) {
      throw new Error(`No active playback found with ID: ${playbackId}`);
    }
    
    try {
      player.source.stop();
      this.cleanupPlayer(playbackId);
      this.emit(AudioEvents.PLAYBACK_STOP, playbackId);
    } catch (error) {
      this.emit(AudioEvents.PLAYBACK_ERROR, { id: playbackId, error });
      throw error;
    }
  }
  
  /**
   * Pause audio playback
   */
  public pauseAudio(playbackId: string): void {
    const player = this.activePlayers.get(playbackId);
    
    if (!player || !this.audioContext) {
      throw new Error(`No active playback found with ID: ${playbackId}`);
    }
    
    try {
      // Suspend the audio context
      this.audioContext.suspend();
      this.emit(AudioEvents.PLAYBACK_PAUSE, playbackId);
    } catch (error) {
      this.emit(AudioEvents.PLAYBACK_ERROR, { id: playbackId, error });
      throw error;
    }
  }
  
  /**
   * Resume paused audio playback
   */
  public resumeAudio(playbackId: string): void {
    const player = this.activePlayers.get(playbackId);
    
    if (!player || !this.audioContext) {
      throw new Error(`No active playback found with ID: ${playbackId}`);
    }
    
    try {
      // Resume the audio context
      this.audioContext.resume();
      this.emit(AudioEvents.PLAYBACK_RESUME, playbackId);
    } catch (error) {
      this.emit(AudioEvents.PLAYBACK_ERROR, { id: playbackId, error });
      throw error;
    }
  }
  
  /**
   * Change volume of audio playback
   */
  public setVolume(playbackId: string, volume: number): void {
    const player = this.activePlayers.get(playbackId);
    
    if (!player) {
      throw new Error(`No active playback found with ID: ${playbackId}`);
    }
    
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    // Apply volume change
    player.gainNode.gain.value = clampedVolume;
  }
  
  /**
   * Mix two audio buffers together with specified options
   */
  public async mixAudio(
    vocalBuffer: AudioBuffer | string,
    instrumentalBuffer: AudioBuffer | string,
    options: AudioMixingOptions = {}
  ): Promise<AudioBuffer> {
    try {
      // Initialize audio context if needed
      await this.initAudioContext();
      
      // Default mixing options
      const defaultOptions: AudioMixingOptions = {
        vocalGain: 1.0,
        instrumentalGain: 0.8,
        masterGain: 1.0,
        applyCompression: true,
        applyReverb: false,
        reverbAmount: 0.3
      };
      
      const mixingOptions = { ...defaultOptions, ...options };
      
      // Load audio buffers if URLs provided
      let vocalAudioBuffer: AudioBuffer;
      let instrumentalAudioBuffer: AudioBuffer;
      
      if (typeof vocalBuffer === 'string') {
        vocalAudioBuffer = await this.loadAudio(vocalBuffer);
      } else {
        vocalAudioBuffer = vocalBuffer;
      }
      
      if (typeof instrumentalBuffer === 'string') {
        instrumentalAudioBuffer = await this.loadAudio(instrumentalBuffer);
      } else {
        instrumentalAudioBuffer = instrumentalBuffer;
      }
      
      // Determine the output parameters
      const numberOfChannels = Math.max(
        vocalAudioBuffer.numberOfChannels,
        instrumentalAudioBuffer.numberOfChannels
      );
      
      const sampleRate = this.audioContext!.sampleRate;
      
      // Find the longest duration
      const maxDuration = Math.max(
        vocalAudioBuffer.duration,
        instrumentalAudioBuffer.duration
      );
      
      // Create output buffer
      const outputBuffer = this.audioContext!.createBuffer(
        numberOfChannels,
        Math.ceil(maxDuration * sampleRate),
        sampleRate
      );
      
      // Mix the audio
      for (let channel = 0; channel < numberOfChannels; channel++) {
        // Get channel data arrays
        const outputData = outputBuffer.getChannelData(channel);
        
        // Get vocal data (if channel exists)
        const vocalData = channel < vocalAudioBuffer.numberOfChannels
          ? vocalAudioBuffer.getChannelData(channel)
          : new Float32Array(outputData.length).fill(0);
          
        // Get instrumental data (if channel exists)
        const instrumentalData = channel < instrumentalAudioBuffer.numberOfChannels
          ? instrumentalAudioBuffer.getChannelData(channel)
          : new Float32Array(outputData.length).fill(0);
        
        // Mix the channels with applied gains
        for (let i = 0; i < outputData.length; i++) {
          // Apply gain to each source
          const vocalSample = i < vocalData.length ? vocalData[i] * mixingOptions.vocalGain! : 0;
          const instrumentalSample = i < instrumentalData.length ? instrumentalData[i] * mixingOptions.instrumentalGain! : 0;
          
          // Mix and apply master gain
          outputData[i] = (vocalSample + instrumentalSample) * mixingOptions.masterGain!;
        }
      }
      
      // Apply effects if needed
      let processedBuffer = outputBuffer;
      
      if (mixingOptions.applyCompression) {
        processedBuffer = await this.applyCompression(processedBuffer);
      }
      
      if (mixingOptions.applyReverb && mixingOptions.reverbAmount! > 0) {
        processedBuffer = await this.applyReverb(processedBuffer, mixingOptions.reverbAmount!);
      }
      
      // Emit mixing complete event
      this.emit(AudioEvents.MIXING_COMPLETE, {
        duration: processedBuffer.duration,
        channels: processedBuffer.numberOfChannels
      });
      
      return processedBuffer;
    } catch (error) {
      this.emit(AudioEvents.MIXING_ERROR, error);
      throw error;
    }
  }
  
  /**
   * Apply compression to an audio buffer
   */
  private async applyCompression(buffer: AudioBuffer): Promise<AudioBuffer> {
    // Create offline context for processing
    const offlineContext = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
    
    // Create source node
    const sourceNode = offlineContext.createBufferSource();
    sourceNode.buffer = buffer;
    
    // Create compressor
    const compressor = offlineContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    // Connect nodes
    sourceNode.connect(compressor);
    compressor.connect(offlineContext.destination);
    
    // Start source and render
    sourceNode.start();
    return await offlineContext.startRendering();
  }
  
  /**
   * Apply reverb to an audio buffer
   */
  private async applyReverb(buffer: AudioBuffer, amount: number): Promise<AudioBuffer> {
    // Create impulse response for reverb if not already created
    if (!this.convolver) {
      this.convolver = await this.createReverbImpulse();
    }
    
    // Create offline context for processing
    const offlineContext = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length + this.convolver.buffer!.length,
      buffer.sampleRate
    );
    
    // Create source node
    const sourceNode = offlineContext.createBufferSource();
    sourceNode.buffer = buffer;
    
    // Create convolver node
    const convolver = offlineContext.createConvolver();
    convolver.buffer = this.convolver.buffer;
    
    // Create gain nodes for dry/wet mix
    const dryGain = offlineContext.createGain();
    const wetGain = offlineContext.createGain();
    
    // Set gains for dry/wet mix
    dryGain.gain.value = 1 - amount;
    wetGain.gain.value = amount;
    
    // Connect nodes
    sourceNode.connect(dryGain);
    dryGain.connect(offlineContext.destination);
    
    sourceNode.connect(convolver);
    convolver.connect(wetGain);
    wetGain.connect(offlineContext.destination);
    
    // Start source and render
    sourceNode.start();
    return await offlineContext.startRendering();
  }
  
  /**
   * Create a reverb impulse response
   */
  private async createReverbImpulse(): Promise<ConvolverNode> {
    // Initialize audio context if needed
    await this.initAudioContext();
    
    // Create impulse response
    const sampleRate = this.audioContext!.sampleRate;
    const length = 2 * sampleRate; // 2 seconds
    const impulse = this.audioContext!.createBuffer(2, length, sampleRate);
    
    // Fill with noise and create decay
    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const channelData = impulse.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        // Random noise
        const noise = Math.random() * 2 - 1;
        
        // Decay curve
        const decay = Math.exp(-i / (sampleRate * 0.5));
        
        // Apply decay to noise
        channelData[i] = noise * decay;
      }
    }
    
    // Create convolver node
    const convolver = this.audioContext!.createConvolver();
    convolver.buffer = impulse;
    
    return convolver;
  }
  
  /**
   * Upload audio to storage with progress tracking
   */
  public async uploadAudio(
    audioData: Blob | AudioBuffer,
    options: AudioUploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Default options
      const defaultOptions: AudioUploadOptions = {
        format: 'mp3',
        quality: 'high',
        chunkSize: 1024 * 1024, // 1MB chunks
      };
      
      const uploadOptions = { ...defaultOptions, ...options };
      
      // Convert AudioBuffer to Blob if needed
      let audioBlob: Blob;
      let audioDuration: number = 0;
      
      if (audioData instanceof AudioBuffer) {
        // Convert AudioBuffer to WAV blob
        audioBlob = await this.audioBufferToBlob(audioData, uploadOptions.format!);
        audioDuration = audioData.duration;
      } else {
        audioBlob = audioData;
        
        // Try to get duration from blob
        try {
          const tempUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio();
          
          await new Promise((resolve, reject) => {
            audio.onloadedmetadata = () => {
              audioDuration = audio.duration;
              resolve(null);
            };
            audio.onerror = reject;
            audio.src = tempUrl;
          });
          
          URL.revokeObjectURL(tempUrl);
        } catch (error) {
          console.warn('Could not determine audio duration from blob');
        }
      }
      
      // Emit upload start event
      this.emit(AudioEvents.UPLOAD_START, {
        size: audioBlob.size,
        format: uploadOptions.format,
        metadata: uploadOptions.metadata
      });
      
      // This would typically call your actual upload service
      // For now, we'll simulate an upload with a delay
      
      // Simulate chunked upload with progress
      const totalChunks = Math.ceil(audioBlob.size / uploadOptions.chunkSize!);
      let uploadedChunks = 0;
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * uploadOptions.chunkSize!;
        const end = Math.min(start + uploadOptions.chunkSize!, audioBlob.size);
        const chunk = audioBlob.slice(start, end);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        uploadedChunks++;
        const progress = Math.round((uploadedChunks / totalChunks) * 100);
        
        // Report progress
        if (uploadOptions.onProgress) {
          uploadOptions.onProgress(progress);
        }
        
        this.emit(AudioEvents.UPLOAD_PROGRESS, {
          progress,
          totalSize: audioBlob.size,
          uploadedSize: Math.min(uploadedChunks * uploadOptions.chunkSize!, audioBlob.size)
        });
      }
      
      // Simulate getting a URL back from the server
      const fakeUrl = `https://storage.example.com/audio/${Date.now()}.${uploadOptions.format}`;
      
      // Create result
      const result: UploadResult = {
        url: fakeUrl,
        format: uploadOptions.format!,
        duration: audioDuration,
        size: audioBlob.size,
        metadata: uploadOptions.metadata
      };
      
      // Emit upload complete event
      this.emit(AudioEvents.UPLOAD_COMPLETE, result);
      
      return result;
    } catch (error) {
      this.emit(AudioEvents.UPLOAD_ERROR, error);
      throw error;
    }
  }
  
  /**
   * Convert AudioBuffer to Blob with specified format
   */
  private async audioBufferToBlob(buffer: AudioBuffer, format: AudioFormat): Promise<Blob> {
    // Create offline context for rendering
    const offlineContext = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
    
    // Create source node
    const sourceNode = offlineContext.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.connect(offlineContext.destination);
    
    // Start source and render
    sourceNode.start();
    const renderedBuffer = await offlineContext.startRendering();
    
    // Convert to WAV format first
    const wavBlob = this.encodeWAV(renderedBuffer);
    
    // If WAV is requested, return as is
    if (format === 'wav') {
      return wavBlob;
    }
    
    // For other formats, we would need format conversion libraries
    // This is a simplified implementation - in production, you would use
    // libraries like lamejs for MP3 encoding or other appropriate encoders
    
    // For now, we'll just return the WAV blob with a warning
    console.warn(`Format conversion to ${format} not implemented, returning WAV`);
    return wavBlob;
  }
  
  /**
   * Encode AudioBuffer to WAV format Blob
   */
  private encodeWAV(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM format
    const bitDepth = 16;
    
    // Interleave all channels
    let interleaved: Float32Array;
    
    if (numChannels === 2) {
      // Stereo
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);
      interleaved = this.interleave(left, right);
    } else {
      // Mono or other (use first channel)
      interleaved = buffer.getChannelData(0);
    }
    
    // Convert to 16-bit PCM
    const dataLength = interleaved.length * (bitDepth / 8);
    const buffer16Bit = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer16Bit);
    
    // Write WAV header
    // "RIFF" chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    this.writeString(view, 8, 'WAVE');
    
    // "fmt " sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true); // audio format (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // byte rate
    view.setUint16(32, numChannels * (bitDepth / 8), true); // block align
    view.setUint16(34, bitDepth, true); // bits per sample
    
    // "data" sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    this.floatTo16BitPCM(view, 44, interleaved);
    
    // Return as blob
    return new Blob([buffer16Bit], { type: 'audio/wav' });
  }
  
  /**
   * Interleave two mono channels into a stereo channel
   */
  private interleave(leftChannel: Float32Array, rightChannel: Float32Array): Float32Array {
    const length = leftChannel.length + rightChannel.length;
    const result = new Float32Array(length);
    
    let inputIndex = 0;
    
    for (let i = 0; i < length; ) {
      result[i++] = leftChannel[inputIndex];
      result[i++] = rightChannel[inputIndex];
      inputIndex++;
    }
    
    return result;
  }
  
  /**
   * Write string to DataView
   */
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  
  /**
   * Convert Float32Array to 16-bit PCM
   */
  private floatTo16BitPCM(output: DataView, offset: number, input: Float32Array): void {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }
  
  /**
   * Start waveform analysis for visualization
   */
  private startWaveformAnalysis(): void {
    if (!this.analyserNode || !this.isRecording) return;
    
    // Configure analyzer for waveform
    this.analyserNode.fftSize = 2048;
    const bufferLength = this.analyserNode.frequencyBinCount;
    
    // Create data arrays
    this.waveformData = new Float32Array(bufferLength);
    this.peakData = new Float32Array(100); // Store peak values over time
    
    let peakIndex = 0;
    
    // Start analysis interval
    this.recordingInterval = setInterval(() => {
      if (!this.analyserNode || !this.isRecording) return;
      
      // Get waveform data
      this.analyserNode.getFloatTimeDomainData(this.waveformData!);
      
      // Calculate peak for this interval
      let peak = 0;
      for (let i = 0; i < this.waveformData!.length; i++) {
        const amplitude = Math.abs(this.waveformData![i]);
        peak = Math.max(peak, amplitude);
      }
      
      // Store peak in circular buffer
      this.peakData![peakIndex] = peak;
      peakIndex = (peakIndex + 1) % this.peakData!.length;
    }, 100);
  }
  
  /**
   * Stop waveform analysis
   */
  private stopWaveformAnalysis(): void {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }
  
  /**
   * Start progress reporting for audio playback
   */
  private startProgressReporting(
    playbackId: string,
    duration: number,
    interval: number
  ): void {
    const player = this.activePlayers.get(playbackId);
    if (!player || !this.audioContext) return;
    
    // Create interval for progress updates
    const progressInterval = setInterval(() => {
      if (!this.activePlayers.has(playbackId) || !this.audioContext) {
        clearInterval(progressInterval);
        return;
      }
      
      // Calculate current position
      const elapsedTime = this.audioContext.currentTime - player.startTime;
      const position = player.options.startTime! + elapsedTime;
      const progress = Math.min(position / duration, 1);
      
      // Emit progress event
      this.emit(AudioEvents.PLAYBACK_PROGRESS, {
        id: playbackId,
        position,
        duration,
        progress
      });
      
      // Stop if we've reached the end
      if (position >= duration && !player.options.loop) {
        clearInterval(progressInterval);
      }
    }, interval);
    
    // Store interval reference in player object for cleanup
    player.progressInterval = progressInterval;
  }
  
  /**
   * Clean up player resources
   */
  private cleanupPlayer(playbackId: string): void {
    const player = this.activePlayers.get(playbackId);
    if (!player) return;
    
    // Clear progress interval if exists
    if (player.progressInterval) {
      clearInterval(player.progressInterval);
    }
    
    // Disconnect nodes
    try {
      player.source.disconnect();
      player.gainNode.disconnect();
    } catch (error) {
      console.warn('Error disconnecting audio nodes:', error);
    }
    
    // Remove from active players
    this.activePlayers.delete(playbackId);
  }
  
  /**
   * Release media resources (microphone, etc)
   */
  private releaseMediaResources(): void {
    // Stop and disconnect media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (error) {
        console.warn('Error stopping media recorder:', error);
      }
    }
    
    // Stop all tracks in media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.mediaStream = null;
    }
    
    // Disconnect source node
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (error) {
        console.warn('Error disconnecting source node:', error);
      }
      this.sourceNode = null;
    }
  }
  
  /**
   * Start memory usage monitoring
   */
  private startMemoryMonitoring(): void {
    // Check memory usage every 30 seconds
    this.memoryUsageInterval = setInterval(() => {
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        
        if (memoryInfo.usedJSHeapSize > this.maxMemoryThreshold) {
          // Memory usage is high, emit warning
          this.emit(AudioEvents.MEMORY_WARNING, {
            used: memoryInfo.usedJSHeapSize,
            threshold: this.maxMemoryThreshold
          });
          
          // Clear some caches to free memory
          this.clearOldestCachedBuffers(5);
        }
      }
    }, 30000);
  }
  
  /**
   * Clear oldest cached audio buffers
   */
  private clearOldestCachedBuffers(count: number): void {
    if (this.audioBufferCache.size <= count) return;
    
    // Convert to array for sorting
    const bufferEntries = Array.from(this.audioBufferCache.entries());
    
    // Sort by last accessed time (if available) or just take first entries
    const oldestEntries = bufferEntries.slice(0, count);
    
    // Remove from cache
    oldestEntries.forEach(([url]) => {
      this.audioBufferCache.delete(url);
    });
    
    // Emit cleanup event
    this.emit(AudioEvents.RESOURCE_CLEANUP, {
      type: 'audioBufferCache',
      cleared: count,
      remaining: this.audioBufferCache.size
    });
  }
  
  /**
   * Set master volume for all audio
   */
  public setMasterVolume(volume: number): void {
    if (!this.gainNode) return;
    
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    // Apply volume
    this.gainNode.gain.value = clampedVolume;
  }
  
  /**
   * Get available audio input devices
   */
  public async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Error getting audio input devices:', error);
      return [];
    }
  }
  
  /**
   * Clean up all resources
   */
  public cleanup(): void {
    // Stop all active playback
    this.activePlayers.forEach((player, id) => {
      try {
        player.source.stop();
        this.cleanupPlayer(id);
      } catch (error) {
        console.warn(`Error stopping player ${id}:`, error);
      }
    });
    
    // Release media resources
    this.releaseMediaResources();
    
    // Stop analysis
    this.stopWaveformAnalysis();
    
    // Clear intervals
    if (this.memoryUsageInterval) {
      clearInterval(this.memoryUsageInterval);
      this.memoryUsageInterval = null;
    }
    
    // Abort any pending fetches
    this.fetchControllers.forEach(controller => {
      controller.abort();
    });
    this.fetchControllers.clear();
    
    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(error => {
        console.warn('Error closing audio context:', error);
      });
    }
    
    // Clear caches
    this.audioBufferCache.clear();
    
    // Reset state
    this.isRecording = false;
    this.isPaused = false;
    this.recordingChunks = [];
    this.waveformData = null;
    this.peakData = null;
    
    // Emit cleanup event
    this.emit(AudioEvents.RESOURCE_CLEANUP, { type: 'all' });
  }
}

// Export singleton instance
export const audioManager = AudioServiceManager.getInstance();

// Export class for testing purposes
export default AudioServiceManager;
