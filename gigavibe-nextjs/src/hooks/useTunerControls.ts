import { useState } from 'react';
import useAudioInput from '@/hooks/useAudioInput';

export const useTunerControls = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showCoaching, setShowCoaching] = useState(false);
  
  const { 
    audioData, 
    isListening, 
    isRecording,
    hasPermission, 
    error, 
    recordings,
    currentRecording,
    isPlaying,
    playbackTime,
    startListening, 
    stopListening,
    startRecording,
    stopRecording,
    playRecording,
    pausePlayback,
    seekPlayback,
    exportRecording
  } = useAudioInput();

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleToggleAnalysis = () => {
    setShowAnalysis(!showAnalysis);
  };

  const handleToggleCoaching = () => {
    setShowCoaching(!showCoaching);
  };

  return {
    showAnalysis,
    showCoaching,
    audioData,
    isListening,
    isRecording,
    hasPermission,
    error,
    recordings,
    currentRecording,
    isPlaying,
    playbackTime,
    handleToggleListening,
    handleToggleAnalysis,
    handleToggleCoaching,
    startRecording,
    stopRecording,
    playRecording,
    pausePlayback,
    seekPlayback,
    exportRecording
  };
};
