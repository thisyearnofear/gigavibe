"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { useFilCDN } from "@/hooks/useFilCDN";

interface FilCDNSetupProps {
  // Component gets all data from useFilCDN hook, no props needed
}

export function FilCDNSetup({}: FilCDNSetupProps = {}) {
  const { synapse, isInitialized, needsPaymentSetup, clientAddress, setupPayments, error } = useFilCDN();
  const [isSettingUpPayments, setIsSettingUpPayments] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSetup = async () => {
    setIsSettingUpPayments(true);
    try {
      await setupPayments();
    } catch (err) {
      console.error("Payment setup failed:", err);
    } finally {
      setIsSettingUpPayments(false);
    }
  };

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Initializing Filecoin Onchain Cloud
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Filecoin Setup Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              FilCDN is optional. The app will continue to work with alternative storage providers.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!synapse) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>🚀 Filecoin Onchain Cloud Setup</CardTitle>
          <CardDescription>
            Enable decentralized storage with Filecoin's Onchain Cloud for enhanced performance and Web3 integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Step 1: Get a Filecoin Private Key</h3>
            <p className="text-sm text-muted-foreground">
              Create a wallet on Calibration testnet and add the private key to your environment:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              NEXT_PUBLIC_FILECOIN_PRIVATE_KEY=your_private_key_here
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Step 2: Get Test Tokens</h3>
            <p className="text-sm text-muted-foreground">
              Visit the Calibration faucet to get test FIL and USDFC tokens:
            </p>
            <Button variant="secondary" size="sm" asChild>
              <a href="https://faucet.calibration.fildev.network/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Calibration Faucet
              </a>
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              FilCDN is optional and will gracefully fallback to other storage providers if not configured.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Filecoin Onchain Cloud Active
        </CardTitle>
        <CardDescription>
          Your GIGAVIBE app is connected to Filecoin's decentralized storage network.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <div>
            <p className="font-semibold">Wallet Address</p>
            <p className="text-sm text-muted-foreground font-mono">
              {clientAddress ? `${clientAddress.slice(0, 6)}...${clientAddress.slice(-4)}` : 'Loading...'}
            </p>
          </div>
          {clientAddress && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => copyToClipboard(clientAddress)}
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {needsPaymentSetup && (
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Payment setup required for storage operations</span>
              <Button
                size="sm"
                onClick={handlePaymentSetup}
                disabled={isSettingUpPayments}
              >
                {isSettingUpPayments ? "Setting up..." : "Setup Payments"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Badge variant="secondary">Network</Badge>
            <p className="text-sm">Calibration Testnet</p>
          </div>
          <div className="space-y-2">
            <Badge variant="secondary">Storage Type</Badge>
            <p className="text-sm">Warm Storage</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Features Enabled</h3>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Decentralized audio storage
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Automated storage payments
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Content verification & integrity
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Web3 ownership & provenance
            </li>
          </ul>
        </div>

        <Button variant="secondary" size="sm" asChild>
          <a href="https://docs.filecoin.io/smart-contracts/developing-contracts/onchain-cloud/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Learn More About Filecoin Onchain Cloud
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
