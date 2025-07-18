/**
 * Challenge Rating Step Component
 * Production-ready self-rating with confidence levels
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  ArrowRight, 
  TrendingUp, 
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Challenge } from '@/types/challenge.types';

interface ChallengeRatingProps {
  challenge: Challenge;
  recordingData: {
    audioBlob?: Blob;
    mixedAudioBlob?: Blob;
    audioUrl?: string;
    duration: number;
  };
  initialRating?: {
    selfRating: number;
    confidence: 'nervous' | 'confident' | 'very confident';
  };
  onNext: (data: { selfRating: number; confidence: 'nervous' | 'confident' | 'very confident' }) => void;
  onBack?: () => void;
  onCancel: () => void;
}

export default function ChallengeRating({ 
  challenge, 
  recordingData, 
  initialRating,
  onNext, 
  onBack, 
  onCancel 
}: ChallengeRatingProps) {
  const [selfRating, setSelfRating] = useState(initialRating?.selfRating || 7.5);
  const [confidence, setConfidence] = useState<'nervous' | 'confident' | 'very confident'>(
    initialRating?.confidence || 'confident'
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'text-green-400';
    if (rating >= 7) return 'text-gigavibe-400';
    if (rating >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRatingText = (rating: number) => {
    if (rating >= 9) return 'Outstanding!';
    if (rating >= 8) return 'Great job!';
    if (rating >= 7) return 'Well done!';
    if (rating >= 6) return 'Good effort!';
    if (rating >= 5) return 'Not bad!';
    return 'Room to grow!';
  };

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'very confident': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'confident': return 'bg-gigavibe-500/20 text-gigavibe-400 border-gigavibe-500/30';
      case 'nervous': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const handleSubmit = () => {
    onNext({ selfRating, confidence });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <Star className="w-16 h-16 text-gigavibe-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Rate Your Performance</h2>
        <p className="text-slate-300">
          How do you think you did? Be honest - the community will rate you too!
        </p>
      </div>

      {/* Performance Summary */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6 text-center space-y-3">
          <h3 className="font-semibold text-white">{challenge.title}</h3>
          <p className="text-slate-400">{challenge.artist}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
            <span>Duration: {formatTime(recordingData.duration)}</span>
            <span>•</span>
            <span>Quality: High</span>
          </div>
        </CardContent>
      </Card>

      {/* Rating Section */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6 space-y-6">
          {/* Self Rating */}
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <motion.div
                className={`text-5xl font-bold ${getRatingColor(selfRating)}`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
                key={Math.floor(selfRating * 10)} // Re-trigger animation on rating change
              >
                {selfRating.toFixed(1)}
              </motion.div>
              <div className="text-lg text-slate-400">out of 10</div>
              <motion.div
                className={`text-sm font-medium ${getRatingColor(selfRating)}`}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {getRatingText(selfRating)}
              </motion.div>
            </div>
            
            {/* Rating Slider */}
            <div className="space-y-3">
              <Slider
                value={[selfRating]}
                onValueChange={(value) => setSelfRating(value[0])}
                max={10}
                min={1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 - Needs work</span>
                <span>5 - Average</span>
                <span>10 - Perfect</span>
              </div>
            </div>
          </div>

          {/* Confidence Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">How confident are you in this rating?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'nervous', label: 'Nervous', icon: '😅' },
                { value: 'confident', label: 'Confident', icon: '😊' },
                { value: 'very confident', label: 'Very Confident', icon: '🔥' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={confidence === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfidence(option.value as any)}
                  className={`flex flex-col gap-1 h-auto py-3 ${
                    confidence === option.value 
                      ? "bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white border-0" 
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-xs">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reality Check Preview */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-gigavibe-400">
            <Zap className="w-5 h-5" />
            <h3 className="font-semibold">Reality Check Preview</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gigavibe-400">
                {selfRating.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">Your Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-500">
                ?
              </div>
              <div className="text-xs text-slate-400">Community</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-500">
                ?
              </div>
              <div className="text-xs text-slate-400">Reality Gap</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Users className="w-4 h-4" />
            <span>The community will reveal the truth!</span>
          </div>
        </CardContent>
      </Card>

      {/* Potential Rewards */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20 bg-gradient-to-r from-gigavibe-500/10 to-purple-500/10">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-gigavibe-400">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">Potential Rewards</h3>
          </div>
          
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>High community rating (8.5+)</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Coin Creation
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Viral performance (trending)</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Featured
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Accurate self-assessment</span>
              <Badge className="bg-gigavibe-500/20 text-gigavibe-400 border-gigavibe-500/30">
                Bonus Points
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300"
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
        >
          Submit Rating
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}