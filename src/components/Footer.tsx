
import { useState } from 'react';
import { Mic, Square, ArrowUp, ArrowDown } from 'lucide-react';
import useAudioInput from '@/hooks/useAudioInput';

const Footer = () => {
  const { isListening, startListening, stopListening } = useAudioInput();
  const [currentKey, setCurrentKey] = useState('C');

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const changeKey = (direction: 'up' | 'down') => {
    const currentIndex = keys.indexOf(currentKey);
    if (direction === 'up') {
      setCurrentKey(keys[(currentIndex + 1) % keys.length]);
    } else {
      setCurrentKey(keys[currentIndex === 0 ? keys.length - 1 : currentIndex - 1]);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 max-w-md w-full px-4 z-40">
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Key Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeKey('down')}
              className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <ArrowDown className="w-4 h-4 text-slate-600" />
            </button>
            <div className="bg-slate-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-slate-700">Key: {currentKey}</span>
            </div>
            <button
              onClick={() => changeKey('up')}
              className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <ArrowUp className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Record Button with Pink Accent */}
          <button
            onClick={toggleRecording}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isListening
                ? 'bg-gradient-to-br from-red-400 to-pink-500 animate-pulse'
                : 'bg-gradient-to-br from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600'
            }`}
          >
            {isListening ? (
              <Square className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Status Indicator */}
          <div className="w-20 flex justify-center">
            <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              isListening ? 'bg-pink-400 animate-pulse' : 'bg-slate-300'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
