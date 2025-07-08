'use client';

import { ExternalLink, Wallet, CreditCard, FileText, CheckCircle } from 'lucide-react';

interface FilCDNSetupProps {
  error: string;
  needsPaymentSetup: boolean;
  clientAddress: string | null;
}

export default function FilCDNSetup({ error, needsPaymentSetup, clientAddress }: FilCDNSetupProps) {
  const setupSteps = [
    {
      icon: Wallet,
      title: "Set up Filecoin Calibration Wallet",
      description: "Configure your wallet for the Filecoin Calibration testnet",
      details: [
        "Add Filecoin Calibration network to MetaMask",
        "Get testnet FIL from faucets",
        "Export your private key for the app"
      ],
      links: [
        { text: "Calibration Faucet - Chainsafe", url: "https://faucet.calibration.fildev.network/" },
        { text: "Calibration Faucet - Zondax", url: "https://beryx.zondax.ch/faucet" }
      ]
    },
    {
      icon: CreditCard,
      title: "Get USDFC Tokens",
      description: "Obtain USDFC tokens to pay for storage deals",
      details: [
        "Mint new USDFC tokens",
        "Or get USDFC from the Chainsafe faucet"
      ],
      links: [
        { text: "USDFC Faucet", url: "https://faucet.calibration.fildev.network/" }
      ]
    },
    {
      icon: FileText,
      title: "Set up Payment Authorization",
      description: "Authorize Filecoin Services to charge your wallet",
      details: [
        "Visit the FilCDN demo app",
        "Connect your Calibration wallet",
        "Set spending cap and deposit USDFC",
        "Sign metadata for ProofSet creation"
      ],
      links: [
        { text: "FilCDN Demo App", url: "https://fs-upload-dapp.netlify.app" }
      ]
    }
  ];

  if (!error && !needsPaymentSetup) {
    return null; // No setup needed
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/20 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-purple-700 mb-2">FilCDN Setup Required</h1>
          <p className="text-gray-600">
            GIGAVIBE uses decentralized storage via FilCDN. Let's get you set up!
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-red-700 mb-2">Setup Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {clientAddress && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-green-700 mb-2">Wallet Connected</h3>
            <p className="text-green-600 text-sm font-mono">{clientAddress}</p>
          </div>
        )}

        <div className="space-y-6">
          {setupSteps.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  
                  <ul className="space-y-1 mb-4">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    {step.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {link.text}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-2xl">
          <h4 className="font-semibold text-blue-700 mb-2">💡 Quick Setup Tips</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• Use the same wallet address for all steps</li>
            <li>• Make sure you have enough tFIL for gas fees</li>
            <li>• The payment setup only needs to be done once</li>
            <li>• After setup, refresh this page to continue</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all"
          >
            Refresh After Setup
          </button>
        </div>
      </div>
    </div>
  );
}
