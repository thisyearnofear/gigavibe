'use client';

import { GroveService } from '../storage/GroveService';

/**
 * Audio upload options and metadata
 */
export interface AudioUploadOptions {
  // Required properties
  blob: Blob;
  challengeId: string;
  sourceType: string;
  
  // Optional properties
  filename?: string;
  metadata?: Record<string, any>;
}

/**
 * Result of an audio upload operation
 */
export interface AudioUploadResult {
  success: boolean;
  recordingId: string;
  storageType: 'filcdn' | 'grove' | 'local' | 'none';
  url?: string;
  error?: Error;
}

/**
 * AudioUploadService
 * 
 * Manages audio file uploads to various storage services
 * with fallback mechanisms and consistent error handling
 */
export class AudioUploadService {
  
  /**
   * Upload an audio file to storage
   * 
   * The service will try multiple storage options in this order:
   * 1. FilCDN (via /api/upload)
   * 2. Grove (direct Web3 storage)
   * 3. Local fallback (sessionStorage)
   * 
   * @param options - Upload options containing the audio blob and metadata
   * @returns Promise resolving to upload result
   */
  static async uploadAudio(options: AudioUploadOptions): Promise<AudioUploadResult> {
    const { blob, challengeId, sourceType } = options;
    
    if (!blob || blob.size === 0) {
      return {
        success: false,
        recordingId: '',
        storageType: 'none',
        error: new Error('Invalid or empty audio blob')
      };
    }
    
    console.log(`Starting upload process for ${sourceType} audio:`, {
      blobSize: blob.size,
      blobType: blob.type,
      challengeId
    });
    
    // Prepare the result object
    let result: AudioUploadResult = {
      success: false,
      recordingId: '',
      storageType: 'none'
    };
    
    try {
      // First convert the audioBlob to base64
      const base64Data = await this.blobToBase64(blob);
      
      // Try FilCDN first
      try {
        console.log("Attempting to upload via FilCDN...");
        
        // Generate a descriptive filename
        const timestamp = Date.now();
        const filename = options.filename || 
          `${challengeId}_${sourceType}_${timestamp}.webm`;
        
        console.log(`Uploading file with name: ${filename}`);
        
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename,
            data: base64Data,
            metadata: {
              sourceType,
              challengeId,
              timestamp,
              ...options.metadata
            },
          }),
        });
        
        if (!response.ok) {
          throw new Error(`FilCDN upload failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        result = {
          success: true,
          recordingId: data.ipfsHash,
          storageType: 'filcdn',
          url: data.url || `ipfs://${data.ipfsHash}`
        };
        
        console.log("✅ Audio uploaded to FilCDN successfully with hash:", result.recordingId);
        return result;
      } catch (fileCdnError) {
        console.warn("⚠️ FilCDN upload failed, trying Grove instead:", fileCdnError);
        
        // Try Grove storage as fallback
        try {
          if (GroveService.isSupported()) {
            const groveService = GroveService.getInstance();
            await groveService.initialize();
            
            // Include sourceType in the filename for Grove uploads too
            const timestamp = Date.now();
            const filename = options.filename || 
              `${challengeId}_${sourceType}_${timestamp}.webm`;
            
            console.log(`Uploading to Grove with filename: ${filename}`);
            
            const groveResult = await groveService.uploadFile(blob, filename);
            
            result = {
              success: true,
              recordingId: groveResult.uri,
              storageType: 'grove',
              url: groveResult.gatewayUrl || groveResult.uri
            };
            
            console.log("✅ Audio uploaded to Grove successfully with URI:", result.recordingId);
            return result;
          } else {
            throw new Error("Grove storage not supported in this environment");
          }
        } catch (groveError) {
          console.warn("⚠️ Grove upload failed, using local storage:", groveError);
          
          // Local storage fallback
          const localId = `local_${Date.now()}`;
          
          // Store blob in sessionStorage for temporary persistence
          try {
            sessionStorage.setItem(localId, base64Data);
            
            result = {
              success: true,
              recordingId: localId,
              storageType: 'local'
            };
            
            console.log("✅ Audio stored in session storage with key:", result.recordingId);
            return result;
          } catch (storageError) {
            console.warn("⚠️ Could not store in sessionStorage:", storageError);
            throw storageError;
          }
        }
      }
    } catch (error) {
      console.error("❌ All upload methods failed:", error);
      
      // Create a fallback ID for emergency situations
      const fallbackId = `local_${Date.now()}`;
      
      return {
        success: false,
        recordingId: fallbackId,
        storageType: 'local',
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
  
  /**
   * Convert a Blob to base64 string
   * 
   * @param blob - The Blob to convert
   * @returns Promise resolving to base64 string (without data URL prefix)
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = () => {
        try {
          // Get base64 data (remove the data:audio/webm;base64, prefix)
          const result = reader.result?.toString() || '';
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }
}