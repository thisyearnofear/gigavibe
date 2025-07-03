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
} from "recharts";
import { AlertCircle, Trophy } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProgressData } from "@/hooks/useProgressData";

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
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
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
        <AlertDescription>
          Could not fetch progress data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (
    !progressData ||
    (progressData.sessions.length === 0 &&
      progressData.achievements.length === 0)
  ) {
    return (
      <div className="text-center py-16 bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-2">
          Your Progress Awaits!
        </h3>
        <p className="text-gray-600">
          Complete some exercises on the Practice screen to see your progress
          here.
        </p>
      </div>
    );
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
            <div
              className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
            >
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly Practice Chart */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">
          Weekly Practice Time (minutes)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#6b21a8" fontSize={12} />
              <YAxis stroke="#6b21a8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderColor: "#a855f7",
                  borderRadius: "1rem",
                }}
              />
              <Bar
                dataKey="minutes"
                fill="url(#gradient)"
                radius={[4, 4, 0, 0]}
              />
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
        <h3 className="text-lg font-semibold text-purple-700 mb-4">
          Accuracy Trend (%)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="day" stroke="#6b21a8" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#6b21a8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderColor: "#a855f7",
                  borderRadius: "1rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">
          Recent Achievements
        </h3>
        <div className="space-y-3">
          {achievementsList.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-2xl transition-all ${
                achievement.earned
                  ? "bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300"
                  : "bg-white/10 border border-gray-300 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.earned ? "bg-yellow-400" : "bg-gray-300"
                  }`}
                >
                  <Trophy
                    className={`w-5 h-5 ${
                      achievement.earned ? "text-white" : "text-gray-500"
                    }`}
                  />
                </div>
                <div>
                  <div
                    className={`font-medium ${
                      achievement.earned ? "text-yellow-800" : "text-gray-600"
                    }`}
                  >
                    {achievement.name}
                  </div>
                  <div
                    className={`text-sm ${
                      achievement.earned ? "text-yellow-700" : "text-gray-500"
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
    </div>
  );
};

export default ProgressScreen;
