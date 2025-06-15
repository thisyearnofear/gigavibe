
import { Play, Pause, Square, Download, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Recording {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
  size: number;
  quality: 'high' | 'medium' | 'low';
}

interface RecordingControlsProps {
  isRecording: boolean;
  isPlaying: boolean;
  playbackTime: number;
  currentRecording: Recording | null;
  recordings: Recording[];
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: (recording: Recording) => void;
  onPausePlayback: () => void;
  onSeekPlayback: (time: number) => void;
  onExportRecording: (recording: Recording, format: 'wav' | 'mp3') => void;
}

const RecordingControls = ({
  isRecording,
  isPlaying,
  playbackTime,
  currentRecording,
  recordings,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  onPausePlayback,
  onSeekPlayback,
  onExportRecording,
}: RecordingControlsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getQualityColor = (quality: 'high' | 'medium' | 'low') => {
    switch (quality) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-700">Recording</h3>
        <Button
          onClick={isRecording ? onStopRecording : onStartRecording}
          size="sm"
          className={`${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gradient-to-br from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600'
          } text-white`}
        >
          {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isRecording ? 'Stop' : 'Record'}
        </Button>
      </div>

      {currentRecording && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Button
              onClick={isPlaying ? onPausePlayback : () => onPlayRecording(currentRecording)}
              size="sm"
              variant="outline"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex-1">
              <div className="bg-slate-200 rounded-full h-2 relative">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-150"
                  style={{ width: `${(playbackTime / currentRecording.duration) * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={currentRecording.duration}
                  value={playbackTime}
                  onChange={(e) => onSeekPlayback(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <span className="text-xs text-slate-500">
              {formatTime(playbackTime)} / {formatTime(currentRecording.duration)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${getQualityColor(currentRecording.quality)}`}>
                {currentRecording.quality.toUpperCase()}
              </span>
              <span>{formatFileSize(currentRecording.size)}</span>
            </div>
            <Button
              onClick={() => onExportRecording(currentRecording, 'wav')}
              size="sm"
              variant="ghost"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {recordings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-slate-600">Recent Recordings</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {recordings.slice(0, 3).map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onPlayRecording(recording)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                  <span className="text-slate-600">
                    {recording.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={getQualityColor(recording.quality)}>
                    {recording.quality}
                  </span>
                  <span className="text-slate-500">
                    {formatFileSize(recording.size)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
