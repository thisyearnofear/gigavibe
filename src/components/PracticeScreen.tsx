
import { useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const PracticeScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [progress, setProgress] = useState(0);

  const exercises = [
    { name: 'Vocal Warm-up', duration: '5 min', difficulty: 'Easy' },
    { name: 'Scale Practice', duration: '10 min', difficulty: 'Medium' },
    { name: 'Interval Training', duration: '8 min', difficulty: 'Hard' },
    { name: 'Pitch Matching', duration: '6 min', difficulty: 'Medium' },
  ];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Current Exercise */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Practice Session</h2>
        
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <h3 className="text-lg font-semibold text-purple-600 mb-2">
            {exercises[currentExercise].name}
          </h3>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Duration: {exercises[currentExercise].duration}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              exercises[currentExercise].difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
              exercises[currentExercise].difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {exercises[currentExercise].difficulty}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-center text-sm text-gray-600">
            {progress}% Complete
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>
          <button
            onClick={resetExercise}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white/30 transition-all"
          >
            <RotateCcw className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Available Exercises</h3>
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <button
              key={index}
              onClick={() => setCurrentExercise(index)}
              className={`w-full text-left p-4 rounded-2xl transition-all ${
                currentExercise === index
                  ? 'bg-gradient-to-r from-purple-400/30 to-pink-400/30 border-2 border-purple-300'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-purple-700">{exercise.name}</div>
                  <div className="text-sm text-gray-600">{exercise.duration}</div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  exercise.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  exercise.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {exercise.difficulty}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticeScreen;
