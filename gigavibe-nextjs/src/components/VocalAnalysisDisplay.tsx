
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface VocalAnalysisDisplayProps {
  metrics: any;
  isListening: boolean;
}

const VocalAnalysisDisplay = ({ metrics, isListening }: VocalAnalysisDisplayProps) => {
  const { pitchRange, vibrato, stability, volume, formants, sessionStats } = metrics;

  // Create chart data for stability visualization
  const stabilityData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    stability: Math.max(0, stability.pitchConsistency + (Math.random() - 0.5) * 20)
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50">
          <div className="text-xs text-slate-600 mb-1">Pitch Range</div>
          <div className="text-sm font-bold text-indigo-700">
            {pitchRange.lowestNote || '--'} - {pitchRange.highestNote || '--'}
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50">
          <div className="text-xs text-slate-600 mb-1">Stability</div>
          <div className={`text-sm font-bold ${
            stability.pitchConsistency > 70 ? 'text-green-600' : 
            stability.pitchConsistency > 40 ? 'text-yellow-600' : 'text-red-500'
          }`}>
            {Math.round(stability.pitchConsistency)}%
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50">
          <div className="text-xs text-slate-600 mb-1">Volume Range</div>
          <div className="text-sm font-bold text-purple-700">
            {Math.round(volume.dynamicRange)}%
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50">
          <div className="text-xs text-slate-600 mb-1">Session Time</div>
          <div className="text-sm font-bold text-slate-700">
            {formatTime(sessionStats.duration)}
          </div>
        </div>
      </div>

      {/* Vibrato Detection */}
      {vibrato.detected && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-700">Vibrato Detected</span>
          </div>
          <div className="text-xs text-purple-600">
            Rate: {vibrato.rate.toFixed(1)} Hz • Depth: {vibrato.depth.toFixed(1)} cents
          </div>
        </div>
      )}

      {/* Vocal Stability Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
        <div className="text-sm font-medium text-slate-700 mb-3">Pitch Stability</div>
        <div className="h-20">
          <ChartContainer
            config={{
              stability: {
                label: "Stability",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stabilityData}>
                <Area
                  type="monotone"
                  dataKey="stability"
                  stroke="#6366f1"
                  fill="url(#stabilityGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="stabilityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      {/* Formant Analysis */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
        <div className="text-sm font-medium text-slate-700 mb-3">Vowel Analysis</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-pink-600 capitalize">
              {formants.vowelEstimate}
            </div>
            <div className="text-xs text-slate-600">
              F1: {Math.round(formants.f1)}Hz • F2: {Math.round(formants.f2)}Hz
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
            <span className="text-lg">{formants.vowelEstimate === 'a' ? '👄' : formants.vowelEstimate === 'i' ? '😊' : formants.vowelEstimate === 'o' ? '😮' : '🎵'}</span>
          </div>
        </div>
      </div>

      {/* Session Summary */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
        <div className="text-sm font-medium text-slate-700 mb-3">Session Summary</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Notes Explored:</span>
            <span className="text-sm font-medium">{sessionStats.notesHit.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Overall Score:</span>
            <span className={`text-sm font-bold ${
              sessionStats.accuracyScore > 70 ? 'text-green-600' : 
              sessionStats.accuracyScore > 40 ? 'text-yellow-600' : 'text-red-500'
            }`}>
              {Math.round(sessionStats.accuracyScore)}/100
            </span>
          </div>
          {sessionStats.notesHit.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {sessionStats.notesHit.slice(0, 8).map((note, i) => (
                <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                  {note}
                </span>
              ))}
              {sessionStats.notesHit.length > 8 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                  +{sessionStats.notesHit.length - 8}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocalAnalysisDisplay;
