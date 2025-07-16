'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ChallengeSong {
  id: string;
  title: string;
  artist: string;
  vocalUrl: string;      // Full song with vocals
  instrumentalUrl: string; // Backing track only
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
}

interface ChallengeSongPlayerProps {
  song: ChallengeSong;
  mode: 'preview' | 'practice' | 'recording';
  onModeChange?: (mode: 'preview' | 'practice' | 'recording') => void;
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export default function ChallengeSongPlayer({ 
  song, 
  mode, 
  onModeChange,
  onRecordingComplete 
}: ChallengeSongPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showVocals, setShowVocals] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Determine which audio source to use
  const audioSource = mode === 'recording' ? song.instrumentalUrl : 
                     (showVocals ? song.vocalUrl : song.instrumentalUrl);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioSource;
      audioRef.current.volume = volume;
    }
  }, [audioSource, volume]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (newTime: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        onRecordingComplete?.(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recordingRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Auto-start backing track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (recordingRef.current && isRecording) {
      recordingRef.current.stop();
      setIsRecording(false);
    }
    
    // Stop backing track
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetToStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/30">
      {/* Song Info */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-1">{song.title}</h3>
        <p className="text-gray-300">by {song.artist}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            song.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
            song.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {song.difficulty.toUpperCase()}
          </span>
          <span className="text-gray-400 text-sm">{formatTime(song.duration)}</span>
        </div>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={song.duration}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(song.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          onClick={resetToStart}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          onClick={togglePlayPause}
          size="lg"
          className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={(value) => setVolume(value[0])}
            className="w-20"
          />
        </div>
      </div>

      {/* Mode-specific Controls */}
      {mode === 'practice' && (
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            onClick={() => setShowVocals(!showVocals)}
            variant="outline"
            size="sm"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
          >
            {showVocals ? 'Hide Vocals' : 'Show Vocals'}
          </Button>
          <Button
            onClick={() => onModeChange?.('recording')}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Ready to Record
          </Button>
        </div>
      )}

      {mode === 'recording' && (
        <div className="text-center">
          <p className="text-gray-300 text-sm mb-4">
            {isRecording ? 'Recording your performance...' : 'Press record and sing along!'}
          </p>
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            size="lg"
            className={`${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white px-8`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </div>
      )}

      {mode === 'preview' && (
        <div className="text-center">
          <Button
            onClick={() => onModeChange?.('practice')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
          >
            Start Challenge
          </Button>
        </div>
      )}
    </div>
  );
}