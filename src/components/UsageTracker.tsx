
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Zap, Clock, TrendingUp } from 'lucide-react';

interface UsageStats {
  totalCost: number;
  totalTokens: number;
  avgResponseTime: number;
  requestCount: number;
  modelBreakdown: Array<{
    model: string;
    cost: number;
    tokens: number;
    count: number;
  }>;
}

const COLORS = ['#10B981', '#8B5CF6', '#3B82F6'];

const UsageTracker = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchUsageStats();
  }, [timeRange]);

  const fetchUsageStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('user_id', user.id)
        .gte('request_time', startDate.toISOString())
        .eq('status', 'success');

      if (error) throw error;

      if (data) {
        const totalCost = data.reduce((sum, item) => sum + Number(item.estimated_cost), 0);
        const totalTokens = data.reduce((sum, item) => sum + item.total_tokens, 0);
        const avgResponseTime = data.length > 0 
          ? data.reduce((sum, item) => sum + (item.response_time_ms || 0), 0) / data.length
          : 0;

        const modelBreakdown = ['openai', 'anthropic', 'gemini'].map(model => {
          const modelData = data.filter(item => item.model === model);
          return {
            model,
            cost: modelData.reduce((sum, item) => sum + Number(item.estimated_cost), 0),
            tokens: modelData.reduce((sum, item) => sum + item.total_tokens, 0),
            count: modelData.length
          };
        });

        setStats({
          totalCost,
          totalTokens,
          avgResponseTime,
          requestCount: data.length,
          modelBreakdown
        });
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  if (!stats) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/50">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Usage Analytics</h3>
        <div className="flex gap-2">
          {['1d', '7d', '30d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
            >
              {range === '1d' ? '24h' : range === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Total Cost</span>
          </div>
          <div className="text-xl font-semibold text-gray-800">
            ${stats.totalCost.toFixed(4)}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Total Tokens</span>
          </div>
          <div className="text-xl font-semibold text-gray-800">
            {stats.totalTokens.toLocaleString()}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">Avg Response</span>
          </div>
          <div className="text-xl font-semibold text-gray-800">
            {Math.round(stats.avgResponseTime)}ms
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">Requests</span>
          </div>
          <div className="text-xl font-semibold text-gray-800">
            {stats.requestCount}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Model Usage Bar Chart */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
          <h4 className="font-medium text-gray-800 mb-4">Model Usage</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.modelBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Distribution Pie Chart */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
          <h4 className="font-medium text-gray-800 mb-4">Cost Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.modelBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="cost"
                nameKey="model"
              >
                {stats.modelBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(4)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UsageTracker;
