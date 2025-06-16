
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTunerControls } from '@/hooks/useTunerControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SingMode from './SingMode';
import AnalysisMode from './AnalysisMode';
import CoachMode from './CoachMode';
import RecordingControls from './RecordingControls';

const TunerScreen = () => {
  const [activeMode, setActiveMode] = useState('sing');
  
  const {
    isRecording,
    hasPermission,
    error,
    recordings,
    currentRecording,
    isPlaying,
    playbackTime,
    startRecording,
    stopRecording,
    playRecording,
    pausePlayback,
    seekPlayback,
    exportRecording,
  } = useTunerControls();

  return (
    <div className="flex flex-col space-y-4 py-4">
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

      {/* Main Tab Interface */}
      <Tabs value={activeMode} onValueChange={setActiveMode} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger 
            value="sing" 
            className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
          >
            Sing
          </TabsTrigger>
          <TabsTrigger 
            value="analysis"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="coach"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            Coach
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sing" className="mt-0">
          <SingMode />
        </TabsContent>

        <TabsContent value="analysis" className="mt-0">
          <AnalysisMode />
        </TabsContent>

        <TabsContent value="coach" className="mt-0">
          <CoachMode />
        </TabsContent>
      </Tabs>

      {/* Recording Controls - Always Available */}
      <div className="border-t border-slate-200/50 pt-4">
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
    </div>
  );
};

export default TunerScreen;
