'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Star, 
  Users, 
  Award,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DunningKrugerData } from '@/types/performance.types';

interface DunningKrugerAnalysisProps {
  data: DunningKrugerData;
  showDetailed?: boolean;
  className?: string;
}

export default function DunningKrugerAnalysis({
  data,
  showDetailed = false,
  className = ''
}: DunningKrugerAnalysisProps) {
  const { selfRating, publicRating, ratingCount, confidence, feedback } = data;
  
  const getConfidenceColor = (conf: typeof confidence) => {
    switch (conf) {
      case 'overconfident': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'underconfident': return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      case 'accurate': return 'text-green-400 bg-green-500/20 border-green-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getConfidenceIcon = (conf: typeof confidence) => {
    switch (conf) {
      case 'overconfident': return <TrendingUp className="w-4 h-4" />;
      case 'underconfident': return <TrendingDown className="w-4 h-4" />;
      case 'accurate': return <Target className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getConfidenceMessage = (conf: typeof confidence) => {
    switch (conf) {
      case 'overconfident': return 'You rated yourself higher than the community!';
      case 'underconfident': return 'You\'re being too hard on yourself!';
      case 'accurate': return 'Spot on! You know your skill level!';
      default: return 'Waiting for community ratings...';
    }
  };

  const getXFactorMoment = (conf: typeof confidence, selfRating: number, publicRating?: number) => {
    if (!publicRating) return null;
    
    const difference = Math.abs(selfRating - publicRating);
    
    if (conf === 'overconfident' && difference >= 2) {
      return "Reality Check! Like when someone thinks they're the next Beyoncé... 😅";
    }
    if (conf === 'underconfident' && difference >= 2) {
      return "Hidden Talent! The judges saw something you didn't! ✨";
    }
    if (conf === 'accurate' && difference <= 0.5) {
      return "Perfect Self-Awareness! You'd make a great judge yourself! 🎯";
    }
    
    return null;
  };

  const xFactorMoment = getXFactorMoment(confidence, selfRating, publicRating);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Comparison Card */}
      <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Reality Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rating Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {selfRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Your Rating</div>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < selfRating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-600/20 rounded-lg border border-gray-600/30">
              <div className="text-2xl font-bold text-gray-300 mb-1">
                {publicRating ? publicRating.toFixed(1) : '?'}
              </div>
              <div className="text-sm text-gray-400">
                Community ({ratingCount} {ratingCount === 1 ? 'vote' : 'votes'})
              </div>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      publicRating && i < publicRating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Confidence Analysis */}
          {publicRating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${getConfidenceColor(confidence)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getConfidenceIcon(confidence)}
                <span className="font-semibold capitalize">{confidence}</span>
              </div>
              <p className="text-sm">{getConfidenceMessage(confidence)}</p>
            </motion.div>
          )}

          {/* X-Factor Moment */}
          {xFactorMoment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold text-yellow-400">X-Factor Moment</span>
              </div>
              <p className="text-sm text-yellow-200">{xFactorMoment}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis (if requested) */}
      {showDetailed && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Self-Awareness Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Self-Awareness</span>
                <span className="text-sm text-gray-400">
                  {publicRating ? Math.max(0, 100 - Math.abs(selfRating - publicRating) * 25).toFixed(0) : '?'}%
                </span>
              </div>
              <Progress 
                value={publicRating ? Math.max(0, 100 - Math.abs(selfRating - publicRating) * 25) : 0} 
                className="h-2"
              />
            </div>

            {/* Community Engagement */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Community Engagement</span>
                <span className="text-sm text-gray-400">
                  {Math.min(100, ratingCount * 10)}%
                </span>
              </div>
              <Progress 
                value={Math.min(100, ratingCount * 10)} 
                className="h-2"
              />
            </div>

            {/* Performance Feedback */}
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Community Feedback</span>
              </div>
              <p className="text-sm text-gray-400">
                {feedback || 'No specific feedback yet - keep performing to get more insights!'}
              </p>
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {confidence === 'accurate' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  Self-Aware Performer
                </Badge>
              )}
              {confidence === 'overconfident' && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                  Confidence Booster
                </Badge>
              )}
              {confidence === 'underconfident' && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                  Hidden Talent
                </Badge>
              )}
              {ratingCount >= 10 && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  Community Favorite
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}