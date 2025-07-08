'use client';

import { useState } from 'react';
import { usePitchDetection } from '@/hooks/usePitchDetection';
import { Play, Pause, Mic, MicOff } from 'lucide-react';
import { PitchWheel } from './PitchWheel';
import { VolumeIndicator } from './VolumeIndicator';
import { NoteDisplay } from './NoteDisplay';

export default function TunerScreen() {
  const { pitchData, isListening, startListening, stopListening, error, hasPermission } = usePitchDetection();
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');

  const handleToggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <MicOff className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-red-700">Microphone Error</h3>
          </div>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={handleToggleListening}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!hasPermission && !isListening) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 max-w-sm mx-auto text-center">
          <Mic className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Microphone Access</h3>
          <p className="text-blue-600 text-sm mb-4">
            GIGAVIBE needs microphone access to analyze your voice and provide real-time feedback.
          </p>
          <button
            onClick={handleToggleListening}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Grant Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-1 flex">
          <button
            onClick={() => setMode('basic')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === 'basic'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === 'advanced'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* Main Tuner Display */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6">
        {mode === 'basic' ? (
          <BasicTunerView pitchData={pitchData} isListening={isListening} />
        ) : (
          <AdvancedTunerView pitchData={pitchData} isListening={isListening} />
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={handleToggleListening}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 ${
            isListening
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
          }`}
        >
          {isListening ? (
            <>
              <Pause className="w-6 h-6" />
              Stop Tuner
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              Start Tuner
            </>
          )}
        </button>
      </div>

      {/* Tips */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <h4 className="font-semibold text-purple-700 mb-2">💡 Tuning Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Sing a steady note for best accuracy</li>
          <li>• Keep your device close but not too close</li>
          <li>• Find a quiet environment for better detection</li>
          <li>• Green means you're in tune! 🎯</li>
        </ul>
      </div>
    </div>
  );
}

function BasicTunerView({ pitchData, isListening }: { pitchData: any; isListening: boolean }) {
  return (
    <div className="text-center space-y-6">
      <NoteDisplay 
        note={pitchData.note}
        octave={pitchData.octave}
        isInTune={pitchData.isInTune}
        isListening={isListening}
      />
      
      <PitchWheel 
        cents={pitchData.cents}
        isInTune={pitchData.isInTune}
        isListening={isListening}
      />
      
      <VolumeIndicator 
        volume={pitchData.volume}
        isListening={isListening}
      />
      
      {isListening && (
        <div className="text-sm text-gray-600">
          <div>Frequency: {pitchData.frequency.toFixed(1)} Hz</div>
          <div>Confidence: {Math.round(pitchData.confidence * 100)}%</div>
        </div>
      )}
    </div>
  );
}

function AdvancedTunerView({ pitchData, isListening }: { pitchData: any; isListening: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <NoteDisplay 
          note={pitchData.note}
          octave={pitchData.octave}
          isInTune={pitchData.isInTune}
          isListening={isListening}
          size="small"
        />
        
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-purple-700">
            {pitchData.frequency.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Hz</div>
        </div>
      </div>
      
      <PitchWheel 
        cents={pitchData.cents}
        isInTune={pitchData.isInTune}
        isListening={isListening}
        size="large"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <VolumeIndicator 
          volume={pitchData.volume}
          isListening={isListening}
          showLabel
        />
        
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">
            {Math.round(pitchData.confidence * 100)}%
          </div>
          <div className="text-sm text-gray-600">Confidence</div>
        </div>
      </div>
      
      <div className="bg-white/20 rounded-2xl p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Cents: </span>
            <span className={`font-mono font-bold ${
              Math.abs(pitchData.cents) < 10 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {pitchData.cents > 0 ? '+' : ''}{pitchData.cents}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Status: </span>
            <span className={`font-medium ${
              pitchData.isInTune ? 'text-green-600' : 'text-orange-600'
            }`}>
              {pitchData.isInTune ? 'In Tune' : 'Adjust'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
