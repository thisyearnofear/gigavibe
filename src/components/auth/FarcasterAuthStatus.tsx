'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';
import SIWNButton, { FarcasterProfile } from './SIWNButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FarcasterAuthStatusProps {
  compact?: boolean;
  showSignInButton?: boolean;
  className?: string;
}

export default function FarcasterAuthStatus({ 
  compact = false, 
  showSignInButton = true,
  className = '' 
}: FarcasterAuthStatusProps) {
  const { 
    isAuthenticated, 
    user, 
    loading, 
    error, 
    signIn, 
    signOut, 
    clearError,
    canPost 
  } = useFarcasterAuth();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-500/20 border-red-500/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <Button
              onClick={clearError}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 p-1 h-auto"
            >
              ✕
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated && user) {
    if (compact) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <img
            src={user.pfp_url}
            alt={user.display_name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-white text-sm">@{user.username}</span>
          <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
            {canPost ? 'Connected' : 'Read Only'}
          </Badge>
        </div>
      );
    }

    return (
      <div className={className}>
        <FarcasterProfile user={user} onSignOut={signOut} />
      </div>
    );
  }

  if (!showSignInButton) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <User className="w-4 h-4" />
        <span className="text-sm">Not connected to Farcaster</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <SIWNButton
        onSuccess={signIn}
        onError={(error) => console.error('SIWN Error:', error)}
        theme="dark"
      />
    </div>
  );
}

// Compact version for inline use
export function FarcasterAuthBadge({ className = '' }: { className?: string }) {
  const { isAuthenticated, user, canPost } = useFarcasterAuth();

  if (!isAuthenticated || !user) {
    return (
      <Badge variant="outline" className={`text-gray-400 border-gray-600 ${className}`}>
        Not Connected
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`text-green-400 border-green-400 ${className}`}
    >
      <div className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        @{user.username}
      </div>
    </Badge>
  );
}

// Status indicator for upload interfaces
export function FarcasterUploadStatus({ className = '' }: { className?: string }) {
  const { isAuthenticated, user, canPost, hasValidSigner } = useFarcasterAuth();

  if (!isAuthenticated) {
    return (
      <div className={`text-center text-gray-400 text-sm ${className}`}>
        <User className="w-4 h-4 mx-auto mb-1" />
        Local upload only
      </div>
    );
  }

  if (!canPost || !hasValidSigner) {
    return (
      <div className={`text-center text-yellow-400 text-sm ${className}`}>
        <AlertCircle className="w-4 h-4 mx-auto mb-1" />
        Read-only mode
      </div>
    );
  }

  return (
    <div className={`text-center text-green-400 text-sm ${className}`}>
      <CheckCircle className="w-4 h-4 mx-auto mb-1" />
      Posting as @{user?.username}
    </div>
  );
}