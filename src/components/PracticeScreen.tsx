
import { useState, useMemo, useEffect } from 'react';
import { Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Exercise = Tables<'exercises'>;

const fetchExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase.from('exercises').select('*').order('created_at');
  if (error) {
    console.error('Error fetching exercises:', error);
    throw new Error(error.message);
  }
  return data || [];
};

const calculateDuration = (notes: any): string => {
  if (!notes || !Array.isArray(notes) || notes.length === 0) {
    return 'N/A';
  }
  const totalDurationMs = notes.reduce((sum, note) => sum + (note.duration || 0), 0);
  const minutes = Math.floor(totalDurationMs / 60000);
  const seconds = Math.round((totalDurationMs % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

const PracticeScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [progress, setProgress] = useState(0);

  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
  });

  useEffect(() => {
    if (!currentExercise && exercises && exercises.length > 0) {
      setCurrentExercise(exercises[0]);
    }
  }, [exercises, currentExercise]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setProgress(0);
    setIsPlaying(false);
  };
  
  const difficultyMap = {
    beginner: {
      label: 'Easy',
      className: 'bg-green-100 text-green-700',
    },
    intermediate: {
      label: 'Medium',
      className: 'bg-yellow-100 text-yellow-700',
    },
    advanced: {
      label: 'Hard',
      className: 'bg-red-100 text-red-700',
    },
  };

  const currentExerciseDuration = useMemo(() => {
    if (!currentExercise?.notes) return 'N/A';
    return calculateDuration(currentExercise.notes);
  }, [currentExercise]);

  return (
    <div className="space-y-6">
      {/* Current Exercise */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Practice Session</h2>
        
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 mb-4 min-h-[160px]">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full my-4" />
              <Skeleton className="h-4 w-1/4 mx-auto" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Could not fetch exercises.</AlertDescription>
            </Alert>
          ) : currentExercise ? (
            <>
              <h3 className="text-lg font-semibold text-purple-600 mb-2">
                {currentExercise.name}
              </h3>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Duration: {currentExerciseDuration}</span>
                <span className={`px-2 py-1 rounded-full text-xs capitalize ${difficultyMap[currentExercise.difficulty].className}`}>
                  {difficultyMap[currentExercise.difficulty].label}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="text-center text-sm text-gray-600">
                {progress}% Complete
              </div>
            </>
          ) : (
             <div className="text-center text-gray-500 pt-8">No exercises available.</div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={togglePlay}
            disabled={!currentExercise || isLoading}
            className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>
          <button
            onClick={resetExercise}
            disabled={!currentExercise || isLoading}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white/30 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Available Exercises</h3>
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-20 rounded-2xl" />)
          ) : exercises && exercises.length > 0 ? (
            exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => {
                  setCurrentExercise(exercise);
                  setProgress(0);
                  setIsPlaying(false);
                }}
                className={`w-full text-left p-4 rounded-2xl transition-all ${
                  currentExercise?.id === exercise.id
                    ? 'bg-gradient-to-r from-purple-400/30 to-pink-400/30 border-2 border-purple-300'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-purple-700">{exercise.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{calculateDuration(exercise.notes)}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs capitalize ${difficultyMap[exercise.difficulty].className}`}>
                    {difficultyMap[exercise.difficulty].label}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">No exercises found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeScreen;
