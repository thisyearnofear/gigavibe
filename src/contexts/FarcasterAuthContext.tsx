'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  bio: {
    text: string;
  };
  follower_count: number;
  following_count: number;
}

interface FarcasterAuthData {
  signer_uuid: string;
  fid: number;
  user: FarcasterUser;
}

interface FarcasterAuthContextType {
  // Auth state
  isAuthenticated: boolean;
  user: FarcasterUser | null;
  signerUuid: string | null;
  loading: boolean;
  error: string | null;
  
  // Auth actions
  signIn: (data: FarcasterAuthData) => void;
  signOut: () => void;
  clearError: () => void;
  
  // Computed
  canPost: boolean;
  hasValidSigner: boolean;
}

const FarcasterAuthContext = createContext<FarcasterAuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SIGNER_UUID: 'gigavibe_signer_uuid',
  USER_DATA: 'gigavibe_user_data',
  AUTH_TIMESTAMP: 'gigavibe_auth_timestamp'
};

const AUTH_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export function FarcasterAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [signerUuid, setSignerUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved auth data on mount
  useEffect(() => {
    loadSavedAuth();
  }, []);

  const loadSavedAuth = () => {
    try {
      const savedSignerUuid = localStorage.getItem(STORAGE_KEYS.SIGNER_UUID);
      const savedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const savedTimestamp = localStorage.getItem(STORAGE_KEYS.AUTH_TIMESTAMP);

      if (savedSignerUuid && savedUserData && savedTimestamp) {
        const timestamp = parseInt(savedTimestamp);
        const now = Date.now();

        // Check if auth is still valid (not expired)
        if (now - timestamp < AUTH_EXPIRY) {
          const userData = JSON.parse(savedUserData);
          setSignerUuid(savedSignerUuid);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ Restored Farcaster auth from storage');
        } else {
          console.log('⚠️ Farcaster auth expired, clearing storage');
          clearStoredAuth();
        }
      }
    } catch (error) {
      console.error('Failed to load saved auth:', error);
      clearStoredAuth();
    } finally {
      setLoading(false);
    }
  };

  const saveAuthToStorage = (signerUuid: string, userData: FarcasterUser) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIGNER_UUID, signerUuid);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.AUTH_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Failed to save auth to storage:', error);
    }
  };

  const clearStoredAuth = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SIGNER_UUID);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TIMESTAMP);
    } catch (error) {
      console.error('Failed to clear stored auth:', error);
    }
  };

  const signIn = (data: FarcasterAuthData) => {
    try {
      setLoading(true);
      setError(null);

      // Validate the data
      if (!data.signer_uuid || !data.user || !data.fid) {
        throw new Error('Invalid authentication data received');
      }

      // Update state
      setSignerUuid(data.signer_uuid);
      setUser(data.user);
      setIsAuthenticated(true);

      // Save to storage
      saveAuthToStorage(data.signer_uuid, data.user);

      console.log('✅ Farcaster sign in successful:', {
        fid: data.fid,
        username: data.user.username,
        signerUuid: data.signer_uuid
      });
    } catch (err: any) {
      console.error('❌ Farcaster sign in failed:', err);
      setError(err.message || 'Sign in failed');
      signOut(); // Clear any partial state
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    try {
      setLoading(true);
      
      // Clear state
      setIsAuthenticated(false);
      setUser(null);
      setSignerUuid(null);
      setError(null);

      // Clear storage
      clearStoredAuth();

      console.log('✅ Farcaster sign out successful');
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Computed values
  const canPost = isAuthenticated && !!signerUuid && !!user;
  const hasValidSigner = !!signerUuid;

  const value: FarcasterAuthContextType = {
    // Auth state
    isAuthenticated,
    user,
    signerUuid,
    loading,
    error,
    
    // Auth actions
    signIn,
    signOut,
    clearError,
    
    // Computed
    canPost,
    hasValidSigner
  };

  return (
    <FarcasterAuthContext.Provider value={value}>
      {children}
    </FarcasterAuthContext.Provider>
  );
}

export function useFarcasterAuth() {
  const context = useContext(FarcasterAuthContext);
  if (context === undefined) {
    throw new Error('useFarcasterAuth must be used within a FarcasterAuthProvider');
  }
  return context;
}

// Hook for checking auth status without throwing
export function useFarcasterAuthOptional() {
  const context = useContext(FarcasterAuthContext);
  return context;
}