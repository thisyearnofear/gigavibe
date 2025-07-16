'use client';

import { useState, useCallback } from 'react';
import { uploadService, UploadResult, UploadMetadata } from '@/lib/audio/UploadService';

interface UseAudioUploadReturn {
  uploadAudio: (blob: Blob, filename: string, metadata?: UploadMetadata) => Promise<UploadResult>;
  isUploading: boolean;
  uploadProgress: number;
  lastUploadResult: UploadResult | null;
  error: string | null;
  clearError: () => void;
  checkServiceHealth: () => Promise<void>;
  serviceHealth: {
    status: string;
    primaryStorage: string;
    availableStorage: string[];
  } | null;
}

/**
 * Hook for handling audio uploads with state management
 */
export function useAudioUpload(): UseAudioUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploadResult, setLastUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceHealth, setServiceHealth] = useState<{
    status: string;
    primaryStorage: string;
    availableStorage: string[];
  } | null>(null);

  const uploadAudio = useCallback(async (
    blob: Blob, 
    filename: string, 
    metadata: UploadMetadata = {}
  ): Promise<UploadResult> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // Validate audio blob
      const validation = uploadService.validateAudioBlob(blob);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setUploadProgress(25);

      // Perform upload
      const result = await uploadService.uploadAudio(blob, filename, metadata);
      
      setUploadProgress(100);
      setLastUploadResult(result);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('Upload completed successfully:', {
        storageType: result.storageType,
        url: result.url,
        size: result.size
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
      
      // Return error result
      const errorResult: UploadResult = {
        success: false,
        storageType: 'local',
        filename,
        size: blob.size,
        error: errorMessage
      };
      setLastUploadResult(errorResult);
      return errorResult;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await uploadService.checkHealth();
      setServiceHealth(health);
      
      if (health.status !== 'ready') {
        console.warn('Upload service health check warning:', health);
      }
    } catch (err) {
      console.error('Service health check failed:', err);
      setServiceHealth({
        status: 'error',
        primaryStorage: 'local',
        availableStorage: ['local']
      });
    }
  }, []);

  return {
    uploadAudio,
    isUploading,
    uploadProgress,
    lastUploadResult,
    error,
    clearError,
    checkServiceHealth,
    serviceHealth
  };
}