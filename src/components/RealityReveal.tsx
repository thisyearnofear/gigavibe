'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RotateCcw, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import FarcasterIntegration from './FarcasterIntegration';

interface RealityRevealProps {
  selfRating: number;
  communityRating: number;
  confidence: string;
  challengeTitle: string;
  totalJudges: number;
  onShare: () => void;
  onTryAgain: () => void;
}

export default function RealityReveal({
  selfRating,
  communityRating,
  confidence,
  challengeTitle,
  totalJudges,
  onShare,
  onTryAgain
}: RealityRevealProps) {
  const [phase, setPhase] = useState<'suspense' | 'self' | 'community' | 'comparison' | 'share'>('suspense');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase('self');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPhase('community');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPhase('comparison');
      
      // Show confetti if they did well or if the gap is hilariously large
      if (communityRating >= 4 || Math.abs(selfRating - communityRating) >= 2) {
        setShowConfetti(true);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('share');
    };
    
    sequence();
  }, [selfRating, communityRating]);

  const getRatingGap = () => {
    const gap = selfRating - communityRating;
    if (gap >= 2) return { type: 'overconfident', emoji: '😅', color: 'text-red-400' };
    if (gap <= -2) return { type: 'underconfident', emoji: '😲', color: 'text-green-400' };
    if (Math.abs(gap) <= 0.5) return { type: 'accurate', emoji: '🎯', color: 'text-purple-400' };
    return { type: 'close', emoji: '🤔', color: 'text-yellow-400' };
  };

  const getWittyCommentary = () => {
    const gap = selfRating - communityRating;
    const gapType = getRatingGap().type;
    
    if (gapType === 'overconfident') {
      if (gap >= 3) return "Someone's been practicing in the shower a bit too much";
      if (gap >= 2) return "Confidence is key... maybe dial it back just a touch";
      return "Close, but the community has spoken";
    }
    
    if (gapType === 'underconfident') {
      if (gap <= -2) return "You're way too hard on yourself!";
      return "The community believes in you more than you do";
    }
    
    if (gapType === 'accurate') {
      return "Spot on! You know your voice well";
    }
    
    return "Pretty close to reality";
  };

  const getConfidenceText = () => {
    switch (confidence) {
      case 'modest': return 'thought it was pretty good';
      case 'confident': return 'was sure they nailed it';
      case 'unsure': return 'honestly wasn\'t sure';
      case 'showoff': return 'thought they should go pro';
      default: return 'rated themselves';
    }
  };

  const StarDisplay = ({ rating, animated = false }: { rating: number; animated?: boolean }) => (
    <div className="flex justify-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          initial={animated ? { scale: 0, rotate: -180 } : false}
          animate={animated ? { scale: 1, rotate: 0 } : false}
          transition={animated ? { delay: star * 0.1, type: "spring", stiffness: 500 } : undefined}
        >
          <Star
            className={`w-8 h-8 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-600'
            }`}
          />
        </motion.div>
      ))}
    </div>
  );

  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -10,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            y: window.innerHeight + 10,
            rotate: 360,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            ease: "easeOut",
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {showConfetti && <Confetti />}
      
      <div className="flex items-center justify-center min-h-screen p-6 text-white relative z-10">
        <div className="w-full max-w-md text-center">
          
          <AnimatePresence mode="wait">
            {phase === 'suspense' && (
              <motion.div
                key="suspense"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="text-6xl mb-6"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎭
                </motion.div>
                <h1 className="text-3xl font-bold mb-4">Reality Check Time</h1>
                <p className="text-lg text-gray-300">
                  Let's see how you really did...
                </p>
                <motion.div
                  className="mt-8 flex justify-center gap-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                </motion.div>
              </motion.div>
            )}

            {phase === 'self' && (
              <motion.div
                key="self"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-4xl mb-6">🤔</div>
                <h2 className="text-2xl font-bold mb-6">You {getConfidenceText()}</h2>
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-4">
                  <div className="text-6xl font-bold text-purple-400 mb-4">{selfRating}</div>
                  <StarDisplay rating={selfRating} animated />
                  <p className="text-gray-300 mt-4">Your self-rating</p>
                </div>
              </motion.div>
            )}

            {phase === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-4xl mb-6">👥</div>
                <h2 className="text-2xl font-bold mb-6">The community said...</h2>
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-4">
                  <motion.div
                    className="text-6xl font-bold text-indigo-400 mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
                  >
                    {communityRating.toFixed(1)}
                  </motion.div>
                  <StarDisplay rating={Math.round(communityRating)} animated />
                  <p className="text-gray-300 mt-4">Average from {totalJudges} judges</p>
                </div>
              </motion.div>
            )}

            {phase === 'comparison' && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="text-6xl mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {getRatingGap().emoji}
                </motion.div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-2">{selfRating}</div>
                      <div className="text-sm text-gray-400">You</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selfRating > communityRating ? (
                        <TrendingDown className={`w-8 h-8 ${getRatingGap().color}`} />
                      ) : selfRating < communityRating ? (
                        <TrendingUp className={`w-8 h-8 ${getRatingGap().color}`} />
                      ) : (
                        <Minus className={`w-8 h-8 ${getRatingGap().color}`} />
                      )}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-400 mb-2">{communityRating.toFixed(1)}</div>
                      <div className="text-sm text-gray-400">Community</div>
                    </div>
                  </div>
                  
                  <motion.p
                    className={`text-lg font-semibold ${getRatingGap().color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {getWittyCommentary()}
                  </motion.p>
                </div>
              </motion.div>
            )}

            {phase === 'share' && (
              <motion.div
                key="share"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-4xl mb-6">🎉</div>
                <h2 className="text-2xl font-bold mb-6">Ready to share this moment?</h2>
                
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                  <p className="text-lg mb-4">
                    "I thought I was a <span className="font-bold text-purple-400">{selfRating}⭐</span> singer...
                  </p>
                  <p className="text-lg">
                    The community said <span className="font-bold text-indigo-400">{communityRating.toFixed(1)}⭐</span> {getRatingGap().emoji}"
                  </p>
                  <p className="text-sm text-gray-400 mt-4">#{challengeTitle.replace(/\s+/g, '')} #VocalRealityCheck</p>
                </div>

                {/* Farcaster Integration */}
                <FarcasterIntegration
                  challengeId="mock-challenge-id"
                  challengeTitle={challengeTitle}
                  userScore={Math.round((selfRating + communityRating) / 2 * 20)}
                  selfRating={selfRating}
                  communityRating={communityRating}
                />

                <div className="flex gap-4 mt-6">
                  <motion.button
                    onClick={onShare}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="w-5 h-5" />
                    Share the Reality
                  </motion.button>
                  
                  <motion.button
                    onClick={onTryAgain}
                    className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}