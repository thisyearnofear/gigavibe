import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  CartesianGrid,
  Legend, // Added Legend
  ComposedChart, // Added for combined charts if needed
} from "recharts";
import { AlertCircle, Trophy, Gamepad2 } from "lucide-react"; // Added Gamepad2

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProgressData } from "@/hooks/useProgressData";
import { format, parseISO } from "date-fns"; // For formatting game session dates

const ProgressScreen = () => {
  const {
    progressData,
    progressError,
    stats,
    chartData,
    achievementsList,
    isLoading,
  } = useProgressData();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4"> {/* Adjusted grid for more stats */}
          {[...Array(5)].map((_, i) => ( // Assuming 5 stats now
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" /> {/* Placeholder for game sessions list */}
      </div>
    );
  }

  if (progressError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not fetch progress data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (
    !progressData ||
    (progressData.sessions.length === 0 &&
      progressData.achievements.length === 0 &&
      progressData.gameSessions.length === 0) // Check gameSessions too
  ) {
    return (
      <div className="text-center py-16 bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-2">
          Your Progress Awaits!
        </h3>
        <p className="text-gray-600">
          Complete some exercises or play games on the Practice screen to see your progress here.
        </p>
      </div>
    );
  }

  const recentGameSessions = progressData?.gameSessions
    ?.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 5); // Get latest 5 game sessions

  return (
    <div className="space-y-6 pb-8"> {/* Added pb-8 for more space at the bottom */}
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4"> {/* Adjusted for potentially more stats */}
        {stats?.map((stat, index) => (
          <div
            key={index}
            className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 flex flex-col justify-between min-h-[100px]"
          >
            <div>
                <div className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Practice Chart */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">
          Weekly Activity (minutes)
        </h3>
        <div className="h-56 sm:h-64"> {/* Increased height */}
          <ResponsiveContainer width="100%" height="100%">
            {/* Using ComposedChart if you plan to add lines for game time vs exercise time later */}
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="day" stroke="#6b21a8" fontSize={12} />
              <YAxis stroke="#6b21a8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(5px)",
                  borderColor: "#a855f7",
                  borderRadius: "1rem",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "#6b21a8", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar
                name="Total Mins" // Added name for legend
                dataKey="minutes"
                fill="url(#gradientPracticeTime)"
                radius={[4, 4, 0, 0]}
                barSize={20} // Adjusted bar size
              />
              <defs>
                <linearGradient id="gradientPracticeTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.9} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy Trend (Assuming this is for exercises only for now) */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">
          Exercise Accuracy Trend (%)
        </h3>
        <div className="h-56 sm:h-64"> {/* Increased height */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="day" stroke="#6b21a8" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#6b21a8" fontSize={12} />
              <Tooltip
                 contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(5px)",
                  borderColor: "#a855f7",
                  borderRadius: "1rem",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "#6b21a8", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Line
                name="Avg Accuracy" // Added name for legend
                type="monotone"
                dataKey="accuracy"
                stroke="url(#gradientAccuracy)"
                strokeWidth={3}
                dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#a855f7", stroke: "white" }}
              />
               <defs>
                <linearGradient id="gradientAccuracy" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d8b4fe" />
                  <stop offset="100%" stopColor="#f9a8d4" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Game Sessions */}
      {recentGameSessions && recentGameSessions.length > 0 && (
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">Recent Game Activity</h3>
          <div className="space-y-3">
            {recentGameSessions.map((session) => {
              const scoreDetails = session.score_details as { score: number; notesAttempted?: number; notesCorrect?: number };
              const accuracy = (scoreDetails?.notesAttempted && scoreDetails.notesCorrect)
                                ? Math.round((scoreDetails.notesCorrect / scoreDetails.notesAttempted) * 100)
                                : null;
              return (
                <div key={session.id} className="p-4 rounded-2xl bg-white/10 border border-gray-300/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gamepad2 className="w-6 h-6 text-indigo-500" />
                      <div>
                        <div className="font-medium text-indigo-700">{session.game_name}</div>
                        <div className="text-xs text-gray-500">
                          {format(parseISO(session.completed_at), "MMM d, yyyy - h:mm a")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-indigo-600">{scoreDetails?.score || 0} pts</div>
                      {accuracy !== null && <div className="text-xs text-gray-500">{accuracy}% acc.</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievementsList && achievementsList.length > 0 && (
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">
            Achievements
          </h3>
          <div className="space-y-3">
            {achievementsList.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-2xl transition-all ${
                  achievement.earned
                    ? "bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-50 border-2 border-yellow-400 shadow-md"
                    : "bg-white/5 border border-gray-400/30 opacity-70" // Subtle unearned style
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ // Made icon bg larger
                      achievement.earned ? "bg-gradient-to-br from-yellow-400 to-amber-500" : "bg-gray-300"
                    }`}
                  >
                    <Trophy
                      className={`w-5 h-5 ${ // Icon size consistent
                        achievement.earned ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div className="flex-grow">
                    <div
                      className={`font-semibold ${ // Bolder earned title
                        achievement.earned ? "text-amber-700" : "text-gray-700"
                      }`}
                    >
                      {achievement.name}
                    </div>
                    <div
                      className={`text-sm ${
                        achievement.earned ? "text-amber-600" : "text-gray-500"
                      }`}
                    >
                      {achievement.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressScreen;
