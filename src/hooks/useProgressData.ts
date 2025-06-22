import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subDays, format, isSameDay, differenceInCalendarDays, parseISO } from 'date-fns';

import { supabase } from '@/integrations/supabase/client';
import { Tables, Json } from '@/integrations/supabase/types'; // Ensure Json is imported if used

type Exercise = Tables<'exercises'>;
type UserExerciseSession = Tables<'user_exercise_sessions'>;
type Achievement = Tables<'achievements'>;
type UserGameSession = Tables<'user_game_sessions'>; // New type for game sessions

type UserExerciseSessionWithExercise = UserExerciseSession & {
  exercises: Exercise | null;
};

// Define a structure for game scores if it's complex, otherwise use Json
// For PitchPerfectChallenge, let's assume score is a number and accuracy is a number
interface PitchPerfectGameScore {
  score: number;
  // accuracy?: number; // Optional: if you want to track overall accuracy for the game session
  notesAttempted: number;
  notesCorrect: number;
}

type ProgressData = {
  sessions: UserExerciseSessionWithExercise[];
  achievements: (Tables<'user_achievements'> & { achievements: Achievement | null })[];
  gameSessions: UserGameSession[]; // Add game sessions to progress data
};

export const fetchProgressData = async (): Promise<ProgressData> => {
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  
  const sessionsPromise = supabase
    .from('user_exercise_sessions')
    .select('*, exercises(*)')
    .gte('completed_at', thirtyDaysAgo)
    .order('completed_at', { ascending: false });

  const achievementsPromise = supabase
    .from('user_achievements')
    .select('*, achievements(*)');

  const gameSessionsPromise = supabase // Fetch game sessions
    .from('user_game_sessions')
    .select('*')
    .gte('completed_at', thirtyDaysAgo)
    .order('completed_at', { ascending: false });

  const [
    { data: sessions, error: sessionsError },
    { data: achievements, error: achievementsError },
    { data: gameSessions, error: gameSessionsError }
  ] = await Promise.all([sessionsPromise, achievementsPromise, gameSessionsPromise]);

  if (sessionsError) throw new Error(`Error fetching exercise sessions: ${sessionsError.message}`);
  if (achievementsError) throw new Error(`Error fetching achievements: ${achievementsError.message}`);
  if (gameSessionsError) throw new Error(`Error fetching game sessions: ${gameSessionsError.message}`);

  return {
    sessions: sessions || [],
    achievements: achievements || [],
    gameSessions: gameSessions || []
  };
};

export const fetchAllAchievements = async (): Promise<Achievement[]> => {
    const { data, error } = await supabase.from('achievements').select('*');
    if (error) throw new Error(`Error fetching all achievements: ${error.message}`);
    return data || [];
};

