
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

const ProgressScreen = () => {
  const weeklyData = [
    { day: 'Mon', minutes: 15, accuracy: 78 },
    { day: 'Tue', minutes: 22, accuracy: 82 },
    { day: 'Wed', minutes: 18, accuracy: 85 },
    { day: 'Thu', minutes: 25, accuracy: 79 },
    { day: 'Fri', minutes: 30, accuracy: 88 },
    { day: 'Sat', minutes: 28, accuracy: 91 },
    { day: 'Sun', minutes: 20, accuracy: 86 },
  ];

  const stats = [
    { label: 'Total Practice Time', value: '2h 38m', color: 'from-purple-400 to-purple-600' },
    { label: 'Average Accuracy', value: '84%', color: 'from-pink-400 to-pink-600' },
    { label: 'Streak Days', value: '7', color: 'from-blue-400 to-blue-600' },
    { label: 'Exercises Completed', value: '23', color: 'from-green-400 to-green-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
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
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Weekly Practice Time</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
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
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Accuracy Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis domain={[70, 95]} />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {[
            { title: '7-Day Streak', description: 'Practiced for 7 consecutive days', earned: true },
            { title: 'Perfect Pitch', description: 'Achieved 95% accuracy in pitch matching', earned: true },
            { title: 'Practice Master', description: 'Complete 50 exercises', earned: false },
            { title: 'Vocal Warrior', description: 'Practice for 10 hours total', earned: false },
          ].map((achievement, index) => (
            <div
              key={index}
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
                  <span className="text-white text-sm">🏆</span>
                </div>
                <div>
                  <div className={`font-medium ${achievement.earned ? 'text-yellow-800' : 'text-gray-600'}`}>
                    {achievement.title}
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
