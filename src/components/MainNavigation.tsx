"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Users, Trophy, Zap, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import VocalRealityFlow from "./VocalRealityFlow";
import PeerJudging from "./PeerJudging";
import FarcasterIntegration from "./FarcasterIntegration";
import MarketLeaderboard from "./market/MarketLeaderboard";
import DiscoveryFeed from "./discovery/DiscoveryFeed";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";

type MainScreen = "challenge" | "discovery" | "judging" | "leaderboard";

export default function MainNavigation() {
  const [activeScreen, setActiveScreen] = useState<MainScreen>("discovery");
  const { userInfo, notifyNewChallenge } = useFarcasterIntegration();

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

  const renderScreen = () => {
    switch (activeScreen) {
      case "challenge":
        return <VocalRealityFlow />;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative">
      {/* App Logo */}
      <div className="fixed top-4 left-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/images/gigavibe.png"
            alt="GIGAVIBE"
            width={40}
            height={40}
            className="rounded-lg shadow-lg"
          />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="pb-20">{renderScreen()}</div>

      {/* Auth Test Link */}
      <Link href="/auth-test" className="fixed top-4 right-4 z-50">
        <motion.div
          className="flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-full border border-purple-500/30 hover:bg-black/70"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Lock className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-medium">Auth Test</span>
        </motion.div>
      </Link>

      {/* Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 px-4 py-3 z-50"
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
                onClick={() => setActiveScreen(item.id)}
                className={`flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all duration-200 min-h-[56px] min-w-[56px] touch-manipulation ${
                  isActive
                    ? "text-purple-400"
                    : "text-gray-400 hover:text-white active:bg-white/10"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    rotate: isActive ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 bg-purple-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}

// No longer needed as we're using MarketLeaderboard component
