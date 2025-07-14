'use client';

import { useEffect, useState, useCallback } from 'react';
import { AudioRecordingService, AudioRecordingEvent, RecordingState } from '@/lib/audio/AudioRecordingService';

/**
 * Hook for audio recording functionality using the AudioRecordingService
 * 
 * Provides a React-friendly interface to the recording service
 */
export function useAudioRecording() {
  // Get the singleton recording service
  const recordingService = AudioRecordingService.getInstance();
  
  // State tracking
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    hasRecording: false,
    audioBlob: null,
    mixedAudioBlob: null,
    duration: 0
  });
  
  // Update state from service
  const updateState = useCallback(() => {
    const newState = recordingService.getRecordingState();
    setState(newState);
  }, [recordingService]);
  
  // Start recording
  const startRecording = useCallback(async () => {
    const success = await recordingService.startRecording();
    updateState();
    return success;
  }, [recordingService, updateState]);
  
  // Stop recording
  const stopRecording = useCallback(async () => {
    const success = await recordingService.stopRecording();
    updateState();
    return success;
  }, [recordingService, updateState]);
  
  // Clear recording
  const clearRecording = useCallback(() => {
    recordingService.clearRecording();
    updateState();
  }, [recordingService, updateState]);
  
  // Mix with instrumental
  const mixWithInstrumental = useCallback(async (instrumentalUrl: string) => {
    const success = await recordingService.mixWithInstrumental(instrumentalUrl);
    updateState();
    return success;
  }, [recordingService, updateState]);
  
  // Set up event listeners
  useEffect(() => {
    const handleRecordingStart = () => updateState();
    const handleRecordingStop = () => updateState();
    const handleRecordingAvailable = () => updateState();
    const handleMixedAudioAvailable = () => updateState();

    // Register all event listeners
    recordingService.addEventListener(AudioRecordingEvent.RECORDING_START, handleRecordingStart);
    recordingService.addEventListener(AudioRecordingEvent.RECORDING_STOP, handleRecordingStop);
    recordingService.addEventListener(AudioRecordingEvent.RECORDING_AVAILABLE, handleRecordingAvailable);
    recordingService.addEventListener(AudioRecordingEvent.MIXED_AUDIO_AVAILABLE, handleMixedAudioAvailable);

    // Initial state update
    updateState();

    // Clean up event listeners
    return () => {
      recordingService.removeEventListener(AudioRecordingEvent.RECORDING_START, handleRecordingStart);
      recordingService.removeEventListener(AudioRecordingEvent.RECORDING_STOP, handleRecordingStop);
      recordingService.removeEventListener(AudioRecordingEvent.RECORDING_AVAILABLE, handleRecordingAvailable);
      recordingService.removeEventListener(AudioRecordingEvent.MIXED_AUDIO_AVAILABLE, handleMixedAudioAvailable);
    };
  }, [recordingService, updateState]);
  
  // Return all the necessary state and functions
  return {
    isRecording: state.isRecording,
    hasRecording: state.hasRecording,
    audioBlob: state.audioBlob,
    mixedAudioBlob: state.mixedAudioBlob,
    recordingDuration: state.duration,
    startRecording,
    stopRecording,
    clearRecording,
    mixWithInstrumental
  };
}