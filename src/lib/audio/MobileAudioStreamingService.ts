/**
 * Mobile-Optimized Audio Streaming Service
 * Designed for low bandwidth and battery efficiency in Farcaster mini app context
 */

export interface AudioRoom {
  id: string;
  name: string;
  description: string;
  hostFid: number;
  hostName: string;
  participants: RoomParticipant[];
  maxParticipants: number;
  isLive: boolean;
  currentTrack?: {
    title: string;
    artist: string;
    duration: number;
    currentTime: number;
  };
  settings: RoomSettings;
  createdAt: Date;
}

export interface RoomParticipant {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  role: 'host' | 'moderator' | 'participant';
  isMuted: boolean;
  isListening: boolean;
  joinedAt: Date;
  lastActive: Date;
}

export interface RoomSettings {
  allowParticipantAudio: boolean;
  requireApprovalToJoin: boolean;
  maxAudioQuality: 'low' | 'medium' | 'high';
  enableReactions: boolean;
  enableChat: boolean;
  autoMuteNewJoiners: boolean;
}

export interface AudioStreamConfig {
  sampleRate: number;
  bitRate: number;
  channels: number;
  bufferSize: number;
  compressionLevel: number;
}

export class MobileAudioStreamingService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private currentRoom: AudioRoom | null = null;
  private isStreaming = false;
  private isMobile = false;
  
  // Mobile-optimized configurations
  private mobileConfig: AudioStreamConfig = {
    sampleRate: 22050, // Reduced for mobile
    bitRate: 32000,    // Lower bitrate for bandwidth
    channels: 1,       // Mono for efficiency
    bufferSize: 2048,  // Smaller buffer
    compressionLevel: 8 // Higher compression
  };
  
  private desktopConfig: AudioStreamConfig = {
    sampleRate: 44100,
    bitRate: 128000,
    channels: 2,
    bufferSize: 4096,
    compressionLevel: 5
  };

  // Event callbacks
  private onRoomUpdate?: (room: AudioRoom) => void;
  private onParticipantJoined?: (participant: RoomParticipant) => void;
  private onParticipantLeft?: (participantFid: number) => void;
  private onAudioReceived?: (participantFid: number, audioData: ArrayBuffer) => void;

  constructor() {
    this.detectMobileDevice();
    this.initializeAudioContext();
  }

  private detectMobileDevice(): void {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Mobile-specific optimizations
      if (this.isMobile) {
        // Reduce audio context sample rate for mobile
        if (this.audioContext.sampleRate > this.mobileConfig.sampleRate) {
          console.log('Mobile device detected, using optimized audio settings');
        }
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async createRoom(roomData: Partial<AudioRoom>): Promise<AudioRoom> {
    const room: AudioRoom = {
      id: `room-${Date.now()}`,
      name: roomData.name || 'Untitled Room',
      description: roomData.description || '',
      hostFid: roomData.hostFid || 0,
      hostName: roomData.hostName || 'Unknown Host',
      participants: [],
      maxParticipants: this.isMobile ? 6 : 12, // Reduced for mobile
      isLive: false,
      settings: {
        allowParticipantAudio: true,
        requireApprovalToJoin: false,
        maxAudioQuality: this.isMobile ? 'medium' : 'high',
        enableReactions: true,
        enableChat: true,
        autoMuteNewJoiners: this.isMobile // Auto-mute on mobile to save bandwidth
      },
      createdAt: new Date(),
      ...roomData
    };

    this.currentRoom = room;
    return room;
  }

  async joinRoom(roomId: string, userInfo: Partial<RoomParticipant>): Promise<void> {
    if (!this.currentRoom || this.currentRoom.id !== roomId) {
      throw new Error('Room not found or not initialized');
    }

    const participant: RoomParticipant = {
      fid: userInfo.fid || 0,
      username: userInfo.username || 'anonymous',
      displayName: userInfo.displayName || 'Anonymous User',
      pfpUrl: userInfo.pfpUrl || '',
      role: 'participant',
      isMuted: this.currentRoom.settings.autoMuteNewJoiners,
      isListening: true,
      joinedAt: new Date(),
      lastActive: new Date(),
      ...userInfo
    };

    // Check room capacity
    if (this.currentRoom.participants.length >= this.currentRoom.maxParticipants) {
      throw new Error('Room is at maximum capacity');
    }

    this.currentRoom.participants.push(participant);
    this.onParticipantJoined?.(participant);
    this.onRoomUpdate?.(this.currentRoom);

    // Initialize audio streaming if allowed
    if (this.currentRoom.settings.allowParticipantAudio && !participant.isMuted) {
      await this.initializeAudioStreaming();
    }
  }

  async leaveRoom(): Promise<void> {
    if (this.isStreaming) {
      await this.stopStreaming();
    }

    // Clean up peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.currentRoom = null;
  }

  private async initializeAudioStreaming(): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    try {
      const config = this.isMobile ? this.mobileConfig : this.desktopConfig;
      
      // Get user media with mobile-optimized constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          sampleRate: config.sampleRate,
          channelCount: config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: this.isMobile, // Enable AGC on mobile
          ...(this.isMobile && {
            // Mobile-specific constraints
            sampleSize: 16,
            latency: 0.1 // Lower latency for mobile
          })
        }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Apply mobile-specific audio processing
      if (this.isMobile) {
        await this.applyMobileAudioOptimizations();
      }

    } catch (error) {
      console.error('Failed to initialize audio streaming:', error);
      throw error;
    }
  }

  private async applyMobileAudioOptimizations(): Promise<void> {
    if (!this.audioContext || !this.mediaStream) return;

    try {
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create compressor for mobile to reduce dynamic range
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      // Create low-pass filter to reduce high frequencies (saves bandwidth)
      const lowPassFilter = this.audioContext.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.value = 8000; // Cut off at 8kHz for mobile

      // Connect the audio processing chain
      source.connect(compressor);
      compressor.connect(lowPassFilter);
      
      // Create destination for processed audio
      const destination = this.audioContext.createMediaStreamDestination();
      lowPassFilter.connect(destination);

      // Replace original stream with processed stream
      this.mediaStream = destination.stream;

    } catch (error) {
      console.warn('Failed to apply mobile audio optimizations:', error);
    }
  }

  async startStreaming(): Promise<void> {
    if (!this.currentRoom || !this.mediaStream) {
      throw new Error('Room or media stream not initialized');
    }

    this.isStreaming = true;
    this.currentRoom.isLive = true;
    this.onRoomUpdate?.(this.currentRoom);

    // Start streaming to all participants
    await this.broadcastToParticipants();
  }

  async stopStreaming(): Promise<void> {
    this.isStreaming = false;
    
    if (this.currentRoom) {
      this.currentRoom.isLive = false;
      this.onRoomUpdate?.(this.currentRoom);
    }

    // Stop all peer connections
    this.peerConnections.forEach(pc => {
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          pc.removeTrack(sender);
        }
      });
    });
  }

  private async broadcastToParticipants(): Promise<void> {
    if (!this.currentRoom || !this.mediaStream) return;

    for (const participant of this.currentRoom.participants) {
      if (participant.fid !== this.currentRoom.hostFid) {
        await this.createPeerConnection(participant.fid.toString());
      }
    }
  }

  private async createPeerConnection(participantId: string): Promise<void> {
    const config = this.isMobile ? this.mobileConfig : this.desktopConfig;
    
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers for mobile reliability
        ...(this.isMobile ? [
          { urls: 'turn:relay.gigavibe.app:3478', username: 'user', credential: 'pass' }
        ] : [])
      ]
    });

    // Add audio track with mobile-optimized settings
    if (this.mediaStream) {
      const audioTrack = this.mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        const sender = peerConnection.addTrack(audioTrack, this.mediaStream);
        
        // Apply mobile-specific encoding parameters
        if (this.isMobile && sender.setParameters) {
          const params = sender.getParameters();
          if (params.encodings && params.encodings[0]) {
            params.encodings[0].maxBitrate = config.bitRate;
            params.encodings[0].priority = 'high';
            await sender.setParameters(params);
          }
        }
      }
    }

    // Handle incoming audio
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.handleIncomingAudio(participantId, remoteStream);
    };

    // Store peer connection
    this.peerConnections.set(participantId, peerConnection);

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // In a real implementation, send offer through signaling server
    console.log(`Offer created for participant ${participantId}`);
  }

  private handleIncomingAudio(participantId: string, stream: MediaStream): void {
    if (!this.audioContext) return;

    try {
      const source = this.audioContext.createMediaStreamSource(stream);
      const gainNode = this.audioContext.createGain();
      
      // Apply mobile-specific audio processing for incoming streams
      if (this.isMobile) {
        gainNode.gain.value = 0.8; // Slightly reduce volume on mobile
      }
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Notify about received audio
      stream.getAudioTracks()[0]?.addEventListener('ended', () => {
        console.log(`Audio ended for participant ${participantId}`);
      });

    } catch (error) {
      console.error('Failed to handle incoming audio:', error);
    }
  }

  // Utility methods
  muteParticipant(participantFid: number): void {
    if (!this.currentRoom) return;

    const participant = this.currentRoom.participants.find(p => p.fid === participantFid);
    if (participant) {
      participant.isMuted = true;
      this.onRoomUpdate?.(this.currentRoom);
    }
  }

  unmuteParticipant(participantFid: number): void {
    if (!this.currentRoom) return;

    const participant = this.currentRoom.participants.find(p => p.fid === participantFid);
    if (participant) {
      participant.isMuted = false;
      this.onRoomUpdate?.(this.currentRoom);
    }
  }

  getCurrentRoom(): AudioRoom | null {
    return this.currentRoom;
  }

  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }

  isMobileDevice(): boolean {
    return this.isMobile;
  }

  // Event listeners
  setRoomUpdateCallback(callback: (room: AudioRoom) => void): void {
    this.onRoomUpdate = callback;
  }

  setParticipantJoinedCallback(callback: (participant: RoomParticipant) => void): void {
    this.onParticipantJoined = callback;
  }

  setParticipantLeftCallback(callback: (participantFid: number) => void): void {
    this.onParticipantLeft = callback;
  }

  // Cleanup
  dispose(): void {
    this.leaveRoom();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}