// Function to save game session data
export const saveGameSession = async (
  gameName: string,
  scoreDetails: PitchPerfectGameScore, // Using the specific interface
  durationMs: number
): Promise<UserGameSession | null> => {
  // Here, we assume user_id can be fetched or is known.
  // For client-side Supabase, it often comes from auth.
  // If your RLS policies require user_id and it's not automatically set, you'll need to provide it.
  // const { data: { user } } = await supabase.auth.getUser();
  // const userId = user?.id;

  // If your 'score_details' column is of type JSON or JSONB, 'scoreDetails' will be stored as is.
  const { data, error } = await supabase
    .from('user_game_sessions')
    .insert({
      // user_id: userId, // Uncomment if you handle user auth and need to pass it
      game_name: gameName,
      score_details: scoreDetails as unknown as Json, // Cast to Json
      duration_ms: durationMs,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving game session:', error);
    throw new Error(error.message);
  }
  return data;
};


export const calculateExerciseDurationMs = (notes: any): number => {
    if (!notes || !Array.isArray(notes) || notes.length === 0) return 0;
    return notes.reduce((sum, note) => sum + (note.duration || 0), 0);
};

export const formatDuration = (ms: number): string => {
    if (ms === 0) return '0s';
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds > 0 ? `${seconds}s` : ''}`.trim();
    return `${seconds}s`;
};

export const useProgressData = () => {
  const queryClient = useQueryClient();

  const { data: progressData, isLoading: isLoadingProgress, error: progressError } = useQuery({
    queryKey: ['progressData'],
    queryFn: fetchProgressData,
  });

  const { data: allAchievements, isLoading: isLoadingAchievements } = useQuery({
      queryKey: ['allAchievements'],
      queryFn: fetchAllAchievements,
  });

  const mutation = useMutation({
    mutationFn: (params: { gameName: string; scoreDetails: PitchPerfectGameScore; durationMs: number }) =>
      saveGameSession(params.gameName, params.scoreDetails, params.durationMs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressData'] }); // Refetch progress data after saving
    },
    onError: (error) => {
      console.error("Failed to save game session:", error);
      // Potentially show a toast notification to the user
    }
  });

  const savePitchPerfectScore = useCallback((scoreDetails: PitchPerfectGameScore, durationMs: number) => {
    return mutation.mutateAsync({ gameName: 'PitchPerfectChallenge', scoreDetails, durationMs });
  }, [mutation]);


  const stats = useMemo(() => {
    if (!progressData) return null;
    const { sessions, gameSessions } = progressData;

    const totalExerciseTimeMs = sessions.reduce((sum, s) => sum + calculateExerciseDurationMs(s.exercises?.notes), 0);
    const totalGameTimeMs = gameSessions.reduce((sum, gs) => sum + (gs.duration_ms || 0), 0);
    const totalPracticeTimeMs = totalExerciseTimeMs + totalGameTimeMs;

    const averageAccuracy = sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length) : 0;
    const exercisesCompleted = sessions.length;
    const gamesPlayed = gameSessions.length;

    // Streak calculation based on both exercises and games
    const practiceDaysSet = new Set<string>();
    sessions.forEach(s => practiceDaysSet.add(format(parseISO(s.completed_at), 'yyyy-MM-dd')));
    gameSessions.forEach(gs => practiceDaysSet.add(format(parseISO(gs.completed_at), 'yyyy-MM-dd')));

    const practiceDays = Array.from(practiceDaysSet).sort().reverse();
    let streak = 0;
    if (practiceDays.length > 0) {
      const today = new Date();
      const mostRecentPracticeDate = parseISO(practiceDays[0]);
      if (differenceInCalendarDays(today, mostRecentPracticeDate) <= 1) {
        streak = 1;
        for (let i = 0; i < practiceDays.length - 1; i++) {
          const day1 = parseISO(practiceDays[i]);
          const day2 = parseISO(practiceDays[i + 1]);
          if (differenceInCalendarDays(day1, day2) === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return [
      { label: 'Total Practice Time', value: formatDuration(totalPracticeTimeMs), color: 'from-purple-400 to-purple-600' },
      { label: 'Avg Exercise Accuracy', value: `${averageAccuracy}%`, color: 'from-pink-400 to-pink-600' },
      { label: 'Streak Days', value: `${streak}`, color: 'from-blue-400 to-blue-600' },
      { label: 'Exercises Done', value: `${exercisesCompleted}`, color: 'from-green-400 to-green-600' },
      { label: 'Games Played', value: `${gamesPlayed}`, color: 'from-yellow-400 to-yellow-600' }, // New stat for games
    ];
  }, [progressData]);

  const chartData = useMemo(() => {
    if (!progressData) return [];
    const last7Days = [...Array(7)].map((_, i) => subDays(new Date(), i)).reverse();

    return last7Days.map(day => {
      const sessionsOnDay = progressData.sessions.filter(s => isSameDay(parseISO(s.completed_at), day));
      const gamesOnDay = progressData.gameSessions.filter(gs => isSameDay(parseISO(gs.completed_at), day));

      const exerciseMinutes = sessionsOnDay.length > 0 ? Math.round(sessionsOnDay.reduce((sum, s) => sum + calculateExerciseDurationMs(s.exercises?.notes), 0) / 60000) : 0;
      const gameMinutes = gamesOnDay.length > 0 ? Math.round(gamesOnDay.reduce((sum, gs) => sum + (gs.duration_ms || 0), 0) / 60000) : 0;
      const totalMinutes = exerciseMinutes + gameMinutes;

      const avgAccuracy = sessionsOnDay.length > 0 ? Math.round(sessionsOnDay.reduce((sum, s) => sum + s.score, 0) / sessionsOnDay.length) : 0;

      // Potentially add game accuracy if tracked
      // const avgGameScore = gamesOnDay.length > 0 ? Math.round(gamesOnDay.reduce((sum, gs) => sum + ((gs.score_details as PitchPerfectGameScore)?.score || 0), 0) / gamesOnDay.length) : 0;

      return {
        day: format(day, 'E'),
        minutes: totalMinutes,
        accuracy: avgAccuracy,
        // gameScore: avgGameScore // Example
      };
    });
  }, [progressData]);
  
  const achievementsList = useMemo(() => {
      if (!allAchievements || !progressData) return [];
      const unlockedIds = new Set(progressData.achievements.map(a => a.achievement_id));
      return allAchievements.map(ach => ({
          ...ach,
          earned: unlockedIds.has(ach.id),
      }));
  }, [progressData, allAchievements]);

  const isLoading = isLoadingProgress || isLoadingAchievements;

  return {
    progressData,
    progressError,
    stats,
    chartData,
    achievementsList,
    isLoading,
    savePitchPerfectScore, // Expose the save function
    isSavingScore: mutation.isPending, // Expose loading state for saving
  };
};
