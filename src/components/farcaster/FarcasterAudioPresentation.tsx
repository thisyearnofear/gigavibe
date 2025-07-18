/**
 * Farcaster Audio Presentation Components
 * Optimized for mini app constraints and Farcaster social context
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Mic, 
  Zap, 
  Star,
  Users,
  Trophy,
  ExternalLink,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FarcasterAudioCardProps {
  performance: {
    id: string;
    challengeTitle: string;
    audioUrl: string;
    duration: number;
    selfRating: number;
    communityRating?: number;
    gap?: number;
    author: {
      fid: number;
      username: string;
      displayName: string;
      avatar: string;
    };
    stats: {
      likes: number;
      recasts: number;
      replies: number;
    };
    coinData?: {
      symbol: string;
      currentPrice: number;
      priceChange24h: number;
    };
  };
  variant?: 'cast' | 'frame' | 'compact';
  onOpenInApp?: () => void;
  onCast?: () => void;
}

export function FarcasterAudioCard({ 
  performance, 
  variant = 'cast',
  onOpenInApp,
  onCast 
}: FarcasterAudioCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const getRealityEmoji = (gap?: number) => {
    if (!gap) return '🎤';
    if (gap > 1) return '🤔';
    if (gap > 0) return '😅';
    if (gap > -1) return '🎯';
    return '🌟';
  };

  const getQualityColor = (rating: number) => {
    if (rating >= 9) return 'text-yellow-400';
    if (rating >= 8) return 'text-green-400';
    if (rating >= 7) return 'text-blue-400';
    return 'text-slate-400';
  };

  // Compact version for cast embeds
  if (variant === 'compact') {
    return (
      <Card className="bg-slate-900/90 border-slate-700 max-w-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 w-10 h-10 rounded-full flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white text-sm truncate">
                {performance.challengeTitle}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>by @{performance.author.username}</span>
                <span>•</span>
                <span className={getQualityColor(performance.communityRating || performance.selfRating)}>
                  {(performance.communityRating || performance.selfRating).toFixed(1)}/10
                </span>
                <span>{getRealityEmoji(performance.gap)}</span>
              </div>
            </div>
            
            <Button
              onClick={onOpenInApp}
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Frame version for Farcaster frames
  if (variant === 'frame') {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={performance.author.avatar} />
              <AvatarFallback>{performance.author.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm">
                {performance.author.displayName}
              </h3>
              <p className="text-xs text-slate-400">@{performance.author.username}</p>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
              GIGAVIBE
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h4 className="font-medium text-white">{performance.challengeTitle}</h4>
          
          {/* Audio Player */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 w-10 h-10 rounded-full"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <div className="flex-1">
              <div className="text-sm text-white mb-1">Vocal Performance</div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{Math.floor(performance.duration / 60)}:{(performance.duration % 60).toString().padStart(2, '0')}</span>
                <span>•</span>
                <span className={getQualityColor(performance.communityRating || performance.selfRating)}>
                  {(performance.communityRating || performance.selfRating).toFixed(1)}/10
                </span>
                <span>{getRealityEmoji(performance.gap)}</span>
              </div>
            </div>
          </div>

          {/* Reality Check */}
          {performance.communityRating && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-purple-400 font-bold">{performance.selfRating}</div>
                <div className="text-slate-500">Self</div>
              </div>
              <div>
                <div className="text-green-400 font-bold">{performance.communityRating}</div>
                <div className="text-slate-500">Community</div>
              </div>
              <div>
                <div className={`font-bold ${
                  performance.gap! > 0 ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                  {performance.gap! > 0 ? '+' : ''}{performance.gap!.toFixed(1)}
                </div>
                <div className="text-slate-500">Gap</div>
              </div>
            </div>
          )}

          {/* Coin Info */}
          {performance.coinData && (
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white font-medium">{performance.coinData.symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white font-bold">
                  {performance.coinData.currentPrice.toFixed(4)} ETH
                </div>
                <div className={`text-xs ${
                  performance.coinData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {performance.coinData.priceChange24h >= 0 ? '+' : ''}{performance.coinData.priceChange24h.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-700 flex gap-2">
          <Button
            onClick={onOpenInApp}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            size="sm"
          >
            <Mic className="w-4 h-4 mr-2" />
            Try Challenge
          </Button>
          <Button
            onClick={onCast}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            size="sm"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Default cast version
  return (
    <Card className="bg-slate-900/90 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={performance.author.avatar} />
            <AvatarFallback>{performance.author.displayName[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{performance.author.displayName}</h3>
                <span className="text-slate-400">@{performance.author.username}</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  GIGAVIBE
                </Badge>
              </div>
              <p className="text-slate-300 mt-1">
                Just crushed the "{performance.challengeTitle}" challenge! 🎤
              </p>
            </div>

            {/* Audio Preview */}
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 w-10 h-10 rounded-full"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1">
                  <div className="text-sm text-white mb-1">Vocal Performance</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Self-rated: {performance.selfRating}/10</span>
                    {performance.communityRating && (
                      <>
                        <span>•</span>
                        <span>Community: {performance.communityRating}/10</span>
                        <span>{getRealityEmoji(performance.gap)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={onOpenInApp}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open
                </Button>
              </div>
            </div>

            {/* Social Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{performance.stats.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{performance.stats.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                <span>{performance.stats.recasts}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized component for Farcaster cast creation
export function FarcasterCastComposer({ 
  performance,
  onPublish 
}: {
  performance: any;
  onPublish: (castData: any) => void;
}) {
  const [castText, setCastText] = useState('');

  useEffect(() => {
    const defaultText = `Just crushed the "${performance.challengeTitle}" challenge! 🎤 

Self-rated: ${performance.selfRating}/10 ${performance.communityRating ? `| Community: ${performance.communityRating}/10` : ''}

${performance.gap ? `Reality gap: ${performance.gap > 0 ? '+' : ''}${performance.gap.toFixed(1)} ${performance.gap > 1 ? '🤔' : performance.gap > 0 ? '😅' : performance.gap > -1 ? '🎯' : '🌟'}` : ''}

Try the challenge yourself! 👇`;
    
    setCastText(defaultText);
  }, [performance]);

  const handlePublish = () => {
    const castData = {
      text: castText,
      embeds: [
        {
          url: `${window.location.origin}/challenge/${performance.challengeId}?ref=farcaster`
        }
      ],
      channelId: 'gigavibe' // Assuming we have a GIGAVIBE channel
    };
    
    onPublish(castData);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={castText}
        onChange={(e) => setCastText(e.target.value)}
        className="w-full h-32 p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
        placeholder="Share your performance..."
        maxLength={320}
      />
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {castText.length}/320 characters
        </span>
        
        <Button
          onClick={handlePublish}
          disabled={!castText.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Cast Performance
        </Button>
      </div>
    </div>
  );
}