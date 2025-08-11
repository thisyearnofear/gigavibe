"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

interface FilCDNContextType {
  synapse: any | null;
  storageService: any | null;
  isInitialized: boolean;
  uploadFile: (fileData: ArrayBuffer) => Promise<string>;
  downloadFile: (cid: string) => Promise<ArrayBuffer>;
  error: string | null;
  needsPaymentSetup: boolean;
  clientAddress: string | null;
  isOptional: boolean;
}

const FilCDNContext = createContext<FilCDNContextType | undefined>(undefined);

export function FilCDNProvider({ children }: { children: ReactNode }) {
  const [synapse, setSynapse] = useState<any>(null);
  const [storageService, setStorageService] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPaymentSetup, setNeedsPaymentSetup] = useState(false);
  const [clientAddress, setClientAddress] = useState<string | null>(null);
  const [isOptional, setIsOptional] = useState(true);

  useEffect(() => {
    initializeFilCDN();
  }, []);

  const initializeFilCDN = async () => {
    try {
      setError(null);

      // Check if we have the required environment variables
      const privateKey = process.env.NEXT_PUBLIC_FILECOIN_PRIVATE_KEY;

      if (!privateKey) {
        console.info(
          "FilCDN disabled: NEXT_PUBLIC_FILECOIN_PRIVATE_KEY not found (optional service)"
        );
        setIsInitialized(true);
        return;
      }

      // For now, just mark as initialized without actual Synapse SDK
      // This prevents the app from breaking when FilCDN is not configured
      console.info("FilCDN initialization skipped - using fallback storage");
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize FilCDN:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setIsInitialized(true); // Still mark as initialized to prevent app blocking
    }
  };

  const uploadFile = async (fileData: ArrayBuffer): Promise<string> => {
    throw new Error("FilCDN not configured - please use alternative storage");
  };

  const downloadFile = async (cid: string): Promise<ArrayBuffer> => {
    throw new Error("FilCDN not configured - please use alternative storage");
  };

  const value: FilCDNContextType = {
    synapse,
    storageService,
    isInitialized,
    uploadFile,
    downloadFile,
    error,
    needsPaymentSetup,
    clientAddress,
    isOptional,
  };

  return (
    <FilCDNContext.Provider value={value}>{children}</FilCDNContext.Provider>
  );
}

export function useFilCDN() {
  const context = useContext(FilCDNContext);
  if (context === undefined) {
    throw new Error("useFilCDN must be used within a FilCDNProvider");
  }
  return context;
}