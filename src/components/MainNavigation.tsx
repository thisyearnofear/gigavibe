"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Users, Trophy, Zap, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Challenge, ChallengeResult } from "@/types/challenge.types";
import { useUnifiedChallenge } from "@/hooks/useUnifiedChallenge";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";
import { FullScreenLoading } from "./ui/loading";
import { useCrossTab } from "@/contexts/CrossTabContext";
import Header from "./Header";

// Import new unified components
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import ChallengeDiscovery from "./challenge/ChallengeDiscovery";
import ChallengeFlow from "./challenge/ChallengeFlow";
import DiscoveryFeed from "./discovery/DiscoveryFeed";
import PeerJudging from "./PeerJudging";
import MarketLeaderboard from "./market/MarketLeaderboard";

type MainScreen =
  | "home"
  | "challenge"
  | "discovery"
  | "judging"
  | "leaderboard";

export default function MainNavigation() {
  const [activeScreen, setActiveScreen] = useState<MainScreen>("home");
  const [isLoading, setIsLoading] = useState(false);

  // Use unified challenge hook
  const {
    currentChallenge,
    startChallenge,
    completeChallenge,
    cancelChallenge,
    isActive: isChallengeActive,
  } = useUnifiedChallenge();

  const { userInfo } = useFarcasterIntegration();
  const { navigateWithContext } = useCrossTab();

  const navItems = [
    {
      id: "home" as MainScreen,
      label: "Home",
      icon: Sparkles,
      description: "Discover challenges",
    },
    {
      id: "discovery" as MainScreen,
      label: "Feed",
      icon: Zap,
      description: "Social performances",
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
    setTimeout(() => setIsLoading(false), 200);
  };

  // Challenge handlers using unified system
  const handleChallengeSelect = (challenge: Challenge) => {
    startChallenge(challenge);
    setActiveScreen("challenge");
  };

  const handleChallengeComplete = async (result: ChallengeResult) => {
    try {
      await completeChallenge(result);
      // Navigate to discovery to see the performance
      setActiveScreen("discovery");
    } catch (error) {
      console.error("Failed to complete challenge:", error);
    }
  };

  const handleChallengeCancel = () => {
    cancelChallenge();
    setActiveScreen("home");
  };

  const handleQuickChallenge = () => {
    // Quick start with a featured challenge - this would get the first featured challenge
    setActiveScreen("home"); // Let user pick from discovery hub
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

  const renderScreen = () => {
    if (isLoading) {
      return <FullScreenLoading message="Loading..." showLogo={false} />;
    }

    // If there's an active challenge, show the challenge flow
    if (isChallengeActive && currentChallenge) {
      return (
        <ChallengeFlow
          challenge={currentChallenge}
          onComplete={handleChallengeComplete}
          onCancel={handleChallengeCancel}
        />
      );
    }

    switch (activeScreen) {
      case "home":
        return (
          <Container maxWidth="xl" className="space-y-12">
            {/* Welcome Section */}
            <Section
              centerTitle
              title={
                <>
                  Welcome back
                  {userInfo?.display_name
                    ? `, ${userInfo.display_name}`
                    : ""}!
                </>
              }
              subtitle="Ready to showcase your vocal talents?"
            />

            {/* Challenge Discovery Hub */}
            <Section
              title="Featured Challenges"
              subtitle="Jump into our top vocal challenges"
            >
              <ChallengeDiscovery
                onChallengeSelect={handleChallengeSelect}
                onViewAllChallenges={() => {
                  // Could navigate to a full challenge browser
                  console.log("View all challenges");
                }}
                maxItems={5}
              />
            </Section>

            {/* Viral CTA Section */}
            <Section centerTitle>
              <motion.div
                className="max-w-3xl mx-auto rounded-3xl p-10 bg-gradient-to-r from-purple-500/30 to-blue-600/30 backdrop-blur-md border border-purple-500/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to go viral?
                </h3>
                <p className="text-slate-200 mb-8">
                  Kick-off any challenge and watch your performance climb the
                  leaderboards. Become the next vocal sensation on GIGAVIBE!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={handleQuickChallenge}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  >
                    Start Singing
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setActiveScreen('discovery')}
                  >
                    Explore Performances
                  </Button>
                </div>
              </motion.div>
            </Section>
          </Container>
        );
      case "challenge":
        // This case is handled above by the isChallengeActive check
        return null;
      case "discovery":
        return <DiscoveryFeed initialFeedType="foryou" />;
      case "judging":
        return <PeerJudging />;
      case "leaderboard":
        return <MarketLeaderboard />;
      default:
        return (
          <ChallengeDiscovery
            onChallengeSelect={handleChallengeSelect}
            onViewAllChallenges={() => console.log("View all challenges")}
          />
        );
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

      {/* Floating Quick Challenge Button */}
      <motion.button
        onClick={handleQuickChallenge}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-gigavibe-500/25 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}

// No longer needed as we're using MarketLeaderboard component
