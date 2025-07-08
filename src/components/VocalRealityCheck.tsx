'use client';

import { useState, useEffect } from 'react';
import { usePitchDetection } from '@/hooks/usePitchDetection';
import { Mic, Play, Share2, Zap } from 'lucide-react';

export default function VocalRealityCheck() {
  const { pitchData, isListening, startListening, stopListening, error, hasPermission } = usePitchDetection();
  const [phase, setPhase] = useState<'ready' | 'listening' | 'challenge' | 'results'>('ready');
  const [accuracy, setAccuracy] = useState(0);

  // Simplified accuracy calculation
  useEffect(() => {
    if (isListening && pitchData.frequency > 0) {
      const newAccuracy = Math.max(0, 100 - Math.abs(pitchData.cents));
      setAccuracy(Math.round(newAccuracy));
    }
  }, [pitchData, isListening]);

  const handleStart = async () => {
    if (!hasPermission) {
      await startListening();
      return;
    }
    
    if (phase === 'ready') {
      setPhase('challenge');
      await startListening();
    }
  };

  // Permission screen - clean and simple
  if (!hasPermission && !isListening) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
        <div className="text-center space-y-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Mic className="w-12 h-12" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Ready to sing?</h1>
            <p className="text-gray-300 text-lg">
              We need your microphone to hear your amazing voice
            </p>
          </div>
          
          <button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl text-xl font-semibold"
          >
            Let's Go! 🎤
          </button>
        </div>
      </div>
    );
  }

  // Error screen - minimal and friendly
  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
        <div className="text-center space-y-6">
          <div className="text-6xl">😅</div>
          <h2 className="text-2xl font-bold">Oops!</h2>
          <p className="text-gray-300">Something went wrong with your microphone</p>
          <button
            onClick={handleStart}
            className="bg-purple-500 text-white px-8 py-3 rounded-2xl font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main challenge screen - TikTok style
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg">GIGAVIBE</span>
        </div>
        
        <button className="p-2">
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] p-6">
        
        {phase === 'ready' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Daily Challenge</h1>
              <p className="text-xl text-gray-300">
                Sing this melody and see how you really sound
              </p>
            </div>
            
            {/* Play original button */}
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 w-full">
              <div className="flex items-center justify-center gap-3">
                <Play className="w-8 h-8" />
                <span className="text-xl font-semibold">Play Original</span>
              </div>
            </button>
            
            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6 rounded-2xl text-2xl font-bold"
            >
              Start Challenge 🎤
            </button>
          </div>
        )}

        {phase === 'challenge' && isListening && (
          <div className="text-center space-y-8 w-full">
            {/* Large note display */}
            <div className="space-y-2">
              <div className="text-8xl font-bold">
                {pitchData.frequency > 0 ? `${pitchData.note}${pitchData.octave}` : '—'}
              </div>
              <div className="text-xl text-gray-300">
                {pitchData.frequency > 0 ? `${pitchData.frequency.toFixed(0)} Hz` : 'Sing now!'}
              </div>
            </div>

            {/* Simple accuracy indicator */}
            <div className="space-y-4">
              <div className="text-3xl font-bold">
                {accuracy}% Match
              </div>
              
              {/* Visual accuracy bar */}
              <div className="w-full bg-white/10 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-300 ${
                    accuracy > 80 ? 'bg-green-500' : 
                    accuracy > 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>

            {/* Recording indicator */}
            <div className="flex items-center justify-center gap-2 text-red-500">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-semibold">Recording...</span>
            </div>

            {/* Stop button */}
            <button
              onClick={() => {
                stopListening();
                setPhase('results');
              }}
              className="bg-red-500 text-white px-8 py-4 rounded-2xl text-xl font-semibold"
            >
              Finish Challenge
            </button>
          </div>
        )}

        {phase === 'results' && (
          <div className="text-center space-y-8">
            <div className="text-6xl">🎉</div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Challenge Complete!</h2>
              <div className="text-2xl text-purple-400">
                Your Score: {accuracy}%
              </div>
            </div>
            
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl text-xl font-semibold">
                Share Result 🔥
              </button>
              
              <button 
                onClick={() => setPhase('ready')}
                className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-2xl text-xl font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}