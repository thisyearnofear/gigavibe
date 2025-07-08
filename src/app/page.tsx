"use client";

import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useFilCDN } from "@/providers/FilCDNProvider";
import MainNavigation from "@/components/MainNavigation";
import FilCDNSetup from "@/components/FilCDNSetup";

export default function HomePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const {
    isInitialized,
    error: filcdnError,
    needsPaymentSetup,
    clientAddress,
  } = useFilCDN();

  // Initialize MiniKit when ready
  useEffect(() => {
    if (!isFrameReady && isInitialized) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady, isInitialized]);

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="text-white font-medium">
            Loading GIGAVIBE...
          </span>
        </div>
      </div>
    );
  }

  return <MainNavigation />;
}
