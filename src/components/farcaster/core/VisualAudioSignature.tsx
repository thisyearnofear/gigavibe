/**
 * Visual Audio Signature Component
 * Reusable component that creates visual representations of audio quality
 * Used across cast cards, frames, and mini app contexts
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Zap, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PerformanceQuality, VisualSignature } from '@/types/farcaster.types';

interface VisualAudioSignatureProps {
  rating: number;
  variant?: 'full' | 'compact' | 'icon-only' | 'badge-only';
  showLabel?: boolean;
  showEmoji?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VisualAudioSignature({
  rating,
  variant = 'full',
  showLabel = true,
  showEmoji = true,
  animated = true,
  size = 'md'
}: VisualAudioSignatureProps) {
  
  // Determine quality tier based on rating
  const getQualityTier = (rating: number): PerformanceQuality => {
    if (rating >= 9.5) return 'legendary';
    if (rating >= 8.5) return 'epic';
    if (rating >= 7.5) return 'rare';
    return 'common';
  };

  // Get visual configuration for quality tier
  const getVisualConfig = (quality: PerformanceQuality): VisualSignature => {
    const configs: Record<PerformanceQuality, VisualSignature> = {
      legendary: {
        quality: 'legendary',
        gradient: 'from-yellow-400 via-orange-500 to-red-500',
        icon: 'Crown',
        emoji: '👑',
        glow: 'shadow-yellow-500/50',
        border: 'border-yellow-500/50',
        particles: 12
      },
      epic: {
        quality: 'epic',
        gradient: 'from-purple-400 via-pink-500 to-purple-600',
        icon: 'Star',
        emoji: '⭐',
        glow: 'shadow-purple-500/50',
        border: 'border-purple-500/50',
        particles: 8
      },
      rare: {
        quality: 'rare',
        gradient: 'from-blue-400 via-gigavibe-500 to-purple-500',
        icon: 'Zap',
        emoji: '🎯',
        glow: 'shadow-gigavibe-500/50',
        border: 'border-gigavibe-500/50',
        particles: 6
      },
      common: {
        quality: 'common',
        gradient: 'from-slate-400 via-slate-500 to-slate-600',
        icon: 'Mic',
        emoji: '🎤',
        glow: 'shadow-slate-500/30',
        border: 'border-slate-500/30',
        particles: 4
      }
    };
    return configs[quality];
  };

  const quality = getQualityTier(rating);
  const config = getVisualConfig(quality);
  
  // Get icon component
  const getIconComponent = () => {
    switch (config.icon) {
      case 'Crown': return Crown;
      case 'Star': return Star;
      case 'Zap': return Zap;
      case 'Mic': return Mic;
      default: return Mic;
    }
  };

  const IconComponent = getIconComponent();

  // Size configurations
  const sizeConfigs = {
    sm: {
      icon: 'w-3 h-3',
      container: 'w-6 h-6',
      text: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5'
    },
    md: {
      icon: 'w-4 h-4',
      container: 'w-8 h-8',
      text: 'text-sm',
      badge: 'text-xs px-2 py-1'
    },
    lg: {
      icon: 'w-6 h-6',
      container: 'w-12 h-12',
      text: 'text-base',
      badge: 'text-sm px-3 py-1.5'
    }
  };

  const sizeConfig = sizeConfigs[size];

  // Badge-only variant
  if (variant === 'badge-only') {
    return (
      <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 ${sizeConfig.badge}`}>
        {showEmoji && <span className="mr-1">{config.emoji}</span>}
        {showLabel && quality.charAt(0).toUpperCase() + quality.slice(1)}
      </Badge>
    );
  }

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <motion.div
        className={`${sizeConfig.container} bg-gradient-to-r ${config.gradient} rounded-full flex items-center justify-center ${config.glow}`}
        animate={animated ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <IconComponent className={`${sizeConfig.icon} text-white`} />
      </motion.div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          className={`${sizeConfig.container} bg-gradient-to-r ${config.gradient} rounded-full flex items-center justify-center`}
          animate={animated ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <IconComponent className={`${sizeConfig.icon} text-white`} />
        </motion.div>
        {showLabel && (
          <span className={`font-medium text-white ${sizeConfig.text}`}>
            {rating.toFixed(1)}
          </span>
        )}
        {showEmoji && (
          <span className={sizeConfig.text}>{config.emoji}</span>
        )}
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className={`${sizeConfig.container} bg-gradient-to-r ${config.gradient} rounded-full flex items-center justify-center ${config.glow} shadow-lg`}
        animate={animated ? { 
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 20px rgba(99, 102, 241, 0.3)',
            '0 0 30px rgba(99, 102, 241, 0.5)',
            '0 0 20px rgba(99, 102, 241, 0.3)'
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <IconComponent className={`${sizeConfig.icon} text-white`} />
      </motion.div>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-white ${sizeConfig.text}`}>
            {rating.toFixed(1)}/10
          </span>
          {showEmoji && (
            <span className={sizeConfig.text}>{config.emoji}</span>
          )}
        </div>
        {showLabel && (
          <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 w-fit ${sizeConfig.badge}`}>
            {quality.charAt(0).toUpperCase() + quality.slice(1)}
          </Badge>
        )}
      </div>
    </div>
  );
}

// Utility function to get quality emoji (for use in text)
export function getQualityEmoji(rating: number): string {
  if (rating >= 9.5) return '👑';
  if (rating >= 8.5) return '⭐';
  if (rating >= 7.5) return '🎯';
  return '🎤';
}

// Utility function to get quality color class
export function getQualityColorClass(rating: number): string {
  if (rating >= 9.5) return 'text-yellow-400';
  if (rating >= 8.5) return 'text-purple-400';
  if (rating >= 7.5) return 'text-gigavibe-400';
  return 'text-slate-400';
}

// Utility function to get quality gradient class
export function getQualityGradientClass(rating: number): string {
  if (rating >= 9.5) return 'from-yellow-400 via-orange-500 to-red-500';
  if (rating >= 8.5) return 'from-purple-400 via-pink-500 to-purple-600';
  if (rating >= 7.5) return 'from-blue-400 via-gigavibe-500 to-purple-500';
  return 'from-slate-400 via-slate-500 to-slate-600';
}