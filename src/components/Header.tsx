"use client";

import { useState } from "react";
import { Mic, User, Menu, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileAuthSheet from "@/components/auth/MobileAuthSheet";

const Header = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const {
    isAuthenticated,
    displayName,
    avatarUrl,
    authMethod,
    setEthUser,
    resolvedProfile,
    profileLoading,
  } = useUnifiedAuth();

  const AuthModal = () => (
    <Sheet open={isAuthOpen} onOpenChange={setIsAuthOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName || "User"}
              className="w-4 h-4 rounded-full"
            />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isAuthenticated ? (
              <div className="flex flex-col items-start">
                <span className="text-sm">{displayName}</span>
                {resolvedProfile?.primaryDomain && (
                  <span className="text-xs text-gray-400">
                    {resolvedProfile.primaryDomain}
                  </span>
                )}
              </div>
            ) : (
              "Sign In"
            )}
          </span>
          {profileLoading && (
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-gradient-to-br from-gray-900 to-indigo-900 text-white border-gray-700"
      >
        <SheetHeader>
          <SheetTitle className="text-white">
            {isAuthenticated ? "Account" : "Sign In"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {isAuthenticated ? (
            <div className="space-y-4">
              {/* Enhanced Profile Display */}
              {resolvedProfile ? (
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {resolvedProfile.avatar ? (
                      <img
                        src={resolvedProfile.avatar}
                        alt={resolvedProfile.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">
                        {resolvedProfile.displayName}
                      </h3>
                      {resolvedProfile.primaryDomain && (
                        <p className="text-sm text-purple-400">
                          {resolvedProfile.primaryDomain}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {resolvedProfile.address.substring(0, 6)}...
                        {resolvedProfile.address.substring(38)}
                      </p>
                    </div>
                  </div>

                  {resolvedProfile.description && (
                    <p className="text-sm text-gray-300">
                      {resolvedProfile.description}
                    </p>
                  )}

                  {resolvedProfile.platforms &&
                    resolvedProfile.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resolvedProfile.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-1 bg-gray-700 text-xs rounded-full text-gray-300 capitalize"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}

                  {Object.keys(resolvedProfile.links).length > 0 && (
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Links:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(resolvedProfile.links).map(
                          ([key, url]) => (
                            <a
                              key={key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 capitalize"
                            >
                              {key}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <FarcasterAuthStatus compact={false} showSignInButton={false} />
              )}
            </div>
          ) : (
            <Tabs defaultValue="farcaster" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger
                  value="farcaster"
                  className="data-[state=active]:bg-purple-600"
                >
                  Farcaster
                </TabsTrigger>
                <TabsTrigger
                  value="ethereum"
                  className="data-[state=active]:bg-indigo-600"
                >
                  Ethereum
                </TabsTrigger>
              </TabsList>

              <TabsContent value="farcaster" className="mt-4 space-y-4">
                <div className="text-center">
                  <p className="text-gray-300 mb-4">
                    Connect your Farcaster account to unlock social features
                  </p>
                  <SIWNButton
                    onSuccess={(data) => {
                      // Handle success - context will manage the state
                      setIsAuthOpen(false);
                    }}
                    onError={(error) => console.error("SIWN Error:", error)}
                    theme="dark"
                  />
                </div>
              </TabsContent>

              <TabsContent value="ethereum" className="mt-4 space-y-4">
                <div className="text-center">
                  <p className="text-gray-300 mb-4">
                    Connect your Ethereum wallet to sign in
                  </p>
                  <SIWEButton
                    onSuccess={(user) => {
                      setEthUser(user);
                      setIsAuthOpen(false);
                    }}
                    onError={(error) => console.error("SIWE Error:", error)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            GIGAVIBE
          </h1>
        </div>

        {/* Desktop Auth Status */}
        <div className="hidden md:flex items-center gap-4">
          <AuthModal />
        </div>

        {/* Mobile Auth */}
        <div className="flex md:hidden items-center">
          <MobileAuthSheet>
            <Button variant="ghost" size="sm" className="gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName || "User"}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              {isAuthenticated ? (
                <div className="flex flex-col items-start">
                  <span className="text-sm">{displayName}</span>
                  {resolvedProfile?.primaryDomain && (
                    <span className="text-xs text-gray-400">
                      {resolvedProfile.primaryDomain}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm">Sign In</span>
              )}
              {profileLoading && (
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              )}
            </Button>
          </MobileAuthSheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
