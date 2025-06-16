
import { useTunerControls } from '@/hooks/useTunerControls';
import useVocalAnalysis from '@/hooks/useVocalAnalysis';
import AICoachingFeedback from './AICoachingFeedback';

const CoachMode = () => {
  const {
    audioData,
    isListening,
    handleToggleListening,
  } = useTunerControls();

  const { metrics } = useVocalAnalysis(audioData, isListening);

  return (
    <div className="flex flex-col space-y-6 py-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">AI Coach Mode</h2>
        <p className="text-slate-600">Get personalized feedback and coaching</p>
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={handleToggleListening}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {isListening ? 'Stop Coaching' : 'Start Coaching Session'}
        </button>
      </div>

      {/* AI Coaching Feedback - Now has full space */}
      <div className="w-full">
        <AICoachingFeedback
          vocalMetrics={metrics}
          isListening={isListening}
          selectedModel="openai"
        />
      </div>

      {/* Current Status */}
      {isListening && (
        <div className="bg-white/70 rounded-xl p-4 text-center">
          <div className="text-sm text-slate-600 mb-2">Current Session</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-indigo-600">
                {audioData.frequency > 0 ? `${audioData.note}${audioData.octave}` : '--'}
              </div>
              <div className="text-xs text-slate-500">Current Note</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {Math.round(metrics.stability.pitchConsistency)}%
              </div>
              <div className="text-xs text-slate-500">Stability</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {Math.round(audioData.volume)}%
              </div>
              <div className="text-xs text-slate-500">Volume</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachMode;
