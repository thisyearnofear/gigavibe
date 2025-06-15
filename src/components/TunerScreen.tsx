
import { useState, useEffect } from 'react';

const TunerScreen = () => {
  const [frequency, setFrequency] = useState(440);
  const [note, setNote] = useState('A4');
  const [isInTune, setIsInTune] = useState(false);
  const [cents, setCents] = useState(0);

  // Simulate frequency detection
  useEffect(() => {
    const interval = setInterval(() => {
      const randomFreq = 440 + (Math.random() - 0.5) * 100;
      setFrequency(randomFreq);
      
      // Simulate note detection
      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      setNote(randomNote + '4');
      
      // Simulate cents deviation
      const randomCents = Math.floor((Math.random() - 0.5) * 100);
      setCents(randomCents);
      setIsInTune(Math.abs(randomCents) < 10);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-full space-y-8">
      {/* Frequency Display */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 text-center shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Current Pitch</h2>
        <div className="text-6xl font-bold text-purple-600 mb-2">{note}</div>
        <div className="text-lg text-gray-600">{frequency.toFixed(1)} Hz</div>
      </div>

      {/* Tuner Dial */}
      <div className="relative w-64 h-64 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/20">
        <div className="absolute inset-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <div className="w-32 h-32 bg-white/50 rounded-full flex items-center justify-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isInTune ? 'bg-green-400' : 'bg-red-400'
              }`}
            >
              <span className="text-white font-bold text-lg">
                {isInTune ? '✓' : cents > 0 ? '♯' : '♭'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Needle */}
        <div
          className="absolute top-1/2 left-1/2 w-1 h-24 bg-purple-600 origin-bottom rounded-full transition-transform duration-300"
          style={{
            transform: `translate(-50%, -100%) rotate(${cents * 0.9}deg)`,
          }}
        />
      </div>

      {/* Cents Display */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center shadow-lg border border-white/20">
        <div className="text-sm text-gray-600 mb-1">Cents</div>
        <div className={`text-2xl font-bold ${isInTune ? 'text-green-600' : 'text-red-600'}`}>
          {cents > 0 ? '+' : ''}{cents}
        </div>
      </div>
    </div>
  );
};

export default TunerScreen;
