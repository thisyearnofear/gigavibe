'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Users, Trophy, Zap } from 'lucide-react';
import VocalRealityFlow from './VocalRealityFlow';
import PeerJudging from './PeerJudging';
import FarcasterIntegration from './FarcasterIntegration';
import MarketLeaderboard from './market/MarketLeaderboard';
import DiscoveryFeed from './discovery/DiscoveryFeed';
import { useFarcasterIntegration } from '@/hooks/useFarcasterIntegration';

type MainScreen = 'challenge' | 'discovery' | 'judging' | 'leaderboard';

export default function MainNavigation() {
  const [activeScreen, setActiveScreen] = useState<MainScreen>('discovery');
  const { userInfo, notifyNewChallenge } = useFarcasterIntegration();

  const navItems = [
    { id: 'challenge' as MainScreen, label: 'Sing', icon: Mic, description: 'Take a challenge' },
    { id: 'discovery' as MainScreen, label: 'Discover', icon: Zap, description: 'For You feed' },
    { id: 'judging' as MainScreen, label: 'Judge', icon: Users, description: 'Rate others' },
    { id: 'leaderboard' as MainScreen, label: 'Market', icon: Trophy, description: 'Performance coins' }
  ];

  const renderScreen = () => {
    switch (activeScreen) {
      case 'challenge':
        return <VocalRealityFlow />;
      case 'discovery':
        return <DiscoveryFeed feedType="foryou" />;
      case 'judging':
        return <PeerJudging />;
      case 'leaderboard':
        return <MarketLeaderboard />;
      default:
        return <DiscoveryFeed feedType="foryou" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative">
      {/* Main Content */}
      <div className="pb-20">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 px-4 py-3 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.2 : 1,
                    rotate: isActive ? [0, 10, -10, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 bg-purple-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}

// Simple Leaderboard Screen
function LeaderboardScreen() {
  const mockLeaderboard = [
    { rank: 1, name: 'Anonymous Singer', avgRating: 4.8, challenges: 12, badge: '🏆' },
    { rank: 2, name: 'Mystery Vocalist', avgRating: 4.6, challenges: 8, badge: '🥈' },
    { rank: 3, name: 'Secret Star', avgRating: 4.4, challenges: 15, badge: '🥉' },
    { rank: 4, name: 'Hidden Talent', avgRating: 4.2, challenges: 6, badge: '⭐' },
    { rank: 5, name: 'Vocal Warrior', avgRating: 4.0, challenges: 20, badge: '🎤' }
  ];

  return (
    <div className="min-h-screen p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8">Top Performers</h1>
        
        <div className="space-y-4 max-w-md mx-auto">
          {mockLeaderboard.map((user, index) => (
            <motion.div
              key={user.rank}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{user.badge}</div>
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-gray-400">
                      {user.challenges} challenges completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-purple-400">
                    {user.avgRating}⭐
                  </div>
                  <div className="text-xs text-gray-400">avg rating</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-8 p-6 bg-white/5 rounded-2xl max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-2">Want to climb the ranks?</h3>
          <p className="text-gray-300 text-sm">
            Complete more challenges and get better community ratings to move up!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}