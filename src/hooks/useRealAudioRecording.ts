'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { RealAudioRecorder } from '@/lib/audio/RealAudioRecorder';

export interface AudioRecordingState {
  isRecording: boolean;
  isInitialized: boolean;
  hasPermission: boolean;
  duration: number;
  error: string | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export function useRealAudioRecording() {
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isInitialized: false,
    hasPermission: false,
    duration: 0,
    error: null,
    audioBlob: null,
    audioUrl: null
  });

  const recorderRef = useRef<RealAudioRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize recorder
  const initializeRecorder = useCallback(async () => {
    if (!RealAudioRecorder.isSupported()) {
      setState(prev => ({ 
        ...prev, 
        error: 'Audio recording not supported in this browser' 
      }));
      return false;
    }

    try {
      recorderRef.current = new RealAudioRecorder();
      
      recorderRef.current.setEventHandlers({
        onRecordingStart: () => {
          startTimeRef.current = Date.now();
          setState(prev => ({ 
            ...prev, 
            isRecording: true, 
            error: null,
            duration: 0
          }));
          
          // Start duration timer
          durationIntervalRef.current = setInterval(() => {
            setState(prev => ({ 
              ...prev, 
              duration: (Date.now() - startTimeRef.current) / 1000 
            }));
          }, 100);
        },
        
        onRecordingStop: () => {
          setState(prev => ({ ...prev, isRecording: false }));
          
          // Clear duration timer
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
        },
        
        onDataAvailable: (audioBlob: Blob) => {
          const audioUrl = URL.createObjectURL(audioBlob);
          setState(prev => ({ 
            ...prev, 
            audioBlob, 
            audioUrl,
            error: null
          }));
        },
        
        onError: (error: string) => {
          setState(prev => ({ 
            ...prev, 
            error, 
            isRecording: false 
          }));
          
          // Clear duration timer on error
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
        }
      });

      const initialized = await recorderRef.current.initialize();
      setState(prev => ({ 
        ...prev, 
        isInitialized: initialized,
        hasPermission: initialized,
        error: initialized ? null : 'Failed to initialize audio recording'
      }));
      
      return initialized;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to initialize audio recorder' 
      }));
      return false;
    }
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    const hasPermission = await RealAudioRecorder.requestPermissions();
    setState(prev => ({ 
      ...prev, 
      hasPermission,
      error: hasPermission ? null : 'Microphone permission denied'
    }));
    return hasPermission;
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!recorderRef.current) {
      const initialized = await initializeRecorder();
      if (!initialized) return false;
    }

    const success = await recorderRef.current!.startRecording();
    if (!success) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start recording' 
      }));
    }
    return success;
  }, [initializeRecorder]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recorderRef.current && state.isRecording) {
      recorderRef.current.stopRecording();
    }
  }, [state.isRecording]);

  // Clear recording
  const clearRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    setState(prev => ({ 
      ...prev, 
      audioBlob: null, 
      audioUrl: null, 
      duration: 0,
      error: null
    }));
  }, [state.audioUrl]);

  // Convert to base64 for storage
  const getBase64Audio = useCallback(async (): Promise<string | null> => {
    if (!state.audioBlob || !recorderRef.current) return null;
    
    try {
      return await recorderRef.current.blobToBase64(state.audioBlob);
    } catch (error) {
      console.error('Failed to convert audio to base64:', error);
      return null;
    }
  }, [state.audioBlob]);

  // Get audio duration
  const getAudioDuration = useCallback(async (): Promise<number | null> => {
    if (!state.audioBlob || !recorderRef.current) return null;
    
    try {
      return await recorderRef.current.getAudioDuration(state.audioBlob);
    } catch (error) {
      console.error('Failed to get audio duration:', error);
      return null;
    }
  }, [state.audioBlob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.cleanup();
      }
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, [state.audioUrl]);

  return {
    // State
    ...state,
    
    // Actions
    initializeRecorder,
    requestPermissions,
    startRecording,
    stopRecording,
    clearRecording,
    
    // Utilities
    getBase64Audio,
    getAudioDuration,
    
    // Computed
    isSupported: RealAudioRecorder.isSupported(),
    canRecord: state.isInitialized && state.hasPermission && !state.isRecording,
    hasRecording: !!state.audioBlob
  };
}