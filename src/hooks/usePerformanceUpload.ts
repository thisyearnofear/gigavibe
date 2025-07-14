'use client';

import { useState, useCallback } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { AudioUploadService } from '@/lib/audio/AudioUploadService';
import { 
  PerformanceData, 
  PerformanceMetadata, 
  UploadProgress, 
  UploadResult,
  UserContext
} from '@/types/performance.types';

type UploadState = 'idle' | 'auth_required' | 'uploading' | 'success' | 'error' | 'retrying';

interface UsePerformanceUploadReturn {
  uploadState: UploadState;
  uploadProgress: UploadProgress | null;
  uploadResult: UploadResult | null;
  error: string | null;
  
  // Actions
  submitPerformance: (audioBlob: Blob, performanceData: PerformanceData) => Promise<void>;
  retryUpload: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export function usePerformanceUpload(): UsePerformanceUploadReturn {
  const { isAuthenticated, user, displayName, authMethod, avatarUrl, canPost } = useUnifiedAuth();
  
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Store for retry attempts
  const [retryData, setRetryData] = useState<{
    audioBlob: Blob;
    performanceData: PerformanceData;
  } | null>(null);

  const createUserContext = useCallback((): UserContext => ({
    userId: user?.address || user?.fid?.toString() || 'anonymous',
    username: displayName || 'Anonymous',
    displayName: displayName || 'Anonymous User',
    authMethod: authMethod || 'ethereum',
    avatarUrl,
    canPost,
    fid: user?.fid
  }), [user, displayName, authMethod, avatarUrl, canPost]);

  const enrichPerformanceData = useCallback((
    performanceData: PerformanceData,
    userContext: UserContext
  ): PerformanceMetadata => {
    return {
      ...performanceData,
      user: userContext,
      intendedForSharing: canPost,
      shareToFarcaster: false, // User can choose later
      deviceInfo: navigator.userAgent,
      uploadMethod: 'filcdn', // Will be updated based on actual upload
      uploadAttempts: 1
    };
  }, [canPost]);

  const updateProgress = useCallback((stage: UploadProgress['stage'], progress: number, message: string) => {
    setUploadProgress({
      stage,
      progress,
      message,
      canCancel: stage === 'preparing' || stage === 'uploading'
    });
  }, []);

  const performUpload = useCallback(async (
    audioBlob: Blob, 
    performanceData: PerformanceData
  ) => {
    const userContext = createUserContext();
    const enrichedMetadata = enrichPerformanceData(performanceData, userContext);

    try {
      // Stage 1: Preparing
      updateProgress('preparing', 10, 'Preparing your performance...');
      
      // Validate audio blob
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Invalid audio recording');
      }

      // Stage 2: Uploading
      updateProgress('uploading', 30, 'Uploading to storage...');
      
      const uploadOptions = {
        blob: audioBlob,
        challengeId: performanceData.challengeId,
        sourceType: 'performance_submission',
        filename: `${performanceData.challengeId}_${userContext.userId}_${Date.now()}.webm`,
        metadata: enrichedMetadata
      };

      const uploadServiceResult = await AudioUploadService.uploadAudio(uploadOptions);
      
      if (!uploadServiceResult.success) {
        throw new Error(uploadServiceResult.error?.message || 'Upload failed');
      }

      // Stage 3: Processing
      updateProgress('processing', 70, 'Processing submission...');
      
      // Update metadata with actual upload method
      const finalMetadata = {
        ...enrichedMetadata,
        uploadMethod: uploadServiceResult.storageType
      };

      // Stage 4: Complete
      updateProgress('complete', 100, 'Performance submitted successfully!');
      
      const result: UploadResult = {
        success: true,
        recordingId: uploadServiceResult.recordingId,
        storageType: uploadServiceResult.storageType,
        url: uploadServiceResult.url,
        metadata: finalMetadata
      };

      setUploadResult(result);
      setUploadState('success');
      
      console.log('✅ Performance upload successful:', {
        recordingId: result.recordingId,
        storageType: result.storageType,
        selfRating: performanceData.selfRating,
        accuracy: performanceData.accuracy
      });

    } catch (uploadError) {
      console.error('❌ Performance upload failed:', uploadError);
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
      setUploadState('error');
    }
  }, [createUserContext, enrichPerformanceData, updateProgress]);

  const submitPerformance = useCallback(async (
    audioBlob: Blob, 
    performanceData: PerformanceData
  ) => {
    // Clear previous state
    setError(null);
    setUploadResult(null);
    setUploadProgress(null);

    // Check authentication
    if (!isAuthenticated) {
      setUploadState('auth_required');
      return;
    }

    // Store data for potential retry
    setRetryData({ audioBlob, performanceData });
    
    setUploadState('uploading');
    await performUpload(audioBlob, performanceData);
  }, [isAuthenticated, performUpload]);

  const retryUpload = useCallback(async () => {
    if (!retryData) {
      setError('No upload data available for retry');
      return;
    }

    setError(null);
    setUploadState('retrying');
    
    // Increment retry attempt
    const updatedData = {
      ...retryData.performanceData,
      uploadAttempts: (retryData.performanceData as any).uploadAttempts + 1 || 2
    };

    await performUpload(retryData.audioBlob, updatedData);
  }, [retryData, performUpload]);

  const clearError = useCallback(() => {
    setError(null);
    setUploadState('idle');
  }, []);

  const reset = useCallback(() => {
    setUploadState('idle');
    setUploadProgress(null);
    setUploadResult(null);
    setError(null);
    setRetryData(null);
  }, []);

  return {
    uploadState,
    uploadProgress,
    uploadResult,
    error,
    
    // Actions
    submitPerformance,
    retryUpload,
    clearError,
    reset
  };
}