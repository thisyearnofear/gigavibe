'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Bell, Share2, Users, Star, Zap } from 'lucide-react';
import { useFarcasterIntegration } from '@/hooks/useFarcasterIntegration';

interface FarcasterIntegrationProps {
  challengeId?: string;
  challengeTitle?: string;
  userScore?: number;
  selfRating?: number;
  communityRating?: number;
  onFrameAdded?: () => void;
}

export default function FarcasterIntegration({
  challengeId,
  challengeTitle,
  userScore,
  selfRating,
  communityRating,
  onFrameAdded
}: FarcasterIntegrationProps) {
  const {
    userInfo,
    isFrameReady,
    isFrameAdded,
    addGigavibeFrame,
    shareChallengeResult,
    notifyNewChallenge,
    viewProfile
  } = useFarcasterIntegration();

  const [showAddFrame, setShowAddFrame] = useState(false);
  const [isAddingFrame, setIsAddingFrame] = useState(false);

  useEffect(() => {
    // Show add frame prompt if user hasn't added it yet
    if (isFrameReady && !isFrameAdded && userInfo) {
      setShowAddFrame(true);
    }
  }, [isFrameReady, isFrameAdded, userInfo]);

  const handleAddFrame = async () => {
    setIsAddingFrame(true);
    try {
      const result = await addGigavibeFrame();
      if (result) {
        setShowAddFrame(false);
        onFrameAdded?.();
      }
    } catch (error) {
      console.error('Failed to add frame:', error);
    } finally {
      setIsAddingFrame(false);
    }
  };

  const handleShareResult = () => {
    if (challengeId && challengeTitle && typeof selfRating === 'number' && typeof communityRating === 'number') {
      shareChallengeResult({
        challengeId,
        challengeTitle,
        userScore: userScore || 0,
        selfRating,
        communityRating
      });
    }
  };

  const handleViewProfile = () => {
    if (userInfo?.fid) {
      viewProfile();
    }
  };

  // Add Frame Prompt
  if (showAddFrame && userInfo) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-md w-full text-white border border-purple-500/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="text-center">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-4">
                Add GIGAVIBE to Your Frames
              </h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Hey <span className="text-purple-400 font-semibold">@{userInfo.username}</span>! 
                Add GIGAVIBE to get notifications about new viral challenges and never miss the fun.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <span className="text-sm">Get notified about new challenges</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-sm">See when friends are singing</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-sm">Track your vocal improvement</span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowAddFrame(false)}
                  className="flex-1 py-3 bg-white/10 border border-white/20 rounded-2xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Maybe Later
                </motion.button>
                
                <motion.button
                  onClick={handleAddFrame}
                  disabled={isAddingFrame}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isAddingFrame ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Add Frame
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Farcaster User Info Display
  if (userInfo && isFrameReady) {
    return (
      <div className="space-y-4">
        {/* User Profile Card */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            {userInfo.pfpUrl && (
              <img
                src={userInfo.pfpUrl}
                alt={userInfo.username}
                className="w-12 h-12 rounded-full border-2 border-purple-400"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">@{userInfo.username}</span>
                {isFrameAdded && (
                  <div className="w-2 h-2 bg-green-400 rounded-full" title="Frame Added" />
                )}
              </div>
              {userInfo.displayName && (
                <div className="text-sm text-gray-300">{userInfo.displayName}</div>
              )}
            </div>
            <motion.button
              onClick={handleViewProfile}
              className="p-2 bg-purple-500/20 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Users className="w-4 h-4 text-purple-400" />
            </motion.button>
          </div>
        </motion.div>

        {/* Share Results Button */}
        {challengeId && selfRating !== undefined && communityRating !== undefined && (
          <motion.button
            onClick={handleShareResult}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold flex items-center justify-center gap-2 text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Share2 className="w-5 h-5" />
            Share to Farcaster
          </motion.button>
        )}

        {/* Add Frame Button (if not added) */}
        {!isFrameAdded && (
          <motion.button
            onClick={handleAddFrame}
            disabled={isAddingFrame}
            className="w-full py-3 bg-white/10 border border-white/20 rounded-2xl font-semibold flex items-center justify-center gap-2 text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {isAddingFrame ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Bell className="w-5 h-5" />
                Get Notifications
              </>
            )}
          </motion.button>
        )}
      </div>
    );
  }

  return null;
}