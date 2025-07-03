import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subDays, format, isSameDay, differenceInCalendarDays, parseISO } from 'date-fns';

import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'exercises'>;
type UserExerciseSession = Tables<'user_exercise_sessions'>;
type Achievement = Tables<'achievements'>;

type UserExerciseSessionWithExercise = UserExerciseSession & {
  exercises: Exercise | null;
};

type ProgressData = {
  sessions: UserExerciseSessionWithExercise[];
  achievements: (Tables<'user_achievements'> & { achievements: Achievement | null })[];
};

export const fetchProgressData = async (): Promise<ProgressData> => {
  const sevenDaysAgo = subDays(new Date(), 30).toISOString(); // Fetch last 30 days of data for calculations
  
  const sessionsPromise = supabase
    .from('user_exercise_sessions')
    .select('*, exercises(*)')
    .gte('completed_at', sevenDaysAgo)
    .order('completed_at', { ascending: false });

  const achievementsPromise = supabase
    .from('user_achievements')
    .select('*, achievements(*)');

  const [{ data: sessions, error: sessionsError }, { data: achievements, error: achievementsError }] = await Promise.all([sessionsPromise, achievementsPromise]);

  if (sessionsError) {
    console.error('Error fetching exercise sessions:', sessionsError);
    throw new Error(sessionsError.message);
  }
  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError);
    throw new Error(achievementsError.message);
  }

  return { sessions: sessions || [], achievements: achievements || [] };
};

export const fetchAllAchievements = async (): Promise<Achievement[]> => {
    const { data, error } = await supabase.from('achievements').select('*');
    if (error) {
        console.error('Error fetching all achievements:', error);
        throw new Error(error.message);
    }
    return data || [];
};

export const calculateExerciseDurationMs = (notes: any): number => {
    if (!notes || !Array.isArray(notes) || notes.length === 0) return 0;
    return notes.reduce((sum, note) => sum + (note.duration || 0), 0);
};

export const formatDuration = (ms: number): string => {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${Math.round(totalSeconds)}s`;
};

export const useProgressData = () => {
  const { data: progressData, isLoading: isLoadingProgress, error: progressError } = useQuery({
    queryKey: ['progressData'],
    queryFn: fetchProgressData,
  });

  const { data: allAchievements, isLoading: isLoadingAchievements } = useQuery({
      queryKey: ['allAchievements'],
      queryFn: fetchAllAchievements,
  });

  const stats = useMemo(() => {
    if (!progressData) return null;
    const { sessions } = progressData;

    const totalPracticeTimeMs = sessions.reduce((sum, s) => sum + calculateExerciseDurationMs(s.exercises?.notes), 0);
    const averageAccuracy = sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length) : 0;
    const exercisesCompleted = sessions.length;

    const practiceDays = [...new Set(sessions.map(s => format(parseISO(s.completed_at), 'yyyy-MM-dd')))].sort().reverse();
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
      { label: 'Average Accuracy', value: `${averageAccuracy}%`, color: 'from-pink-400 to-pink-600' },
      { label: 'Streak Days', value: `${streak}`, color: 'from-blue-400 to-blue-600' },
      { label: 'Exercises Completed', value: `${exercisesCompleted}`, color: 'from-green-400 to-green-600' },
    ];
  }, [progressData]);

  const chartData = useMemo(() => {
    if (!progressData) return [];
    const last7Days = [...Array(7)].map((_, i) => subDays(new Date(), i)).reverse();
    return last7Days.map(day => {
      const sessionsOnDay = progressData.sessions.filter(s => isSameDay(parseISO(s.completed_at), day));
      const totalMinutes = sessionsOnDay.length > 0 ? Math.round(sessionsOnDay.reduce((sum, s) => sum + calculateExerciseDurationMs(s.exercises?.notes), 0) / 60000) : 0;
      const avgAccuracy = sessionsOnDay.length > 0 ? Math.round(sessionsOnDay.reduce((sum, s) => sum + s.score, 0) / sessionsOnDay.length) : 0;
      return { day: format(day, 'E'), minutes: totalMinutes, accuracy: avgAccuracy };
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

  return { progressData, progressError, stats, chartData, achievementsList, isLoading };
};
