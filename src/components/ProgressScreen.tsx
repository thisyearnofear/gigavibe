
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, CartesianGrid } from 'recharts';
import { subDays, format, isSameDay, differenceInCalendarDays, parseISO } from 'date-fns';
import { AlertCircle, Trophy } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

const fetchProgressData = async (): Promise<ProgressData> => {
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

const fetchAllAchievements = async (): Promise<Achievement[]> => {
    const { data, error } = await supabase.from('achievements').select('*');
    if (error) {
        console.error('Error fetching all achievements:', error);
        throw new Error(error.message);
    }
    return data || [];
};

const calculateExerciseDurationMs = (notes: any): number => {
    if (!notes || !Array.isArray(notes) || notes.length === 0) return 0;
    return notes.reduce((sum, note) => sum + (note.duration || 0), 0);
};

const formatDuration = (ms: number): string => {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${Math.round(totalSeconds)}s`;
};

const ProgressScreen = () => {
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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  if (progressError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Could not fetch progress data. Please try again later.</AlertDescription>
      </Alert>
    );
  }
  
  if (!progressData || (progressData.sessions.length === 0 && progressData.achievements.length === 0)) {
    return (
        <div className="text-center py-16 bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">Your Progress Awaits!</h3>
            <p className="text-gray-600">Complete some exercises on the Practice screen to see your progress here.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {stats?.map((stat, index) => (
          <div
            key={index}
            className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20"
          >
            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly Practice Chart */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Weekly Practice Time (minutes)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#6b21a8" fontSize={12} />
              <YAxis stroke="#6b21a8" fontSize={12}/>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: '#a855f7',
                  borderRadius: '1rem',
                }}
              />
              <Bar dataKey="minutes" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy Trend */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Accuracy Trend (%)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="day" stroke="#6b21a8" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#6b21a8" fontSize={12} />
               <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: '#a855f7',
                  borderRadius: '1rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {achievementsList.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-2xl transition-all ${
                achievement.earned
                  ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300'
                  : 'bg-white/10 border border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  achievement.earned ? 'bg-yellow-400' : 'bg-gray-300'
                }`}>
                  <Trophy className={`w-5 h-5 ${achievement.earned ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <div className={`font-medium ${achievement.earned ? 'text-yellow-800' : 'text-gray-600'}`}>
                    {achievement.name}
                  </div>
                  <div className={`text-sm ${achievement.earned ? 'text-yellow-700' : 'text-gray-500'}`}>
                    {achievement.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressScreen;
