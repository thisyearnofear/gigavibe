/**
 * Reality Gap Display Component
 * Reusable component for showing self vs community rating gaps
 * Core to GIGAVIBE's authenticity-first philosophy
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RealityGapDisplay } from '@/types/farcaster.types';

interface RealityGapDisplayProps {
  selfRating: number;
  communityRating?: number;
  variant?: 'full' | 'compact' | 'emoji-only' | 'minimal';
  showDescription?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RealityGapDisplayComponent({
  selfRating,
  communityRating,
  variant = 'full',
  showDescription = true,
  animated = true,
  size = 'md'
}: RealityGapDisplayProps) {
  
  // Calculate gap and get display configuration
  const getGapConfig = (selfRating: number, communityRating?: number): RealityGapDisplay => {
    if (!communityRating) {
      return {
        gap: 0,
        emoji: '🎤',
        label: 'Pending',
        color: 'text-slate-400',
        description: 'Waiting for community rating'
      };
    }

    const gap = selfRating - communityRating;
    
    if (gap > 2) {
      return {
        gap,
        emoji: '🤔',
        label: 'Overconfident',
        color: 'text-red-400',
        description: 'Thought I was better than I was'
      };
    }
    
    if (gap > 0.5) {
      return {
        gap,
        emoji: '😅',
        label: 'Slightly High',
        color: 'text-yellow-400',
        description: 'Pretty close to reality'
      };
    }
    
    if (gap > -0.5) {
      return {
        gap,
        emoji: '🎯',
        label: 'Spot On',
        color: 'text-green-400',
        description: 'Nailed the self-assessment'
      };
    }
    
    return {
      gap,
      emoji: '🌟',
      label: 'Underrated',
      color: 'text-blue-400',
      description: 'Hidden gem discovered by community'
    };
  };

  const gapConfig = getGapConfig(selfRating, communityRating);

  // Size configurations
  const sizeConfigs = {
    sm: {
      emoji: 'text-sm',
      rating: 'text-lg',
      label: 'text-xs',
      description: 'text-xs',
      gap: 'text-sm',
      container: 'gap-2',
      grid: 'gap-2'
    },
    md: {
      emoji: 'text-base',
      rating: 'text-xl',
      label: 'text-sm',
      description: 'text-sm',
      gap: 'text-base',
      container: 'gap-3',
      grid: 'gap-3'
    },
    lg: {
      emoji: 'text-lg',
      rating: 'text-2xl',
      label: 'text-base',
      description: 'text-base',
      gap: 'text-lg',
      container: 'gap-4',
      grid: 'gap-4'
    }
  };

  const sizeConfig = sizeConfigs[size];

  // Get trend icon
  const getTrendIcon = () => {
    if (!communityRating) return Target;
    if (gapConfig.gap > 0.5) return TrendingDown;
    if (gapConfig.gap < -0.5) return TrendingUp;
    return Target;
  };

  const TrendIcon = getTrendIcon();

  // Emoji-only variant
  if (variant === 'emoji-only') {
    return (
      <motion.span
        className={`${sizeConfig.emoji}`}
        animate={animated ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {gapConfig.emoji}
      </motion.span>
    );
  }

  // Minimal variant (just gap number and emoji)
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center ${sizeConfig.container}`}>
        <span className={`${sizeConfig.emoji}`}>{gapConfig.emoji}</span>
        {communityRating && (
          <span className={`font-bold ${gapConfig.color} ${sizeConfig.gap}`}>
            {gapConfig.gap > 0 ? '+' : ''}{gapConfig.gap.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between ${sizeConfig.container}`}>
        <div className="flex items-center gap-2">
          <span className={sizeConfig.emoji}>{gapConfig.emoji}</span>
          <span className={`font-medium text-white ${sizeConfig.label}`}>
            {gapConfig.label}
          </span>
        </div>
        {communityRating && (
          <div className="flex items-center gap-1">
            <TrendIcon className={`w-3 h-3 ${gapConfig.color}`} />
            <span className={`font-bold ${gapConfig.color} ${sizeConfig.gap}`}>
              {gapConfig.gap > 0 ? '+' : ''}{gapConfig.gap.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full variant (default)
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className={`font-semibold text-white flex items-center gap-2 ${sizeConfig.label}`}>
          <span className={sizeConfig.emoji}>{gapConfig.emoji}</span>
          Reality Check
        </h4>
        {communityRating && (
          <Badge className={`${gapConfig.color.replace('text-', 'bg-').replace('-400', '-500/20')} ${gapConfig.color} border-0`}>
            {gapConfig.label}
          </Badge>
        )}
      </div>

      {/* Ratings Grid */}
      <div className={`grid grid-cols-3 ${sizeConfig.grid} text-center`}>
        <div>
          <motion.div
            className={`font-bold text-gigavibe-400 ${sizeConfig.rating}`}
            animate={animated ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {selfRating.toFixed(1)}
          </motion.div>
          <div className={`text-slate-400 ${sizeConfig.label}`}>Self Rating</div>
        </div>
        
        <div>
          <motion.div
            className={`font-bold text-purple-400 ${sizeConfig.rating}`}
            animate={animated ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            {communityRating ? communityRating.toFixed(1) : '?'}
          </motion.div>
          <div className={`text-slate-400 ${sizeConfig.label}`}>Community</div>
        </div>
        
        <div>
          <motion.div
            className={`font-bold ${gapConfig.color} ${sizeConfig.rating} flex items-center justify-center gap-1`}
            animate={animated ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            {communityRating && (
              <>
                <TrendIcon className="w-4 h-4" />
                {gapConfig.gap > 0 ? '+' : ''}{gapConfig.gap.toFixed(1)}
              </>
            )}
            {!communityRating && '?'}
          </motion.div>
          <div className={`text-slate-400 ${sizeConfig.label}`}>Gap</div>
        </div>
      </div>

      {/* Description */}
      {showDescription && (
        <motion.p
          className={`text-center ${gapConfig.color} ${sizeConfig.description} italic`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {gapConfig.description}
        </motion.p>
      )}
    </motion.div>
  );
}

// Utility functions for external use
export function getRealityGapEmoji(selfRating: number, communityRating?: number): string {
  if (!communityRating) return '🎤';
  
  const gap = selfRating - communityRating;
  if (gap > 2) return '🤔';
  if (gap > 0.5) return '😅';
  if (gap > -0.5) return '🎯';
  return '🌟';
}

export function getRealityGapLabel(selfRating: number, communityRating?: number): string {
  if (!communityRating) return 'Pending';
  
  const gap = selfRating - communityRating;
  if (gap > 2) return 'Overconfident';
  if (gap > 0.5) return 'Slightly High';
  if (gap > -0.5) return 'Spot On';
  return 'Underrated';
}

export function getRealityGapColor(selfRating: number, communityRating?: number): string {
  if (!communityRating) return 'text-slate-400';
  
  const gap = selfRating - communityRating;
  if (gap > 2) return 'text-red-400';
  if (gap > 0.5) return 'text-yellow-400';
  if (gap > -0.5) return 'text-green-400';
  return 'text-blue-400';
}

export function getRealityGapDescription(selfRating: number, communityRating?: number): string {
  if (!communityRating) return 'Waiting for community rating';
  
  const gap = selfRating - communityRating;
  if (gap > 2) return 'Thought I was better than I was';
  if (gap > 0.5) return 'Pretty close to reality';
  if (gap > -0.5) return 'Nailed the self-assessment';
  return 'Hidden gem discovered by community';
}