'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { IPFSAudioService } from '@/lib/storage/IPFSAudioService';

export interface IPFSUploadResult {
  audioIPFS: string;
  metadataIPFS: string;
  audioGatewayUrl: string;
  metadataGatewayUrl: string;
}

export function useIPFSAudio() {
  const { address } = useAccount();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const ipfsService = IPFSAudioService.getInstance();

  /**
   * Upload audio and metadata to IPFS
   */
  const uploadToIPFS = useCallback(async (
    audioBlob: Blob,
    metadata: {
      challengeTitle: string;
      selfRating: number;
      category: string;
      duration: number;
    }
  ): Promise<IPFSUploadResult | null> => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const performanceId = `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Step 1: Upload audio file (50% progress)
      setUploadProgress(25);
      const audioResult = await ipfsService.uploadAudio(audioBlob, {
        performanceId,
        challengeTitle: metadata.challengeTitle,
        duration: metadata.duration,
        userAddress: address
      });

      if (!audioResult) {
        throw new Error('Failed to upload audio to IPFS');
      }

      console.log('✅ Audio uploaded to IPFS:', audioResult.ipfsHash);
      setUploadProgress(50);

      // Step 2: Upload metadata (100% progress)
      setUploadProgress(75);
      const metadataResult = await ipfsService.uploadMetadata({
        performanceId,
        challengeTitle: metadata.challengeTitle,
        selfRating: metadata.selfRating,
        category: metadata.category,
        duration: metadata.duration,
        userAddress: address,
        audioIPFS: audioResult.ipfsUrl,
        timestamp: new Date().toISOString()
      });

      if (!metadataResult) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      console.log('✅ Metadata uploaded to IPFS:', metadataResult.ipfsHash);
      setUploadProgress(100);

      return {
        audioIPFS: audioResult.ipfsUrl,
        metadataIPFS: metadataResult.ipfsUrl,
        audioGatewayUrl: audioResult.gatewayUrl,
        metadataGatewayUrl: metadataResult.gatewayUrl
      };
    } catch (err: any) {
      console.error('IPFS upload failed:', err);
      setError(err.message || 'Failed to upload to IPFS');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [address, ipfsService]);

  /**
   * Get audio stream URL from IPFS hash
   */
  const getAudioUrl = useCallback((ipfsHash: string): string => {
    return ipfsService.getAudioStreamUrl(ipfsHash);
  }, [ipfsService]);

  /**
   * Check if audio file exists on IPFS
   */
  const checkAudioExists = useCallback(async (ipfsHash: string): Promise<boolean> => {
    try {
      return await ipfsService.checkFileExists(ipfsHash);
    } catch (err) {
      console.error('Failed to check IPFS file:', err);
      return false;
    }
  }, [ipfsService]);

  /**
   * Create audio element for playback
   */
  const createAudioElement = useCallback((ipfsHash: string): HTMLAudioElement => {
    return ipfsService.createAudioElement(ipfsHash);
  }, [ipfsService]);

  /**
   * Preload audio for better UX
   */
  const preloadAudio = useCallback(async (ipfsHash: string): Promise<boolean> => {
    try {
      return await ipfsService.preloadAudio(ipfsHash);
    } catch (err) {
      console.error('Failed to preload audio:', err);
      return false;
    }
  }, [ipfsService]);

  /**
   * Get IPFS service status
   */
  const getIPFSStatus = useCallback(() => {
    return ipfsService.getStatus();
  }, [ipfsService]);

  return {
    // State
    uploading,
    uploadProgress,
    error,
    
    // Actions
    uploadToIPFS,
    getAudioUrl,
    checkAudioExists,
    createAudioElement,
    preloadAudio,
    
    // Utils
    getIPFSStatus,
    
    // Computed
    isConfigured: getIPFSStatus().configured,
    hasApiKeys: getIPFSStatus().hasApiKeys
  };
}