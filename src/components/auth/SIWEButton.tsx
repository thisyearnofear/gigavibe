"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiweMessage } from "siwe";
import { getAddress } from "viem";

interface SIWEUser {
  address: string;
  fid?: string;
  username?: string;
}

interface SIWEButtonProps {
  onSuccess: (user: SIWEUser) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function SIWEButton({
  onSuccess,
  onError,
  className = "",
}: SIWEButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if ethereum is available in window (MetaMask or other wallet)
      if (!window.ethereum) {
        throw new Error(
          "No Ethereum wallet detected. Please install MetaMask or another wallet provider."
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];

      if (!address) {
        throw new Error("Failed to get Ethereum address");
      }

      // Get the current domain
      const domain = window.location.host;
      const origin = window.location.origin;

      // Use viem's getAddress to ensure EIP-55 checksum compliance.
      const checksummedAddress = getAddress(address);

      // Create SIWE message
      const message = new SiweMessage({
        domain,
        address: checksummedAddress,
        statement: "Sign in with Ethereum to access GIGAVIBE",
        uri: origin,
        version: "1",
        chainId: 1, // Ethereum mainnet
        nonce: Math.random().toString(36).substring(2, 15),
        issuedAt: new Date().toISOString(),
        // You could add custom fields for FID if you have it
        // e.g., resources: [`FID:${fid}`]
      });

      // Generate the message string
      const messageString = message.prepareMessage();

      // Request signature from wallet
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [messageString, address],
      });

      // Verify the signature with our API
      const response = await fetch("/api/auth/siwe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageString,
          signature,
          domain,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Verification failed");
      }

      // Call the success callback with the user data
      onSuccess(data.user);
    } catch (err: any) {
      console.error("SIWE authentication error:", err);
      const errorMessage = err.message || "Authentication failed";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      {error && (
        <Card className="bg-red-500/20 border-red-500/50 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
      >
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Sign in with Ethereum
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

// Add a TypeScript global interface for the window object
declare global {
  interface Window {
    ethereum?: any;
  }
}
