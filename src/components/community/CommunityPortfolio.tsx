'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Star, Mic2, Share, DollarSign } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useCommunityOwnership } from '@/hooks/useCommunityOwnership';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CommunityPortfolio() {
  const { address } = useAccount();
  const { getUserContributions, getUserPortfolioValue } = useCommunityOwnership();
  const [portfolioValue, setPortfolioValue] = useState<{
    totalValue: number;
    ownedCoins: Array<{
      performanceId: string;
      percentage: number;
      contributionType: string;
      estimatedValue: number;
    }>;
  }>({ totalValue: 0, ownedCoins: [] });

  const userContributions = getUserContributions();

  useEffect(() => {
    const loadPortfolioValue = async () => {
      const value = await getUserPortfolioValue();
      setPortfolioValue(value);
    };

    if (address) {
      loadPortfolioValue();
    }
  }, [address, getUserPortfolioValue]);

  const getContributionIcon = (type: string) => {
    switch (type) {
      case 'voter': return Star;
      case 'cover_artist': return Mic2;
      case 'sharer': return Share;
      case 'original_performer': return TrendingUp;
      default: return Users;
    }
  };

  const getContributionColor = (type: string) => {
    switch (type) {
      case 'voter': return 'text-yellow-400';
      case 'cover_artist': return 'text-blue-400';
      case 'sharer': return 'text-green-400';
      case 'original_performer': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getContributionLabel = (type: string) => {
    switch (type) {
      case 'voter': return 'Voter';
      case 'cover_artist': return 'Cover Artist';
      case 'sharer': return 'Sharer';
      case 'original_performer': return 'Original Performer';
      default: return 'Contributor';
    }
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">Connect your wallet to view your community contributions</p>
      </div>
    );
  }

  const contributionStats = userContributions.reduce((stats, { contribution }) => {
    stats[contribution.contributionType] = (stats[contribution.contributionType] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {portfolioValue.totalValue.toFixed(4)} ETH
            </div>
            <div className="text-sm text-gray-400">
              From {portfolioValue.ownedCoins.length} community coins
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {userContributions.length}
            </div>
            <div className="text-sm text-gray-400">
              Across all performances
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Active Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {portfolioValue.ownedCoins.length}
            </div>
            <div className="text-sm text-gray-400">
              Community-owned assets
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Breakdown */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Contribution Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(contributionStats).map(([type, count]) => {
              const Icon = getContributionIcon(type);
              const color = getContributionColor(type);
              const label = getContributionLabel(type);
              
              return (
                <div key={type} className="text-center">
                  <div className={`w-12 h-12 ${color.replace('text-', 'bg-').replace('-400', '-500/20')} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div className="text-lg font-bold text-white">{count}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Owned Coins */}
      {portfolioValue.ownedCoins.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Community-Owned Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioValue.ownedCoins.map((coin, index) => (
                <motion.div
                  key={coin.performanceId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getContributionColor(coin.contributionType).replace('text-', 'bg-').replace('-400', '-500/20')} rounded-full flex items-center justify-center`}>
                        {React.createElement(getContributionIcon(coin.contributionType), {
                          className: `w-5 h-5 ${getContributionColor(coin.contributionType)}`
                        })}
                      </div>
                      
                      <div>
                        <div className="font-semibold text-white">
                          Performance #{coin.performanceId.slice(-6)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {getContributionLabel(coin.contributionType)} • {(coin.percentage * 100).toFixed(1)}% ownership
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-white">
                        {coin.estimatedValue.toFixed(4)} ETH
                      </div>
                      <div className="text-sm text-gray-400">
                        Estimated value
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Contributions */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userContributions.slice(0, 10).map(({ performanceId, contribution }, index) => {
              const Icon = getContributionIcon(contribution.contributionType);
              const color = getContributionColor(contribution.contributionType);
              const label = getContributionLabel(contribution.contributionType);
              
              return (
                <motion.div
                  key={`${performanceId}-${contribution.contributionType}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  
                  <div className="flex-1">
                    <div className="text-white font-medium">{label}</div>
                    <div className="text-sm text-gray-400">
                      Performance #{performanceId.slice(-6)} • {contribution.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                  
                  {contribution.metadata?.rating && (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                      {contribution.metadata.rating}⭐
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}