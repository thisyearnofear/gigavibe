"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Users, Trophy, Zap, Sparkles } from "lucide-react";
import Image from "next/image";
import UnifiedChallengeFlow from "./UnifiedChallengeFlow";
import PeerJudging from "./PeerJudging";
import FarcasterIntegration from "./FarcasterIntegration";
import MarketLeaderboard from "./market/MarketLeaderboard";
import DiscoveryFeed from "./discovery/DiscoveryFeed";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";
import GigavibeLogo from "./ui/gigavibe-logo";
import { FloatingActionButton } from "./ui/floating-action-button";
import { FullScreenLoading } from "./ui/loading";
import { useCrossTab } from "@/contexts/CrossTabContext";
import Header from "./Header";

type MainScreen = "challenge" | "discovery" | "judging" | "leaderboard";

export default function MainNavigation() {
  const [activeScreen, setActiveScreen] = useState<MainScreen>("discovery");
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo, notifyNewChallenge } = useFarcasterIntegration();
  const { navigateWithContext } = useCrossTab();

  const navItems = [
    {
      id: "challenge" as MainScreen,
      label: "Sing",
      icon: Mic,
      description: "Take a challenge",
    },
    {
      id: "discovery" as MainScreen,
      label: "Discover",
      icon: Zap,
      description: "For You feed",
    },
    {
      id: "judging" as MainScreen,
      label: "Judge",
      icon: Users,
      description: "Rate others",
    },
    {
      id: "leaderboard" as MainScreen,
      label: "Market",
      icon: Trophy,
      description: "Performance coins",
    },
  ];

  const handleScreenChange = (screen: MainScreen, context?: any) => {
    if (screen === activeScreen && !context) return;
    setIsLoading(true);
    setActiveScreen(screen);
    // Simulate loading time for smooth transitions
    setTimeout(() => setIsLoading(false), 300);
  };

  // Listen for cross-tab navigation events
  useEffect(() => {
    const handleNavigationEvent = (event: CustomEvent) => {
      const { tab, context } = event.detail;
      handleScreenChange(tab as MainScreen, context);
    };

    window.addEventListener(
      "gigavibe-navigate",
      handleNavigationEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "gigavibe-navigate",
        handleNavigationEvent as EventListener
      );
    };
  }, []);

  const handleQuickRecord = () => {
    handleScreenChange("challenge");
  };

  const handleQuickChallenge = () => {
    handleScreenChange("challenge");
  };

  const handleSocialClick = () => {
    handleScreenChange("judging");
  };

  const handleLeaderboardClick = () => {
    handleScreenChange("leaderboard");
  };

  const renderScreen = () => {
    if (isLoading) {
      return <FullScreenLoading message="Loading..." showLogo={false} />;
    }

    switch (activeScreen) {
      case "challenge":
        return (
          <UnifiedChallengeFlow
            onComplete={() => handleScreenChange("discovery")}
          />
        );
      case "discovery":
        return <DiscoveryFeed initialFeedType="foryou" />;
      case "judging":
        return <PeerJudging />;
      case "leaderboard":
        return <MarketLeaderboard />;
      default:
        return <DiscoveryFeed initialFeedType="foryou" />;
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
        className="pb-20 pt-4"
        key={activeScreen}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {renderScreen()}
      </motion.div>

      {/* Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 gigavibe-glass-dark border-t border-gigavibe-500/20 px-4 py-3 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleScreenChange(item.id)}
                className={`flex flex-col items-center gap-1 py-3 px-4 rounded-2xl transition-all duration-300 min-h-[64px] min-w-[64px] touch-target haptic-medium gpu-accelerated will-change-transform focus-ring relative ${
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
        </div>
      </motion.nav>

      {/* Floating Action Button */}
      <FloatingActionButton
        variant="menu"
        onRecordClick={handleQuickRecord}
        onQuickChallengeClick={handleQuickChallenge}
        onSocialClick={handleSocialClick}
        onLeaderboardClick={handleLeaderboardClick}
      />
    </div>
  );
}

// No longer needed as we're using MarketLeaderboard component
