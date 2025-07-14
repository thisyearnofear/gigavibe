"use client";

import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useFilCDN } from "@/providers/FilCDNProvider";
import MainNavigation from "@/components/MainNavigation";
import FilCDNSetup from "@/components/FilCDNSetup";
import { FullScreenLoading } from "@/components/ui/loading";

export default function HomePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const {
    isInitialized,
    error: filcdnError,
    needsPaymentSetup,
    clientAddress,
    isOptional,
  } = useFilCDN();

  // Initialize MiniKit when ready
  useEffect(() => {
    if (!isFrameReady && isInitialized) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady, isInitialized]);

  if ((filcdnError || needsPaymentSetup) && !isOptional) {
    return (
      <FilCDNSetup
        error={filcdnError || ""}
        needsPaymentSetup={needsPaymentSetup}
        clientAddress={clientAddress}
      />
    );
  }

  if (!isInitialized) {
    return <FullScreenLoading />;
  }

  return <MainNavigation />;
}
