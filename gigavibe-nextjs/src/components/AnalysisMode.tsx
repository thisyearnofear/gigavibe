
import { useTunerControls } from '@/hooks/useTunerControls';
import useVocalAnalysis from '@/hooks/useVocalAnalysis';
import VocalAnalysisDisplay from './VocalAnalysisDisplay';
import WaveformVisualizer from './WaveformVisualizer';
import CircularPitchWheel from './CircularPitchWheel';

const AnalysisMode = () => {
  const {
    audioData,
    isListening,
    handleToggleListening,
  } = useTunerControls();

  const { metrics, resetSession } = useVocalAnalysis(audioData, isListening);
  const { frequency, note, octave, cents, isInTune, volume, waveform } = audioData;

  return (
    <div className="flex flex-col space-y-6 py-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Analysis Mode</h2>
        <p className="text-slate-600">Detailed vocal metrics and pitch analysis</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggleListening}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
        >
          {isListening ? 'Stop Analysis' : 'Start Analysis'}
        </button>

        <button
          onClick={resetSession}
          disabled={!isListening}
          className="px-4 py-2 rounded-xl bg-slate-500 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Session
        </button>
      </div>

      {/* Vocal Analysis Display */}
      <VocalAnalysisDisplay metrics={metrics} isListening={isListening} />

      {/* Circular Pitch Wheel */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/50">
        <CircularPitchWheel
          note={note}
          octave={octave}
          cents={cents}
          frequency={frequency}
          isListening={isListening}
          isInTune={isInTune}
        />
      </div>

      {/* Waveform Visualizer */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50">
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
    </div>
  );
};

export default AnalysisMode;
