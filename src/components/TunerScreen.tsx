
import { useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import useAudioInput from '@/hooks/useAudioInput';
import WaveformVisualizer from './WaveformVisualizer';

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

  const getPitchColor = () => {
    if (!isListening || frequency === 0) return 'text-gray-400';
    return isInTune ? 'text-green-600' : 'text-red-600';
  };

  const getCentsColor = () => {
    if (!isListening || frequency === 0) return 'text-gray-400';
    if (Math.abs(cents) < 10) return 'text-green-600';
    if (Math.abs(cents) < 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNeedleRotation = () => {
    if (!isListening || frequency === 0) return 0;
    return Math.max(-45, Math.min(45, cents * 0.9));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full space-y-6">
      {/* Permission & Error Handling */}
      {hasPermission === false && (
        <div className="bg-red-100/20 backdrop-blur-md rounded-2xl p-4 text-center shadow-lg border border-red-200/20">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-red-600 text-sm">Microphone access required for pitch detection</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100/20 backdrop-blur-md rounded-2xl p-4 text-center shadow-lg border border-red-200/20">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Microphone Control */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-white/20">
        <button
          onClick={handleToggleListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 mb-3 ${
            isListening
              ? 'bg-gradient-to-br from-red-400 to-pink-500 animate-pulse'
              : 'bg-gradient-to-br from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
        <p className="text-sm text-gray-600">
          {isListening ? 'Tap to stop listening' : 'Tap to start tuning'}
        </p>
      </div>

      {/* Waveform Visualizer */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 w-full max-w-sm">
        <h3 className="text-sm font-medium text-purple-700 mb-3 text-center">Audio Waveform</h3>
        <WaveformVisualizer 
          waveform={waveform} 
          isActive={isListening && volume > 1}
          className="bg-white/10 backdrop-blur-sm"
        />
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-600">
            Volume: {Math.round(volume)}%
          </span>
        </div>
      </div>

      {/* Frequency Display */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 text-center shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Current Pitch</h2>
        <div className={`text-6xl font-bold mb-2 transition-colors duration-300 ${getPitchColor()}`}>
          {frequency > 0 ? `${note}${octave}` : '--'}
        </div>
        <div className="text-lg text-gray-600">
          {frequency > 0 ? `${frequency.toFixed(1)} Hz` : 'No signal'}
        </div>
      </div>

      {/* Tuner Dial */}
      <div className="relative w-64 h-64 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/20">
        <div className="absolute inset-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <div className="w-32 h-32 bg-white/50 rounded-full flex items-center justify-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                !isListening || frequency === 0 
                  ? 'bg-gray-400' 
                  : isInTune 
                    ? 'bg-green-400 animate-pulse' 
                    : 'bg-red-400'
              }`}
            >
              <span className="text-white font-bold text-lg">
                {!isListening || frequency === 0 ? '•' : isInTune ? '✓' : cents > 0 ? '♯' : '♭'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Tuning Scale Marks */}
        {[-50, -25, 0, 25, 50].map((mark) => (
          <div
            key={mark}
            className="absolute top-2 left-1/2 w-0.5 h-4 bg-purple-600/40 origin-bottom"
            style={{
              transform: `translate(-50%, 0) rotate(${mark * 0.9}deg)`,
            }}
          />
        ))}
        
        {/* Needle */}
        <div
          className={`absolute top-1/2 left-1/2 w-1 h-24 origin-bottom rounded-full transition-all duration-200 ${
            !isListening || frequency === 0 
              ? 'bg-gray-400' 
              : 'bg-purple-600 shadow-lg'
          }`}
          style={{
            transform: `translate(-50%, -100%) rotate(${getNeedleRotation()}deg)`,
          }}
        />
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Cents Display */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center shadow-lg border border-white/20">
        <div className="text-sm text-gray-600 mb-1">Cents</div>
        <div className={`text-2xl font-bold transition-colors duration-300 ${getCentsColor()}`}>
          {frequency > 0 ? `${cents > 0 ? '+' : ''}${cents}` : '--'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.abs(cents) < 10 ? 'Perfect!' : Math.abs(cents) < 25 ? 'Close' : 'Adjust pitch'}
        </div>
      </div>
    </div>
  );
};

export default TunerScreen;
