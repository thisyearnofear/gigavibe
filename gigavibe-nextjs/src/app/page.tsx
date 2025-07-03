"use client";

import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useFilCDN } from "@/providers/FilCDNProvider";
import { Zap } from "lucide-react";
import TunerScreen from "@/components/vocal/TunerScreen";
import SocialChallengeScreen from "@/components/SocialChallengeScreen";
import FilCDNSetup from "@/components/FilCDNSetup";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PracticeScreen from "@/components/PracticeScreen";
import ProgressScreen from "@/components/ProgressScreen";
import SettingsScreen from "@/components/SettingsScreen";

export default function HomePage() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const {
    isInitialized,
    error: filcdnError,
    needsPaymentSetup,
    clientAddress,
  } = useFilCDN();
  const [activeScreen, setActiveScreen] = useState("tuner");

  // Initialize MiniKit when ready
  useEffect(() => {
    if (!isFrameReady && isInitialized) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady, isInitialized]);

  const renderScreen = () => {
    switch (activeScreen) {
      case "tuner":
        return <TunerScreen />;
      case "practice":
        return <PracticeScreen />;
      case "progress":
        return <ProgressScreen />;
      case "settings":
        return <SettingsScreen />;
      case "social":
        return <SocialChallengeScreen />;
      default:
        return <TunerScreen />;
    }
  };

  if (filcdnError || needsPaymentSetup) {
    return (
      <FilCDNSetup
        error={filcdnError || ""}
        needsPaymentSetup={needsPaymentSetup}
        clientAddress={clientAddress}
      />
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-purple-700 font-medium">
              Initializing decentralized storage...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col max-w-md mx-auto relative">
      <Header />

      {/* Social Challenge Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setActiveScreen("social")}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center gap-2"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      <main className="flex-1 px-4 py-2 overflow-y-auto pb-20">
        <div className="max-w-sm mx-auto">{renderScreen()}</div>
      </main>

      <BottomNavigation
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
      />
    </div>
  );
}
