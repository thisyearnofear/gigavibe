"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X, Wallet, Users, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FarcasterAuthStatus } from "@/components/auth/FarcasterAuthStatus";
import { useFarcasterAuth } from "@/contexts/FarcasterAuthContext";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import SIWEButton from "@/components/auth/SIWEButton";
import SIWNButton from "@/components/auth/SIWNButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MobileAuthSheetProps {
  children: React.ReactNode;
  onAuthSuccess?: () => void;
}

export default function MobileAuthSheet({
  children,
  onAuthSuccess,
}: MobileAuthSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [authMethod, setAuthMethod] = useState<
    "select" | "farcaster" | "ethereum"
  >("select");
  const {
    isAuthenticated,
    displayName,
    avatarUrl,
    authMethod: currentAuthMethod,
    setEthUser,
  } = useUnifiedAuth();
  const farcasterAuth = useFarcasterAuth();

  const handleSuccess = () => {
    setIsOpen(false);
    setAuthMethod("select");
    // Call the callback to continue the upload flow
    onAuthSuccess?.();
  };

  const handleBack = () => {
    setAuthMethod("select");
  };

  const AuthMethodSelector = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Choose how to sign in
        </h3>
        <p className="text-gray-400 text-sm">
          Connect your account to unlock all features
        </p>
      </div>

      <Card
        className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors"
        onClick={() => setAuthMethod("farcaster")}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-base">
                  Farcaster
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Social features & casting
                </CardDescription>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
      </Card>

      <Card
        className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-800/70 transition-colors"
        onClick={() => setAuthMethod("ethereum")}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Ethereum</CardTitle>
                <CardDescription className="text-gray-400">
                  Wallet connection
                </CardDescription>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
      </Card>

      <div className="flex items-center gap-2 text-gray-400 text-xs mt-4">
        <Shield className="w-4 h-4" />
        <span>Your data is secure and never shared</span>
      </div>
    </div>
  );

  const FarcasterAuth = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-gray-400 hover:text-white p-2"
        >
          ←
        </Button>
        <h3 className="text-lg font-semibold text-white">
          Sign in with Farcaster
        </h3>
      </div>

      <Card className="bg-purple-600/20 border-purple-500/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Farcaster Account</CardTitle>
              <CardDescription className="text-gray-300">
                Connect to unlock social features
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-300 mb-4 text-sm">
              Sign in with your Farcaster account to cast, follow, and interact
              with the community
            </p>
            <SIWNButton
              onSuccess={(data) => {
                // Update the Farcaster auth context
                farcasterAuth.signIn(data);
                handleSuccess();
              }}
              onError={(error) => console.error("SIWN Error:", error)}
              theme="dark"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const EthereumAuth = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-gray-400 hover:text-white p-2"
        >
          ←
        </Button>
        <h3 className="text-lg font-semibold text-white">
          Sign in with Ethereum
        </h3>
      </div>

      <Card className="bg-indigo-600/20 border-indigo-500/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Ethereum Wallet</CardTitle>
              <CardDescription className="text-gray-300">
                Connect your wallet to sign in
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-300 mb-4 text-sm">
              Connect your Ethereum wallet to sign in securely with SIWE
            </p>
            <SIWEButton
              onSuccess={(user) => {
                setEthUser(user);
                handleSuccess();
              }}
              onError={(error) => console.error("SIWE Error:", error)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[80vh] bg-gradient-to-br from-gray-900 to-indigo-900 text-white border-gray-700 rounded-t-3xl"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white text-center">
            {isAuthenticated ? "Account" : "Sign In"}
          </SheetTitle>
        </SheetHeader>

        <div className="h-full overflow-y-auto">
          {isAuthenticated ? (
            <div className="pt-4">
              <FarcasterAuthStatus compact={false} showSignInButton={false} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={authMethod}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {authMethod === "select" && <AuthMethodSelector />}
                {authMethod === "farcaster" && <FarcasterAuth />}
                {authMethod === "ethereum" && <EthereumAuth />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
