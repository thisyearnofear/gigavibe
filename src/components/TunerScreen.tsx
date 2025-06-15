
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
    if (!isListening || frequency === 0) return 'text-slate-400';
    return isInTune ? 'text-green-600' : 'text-red-500';
  };

  const getCentsColor = () => {
    if (!isListening || frequency === 0) return 'text-slate-400';
    if (Math.abs(cents) < 10) return 'text-green-600';
    if (Math.abs(cents) < 25) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getNeedleRotation = () => {
    if (!isListening || frequency === 0) return 0;
    return Math.max(-45, Math.min(45, cents * 0.9));
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-2">
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
        <button
          onClick={handleToggleListening}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 mb-4 mx-auto ${
            isListening
              ? 'bg-gradient-to-br from-red-400 to-pink-500 animate-pulse'
              : 'bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600'
          }`}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>

        <div className={`text-4xl font-bold mb-2 transition-colors duration-300 ${getPitchColor()}`}>
          {frequency > 0 ? `${note}${octave}` : '--'}
        </div>
        <div className="text-sm text-slate-600 mb-3">
          {frequency > 0 ? `${frequency.toFixed(1)} Hz` : 'Tap mic to start'}
        </div>

        {/* Cents Display */}
        <div className="bg-slate-50 rounded-xl p-3 mb-4">
          <div className="text-xs text-slate-500 mb-1">Cents</div>
          <div className={`text-xl font-bold transition-colors duration-300 ${getCentsColor()}`}>
            {frequency > 0 ? `${cents > 0 ? '+' : ''}${cents}` : '--'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {Math.abs(cents) < 10 ? 'Perfect!' : Math.abs(cents) < 25 ? 'Close' : 'Adjust pitch'}
          </div>
        </div>

        {/* Tuner Dial */}
        <div className="relative w-40 h-40 bg-slate-50 rounded-full mx-auto mb-4 border border-slate-200">
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-inner">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  !isListening || frequency === 0 
                    ? 'bg-slate-300' 
                    : isInTune 
                      ? 'bg-green-400 animate-pulse' 
                      : 'bg-red-400'
                }`}
              >
                <span className="text-white font-bold text-sm">
                  {!isListening || frequency === 0 ? '•' : isInTune ? '✓' : cents > 0 ? '♯' : '♭'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Tuning Scale Marks */}
          {[-50, -25, 0, 25, 50].map((mark) => (
            <div
              key={mark}
              className="absolute top-1 left-1/2 w-0.5 h-3 bg-slate-400 origin-bottom"
              style={{
                transform: `translate(-50%, 0) rotate(${mark * 0.9}deg)`,
              }}
            />
          ))}
          
          {/* Needle */}
          <div
            className={`absolute top-1/2 left-1/2 w-0.5 h-16 origin-bottom rounded-full transition-all duration-200 ${
              !isListening || frequency === 0 
                ? 'bg-slate-400' 
                : 'bg-indigo-600 shadow-sm'
            }`}
            style={{
              transform: `translate(-50%, -100%) rotate(${getNeedleRotation()}deg)`,
            }}
          />
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-indigo-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Waveform Visualizer */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50 w-full">
        <h3 className="text-sm font-medium text-slate-700 mb-2 text-center">Audio Waveform</h3>
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
