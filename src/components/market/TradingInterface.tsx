'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Address, parseEther, formatEther } from 'viem';
import { useAccount, useBalance, useWalletClient } from 'wagmi';
import { PerformanceCoin } from '@/lib/zora/types';
import { useZoraLeaderboards } from '@/hooks/useZoraLeaderboards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TradingInterfaceProps {
  coin: PerformanceCoin;
  onClose: () => void;
}

export default function TradingInterface({ coin, onClose }: TradingInterfaceProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(5); // 5% default slippage
  const [isTrading, setIsTrading] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [estimatedOutput, setEstimatedOutput] = useState<string>('');

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: ethBalance } = useBalance({ address });
  const { tradePerformanceCoin, userPortfolio } = useZoraLeaderboards();

  // Calculate estimated output
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const inputAmount = parseFloat(amount);
      if (tradeType === 'buy') {
        // Estimate tokens received for ETH input
        const tokensReceived = inputAmount / coin.marketData.price;
        setEstimatedOutput(`~${tokensReceived.toFixed(4)} ${coin.symbol}`);
      } else {
        // Estimate ETH received for token input
        const ethReceived = inputAmount * coin.marketData.price;
        setEstimatedOutput(`~${ethReceived.toFixed(6)} ETH`);
      }
    } else {
      setEstimatedOutput('');
    }
  }, [amount, tradeType, coin.marketData.price, coin.symbol]);

  const handleTrade = async () => {
    if (!address || !walletClient || !amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please connect wallet and enter valid amount');
      return;
    }

    setIsTrading(true);
    setTradeStatus('pending');
    setErrorMessage('');

    try {
      const amountIn = parseEther(amount);
      
      const receipt = await tradePerformanceCoin(
        coin.address,
        tradeType,
        amountIn,
        address,
        walletClient,
        slippage / 100 // Convert percentage to decimal
      );

      console.log('Trade successful:', receipt);
      setTradeStatus('success');
      
      // Reset form after successful trade
      setTimeout(() => {
        setAmount('');
        setTradeStatus('idle');
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Trade failed:', error);
      setTradeStatus('error');
      setErrorMessage(error.message || 'Trade failed. Please try again.');
    } finally {
      setIsTrading(false);
    }
  };

  const getUserCoinBalance = () => {
    if (!userPortfolio) return '0';
    const userCoin = userPortfolio.coins.find(c => c.address === coin.address);
    return userCoin ? '1.0' : '0'; // Simplified - in real app, get actual balance
  };

  const getMaxAmount = () => {
    if (tradeType === 'buy') {
      return ethBalance ? formatEther(ethBalance.value) : '0';
    } else {
      return getUserCoinBalance();
    }
  };

  const setMaxAmount = () => {
    const max = getMaxAmount();
    setAmount(max);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Trade {coin.symbol}</h2>
            <p className="text-sm text-gray-400">{coin.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Coin Info */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Current Price</span>
              <span className="font-bold text-white">{coin.marketData.price.toFixed(6)} ETH</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">24h Change</span>
              <div className={`flex items-center gap-1 ${
                coin.marketData.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {coin.marketData.priceChangePercent24h >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {coin.marketData.priceChangePercent24h.toFixed(1)}%
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Your Balance</span>
              <span className="text-white">{getUserCoinBalance()} {coin.symbol}</span>
            </div>
          </CardContent>
        </Card>

        {/* Trade Type Toggle */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTradeType('buy')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all min-h-[44px] touch-manipulation flex items-center justify-center ${
              tradeType === 'buy'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white active:bg-gray-700'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setTradeType('sell')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all min-h-[44px] touch-manipulation flex items-center justify-center ${
              tradeType === 'sell'
                ? 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-white active:bg-gray-700'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">
              Amount ({tradeType === 'buy' ? 'ETH' : coin.symbol})
            </label>
            <button
              onClick={setMaxAmount}
              className="text-sm text-purple-400 hover:text-purple-300 px-2 py-1 rounded min-h-[32px] touch-manipulation"
            >
              Max: {getMaxAmount()}
            </button>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="bg-gray-800 border-gray-700 text-white pr-16"
              step="0.000001"
              min="0"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              {tradeType === 'buy' ? 'ETH' : coin.symbol}
            </div>
          </div>
        </div>

        {/* Estimated Output */}
        {estimatedOutput && (
          <div className="bg-gray-800 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">You'll receive</span>
              <span className="text-white font-semibold">{estimatedOutput}</span>
            </div>
          </div>
        )}

        {/* Slippage Settings */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">Slippage Tolerance</label>
          <div className="flex gap-2">
            {[1, 3, 5, 10].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`px-4 py-3 rounded-lg text-sm transition-all min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center ${
                  slippage === value
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white active:bg-gray-700'
                }`}
              >
                {value}%
              </button>
            ))}
            <Input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value) || 5)}
              className="w-16 h-8 bg-gray-800 border-gray-700 text-white text-sm"
              min="0.1"
              max="50"
              step="0.1"
            />
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Trade Button */}
        <Button
          onClick={handleTrade}
          disabled={!address || !amount || parseFloat(amount) <= 0 || isTrading}
          className={`w-full py-3 font-semibold text-white rounded-xl transition-all ${
            tradeType === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isTrading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : tradeStatus === 'success' ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Trade Successful!
            </div>
          ) : (
            `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${coin.symbol}`
          )}
        </Button>

        {/* Wallet Connection */}
        {!address && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">Connect your wallet to start trading</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}