/**
 * Challenge Sharing Step Component
 * Production-ready sharing with social integration
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Share2, 
  Users, 
  Zap, 
  Coins,
  CheckCircle,
  ExternalLink,
  Copy,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Challenge } from '@/types/challenge.types';

interface ChallengeSharingProps {
  challenge: Challenge;
  recordingData: {
    audioBlob?: Blob;
    mixedAudioBlob?: Blob;
    audioUrl?: string;
    duration: number;
  };
  ratingData: {
    selfRating: number;
    confidence: 'nervous' | 'confident' | 'very confident';
  };
  onNext: (data: { shareToSocial: boolean; customMessage?: string }) => void;
  onCancel: () => void;
}

export default function ChallengeSharing({ 
  challenge, 
  recordingData, 
  ratingData, 
  onNext, 
  onCancel 
}: ChallengeSharingProps) {
  const [shareToFarcaster, setShareToFarcaster] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const defaultMessage = `Just crushed the "${challenge.title}" challenge! 🎤 Rated myself ${ratingData.selfRating}/10 - let's see what the community thinks! #GIGAVIBE #VocalChallenge`;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceEmoji = (confidence: string) => {
    switch (confidence) {
      case 'very confident': return '🔥';
      case 'confident': return '😊';
      case 'nervous': return '😅';
      default: return '🎤';
    }
  };

  const handleShare = async (shareToSocial: boolean) => {
    setIsSubmitting(true);
    try {
      await onNext({ 
        shareToSocial, 
        customMessage: customMessage || defaultMessage 
      });
    } catch (error) {
      console.error('Failed to share:', error);
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    // In production, this would be the actual performance URL
    const performanceUrl = `https://gigavibe.app/performance/${challenge.id}-${Date.now()}`;
    navigator.clipboard.writeText(performanceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const estimatedRewards = {
    basePoints: Math.floor(ratingData.selfRating * 10),
    socialBonus: shareToFarcaster ? 25 : 0,
    viralPotential: ratingData.selfRating >= 8 ? 'High' : ratingData.selfRating >= 6 ? 'Medium' : 'Low'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full flex items-center justify-center"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Challenge Complete!</h2>
        <p className="text-slate-300">
          Your performance is ready to share with the community
        </p>
      </div>

      {/* Performance Summary */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
            <p className="text-slate-400">{challenge.artist}</p>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gigavibe-400">
                  {ratingData.selfRating.toFixed(1)}
                </div>
                <div className="text-xs text-slate-400">Your Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {formatTime(recordingData.duration)}
                </div>
                <div className="text-xs text-slate-400">Duration</div>
              </div>
              <div>
                <div className="text-2xl">
                  {getConfidenceEmoji(ratingData.confidence)}
                </div>
                <div className="text-xs text-slate-400 capitalize">
                  {ratingData.confidence}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Performance
          </h3>
          
          {/* Farcaster Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-white">Share to Farcaster</div>
                <div className="text-sm text-slate-400">Post to your feed and relevant channels</div>
              </div>
            </div>
            <Switch
              checked={shareToFarcaster}
              onCheckedChange={setShareToFarcaster}
            />
          </div>

          {/* Custom Message */}
          {shareToFarcaster && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Custom Message (Optional)</label>
              <Textarea
                placeholder={defaultMessage}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-gigavibe-500"
                rows={3}
              />
              <div className="text-xs text-slate-400">
                {customMessage.length || defaultMessage.length}/280 characters
              </div>
            </div>
          )}

          {/* Direct Link Sharing */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            <span className="text-sm text-slate-400">Share directly with friends</span>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Rewards */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20 bg-gradient-to-r from-gigavibe-500/10 to-purple-500/10">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Estimated Rewards
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Base Performance Points</span>
              <Badge className="bg-gigavibe-500/20 text-gigavibe-400 border-gigavibe-500/30">
                +{estimatedRewards.basePoints}
              </Badge>
            </div>
            
            {shareToFarcaster && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Social Sharing Bonus</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  +{estimatedRewards.socialBonus}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Viral Potential</span>
              <Badge className={`${
                estimatedRewards.viralPotential === 'High' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : estimatedRewards.viralPotential === 'Medium'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {estimatedRewards.viralPotential}
              </Badge>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Coins className="w-4 h-4" />
              <span>High-rated performances may become tradeable coins!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="gigavibe-glass-dark border-gigavibe-500/20">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            What Happens Next
          </h3>
          
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gigavibe-400 mt-0.5 flex-shrink-0" />
              <span>Community members will rate your performance</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gigavibe-400 mt-0.5 flex-shrink-0" />
              <span>You'll get a "Reality Check" comparing ratings</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gigavibe-400 mt-0.5 flex-shrink-0" />
              <span>Viral performances may become tradeable coins</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gigavibe-400 mt-0.5 flex-shrink-0" />
              <span>Earn rewards based on community engagement</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => handleShare(shareToFarcaster)}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
          size="lg"
        >
          {isSubmitting ? (
            'Sharing...'
          ) : shareToFarcaster ? (
            <>
              <Share2 className="w-5 h-5 mr-2" />
              Share with Community
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 mr-2" />
              Submit Performance
            </>
          )}
        </Button>
        
        <Button
          onClick={() => handleShare(false)}
          variant="outline"
          className="w-full border-slate-600 text-slate-300"
          disabled={isSubmitting}
        >
          Keep Private for Now
        </Button>
      </div>
    </motion.div>
  );
}