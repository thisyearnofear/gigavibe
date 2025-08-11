"use client";

import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useFilCDN } from "@/providers/FilCDNProvider";
import MainNavigation from "@/components/MainNavigation";
import FilCDNSetup from "@/components/FilCDNSetup";
import { FullScreenLoading } from "@/components/ui/loading";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";
import MiniAppView from "@/components/farcaster/MiniAppView";

export default function HomePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const {
    isInitialized,
    error: filcdnError,
    needsPaymentSetup,
    clientAddress,
    isOptional,
  } = useFilCDN();
  const { isOnboardingActive, hasCompletedOnboarding } = useOnboarding();
  const { isMiniApp } = useFarcasterIntegration();

  // Initialize MiniKit when ready
  useEffect(() => {
    if (!isFrameReady && isInitialized) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady, isInitialized]);

  if (isMiniApp) {
    return <MiniAppView />;
  }

  // Handle FilCDN setup requirements
  if ((filcdnError || needsPaymentSetup) && !isOptional) {
    return (
      <FilCDNSetup
        error={filcdnError || ""}
        needsPaymentSetup={needsPaymentSetup}
        clientAddress={clientAddress}
      />
    );
  }

  // Show loading while initializing
  if (!isInitialized) {
    return <FullScreenLoading />;
  }

  // 🎯 KEY CHANGE: Show onboarding FIRST for new users
  // Only show main app after onboarding is complete
  if (isOnboardingActive && !hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          console.log("🎉 Onboarding completed! User ready for main app.");
        }}
        onSkip={() => {
          console.log("⏭️ Onboarding skipped. User entering main app.");
        }}
      />
    );
  }

  // Show main app for returning users or after onboarding completion
  return <MainNavigation />;
}
