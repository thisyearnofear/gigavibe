
import { useState } from 'react';
import { Mic, MicOff, AlertCircle, BarChart3, Eye, EyeOff, MessageSquare } from 'lucide-react';
import useAudioInput from '@/hooks/useAudioInput';
import useVocalAnalysis from '@/hooks/useVocalAnalysis';
import WaveformVisualizer from './WaveformVisualizer';
import CircularPitchWheel from './CircularPitchWheel';
import PitchMascot from './PitchMascot';
import RecordingControls from './RecordingControls';
import VocalAnalysisDisplay from './VocalAnalysisDisplay';
import AICoachingFeedback from './AICoachingFeedback';

const TunerScreen = () => {
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

  const { metrics, resetSession } = useVocalAnalysis(audioData, isListening);
  const { frequency, note, octave, cents, isInTune, volume, waveform } = audioData;

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

      {/* Controls Row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAnalysis}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 text-sm ${
              showAnalysis
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'bg-white/70 text-indigo-600 hover:bg-white/90'
            }`}
          >
            {showAnalysis ? <EyeOff className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
            <span className="font-medium">
              {showAnalysis ? 'Hide' : 'Analysis'}
            </span>
          </button>

          <button
            onClick={handleToggleCoaching}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 text-sm ${
              showCoaching
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white/70 text-purple-600 hover:bg-white/90'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">
              {showCoaching ? 'Hide Coach' : 'AI Coach'}
            </span>
          </button>
        </div>

        {/* Microphone Toggle Button */}
        <button
          onClick={handleToggleListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
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

        <button
          onClick={resetSession}
          disabled={!isListening}
          className="px-4 py-2 rounded-xl bg-white/70 text-slate-600 hover:bg-white/90 disabled:opacity-50 text-sm font-medium"
        >
          Reset
        </button>
      </div>

      {/* AI Coaching Feedback */}
      {showCoaching && (
        <div className="w-full">
          <AICoachingFeedback 
            vocalMetrics={metrics} 
            isListening={isListening}
            selectedModel="openai"
          />
        </div>
      )}

      {/* Vocal Analysis Display */}
      {showAnalysis && (
        <div className="w-full">
          <VocalAnalysisDisplay metrics={metrics} isListening={isListening} />
        </div>
      )}

      {/* Main Tuner Display */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-sm border border-slate-200/50 w-full">
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

      {/* Enhanced Waveform Visualizer */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50 w-full">
        <WaveformVisualizer 
          waveform={waveform} 
          isActive={isListening && volume > 1}
          volume={volume}
          className="bg-slate-50 rounded-lg"
        />
        <div className="mt-2 text-center">
          <span className="text-xs text-slate-500">
            Volume: {Math.round(volume)}% • Stability: {Math.round(metrics.stability.pitchConsistency)}%
          </span>
        </div>
      </div>

      {/* Recording Controls */}
      <RecordingControls
        isRecording={isRecording}
        isPlaying={isPlaying}
        playbackTime={playbackTime}
        currentRecording={currentRecording}
        recordings={recordings}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onPlayRecording={playRecording}
        onPausePlayback={pausePlayback}
        onSeekPlayback={seekPlayback}
        onExportRecording={exportRecording}
      />
    </div>
  );
};

export default TunerScreen;
