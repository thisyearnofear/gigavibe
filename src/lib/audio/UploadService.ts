'use client';

/**
 * Enhanced Upload Service with real IPFS integration
 * Handles audio uploads with proper error handling and retry logic
 */

export interface UploadMetadata {
  sourceType?: string;
  challengeId?: string;
  userAddress?: string;
  selfRating?: number;
  duration?: number;
  mimeType?: string;
  timestamp?: number;
}

export interface UploadResult {
  success: boolean;
  ipfsHash?: string;
  url?: string;
  gatewayUrl?: string;
  ipfsUrl?: string;
  storageType: 'ipfs' | 'local';
  filename: string;
  size: number;
  timestamp?: string;
  metadata?: UploadMetadata;
  warning?: string;
  error?: string;
}

export class UploadService {
  private static instance: UploadService;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  /**
   * Upload audio blob to IPFS with retry logic
   */
  async uploadAudio(
    audioBlob: Blob, 
    filename: string, 
    metadata: UploadMetadata = {}
  ): Promise<UploadResult> {
    try {
      // Convert blob to base64
      const base64Data = await this.blobToBase64(audioBlob);
      
      // Add default metadata
      const enrichedMetadata: UploadMetadata = {
        timestamp: Date.now(),
        mimeType: audioBlob.type || 'audio/webm',
        sourceType: 'vocal-recording',
        ...metadata
      };

      console.log('Starting audio upload:', {
        filename,
        size: audioBlob.size,
        type: audioBlob.type,
        metadata: enrichedMetadata
      });

      // Attempt upload with retry logic
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          const result = await this.attemptUpload(base64Data, filename, enrichedMetadata);
          
          if (result.success) {
            console.log(`Upload successful on attempt ${attempt}:`, {
              storageType: result.storageType,
              hash: result.ipfsHash,
              url: result.url
            });
            return result;
          }
        } catch (error) {
          console.warn(`Upload attempt ${attempt} failed:`, error);
          
          if (attempt < this.maxRetries) {
            console.log(`Retrying in ${this.retryDelay}ms...`);
            await this.delay(this.retryDelay);
            this.retryDelay *= 2; // Exponential backoff
          }
        }
      }

      throw new Error(`Upload failed after ${this.maxRetries} attempts`);
    } catch (error) {
      console.error('Upload service error:', error);
      return {
        success: false,
        storageType: 'local',
        filename,
        size: audioBlob.size,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Single upload attempt
   */
  private async attemptUpload(
    base64Data: string, 
    filename: string, 
    metadata: UploadMetadata
  ): Promise<UploadResult> {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        data: base64Data,
        metadata
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Upload API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    return await response.json();
  }

  /**
   * Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check upload service health
   */
  async checkHealth(): Promise<{
    status: string;
    primaryStorage: string;
    availableStorage: string[];
    recommendations: Record<string, string>;
  }> {
    try {
      const response = await fetch('/api/upload');
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Upload service health check failed:', error);
      return {
        status: 'error',
        primaryStorage: 'local',
        availableStorage: ['local'],
        recommendations: {
          error: 'Upload service is not responding'
        }
      };
    }
  }

  /**
   * Validate audio blob before upload
   */
  validateAudioBlob(blob: Blob): { valid: boolean; error?: string } {
    if (!blob) {
      return { valid: false, error: 'No audio blob provided' };
    }

    if (blob.size === 0) {
      return { valid: false, error: 'Audio blob is empty' };
    }

    if (blob.size > 50 * 1024 * 1024) { // 50MB limit
      return { valid: false, error: 'Audio file too large (max 50MB)' };
    }

    const validTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg'];
    if (blob.type && !validTypes.includes(blob.type)) {
      return { valid: false, error: `Unsupported audio type: ${blob.type}` };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const uploadService = UploadService.getInstance();