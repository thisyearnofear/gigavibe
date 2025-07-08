'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart, Activity } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useZoraLeaderboards } from '@/hooks/useZoraLeaderboards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PerformanceCoinCard from './PerformanceCoinCard';

export default function PortfolioDashboard() {
  const { address } = useAccount();
  const { userPortfolio, loading } = useZoraLeaderboards();

  if (!address) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">Connect your wallet to view your performance coin portfolio</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!userPortfolio || userPortfolio.coins.length === 0) {
    return (
      <div className="text-center py-12">
        <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Coins Yet</h3>
        <p className="text-gray-400">Start trading performance coins to build your portfolio</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {userPortfolio.totalValue.toFixed(4)} ETH
            </div>
            <div className="text-sm text-gray-400">
              ≈ ${(userPortfolio.totalValue * 3000).toFixed(2)} USD
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              24h P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              userPortfolio.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {userPortfolio.totalGainLoss >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              {userPortfolio.totalGainLoss >= 0 ? '+' : ''}{userPortfolio.totalGainLoss.toFixed(4)} ETH
            </div>
            <div className={`text-sm ${
              userPortfolio.totalGainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {userPortfolio.totalGainLossPercent >= 0 ? '+' : ''}{userPortfolio.totalGainLossPercent.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {userPortfolio.coins.length}
            </div>
            <div className="text-sm text-gray-400">
              Performance Coins
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Your Holdings</h3>
        <div className="space-y-4">
          {userPortfolio.coins.map((coin, index) => (
            <motion.div
              key={coin.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PerformanceCoinCard
                coin={coin}
                rank={index + 1}
                category="portfolio"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}