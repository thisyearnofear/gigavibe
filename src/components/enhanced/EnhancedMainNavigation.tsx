"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Users,
  Trophy,
  Zap,
  Sparkles,
  TrendingUp,
  Plus,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ChallengeDiscoveryHub from "./ChallengeDiscoveryHub";
import SocialDiscoveryFeed from "./SocialDiscoveryFeed";
import StreamlinedChallengeFlow from "./StreamlinedChallengeFlow";
import Header from "@/components/Header";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";

type MainScreen = "home" | "challenge" | "discovery" | "judging" | "market";
type FeedType = "foryou" | "trending" | "viral" | "following";

interface Challenge {
  id: string;
  title: string;
  artist: string;
  difficulty: "easy" | "medium" | "hard";
  duration: number;
  previewUrl: string;
  instrumentalUrl: string;
  description: string;
  tips: string[];
}

export default function EnhancedMainNavigation() {
  const [activeScreen, setActiveScreen] = useState<MainScreen>("home");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [activeFeedType, setActiveFeedType] = useState<FeedType>("foryou");
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { userInfo } = useFarcasterIntegration();

  const navItems = [
    {
      id: "home" as MainScreen,
      label: "Home",
      icon: Sparkles,
      description: "Discover challenges",
      badge: null,
    },
    {
      id: "discovery" as MainScreen,
      label: "Feed",
      icon: Zap,
      description: "Social performances",
      badge: null,
    },
    {
      id: "judging" as MainScreen,
      label: "Judge",
      icon: Users,
      description: "Rate performances",
      badge: "3", // New performances to judge
    },
    {
      id: "market" as MainScreen,
      label: "Market",
      icon: Trophy,
      description: "Trade coins",
      badge: null,
    },
  ];

  const handleScreenChange = (screen: MainScreen) => {
    if (screen === activeScreen) return;
    setIsLoading(true);
    setActiveScreen(screen);
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleChallengeSelect = (challenge: any) => {
    const formattedChallenge: Challenge = {
      id: challenge.id,
      title: challenge.title,
      artist: challenge.artist,
      difficulty: challenge.difficulty,
      duration: challenge.duration,
      previewUrl: challenge.previewUrl,
      instrumentalUrl: challenge.instrumentalUrl,
      description:
        challenge.description ||
        `Sing along to ${challenge.title} by ${challenge.artist}`,
      tips: [
        "Listen to the original first to get familiar",
        "Practice with the instrumental track",
        "Find a quiet space with good acoustics",
        "Sing with confidence and have fun!",
      ],
    };
    setSelectedChallenge(formattedChallenge);
    setActiveScreen("challenge");
  };

  const handleChallengeComplete = (result: any) => {
    console.log("Challenge completed:", result);
    setSelectedChallenge(null);
    setActiveScreen("discovery"); // Navigate to discovery to see the performance
    // In real implementation, this would trigger the performance to appear in the feed
  };

  const handleChallengeCancel = () => {
    setSelectedChallenge(null);
    setActiveScreen("home");
  };

  const handleQuickChallenge = () => {
    // Quick start with featured challenge
    const featuredChallenge: Challenge = {
      id: "espanol-challenge",
      title: "Español",
      artist: "GIGAVIBE",
      difficulty: "medium",
      duration: 180,
      previewUrl: "/audio/espanol.mp3",
      instrumentalUrl: "/audio/espanol-instrumental.mp3",
      description: "Sing along to this catchy Spanish track",
      tips: [
        "Don't worry about perfect pronunciation",
        "Focus on the melody and rhythm",
        "Let the music guide your performance",
        "Have fun with the Latin vibes!",
      ],
    };
    handleChallengeSelect(featuredChallenge);
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-gigavibe-500 border-t-transparent rounded-full"
          />
        </div>
      );
    }

    switch (activeScreen) {
      case "home":
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h1 className="text-3xl font-bold text-white">
                Welcome back
                {userInfo?.display_name ? `, ${userInfo.display_name}` : ""}!
              </h1>
              <p className="text-slate-400">
                Ready to showcase your vocal talents?
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              <Button
                onClick={handleQuickChallenge}
                className="h-24 bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0 flex-col gap-2"
              >
                <Mic className="w-6 h-6" />
                <span className="font-semibold">Quick Challenge</span>
              </Button>
              <Button
                onClick={() => handleScreenChange("discovery")}
                variant="outline"
                className="h-24 border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10 flex-col gap-2"
              >
                <TrendingUp className="w-6 h-6" />
                <span className="font-semibold">Trending Now</span>
              </Button>
            </motion.div>

            {/* Challenge Discovery Hub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ChallengeDiscoveryHub
                onChallengeSelect={handleChallengeSelect}
                onViewAllChallenges={() => {
                  // Navigate to full challenge browser
                  console.log("View all challenges");
                }}
              />
            </motion.div>
          </div>
        );

      case "challenge":
        return selectedChallenge ? (
          <StreamlinedChallengeFlow
            challenge={selectedChallenge}
            onComplete={handleChallengeComplete}
            onCancel={handleChallengeCancel}
          />
        ) : (
          <div className="text-center text-white">No challenge selected</div>
        );

      case "discovery":
        return (
          <SocialDiscoveryFeed
            feedType={activeFeedType}
            onChallengeClick={handleChallengeSelect}
            onProfileClick={(username) => {
              console.log("Navigate to profile:", username);
            }}
          />
        );

      case "judging":
        return (
          <div className="text-center text-white space-y-4">
            <h2 className="text-2xl font-bold">Peer Judging</h2>
            <p className="text-slate-400">Rate other performers' challenges</p>
            <div className="text-sm text-slate-500">Coming soon...</div>
          </div>
        );

      case "market":
        return (
          <div className="text-center text-white space-y-4">
            <h2 className="text-2xl font-bold">Performance Market</h2>
            <p className="text-slate-400">Trade performance coins</p>
            <div className="text-sm text-slate-500">Coming soon...</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gigavibe-mesh relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gigavibe-600/20 via-transparent to-transparent" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <motion.div
        className="pb-24 pt-4 px-4"
        key={activeScreen}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {renderScreen()}
      </motion.div>

      {/* Enhanced Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 gigavibe-glass-dark border-t border-gigavibe-500/20 px-4 py-3 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex justify-around items-center max-w-lg mx-auto relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleScreenChange(item.id)}
                className={`relative flex flex-col items-center gap-1 py-3 px-4 rounded-2xl transition-all duration-300 min-h-[64px] min-w-[64px] ${
                  isActive
                    ? "text-gigavibe-400 bg-gigavibe-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {/* Active background glow */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gigavibe-500/20 to-purple-500/20 blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Badge for notifications */}
                {item.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold z-10"
                  >
                    {item.badge}
                  </motion.div>
                )}

                <motion.div
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    rotate: isActive ? [0, 5, -5, 0] : 0,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <Icon className="w-6 h-6" />
                </motion.div>

                <span className="text-xs font-medium relative z-10">
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="w-2 h-2 bg-gradient-to-r from-gigavibe-400 to-purple-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                )}

                {/* Sparkle effect for active state */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 text-gigavibe-400"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}

          {/* Floating Quick Action Button */}
          <motion.button
            onClick={handleQuickChallenge}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-gigavibe-500/25"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Plus className="w-8 h-8 text-white" />
          </motion.button>
        </div>
      </motion.nav>
    </div>
  );
}
