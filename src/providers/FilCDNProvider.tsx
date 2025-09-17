"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Synapse, RPC_URLS, TOKENS, CONTRACT_ADDRESSES } from '@filoz/synapse-sdk';
import { ethers } from 'ethers';

interface FilCDNContextType {
  synapse: Synapse | null;
  storageService: any | null;
  isInitialized: boolean;
  uploadFile: (fileData: ArrayBuffer, filename?: string) => Promise<string>;
  downloadFile: (pieceCid: string) => Promise<ArrayBuffer>;
  error: string | null;
  needsPaymentSetup: boolean;
  clientAddress: string | null;
  isOptional: boolean;
  setupPayments: () => Promise<void>;
}

export const FilCDNContext = createContext<FilCDNContextType | undefined>(undefined);

export function FilCDNProvider({ children }: { children: ReactNode }) {
  const [synapse, setSynapse] = useState<Synapse | null>(null);
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

      console.log("🚀 Initializing Filecoin Onchain Cloud with Synapse SDK...");

      // Initialize Synapse SDK with Calibration testnet for development
      const synapseInstance = await Synapse.create({
        privateKey,
        rpcURL: RPC_URLS.calibration.websocket // Use calibration testnet
      });

      setSynapse(synapseInstance);
      
      // Get client address from the wallet
      const wallet = new ethers.Wallet(privateKey);
      setClientAddress(wallet.address);

      // Check if payment setup is needed
      const balance = await synapseInstance.payments.balance();
      const hasBalance = balance > ethers.parseUnits('1', 18); // Check for at least 1 USDFC
      
      if (!hasBalance) {
        setNeedsPaymentSetup(true);
        console.warn("⚠️ Payment setup required: Insufficient USDFC balance");
      }

      console.log("✅ Filecoin Onchain Cloud initialized successfully");
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize FilCDN:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setIsInitialized(true); // Still mark as initialized to prevent app blocking
    }
  };

  const setupPayments = async () => {
    if (!synapse) {
      throw new Error("Synapse not initialized");
    }

    try {
      console.log("💰 Setting up Filecoin payments...");

      // 1. Deposit USDFC tokens (100 USDFC for testing)
      const depositAmount = ethers.parseUnits('100', 18);
      await synapse.payments.deposit(depositAmount);
      console.log("✅ Deposited 100 USDFC tokens");

      // 2. Get Warm Storage service address and approve it
      const warmStorageAddress = await synapse.getWarmStorageAddress();
      await synapse.payments.approveService(
        warmStorageAddress,
        ethers.parseUnits('10', 18),   // Rate allowance: 10 USDFC per epoch
        ethers.parseUnits('1000', 18), // Lockup allowance: 1000 USDFC total
        BigInt(86400)                  // Max lockup period: 30 days (in epochs)
      );
      console.log("✅ Approved Warm Storage service for payments");

      setNeedsPaymentSetup(false);
    } catch (err) {
      console.error("Payment setup failed:", err);
      throw err;
    }
  };

  const uploadFile = async (fileData: ArrayBuffer, filename?: string): Promise<string> => {
    if (!synapse) {
      throw new Error("Synapse SDK not initialized");
    }

    try {
      console.log("📤 Uploading file to Filecoin Warm Storage...");
      
      // Convert ArrayBuffer to Uint8Array for Synapse SDK
      const data = new Uint8Array(fileData);
      
      // Upload using the high-level storage API
      const uploadResult = await synapse.storage.upload(data);
      
      console.log(`✅ File uploaded successfully! PieceCID: ${uploadResult.pieceCid}`);
      return uploadResult.pieceCid.toString(); // Convert PieceLink to string
    } catch (err) {
      console.error("File upload failed:", err);
      throw new Error(`FilCDN upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const downloadFile = async (pieceCid: string): Promise<ArrayBuffer> => {
    if (!synapse) {
      throw new Error("Synapse SDK not initialized");
    }

    try {
      console.log(`📥 Downloading file from Filecoin: ${pieceCid}`);
      
      // Download using the high-level storage API
      const data = await synapse.storage.download(pieceCid);
      
      console.log("✅ File downloaded successfully");
      return new ArrayBuffer(data.byteLength).slice(0); // Convert to proper ArrayBuffer
    } catch (err) {
      console.error("File download failed:", err);
      throw new Error(`FilCDN download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    setupPayments,
  };

  return (
    <FilCDNContext.Provider value={value}>{children}</FilCDNContext.Provider>
  );
}