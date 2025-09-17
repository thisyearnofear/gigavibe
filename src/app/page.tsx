"use client";

import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useFilCDN } from "@/hooks/useFilCDN";
import MainNavigation from "@/components/MainNavigation";
import { FilCDNSetup } from "@/components/FilCDNSetup";
import { FullScreenLoading } from "@/components/ui/loading";
import StreamlinedOnboarding from "@/components/onboarding/StreamlinedOnboarding";
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
      <FilCDNSetup />
    );
  }

  // Show loading while initializing
  if (!isInitialized) {
    return <FullScreenLoading />;
  }

  // 🎯 ENHANCED: Streamlined onboarding for faster time-to-value
  // Only show main app after onboarding is complete
  if (isOnboardingActive && !hasCompletedOnboarding) {
    return (
      <StreamlinedOnboarding
        onComplete={() => {
          console.log("🎉 Streamlined onboarding completed! User ready for main app.");
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
