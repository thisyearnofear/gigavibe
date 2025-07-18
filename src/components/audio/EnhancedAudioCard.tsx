/**
 * Enhanced Audio Card Component
 * Distinctive audio presentation that embodies GIGAVIBE's ethos
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  Mic, 
  Zap, 
  Star,
  TrendingUp,
  Users,
  Trophy,
  Coins,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { audioManager } from '@/services/AudioManager';

interface AudioCardProps {
  performance: {
    id: string;
    challengeTitle: string;
    audioUrl: string;
    duration: number;
    selfRating: number;
    communityRating?: number;
    gap?: number;
    viralScore?: number;
    author: {
      username: string;
      displayName: string;
      avatar: string;
      isVerified?: boolean;
    };
    stats: {
      likes: number;
      comments: number;
      shares: number;
    };
    coinData?: {
      address: string;
      currentPrice: number;
      priceChange24h: number;
      holders: number;
    };
  };
  variant?: 'feed' | 'market' | 'compact';
  onPlay?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onTrade?: () => void;
}

export default function EnhancedAudioCard({ 
  performance, 
  variant = 'feed',
  onPlay,
  onLike,
  onComment,
  onShare,
  onTrade
}: AudioCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate waveform visualization based on audio characteristics
  useEffect(() => {
    // Create pseudo-waveform based on performance characteristics
    const generateWaveform = () => {
      const points = 60;
      const baseAmplitude = performance.communityRating ? performance.communityRating / 10 : 0.5;
      const viralBoost = performance.viralScore ? performance.viralScore / 100 : 0;
      
      return Array.from({ length: points }, (_, i) => {
        const progress = i / points;
        const frequency = Math.sin(progress * Math.PI * 4) * 0.3;
        const randomness = (Math.random() - 0.5) * 0.2;
        const amplitude = (baseAmplitude + viralBoost * 0.3) * (0.5 + frequency + randomness);
        return Math.max(0.1, Math.min(1, amplitude));
      });
    };

    setWaveformData(generateWaveform());
  }, [performance]);

  // Audio visualization during playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Simulate audio level based on waveform
      const progress = currentTime / performance.duration;
      const waveformIndex = Math.floor(progress * waveformData.length);
      const level = waveformData[waveformIndex] || 0;
      setAudioLevel(level * 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, waveformData, performance.duration]);

  // Draw dynamic waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Create gradient based on performance quality
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    const quality = performance.communityRating || performance.selfRating;
    
    if (quality >= 8.5) {
      // Gold gradient for excellent performances
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(0.5, '#f59e0b');
      gradient.addColorStop(1, '#d97706');
    } else if (quality >= 7) {
      // GIGAVIBE gradient for good performances
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#ec4899');
    } else {
      // Muted gradient for lower performances
      gradient.addColorStop(0, '#64748b');
      gradient.addColorStop(0.5, '#475569');
      gradient.addColorStop(1, '#334155');
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = isPlaying ? 3 : 2;
    ctx.lineCap = 'round';

    // Draw waveform
    ctx.beginPath();
    const barWidth = width / waveformData.length;
    
    waveformData.forEach((amplitude, i) => {
      const x = i * barWidth;
      const barHeight = amplitude * height * 0.8;
      const y = (height - barHeight) / 2;
      
      // Highlight current position during playback
      const progress = currentTime / performance.duration;
      const isCurrentPosition = Math.abs(i / waveformData.length - progress) < 0.02;
      
      if (isCurrentPosition && isPlaying) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isPlaying ? 3 : 2;
      }
      
      ctx.beginPath();
      ctx.moveTo(x, height / 2);
      ctx.lineTo(x, y);
      ctx.moveTo(x, height / 2);
      ctx.lineTo(x, y + barHeight);
      ctx.stroke();
    });

    // Add glow effect during playback
    if (isPlaying) {
      ctx.shadowColor = quality >= 8.5 ? '#fbbf24' : '#6366f1';
      ctx.shadowBlur = 8;
      ctx.stroke();
    }
  }, [waveformData, isPlaying, currentTime, performance]);

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        audioManager.stop();
        setIsPlaying(false);
      } else {
        await audioManager.playAudio(performance.audioUrl, 'recording', {
          volume: 0.8,
          onEnded: () => setIsPlaying(false),
          onError: () => setIsPlaying(false)
        });
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      setIsPlaying(false);
    }
  };

  const getRealityGapEmoji = (gap?: number) => {
    if (!gap) return '🎤';
    if (gap > 2) return '🤔'; // Overconfident
    if (gap > 0.5) return '😅'; // Slightly high
    if (gap > -0.5) return '🎯'; // Spot on
    return '🌟'; // Underrated
  };

  const getQualityBadge = () => {
    const rating = performance.communityRating || performance.selfRating;
    if (rating >= 9) return { label: 'Legendary', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' };
    if (rating >= 8.5) return { label: 'Excellent', color: 'bg-gradient-to-r from-green-400 to-emerald-500' };
    if (rating >= 7.5) return { label: 'Great', color: 'bg-gradient-to-r from-gigavibe-500 to-purple-500' };
    if (rating >= 6.5) return { label: 'Good', color: 'bg-gradient-to-r from-blue-400 to-indigo-500' };
    return { label: 'Learning', color: 'bg-gradient-to-r from-slate-400 to-slate-500' };
  };

  const qualityBadge = getQualityBadge();

  if (variant === 'compact') {
    return (
      <Card className="gigavibe-glass-dark border-gigavibe-500/20 hover:border-gigavibe-400/40 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePlayPause}
              size="sm"
              className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0 w-10 h-10 rounded-full"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">{performance.challengeTitle}</h4>
              <p className="text-sm text-slate-400 truncate">by {performance.author.displayName}</p>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-gigavibe-400">
                {performance.communityRating?.toFixed(1) || performance.selfRating.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">
                {getRealityGapEmoji(performance.gap)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className="gigavibe-glass-dark border-gigavibe-500/20 hover:border-gigavibe-400/40 transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={performance.author.avatar} />
                  <AvatarFallback>{performance.author.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{performance.author.displayName}</h3>
                    {performance.author.isVerified && (
                      <Star className="w-4 h-4 text-gigavibe-400 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400">@{performance.author.username}</p>
                </div>
              </div>
              
              <Badge className={`${qualityBadge.color} text-white border-0`}>
                {qualityBadge.label}
              </Badge>
            </div>

            {/* Challenge Info */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-1">{performance.challengeTitle}</h4>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Duration: {Math.floor(performance.duration / 60)}:{(performance.duration % 60).toString().padStart(2, '0')}</span>
                {performance.viralScore && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>{performance.viralScore}% Viral</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="px-6 pb-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handlePlayPause}
                  className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0 w-12 h-12 rounded-full"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Performance</span>
                    <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(performance.duration / 60)}:{(performance.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                  
                  {/* Waveform Visualization */}
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={40}
                      className="w-full h-10 rounded cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const progress = x / rect.width;
                        setCurrentTime(progress * performance.duration);
                      }}
                    />
                    {isPlaying && (
                      <motion.div
                        className="absolute top-0 left-0 w-1 h-full bg-white rounded"
                        animate={{ x: (currentTime / performance.duration) * 300 }}
                        transition={{ duration: 0.1 }}
                      />
                    )}
                  </div>
                </div>
                
                {isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Volume2 className="w-5 h-5 text-gigavibe-400" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Reality Check */}
          {performance.communityRating && (
            <div className="px-6 pb-4">
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-white">Reality Check</h5>
                  <span className="text-2xl">{getRealityGapEmoji(performance.gap)}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gigavibe-400">{performance.selfRating}</div>
                    <div className="text-xs text-slate-400">Self Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{performance.communityRating}</div>
                    <div className="text-xs text-slate-400">Community</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${
                      performance.gap! > 1 ? 'text-red-400' : 
                      performance.gap! > 0 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {performance.gap! > 0 ? '+' : ''}{performance.gap!.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-400">Gap</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coin Data */}
          {performance.coinData && variant === 'market' && (
            <div className="px-6 pb-4">
              <div className="bg-gradient-to-r from-gigavibe-500/10 to-purple-500/10 rounded-lg p-4 border border-gigavibe-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-gigavibe-400" />
                    <span className="font-semibold text-white">Performance Coin</span>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    performance.coinData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">
                      {performance.coinData.priceChange24h >= 0 ? '+' : ''}{performance.coinData.priceChange24h.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-white font-medium">{performance.coinData.currentPrice.toFixed(4)} ETH</div>
                    <div className="text-slate-400">Price</div>
                  </div>
                  <div>
                    <div className="text-white font-medium">{performance.coinData.holders}</div>
                    <div className="text-slate-400">Holders</div>
                  </div>
                  <div>
                    <Button
                      onClick={onTrade}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                    >
                      Trade
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Actions */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onLike}
                  className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{performance.stats.likes}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onComment}
                  className="flex items-center gap-2 text-slate-400 hover:text-gigavibe-400 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{performance.stats.comments}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onShare}
                  className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">{performance.stats.shares}</span>
                </motion.button>
              </div>
              
              {performance.coinData && (
                <Button
                  onClick={onTrade}
                  size="sm"
                  className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0"
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Trade Coin
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}