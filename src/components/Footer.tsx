
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
    <footer className="bg-white/20 backdrop-blur-md border-t border-white/20 px-4 py-4">
      <div className="flex items-center justify-between">
        {/* Key Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeKey('down')}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowDown className="w-4 h-4 text-purple-600" />
          </button>
          <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-bold text-purple-700">Key: {currentKey}</span>
          </div>
          <button
            onClick={() => changeKey('up')}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowUp className="w-4 h-4 text-purple-600" />
          </button>
        </div>

        {/* Record Button */}
        <button
          onClick={toggleRecording}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isListening
              ? 'bg-gradient-to-br from-red-400 to-pink-500 animate-pulse'
              : 'bg-gradient-to-br from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
          }`}
        >
          {isListening ? (
            <Square className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Status Indicator */}
        <div className="w-20 flex justify-center">
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            isListening ? 'bg-red-400 animate-pulse' : 'bg-gray-300'
          }`} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
