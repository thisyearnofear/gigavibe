
'use client';

import { useState } from 'react';
import { Mic, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FarcasterAuthStatus } from '@/components/auth/FarcasterAuthStatus';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import SIWEButton from '@/components/auth/SIWEButton';
import SIWNButton from '@/components/auth/SIWNButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MobileAuthSheet from '@/components/auth/MobileAuthSheet';

const Header = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { isAuthenticated, displayName, avatarUrl, authMethod, setEthUser } = useUnifiedAuth();

  const AuthModal = () => (
    <Sheet open={isAuthOpen} onOpenChange={setIsAuthOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName || 'User'} 
              className="w-4 h-4 rounded-full"
            />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isAuthenticated ? displayName : 'Sign In'}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md bg-gradient-to-br from-gray-900 to-indigo-900 text-white border-gray-700">
        <SheetHeader>
          <SheetTitle className="text-white">
            {isAuthenticated ? 'Account' : 'Sign In'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          {isAuthenticated ? (
            <FarcasterAuthStatus compact={false} showSignInButton={false} />
          ) : (
            <Tabs defaultValue="farcaster" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="farcaster" className="data-[state=active]:bg-purple-600">
                  Farcaster
                </TabsTrigger>
                <TabsTrigger value="ethereum" className="data-[state=active]:bg-indigo-600">
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
                    onError={(error) => console.error('SIWN Error:', error)}
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
                    onError={(error) => console.error('SIWE Error:', error)}
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
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 py-3 sticky top-0 z-40">
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
          {isAuthenticated && authMethod === 'farcaster' ? (
            <FarcasterAuthStatus compact={true} showSignInButton={false} />
          ) : isAuthenticated && authMethod === 'ethereum' ? (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span>{displayName}</span>
            </div>
          ) : null}
          <AuthModal />
        </div>

        {/* Mobile Auth */}
        <div className="flex md:hidden items-center">
          <MobileAuthSheet>
            <Button variant="ghost" size="sm" className="gap-2">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName || 'User'} 
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              {isAuthenticated ? (
                <span className="text-sm">{displayName}</span>
              ) : (
                <span className="text-sm">Sign In</span>
              )}
            </Button>
          </MobileAuthSheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
