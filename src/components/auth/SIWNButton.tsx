"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SIWNData {
  signer_uuid: string;
  fid: number;
  user: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    bio: {
      text: string;
    };
    follower_count: number;
    following_count: number;
  };
}

interface SIWNButtonProps {
  onSuccess: (data: SIWNData) => void;
  onError?: (error: string) => void;
  theme?: "light" | "dark";
  className?: string;
}

export default function SIWNButton({
  onSuccess,
  onError,
  theme = "dark",
  className = "",
}: SIWNButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Neynar SIWN script
    const script = document.createElement("script");
    script.src = "https://neynarxyz.github.io/siwn/raw/1.2.0/index.js";
    script.async = true;
    document.body.appendChild(script);

    // Define global callback function
    (window as any).onSignInSuccess = (data: SIWNData) => {
      console.log("✅ SIWN Success:", data);
      setIsLoading(false);
      setError(null);
      onSuccess(data);
    };

    // Define global error callback
    (window as any).onSignInError = (error: string) => {
      console.error("❌ SIWN Error:", error);
      setIsLoading(false);
      setError(error);
      onError?.(error);
    };

    return () => {
      document.body.removeChild(script);
      delete (window as any).onSignInSuccess;
      delete (window as any).onSignInError;
    };
  }, [onSuccess, onError]);

  const handleSignIn = () => {
    setIsLoading(true);
    setError(null);
  };

  if (!process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID) {
    return (
      <Card className="bg-red-500/20 border-red-500/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-400">
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Neynar Client ID not configured</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {error && (
        <Card className="bg-red-500/20 border-red-500/50 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div
        className="neynar_signin"
        data-client_id={process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID}
        data-success-callback="onSignInSuccess"
        data-error-callback="onSignInError"
        data-theme={theme}
        onClick={handleSignIn}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <Button
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign in with Farcaster
              </div>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Custom SIWN Button for more control
export function CustomSIWNButton({
  onSuccess,
  onError,
  children,
  className = "",
}: {
  onSuccess: (data: SIWNData) => void;
  onError?: (error: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Neynar SIWN script
    const script = document.createElement("script");
    script.src = "https://neynarxyz.github.io/siwn/raw/1.2.0/index.js";
    script.async = true;
    document.body.appendChild(script);

    // Define global callback function
    (window as any).onCustomSignInSuccess = (data: SIWNData) => {
      console.log("✅ Custom SIWN Success:", data);
      setIsLoading(false);
      onSuccess(data);
    };

    (window as any).onCustomSignInError = (error: string) => {
      console.error("❌ Custom SIWN Error:", error);
      setIsLoading(false);
      onError?.(error);
    };

    return () => {
      document.body.removeChild(script);
      delete (window as any).onCustomSignInSuccess;
      delete (window as any).onCustomSignInError;
    };
  }, [onSuccess, onError]);

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <div
      className={`neynar_signin ${className}`}
      data-client_id={process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID}
      data-success-callback="onCustomSignInSuccess"
      data-error-callback="onCustomSignInError"
      data-theme="dark"
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

// User Profile Display Component
export function FarcasterProfile({
  user,
  onSignOut,
}: {
  user: SIWNData["user"];
  onSignOut: () => void;
}) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={user.pfp_url}
            alt={user.display_name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="text-white font-semibold">{user.display_name}</h3>
            <p className="text-gray-400 text-sm">@{user.username}</p>
          </div>
        </div>

        {user.bio?.text && (
          <p className="text-gray-300 text-sm mb-4">{user.bio.text}</p>
        )}

        <div className="flex gap-4 mb-4">
          <div className="text-center">
            <div className="text-white font-semibold">
              {user.follower_count}
            </div>
            <div className="text-gray-400 text-xs">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold">
              {user.following_count}
            </div>
            <div className="text-gray-400 text-xs">Following</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-400 border-green-400">
            Connected
          </Badge>
          <Button
            onClick={onSignOut}
            variant="outline"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
