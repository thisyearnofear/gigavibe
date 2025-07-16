'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Coins, Users, Trophy, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOnboarding } from '@/contexts/OnboardingContext';

const DEMO_COINS = [
  {
    id: 'VOCAL-001',
    name: 'Sarah\'s Bohemian Rhapsody',
    price: 0.45,
    change: 23.5,
    volume: 1250,
    holders: 89,
    isViral: true,
    ownership: {
      performer: 60,
      voters: 25,
      covers: 10,
      sharers: 5
    }
  },
  {
    id: 'SING-042',
    name: 'Mike\'s Birthday Song',
    price: 0.12,
    change: -5.2,
    volume: 340,
    holders: 23,
    isViral: false,
    ownership: {
      performer: 60,
      voters: 25,
      covers: 10,
      sharers: 5
    }
  },
  {
    id: 'EPIC-123',
    name: 'Queen\'s Amazing Grace',
    price: 0.78,
    change: 45.8,
    volume: 2100,
    holders: 156,
    isViral: true,
    ownership: {
      performer: 60,
      voters: 25,
      covers: 10,
      sharers: 5
    }
  }
];

export default function MarketIntroStep() {
  const [selectedCoin, setSelectedCoin] = useState<typeof DEMO_COINS[0] | null>(null);
  const [hasExplored, setHasExplored] = useState(false);
  const { markStepCompleted } = useOnboarding();

  const handleCoinSelect = (coin: typeof DEMO_COINS[0]) => {
    setSelectedCoin(coin);
    if (!hasExplored) {
      setHasExplored(true);
      markStepCompleted('market-intro');
    }
  };

  const canContinue = hasExplored;

  return (
    <OnboardingLayout
      title="Performance Coin Market 💰"
      description="Where viral performances become tradeable community-owned assets"
      nextLabel="Complete Onboarding"
      nextDisabled={!canContinue}
    >
      <div className="space-y-6 max-w-md mx-auto">
        {/* Market Concept */}
        <Card className="bg-yellow-600/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Coins className="w-6 h-6 text-yellow-400" />
              <h4 className="font-semibold text-white">How It Works</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div>🎤 <strong>Viral performances</strong> become coins</div>
              <div>👥 <strong>Community contributors</strong> share ownership</div>
              <div>📈 <strong>Trade coins</strong> based on popularity</div>
              <div>💰 <strong>Earn from</strong> your contributions</div>
            </div>
          </CardContent>
        </Card>

        {/* Coin List */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold">Trending Performance Coins</h4>
          {DEMO_COINS.map((coin) => (
            <motion.div
              key={coin.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-colors ${
                  selectedCoin?.id === coin.id 
                    ? 'bg-purple-600/30 border-purple-500' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => handleCoinSelect(coin)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {coin.id.split('-')[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{coin.id}</p>
                        <p className="text-gray-400 text-xs">{coin.name}</p>
                        {coin.isViral && (
                          <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded">
                            🔥 VIRAL
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-white font-bold">${coin.price.toFixed(2)}</p>
                      <div className={`flex items-center gap-1 text-xs ${
                        coin.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {coin.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        <span>{Math.abs(coin.change).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Selected Coin Details */}
        {selectedCoin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
              <CardContent className="p-6">
                <h4 className="text-white font-semibold mb-4 text-center">
                  {selectedCoin.name} Details
                </h4>
                
                {/* Market Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">24h Volume</p>
                    <p className="text-white font-bold">${selectedCoin.volume}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Holders</p>
                    <p className="text-white font-bold">{selectedCoin.holders}</p>
                  </div>
                </div>

                {/* Ownership Distribution */}
                <div className="space-y-3">
                  <h5 className="text-white font-semibold text-sm">Community Ownership</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Performer</span>
                      <span className="text-white font-semibold">{selectedCoin.ownership.performer}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Voters</span>
                      <span className="text-white font-semibold">{selectedCoin.ownership.voters}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Cover Artists</span>
                      <span className="text-white font-semibold">{selectedCoin.ownership.covers}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Sharers</span>
                      <span className="text-white font-semibold">{selectedCoin.ownership.sharers}%</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-green-500 text-green-400 hover:bg-green-500/20"
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Buy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-red-500 text-red-400 hover:bg-red-500/20"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Sell
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
              <CardContent className="p-4">
                <h5 className="font-semibold text-white mb-2">💡 Key Insights</h5>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>• Contributors earn from viral performances</div>
                  <div>• Fair distribution rewards all participants</div>
                  <div>• Market value reflects community engagement</div>
                  <div>• Your votes and shares have real value</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Completion Message */}
        {canContinue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">
                🎉 <strong>Market Mastered!</strong> You now understand how performances become valuable community assets.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </OnboardingLayout>
  );
}