"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useFarcasterAuth } from "./FarcasterAuthContext";
import { AUTH_CONFIG, validateAuthSession } from "@/config/auth.config";
import {
  quickResolveProfile,
  type UnifiedProfile,
} from "@/lib/profile/resolver";

interface EthUser {
  address: string;
  fid?: string;
  username?: string;
}

interface UnifiedAuthContextType {
  // Combined auth state
  isAuthenticated: boolean;
  user: any | null;
  authMethod: "farcaster" | "ethereum" | null;
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

  // Profile resolution
  resolvedProfile: UnifiedProfile | null;
  profileLoading: boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(
  undefined
);

const STORAGE_KEYS = AUTH_CONFIG.STORAGE_KEYS;

export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const [ethUser, setEthUserState] = useState<EthUser | null>(null);
  const [authMethod, setAuthMethod] = useState<"farcaster" | "ethereum" | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile resolution state
  const [resolvedProfile, setResolvedProfile] = useState<UnifiedProfile | null>(
    null
  );
  const [profileLoading, setProfileLoading] = useState(false);

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
          if (savedAuthMethod === "ethereum") {
            setAuthMethod("ethereum");
          }
          console.log("✅ Restored Ethereum auth from storage");
        } else {
          console.log("⚠️ Ethereum auth expired, clearing storage");
          clearEthStoredAuth();
        }
      }
    } catch (error) {
      console.error("Failed to load saved eth auth:", error);
      clearEthStoredAuth();
    }
  };

  const saveEthAuthToStorage = (userData: EthUser) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ETH_USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.ETH_TIMESTAMP, Date.now().toString());
      localStorage.setItem(STORAGE_KEYS.AUTH_METHOD, "ethereum");
    } catch (error) {
      console.error("Failed to save eth auth to storage:", error);
    }
  };

  const clearEthStoredAuth = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ETH_USER);
      localStorage.removeItem(STORAGE_KEYS.ETH_TIMESTAMP);
      localStorage.removeItem(STORAGE_KEYS.AUTH_METHOD);
    } catch (error) {
      console.error("Failed to clear eth stored auth:", error);
    }
  };

  const setEthUser = (user: EthUser | null) => {
    setEthUserState(user);
    if (user) {
      setAuthMethod("ethereum");
      saveEthAuthToStorage(user);
    } else {
      clearEthStoredAuth();
      if (authMethod === "ethereum") {
        setAuthMethod(null);
      }
    }
  };

  // Update auth method when Farcaster auth changes
  useEffect(() => {
    if (farcasterAuth.isAuthenticated) {
      setAuthMethod("farcaster");
      // Clear eth auth when switching to Farcaster
      setEthUserState(null);
      clearEthStoredAuth();
    } else if (authMethod === "farcaster") {
      setAuthMethod(null);
    }
  }, [farcasterAuth.isAuthenticated]);

  // Computed values
  const isAuthenticated = farcasterAuth.isAuthenticated || !!ethUser;
  const user = farcasterAuth.user || ethUser;
  const canPost = farcasterAuth.canPost || false; // Only Farcaster can post

  const displayName =
    resolvedProfile?.displayName ||
    farcasterAuth.user?.display_name ||
    farcasterAuth.user?.username ||
    ethUser?.username ||
    (ethUser?.address
      ? `${ethUser.address.substring(0, 6)}...${ethUser.address.substring(38)}`
      : null);

  const avatarUrl =
    resolvedProfile?.avatar || farcasterAuth.user?.pfp_url || null;

  // Profile resolution effect
  useEffect(() => {
    const resolveUserProfile = async () => {
      if (!isAuthenticated) {
        setResolvedProfile(null);
        return;
      }

      // Get the address to resolve - for now just use ethUser address
      let addressToResolve: string | null = null;

      if (authMethod === "ethereum" && ethUser?.address) {
        addressToResolve = ethUser.address;
      }
      // Note: Farcaster user type doesn't have verified_addresses,
      // we'll need to get this from a different source or API call

      if (!addressToResolve) {
        setResolvedProfile(null);
        return;
      }

      setProfileLoading(true);
      try {
        const profile = await quickResolveProfile(addressToResolve);
        setResolvedProfile(profile);
      } catch (error) {
        console.error("Failed to resolve profile:", error);
        setResolvedProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    resolveUserProfile();
  }, [isAuthenticated, authMethod, ethUser?.address]);

  const signOut = () => {
    // Sign out from both methods
    farcasterAuth.signOut();
    setEthUser(null);
    setAuthMethod(null);
    setError(null);
    setResolvedProfile(null);
  };

  const clearError = () => {
    setError(null);
    farcasterAuth.clearError();
  };

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
    avatarUrl,

    // Profile resolution
    resolvedProfile,
    profileLoading,
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
    throw new Error("useUnifiedAuth must be used within a UnifiedAuthProvider");
  }
  return context;
}

// Optional hook that doesn't throw
export function useUnifiedAuthOptional() {
  const context = useContext(UnifiedAuthContext);
  return context;
}
