
import { useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import useAudioInput from '@/hooks/useAudioInput';
import WaveformVisualizer from './WaveformVisualizer';
import CircularPitchWheel from './CircularPitchWheel';
import PitchMascot from './PitchMascot';

const TunerScreen = () => {
  const { 
    audioData, 
    isListening, 
    hasPermission, 
    error, 
    startListening, 
    stopListening 
  } = useAudioInput();

  const { frequency, note, octave, cents, isInTune, volume, waveform } = audioData;

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      {/* Permission & Error Handling */}
      {hasPermission === false && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center w-full">
          <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-red-600 text-sm">Microphone access required</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center w-full">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Main Tuner Display */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-sm border border-slate-200/50 w-full">
        {/* Microphone Toggle Button */}
        <button
          onClick={handleToggleListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 mb-6 mx-auto ${
            isListening
              ? 'bg-gradient-to-br from-red-400 to-pink-500 animate-pulse scale-110'
              : 'bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 hover:scale-105'
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Mascot */}
        <PitchMascot 
          isInTune={isInTune} 
          isListening={isListening} 
          volume={volume} 
        />

        {/* Circular Pitch Wheel */}
        <CircularPitchWheel
          note={note}
          octave={octave}
          cents={cents}
          frequency={frequency}
          isListening={isListening}
          isInTune={isInTune}
        />
      </div>

      {/* Simplified Waveform Visualizer */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50 w-full">
        <WaveformVisualizer 
          waveform={waveform} 
          isActive={isListening && volume > 1}
          className="bg-slate-50 rounded-lg"
        />
        <div className="mt-2 text-center">
          <span className="text-xs text-slate-500">
            Volume: {Math.round(volume)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default TunerScreen;
