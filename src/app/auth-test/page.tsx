"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw } from "lucide-react";
import SIWEButton from "@/components/auth/SIWEButton";
import SIWNButton, { FarcasterProfile } from "@/components/auth/SIWNButton";
import { useFarcasterAuth } from "@/contexts/FarcasterAuthContext";

interface EthUser {
  address: string;
  fid?: string;
  username?: string;
}

export default function AuthTestPage() {
  const [activeTab, setActiveTab] = useState<string>("siwe");
  const [ethUser, setEthUser] = useState<EthUser | null>(null);
  const [ethError, setEthError] = useState<string | null>(null);
  const {
    user: farcasterUser,
    signIn,
    signOut,
    isAuthenticated,
  } = useFarcasterAuth();

  const handleSIWESuccess = (user: EthUser) => {
    setEthUser(user);
    setEthError(null);
  };

  const handleSIWEError = (error: string) => {
    setEthError(error);
    setEthUser(null);
  };

  const handleEthSignOut = () => {
    setEthUser(null);
    setEthError(null);
  };

  const handleSIWNSuccess = (data: any) => {
    signIn(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Authentication Test Page</h1>
          <p className="text-gray-300">
            Test both SIWE (Ethereum) and SIWN (Farcaster) authentication
            methods
          </p>
        </header>

        <Tabs
          defaultValue="siwe"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <div className="flex justify-center mb-4">
            <TabsList className="bg-gray-800">
              <TabsTrigger
                value="siwe"
                className="data-[state=active]:bg-indigo-600"
              >
                Sign-In with Ethereum
              </TabsTrigger>
              <TabsTrigger
                value="siwn"
                className="data-[state=active]:bg-purple-600"
              >
                Sign-In with Farcaster
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="siwe" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>SIWE Authentication</span>
                  {ethUser && (
                    <Badge
                      variant="outline"
                      className="bg-green-900/30 text-green-400 border-green-500"
                    >
                      Connected
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ethUser ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900 rounded-lg">
                      <div className="mb-2 text-gray-400 text-sm">
                        Connected Address:
                      </div>
                      <div className="font-mono bg-gray-950 p-2 rounded overflow-auto text-green-400">
                        {ethUser.address}
                      </div>
                    </div>

                    {ethUser.fid && (
                      <div className="p-4 bg-gray-900 rounded-lg">
                        <div className="mb-2 text-gray-400 text-sm">
                          Farcaster ID:
                        </div>
                        <div className="font-mono bg-gray-950 p-2 rounded overflow-auto text-purple-400">
                          {ethUser.fid}
                        </div>
                      </div>
                    )}

                    {ethUser.username && (
                      <div className="p-4 bg-gray-900 rounded-lg">
                        <div className="mb-2 text-gray-400 text-sm">
                          Username:
                        </div>
                        <div className="font-mono bg-gray-950 p-2 rounded overflow-auto text-blue-400">
                          {ethUser.username}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleEthSignOut}
                      className="w-full mt-4 bg-red-900 hover:bg-red-800 text-white"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300 mb-4">
                      Connect your Ethereum wallet to sign in. This uses the
                      native SIWE protocol.
                    </p>
                    <SIWEButton
                      onSuccess={handleSIWESuccess}
                      onError={handleSIWEError}
                    />

                    {ethError && (
                      <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm mt-4">
                        {ethError}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="siwn" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Farcaster Authentication</span>
                  {isAuthenticated && (
                    <Badge
                      variant="outline"
                      className="bg-purple-900/30 text-purple-400 border-purple-500"
                    >
                      Connected
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAuthenticated && farcasterUser ? (
                  <FarcasterProfile user={farcasterUser} onSignOut={signOut} />
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300 mb-4">
                      Connect your Farcaster account to sign in. This uses the
                      Neynar SIWN protocol.
                    </p>
                    <SIWNButton
                      onSuccess={handleSIWNSuccess}
                      onError={(error) => console.error("SIWN Error:", error)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}
