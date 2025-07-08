'use client';

/**
 * IPFS Audio Service for decentralized audio storage
 * Handles upload, retrieval, and streaming of audio files
 */
export class IPFSAudioService {
  private static instance: IPFSAudioService;
  private readonly PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  private readonly PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
  private readonly PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

  constructor() {
    if (!this.PINATA_API_KEY || !this.PINATA_SECRET_KEY) {
      console.warn('Pinata API keys not found - IPFS uploads will use fallback');
    }
  }

  static getInstance(): IPFSAudioService {
    if (!IPFSAudioService.instance) {
      IPFSAudioService.instance = new IPFSAudioService();
    }
    return IPFSAudioService.instance;
  }

  /**
   * Upload audio blob to IPFS via Pinata
   */
  async uploadAudio(
    audioBlob: Blob,
    metadata: {
      performanceId: string;
      challengeTitle: string;
      duration: number;
      userAddress: string;
    }
  ): Promise<{
    ipfsHash: string;
    ipfsUrl: string;
    gatewayUrl: string;
  } | null> {
    try {
      // Convert blob to File for FormData
      const audioFile = new File([audioBlob], `${metadata.performanceId}.webm`, {
        type: 'audio/webm'
      });

      // Create FormData for Pinata upload
      const formData = new FormData();
      formData.append('file', audioFile);

      // Add metadata
      const pinataMetadata = {
        name: `GIGAVIBE-${metadata.performanceId}`,
        keyvalues: {
          performanceId: metadata.performanceId,
          challengeTitle: metadata.challengeTitle,
          duration: metadata.duration.toString(),
          userAddress: metadata.userAddress,
          uploadedAt: new Date().toISOString(),
          platform: 'GIGAVIBE'
        }
      };

      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

      // Upload to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.PINATA_API_KEY!,
          'pinata_secret_api_key': this.PINATA_SECRET_KEY!,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const ipfsHash = result.IpfsHash;

      console.log('✅ Audio uploaded to IPFS:', ipfsHash);

      return {
        ipfsHash,
        ipfsUrl: `ipfs://${ipfsHash}`,
        gatewayUrl: `${this.PINATA_GATEWAY}${ipfsHash}`
      };
    } catch (error) {
      console.error('Failed to upload audio to IPFS:', error);
      return null;
    }
  }

  /**
   * Upload performance metadata to IPFS
   */
  async uploadMetadata(metadata: {
    performanceId: string;
    challengeTitle: string;
    selfRating: number;
    category: string;
    duration: number;
    userAddress: string;
    audioIPFS: string;
    timestamp: string;
  }): Promise<{
    ipfsHash: string;
    ipfsUrl: string;
    gatewayUrl: string;
  } | null> {
    try {
      const metadataJson = {
        name: `${metadata.challengeTitle} - Reality Check`,
        description: `GIGAVIBE performance: "${metadata.challengeTitle}" - Self-rated ${metadata.selfRating}⭐`,
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=${metadata.performanceId}`,
        animation_url: metadata.audioIPFS,
        attributes: [
          { trait_type: 'Challenge Title', value: metadata.challengeTitle },
          { trait_type: 'Self Rating', value: metadata.selfRating },
          { trait_type: 'Category', value: metadata.category },
          { trait_type: 'Duration', value: `${metadata.duration}s` },
          { trait_type: 'Platform', value: 'GIGAVIBE' },
          { trait_type: 'Created At', value: metadata.timestamp }
        ],
        properties: {
          performanceId: metadata.performanceId,
          userAddress: metadata.userAddress,
          audioIPFS: metadata.audioIPFS,
          platform: 'GIGAVIBE',
          version: '1.0'
        }
      };

      // Convert to blob
      const metadataBlob = new Blob([JSON.stringify(metadataJson, null, 2)], {
        type: 'application/json'
      });

      const metadataFile = new File([metadataBlob], `${metadata.performanceId}-metadata.json`, {
        type: 'application/json'
      });

      // Create FormData
      const formData = new FormData();
      formData.append('file', metadataFile);

      const pinataMetadata = {
        name: `GIGAVIBE-Metadata-${metadata.performanceId}`,
        keyvalues: {
          type: 'metadata',
          performanceId: metadata.performanceId,
          platform: 'GIGAVIBE'
        }
      };

      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

      // Upload to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.PINATA_API_KEY!,
          'pinata_secret_api_key': this.PINATA_SECRET_KEY!,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Metadata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const ipfsHash = result.IpfsHash;

      console.log('✅ Metadata uploaded to IPFS:', ipfsHash);

      return {
        ipfsHash,
        ipfsUrl: `ipfs://${ipfsHash}`,
        gatewayUrl: `${this.PINATA_GATEWAY}${ipfsHash}`
      };
    } catch (error) {
      console.error('Failed to upload metadata to IPFS:', error);
      return null;
    }
  }

  /**
   * Get audio stream URL from IPFS hash
   */
  getAudioStreamUrl(ipfsHash: string): string {
    // Remove ipfs:// prefix if present
    const hash = ipfsHash.replace('ipfs://', '');
    return `${this.PINATA_GATEWAY}${hash}`;
  }

  /**
   * Check if IPFS file exists and is accessible
   */
  async checkFileExists(ipfsHash: string): Promise<boolean> {
    try {
      const hash = ipfsHash.replace('ipfs://', '');
      const response = await fetch(`${this.PINATA_GATEWAY}${hash}`, {
        method: 'HEAD'
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to check IPFS file:', error);
      return false;
    }
  }

  /**
   * Get file metadata from Pinata
   */
  async getFileMetadata(ipfsHash: string): Promise<any> {
    try {
      const response = await fetch(`https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`, {
        headers: {
          'pinata_api_key': this.PINATA_API_KEY!,
          'pinata_secret_api_key': this.PINATA_SECRET_KEY!,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get metadata: ${response.statusText}`);
      }

      const result = await response.json();
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      return null;
    }
  }

  /**
   * Create audio element for playback
   */
  createAudioElement(ipfsHash: string): HTMLAudioElement {
    const audio = new Audio();
    audio.src = this.getAudioStreamUrl(ipfsHash);
    audio.preload = 'metadata';
    
    // Add error handling
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
    };

    return audio;
  }

  /**
   * Preload audio for better UX
   */
  async preloadAudio(ipfsHash: string): Promise<boolean> {
    try {
      const audio = this.createAudioElement(ipfsHash);
      
      return new Promise((resolve) => {
        audio.oncanplaythrough = () => resolve(true);
        audio.onerror = () => resolve(false);
        
        // Timeout after 10 seconds
        setTimeout(() => resolve(false), 10000);
      });
    } catch (error) {
      console.error('Failed to preload audio:', error);
      return false;
    }
  }

  /**
   * Get IPFS configuration status
   */
  getStatus(): {
    configured: boolean;
    gateway: string;
    hasApiKeys: boolean;
  } {
    return {
      configured: !!(this.PINATA_API_KEY && this.PINATA_SECRET_KEY),
      gateway: this.PINATA_GATEWAY,
      hasApiKeys: !!(this.PINATA_API_KEY && this.PINATA_SECRET_KEY)
    };
  }
}