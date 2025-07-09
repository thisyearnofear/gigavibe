"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Synapse } from "@filoz/synapse-sdk";

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
  const [isOptional, setIsOptional] = useState(true); // Default to optional

  useEffect(() => {
    initializeFilCDN();
  }, []);

  const initializeFilCDN = async () => {
    try {
      setError(null);

      // Check if we have the required environment variables
      const privateKey = process.env.NEXT_PUBLIC_FILECOIN_PRIVATE_KEY;
      const rpcURL =
        process.env.NEXT_PUBLIC_FILECOIN_RPC_URL ||
        "https://api.calibration.node.glif.io/rpc/v1";

      if (!privateKey) {
        // Instead of throwing an error, just log and mark FilCDN as not initialized
        console.log(
          "⚠️ FilCDN disabled: NEXT_PUBLIC_FILECOIN_PRIVATE_KEY not found"
        );
        setIsInitialized(true); // Mark as initialized so the app can continue
        return; // Exit initialization early
      }

      console.log("🔄 Initializing Synapse SDK...");

      // Initialize Synapse SDK for Filecoin Calibration testnet
      const synapseInstance = await Synapse.create({
        withCDN: true,
        privateKey: privateKey,
        rpcURL: rpcURL,
      });

      console.log("✓ Synapse SDK initialized");

      // Get client address for FilCDN URLs
      const address = await synapseInstance.getSigner().getAddress();
      setClientAddress(address);
      console.log(`✓ Client address: ${address}`);

      // Create storage service with detailed callbacks
      const storage = await synapseInstance.createStorage({
        callbacks: {
          onProviderSelected: (provider: any) => {
            console.log(`✓ Selected storage provider: ${provider.owner}`);
            console.log(`  PDP URL: ${provider.pdpUrl}`);
          },
          onProofSetResolved: (info: any) => {
            if (info.isExisting) {
              console.log(`✓ Using existing proof set: ${info.proofSetId}`);
            } else {
              console.log(`✓ Created new proof set: ${info.proofSetId}`);
            }
          },
          onProofSetCreationStarted: (transaction: any, statusUrl: string) => {
            console.log(`  Creating proof set, tx: ${transaction.hash}`);
          },
          onProofSetCreationProgress: (progress: any) => {
            if (progress.transactionMined && !progress.proofSetLive) {
              console.log(
                "  Transaction mined, waiting for proof set to be live..."
              );
            }
          },
        },
      });

      setSynapse(synapseInstance);
      setStorageService(storage);
      setIsInitialized(true);
      console.log("✅ FilCDN initialized successfully");
    } catch (err) {
      console.error("❌ Failed to initialize FilCDN:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);

      // Check if it's a payment setup issue
      if (
        errorMessage.includes("allowance") ||
        errorMessage.includes("insufficient")
      ) {
        setNeedsPaymentSetup(true);
      }
    }
  };

  const uploadFile = async (fileData: ArrayBuffer): Promise<string> => {
    if (!storageService) {
      throw new Error("Storage service not initialized");
    }

    try {
      // Run preflight checks
      const preflight = await storageService.preflightUpload(
        fileData.byteLength
      );

      if (!preflight.allowanceCheck.sufficient) {
        throw new Error(
          "Allowance not sufficient. Please increase allowance via the web app."
        );
      }

      const uploadResult = await storageService.upload(fileData);
      return uploadResult.commp; // Return the CID
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
    }
  };

  const downloadFile = async (cid: string): Promise<ArrayBuffer> => {
    if (!synapse) {
      throw new Error("Synapse not initialized");
    }

    try {
      const downloadedData = await synapse.download(cid);
      return downloadedData;
    } catch (err) {
      console.error("Download failed:", err);
      throw err;
    }
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
