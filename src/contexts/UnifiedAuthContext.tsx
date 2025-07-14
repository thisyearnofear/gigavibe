'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFarcasterAuth } from './FarcasterAuthContext';
import { AUTH_CONFIG, validateAuthSession } from '@/config/auth.config';

interface EthUser {
  address: string;
  fid?: string;
  username?: string;
}

interface UnifiedAuthContextType {
  // Combined auth state
  isAuthenticated: boolean;
  user: any | null;
  authMethod: 'farcaster' | 'ethereum' | null;
  loading: boolean;
  error: string | null;
  
  // Auth actions
  signOut: () => void;
  clearError: () => void;
  
  // Ethereum specific
  ethUser: EthUser | null;
  setEthUser: (user: EthUser | null) => void;
  
  // Computed values
  canPost: boolean;
  displayName: string | null;
  avatarUrl: string | null;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

const STORAGE_KEYS = AUTH_CONFIG.STORAGE_KEYS;

export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const [ethUser, setEthUserState] = useState<EthUser | null>(null);
  const [authMethod, setAuthMethod] = useState<'farcaster' | 'ethereum' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use existing Farcaster auth context
  const farcasterAuth = useFarcasterAuth();

  // Load saved eth auth data on mount
  useEffect(() => {
    loadSavedEthAuth();
  }, []);

  // Update loading state based on both auth methods
  useEffect(() => {
    setLoading(farcasterAuth.loading);
  }, [farcasterAuth.loading]);

  const loadSavedEthAuth = () => {
    try {
      const savedEthUser = localStorage.getItem(STORAGE_KEYS.ETH_USER);
      const savedTimestamp = localStorage.getItem(STORAGE_KEYS.ETH_TIMESTAMP);
      const savedAuthMethod = localStorage.getItem(STORAGE_KEYS.AUTH_METHOD);

      if (savedEthUser && savedTimestamp) {
        const timestamp = parseInt(savedTimestamp);
        const now = Date.now();

        if (validateAuthSession(timestamp)) {
          const userData = JSON.parse(savedEthUser);
          setEthUserState(userData);
          if (savedAuthMethod === 'ethereum') {
            setAuthMethod('ethereum');
          }
          console.log('✅ Restored Ethereum auth from storage');
        } else {
          console.log('⚠️ Ethereum auth expired, clearing storage');
          clearEthStoredAuth();
        }
      }
    } catch (error) {
      console.error('Failed to load saved eth auth:', error);
      clearEthStoredAuth();
    }
  };

  const saveEthAuthToStorage = (userData: EthUser) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ETH_USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.ETH_TIMESTAMP, Date.now().toString());
      localStorage.setItem(STORAGE_KEYS.AUTH_METHOD, 'ethereum');
    } catch (error) {
      console.error('Failed to save eth auth to storage:', error);
    }
  };

  const clearEthStoredAuth = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ETH_USER);
      localStorage.removeItem(STORAGE_KEYS.ETH_TIMESTAMP);
      localStorage.removeItem(STORAGE_KEYS.AUTH_METHOD);
    } catch (error) {
      console.error('Failed to clear eth stored auth:', error);
    }
  };

  const setEthUser = (user: EthUser | null) => {
    setEthUserState(user);
    if (user) {
      setAuthMethod('ethereum');
      saveEthAuthToStorage(user);
    } else {
      clearEthStoredAuth();
      if (authMethod === 'ethereum') {
        setAuthMethod(null);
      }
    }
  };

  // Update auth method when Farcaster auth changes
  useEffect(() => {
    if (farcasterAuth.isAuthenticated) {
      setAuthMethod('farcaster');
      // Clear eth auth when switching to Farcaster
      setEthUserState(null);
      clearEthStoredAuth();
    } else if (authMethod === 'farcaster') {
      setAuthMethod(null);
    }
  }, [farcasterAuth.isAuthenticated]);

  const signOut = () => {
    // Sign out from both methods
    farcasterAuth.signOut();
    setEthUser(null);
    setAuthMethod(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
    farcasterAuth.clearError();
  };

  // Computed values
  const isAuthenticated = farcasterAuth.isAuthenticated || !!ethUser;
  const user = farcasterAuth.user || ethUser;
  const canPost = farcasterAuth.canPost || false; // Only Farcaster can post
  
  const displayName = farcasterAuth.user?.display_name || 
                     farcasterAuth.user?.username || 
                     ethUser?.username || 
                     (ethUser?.address ? `${ethUser.address.substring(0, 6)}...${ethUser.address.substring(38)}` : null);
  
  const avatarUrl = farcasterAuth.user?.pfp_url || null;

  const value: UnifiedAuthContextType = {
    // Combined auth state
    isAuthenticated,
    user,
    authMethod,
    loading,
    error: error || farcasterAuth.error,
    
    // Auth actions
    signOut,
    clearError,
    
    // Ethereum specific
    ethUser,
    setEthUser,
    
    // Computed values
    canPost,
    displayName,
    avatarUrl
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
}

// Optional hook that doesn't throw
export function useUnifiedAuthOptional() {
  const context = useContext(UnifiedAuthContext);
  return context;
}