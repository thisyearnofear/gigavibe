'use client';

import { useEffect, useState } from 'react';

/**
 * Client-only wrapper to prevent SSR hydration mismatches
 * Use this for components that rely on browser-only APIs
 */
export function ClientOnly({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if we're on the client side
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Safe window object access
 */
export function safeWindow<T>(callback: (window: Window) => T, fallback?: T): T | undefined {
  if (typeof window !== 'undefined') {
    try {
      return callback(window);
    } catch (error) {
      console.warn('Error accessing window object:', error);
      return fallback;
    }
  }
  return fallback;
}

/**
 * Safe localStorage access
 */
export function safeLocalStorage() {
  return {
    getItem: (key: string): string | null => {
      return safeWindow((window) => window.localStorage.getItem(key), null) || null;
    },
    setItem: (key: string, value: string): void => {
      safeWindow((window) => window.localStorage.setItem(key, value));
    },
    removeItem: (key: string): void => {
      safeWindow((window) => window.localStorage.removeItem(key));
    }
  };
}

/**
 * Safe sessionStorage access
 */
export function safeSessionStorage() {
  return {
    getItem: (key: string): string | null => {
      return safeWindow((window) => window.sessionStorage.getItem(key), null) || null;
    },
    setItem: (key: string, value: string): void => {
      safeWindow((window) => window.sessionStorage.setItem(key, value));
    },
    removeItem: (key: string): void => {
      safeWindow((window) => window.sessionStorage.removeItem(key));
    }
  };
}