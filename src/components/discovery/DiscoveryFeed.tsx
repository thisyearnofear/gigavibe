"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Heart, MessageCircle, Share, Music } from "lucide-react";
import { Button } from "../ui/button";

interface DiscoveryFeedProps {
  initialFeedType?: "foryou" | "trending" | "following";
}

interface FeedItem {
  id: string;
  username: string;
  avatar: string;
  songTitle: string;
  artist: string;
  duration: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

// Mock data for the feed
const mockFeedItems: FeedItem[] = [
  {
    id: "1",
    username: "vocalmaven",
    avatar: "/api/placeholder/40/40",
    songTitle: "Bohemian Rhapsody",
    artist: "Queen",
    duration: "2:34",
    likes: 1247,
    comments: 89,
    shares: 23,
    isLiked: false,
  },
  {
    id: "2",
    username: "singingstar",
    avatar: "/api/placeholder/40/40",
    songTitle: "Someone Like You",
    artist: "Adele",
    duration: "3:12",
    likes: 892,
    comments: 45,
    shares: 12,
    isLiked: true,
  },
  {
    id: "3",
    username: "harmonyhero",
    avatar: "/api/placeholder/40/40",
    songTitle: "Perfect",
    artist: "Ed Sheeran",
    duration: "1:58",
    likes: 2156,
    comments: 134,
    shares: 67,
    isLiked: false,
  },
];

export default function DiscoveryFeed({
  initialFeedType = "foryou",
}: DiscoveryFeedProps) {
  const [feedType, setFeedType] = useState(initialFeedType);
  const [feedItems, setFeedItems] = useState(mockFeedItems);

  const handleLike = (itemId: string) => {
    setFeedItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

  const feedTabs = [
    { id: "foryou", label: "For You", icon: Zap },
    { id: "trending", label: "Trending", icon: Music },
    { id: "following", label: "Following", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header with tabs */}
      <div className="sticky top-0 z-40 gigavibe-glass-dark border-b border-gigavibe-500/20 px-4 py-3">
        <div className="flex justify-center space-x-1">
          {feedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = feedType === tab.id;

            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => setFeedType(tab.id as typeof feedType)}
                className={`gap-2 transition-all duration-300 ${
                  isActive
                    ? "bg-gigavibe-500/20 text-gigavibe-400 border-gigavibe-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Feed Content */}
      <div className="px-4 py-6 space-y-6">
        {feedItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="gigavibe-glass-dark rounded-2xl p-6 border border-gigavibe-500/20"
          >
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gigavibe-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {item.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">@{item.username}</p>
                <p className="text-slate-400 text-sm">
                  {item.songTitle} • {item.artist}
                </p>
              </div>
            </div>

            {/* Audio Waveform Placeholder */}
            <div className="bg-black/30 rounded-xl p-6 mb-4 border border-gigavibe-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-gigavibe-400" />
                  <span className="text-white font-medium">
                    {item.songTitle}
                  </span>
                </div>
                <span className="text-slate-400 text-sm">{item.duration}</span>
              </div>

              {/* Waveform visualization placeholder */}
              <div className="flex items-center gap-1 h-12">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gigavibe-500/30 rounded-full flex-1"
                    style={{
                      height: `${Math.random() * 100}%`,
                      minHeight: "4px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    item.isLiked
                      ? "text-red-400 hover:text-red-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${item.isLiked ? "fill-current" : ""}`}
                  />
                  <span className="text-sm">{item.likes}</span>
                </button>

                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{item.comments}</span>
                </button>

                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Share className="w-5 h-5" />
                  <span className="text-sm">{item.shares}</span>
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
              >
                Try This Song
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading state for infinite scroll */}
      <div className="flex justify-center py-8">
        <div className="text-slate-400 text-sm">
          Loading more performances...
        </div>
      </div>
    </div>
  );
}
