"use client";

import React, { useState, memo } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Play, Pause } from "lucide-react";
import { useHapticFeedback } from "@/hooks/usePerformanceOptimization";

interface FeedCardProps {
  item: {
    id?: string;
    username?: string;
    timestamp?: string;
    content?: string;
    audioUrl?: string;
    duration?: string;
    likes?: number;
    comments?: number;
    shares?: number;
    isVerified?: boolean;
  };
  index: number;
  isRefreshing: boolean;
}

// Memoized FeedCard for better performance
export const FeedCard = memo(function FeedCard({ 
  item, 
  index, 
  isRefreshing 
}: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(item.likes || 0);
  const { lightTap, success } = useHapticFeedback();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    // Haptic feedback
    if (!isLiked) {
      success();
    } else {
      lightTap();
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    lightTap();
  };

  const handleShare = () => {
    lightTap();
    // Implement share functionality
  };

  const handleComment = () => {
    lightTap();
    // Implement comment functionality
  };

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/5 hover:border-gigavibe-500/30 transition-all duration-300 gpu-accelerated will-change-transform"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(212, 70, 239, 0.1)" }}
      layout={isRefreshing}
    >
      {/* User Info */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div 
          className="w-10 h-10 bg-gradient-to-br from-gigavibe-500 to-purple-600 rounded-full flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
        >
          <span className="text-white text-sm font-bold">
            {(item.username || "U").charAt(0).toUpperCase()}
          </span>
        </motion.div>
        <div className="flex-1">
          <div className="font-medium text-white">
            {item.username || "Anonymous User"}
          </div>
          <div className="text-xs text-gray-400">
            {item.timestamp || "Just now"}
          </div>
        </div>
        {item.isVerified && (
          <motion.div
            className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <p className="text-white mb-4 leading-relaxed">
        {item.content || "Amazing vocal performance! 🎵"}
      </p>

      {/* Audio Player (if audio content) */}
      {item.audioUrl && (
        <motion.div 
          className="bg-black/20 rounded-lg p-3 mb-4 flex items-center gap-3"
          whileHover={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <motion.button
            className="w-10 h-10 bg-gigavibe-500 rounded-full flex items-center justify-center touch-target haptic-light"
            onClick={handlePlay}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </motion.button>
          <div className="flex-1">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gigavibe-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: isPlaying ? "60%" : "0%" }}
                transition={{ duration: 2 }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {item.duration || "0:30"}
          </span>
        </motion.div>
      )}

      {/* Engagement Actions */}
      <div className="flex justify-between items-center text-gray-400 text-sm">
        <motion.button 
          className="flex items-center gap-2 hover:text-white transition-colors touch-target haptic-light focus-ring"
          onClick={handleComment}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{item.comments || 0}</span>
        </motion.button>

        <motion.button 
          className={`flex items-center gap-2 transition-colors touch-target haptic-light focus-ring ${
            isLiked ? "text-red-400" : "hover:text-red-400"
          }`}
          onClick={handleLike}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          </motion.div>
          <span>{likes}</span>
        </motion.button>

        <motion.button 
          className="flex items-center gap-2 hover:text-white transition-colors touch-target haptic-light focus-ring"
          onClick={handleShare}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Share2 className="w-4 h-4" />
          <span>{item.shares || 0}</span>
        </motion.button>
      </div>
    </motion.div>
  );
});

export default FeedCard;