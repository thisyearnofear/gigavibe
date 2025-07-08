'use client';

import { useState, useEffect, useCallback } from 'react';
import { Address } from 'viem';
import { MarketLeaderboards, PerformanceCoin, TradingMetrics } from '@/lib/zora/types';
import { MarketDataService } from '@/lib/zora/MarketDataService';
import { ZoraService } from '@/lib/zora/ZoraService';

export function useZoraLeaderboards() {
  const [leaderboards, setLeaderboards] = useState<MarketLeaderboards | null>(null);
  const [tradingMetrics, setTradingMetrics] = useState<TradingMetrics | null>(null);
  const [userPortfolio, setUserPortfolio] = useState<{
    coins: PerformanceCoin[];
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const marketDataService = MarketDataService.getInstance();
  const zoraService = ZoraService.getInstance();

  const fetchLeaderboards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [leaderboardData, metricsData] = await Promise.all([
        marketDataService.getMarketLeaderboards(),
        marketDataService.getTradingMetrics()
      ]);
      
      setLeaderboards(leaderboardData);
      setTradingMetrics(metricsData);
    } catch (err) {
      console.error('Failed to fetch leaderboards:', err);
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, [marketDataService]);

  const fetchUserPortfolio = useCallback(async (userAddress: Address) => {
    try {
      const portfolio = await marketDataService.getUserPortfolio(userAddress);
      setUserPortfolio(portfolio);
    } catch (err) {
      console.error('Failed to fetch user portfolio:', err);
    }
  }, [marketDataService]);

  const searchCoins = useCallback(async (query: string): Promise<PerformanceCoin[]> => {
    try {
      return await marketDataService.searchPerformanceCoins(query);
    } catch (err) {
      console.error('Failed to search coins:', err);
      return [];
    }
  }, [marketDataService]);

  const tradePerformanceCoin = useCallback(async (
    coinAddress: Address,
    action: 'buy' | 'sell',
    amountIn: bigint,
    userAddress: Address,
    walletClient: any,
    slippage?: number
  ) => {
    try {
      const receipt = await zoraService.tradePerformanceCoin(
        coinAddress,
        action,
        amountIn,
        userAddress,
        walletClient,
        slippage
      );
      
      // Refresh data after successful trade
      await fetchLeaderboards();
      if (userAddress) {
        await fetchUserPortfolio(userAddress);
      }
      
      return receipt;
    } catch (err) {
      console.error('Trade failed:', err);
      throw err;
    }
  }, [zoraService, fetchLeaderboards, fetchUserPortfolio]);

  const createPerformanceCoin = useCallback(async (
    performance: any,
    walletClient: any
  ) => {
    try {
      const result = await zoraService.createPerformanceCoin(performance, walletClient);
      
      if (result) {
        // Refresh leaderboards after coin creation
        await fetchLeaderboards();
      }
      
      return result;
    } catch (err) {
      console.error('Failed to create performance coin:', err);
      throw err;
    }
  }, [zoraService, fetchLeaderboards]);

  const refreshData = useCallback(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards]);

  useEffect(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards]);

  return {
    // Data
    leaderboards,
    tradingMetrics,
    userPortfolio,
    
    // State
    loading,
    error,
    
    // Actions
    fetchUserPortfolio,
    searchCoins,
    tradePerformanceCoin,
    createPerformanceCoin,
    refreshData
  };
}