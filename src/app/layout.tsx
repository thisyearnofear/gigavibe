import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export async function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#4b0082", // Indigo color
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const appName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "GIGAVIBE";
  const heroImage = process.env.NEXT_PUBLIC_APP_HERO_IMAGE || "/images/gigavibeclouds.png";
  const splashImage = process.env.NEXT_PUBLIC_SPLASH_IMAGE || "/images/gigavibeclouds.png";
  const splashBgColor = process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#4b0082";

  return {
    title: appName,
    description: "AI-Powered Vocal Training App with Web3 Social Features",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/images/gigavibe.png", type: "image/png", sizes: "192x192" },
      ],
      apple: [
        {
          url: "/images/gigavibearch.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    manifest: "/manifest.json",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: heroImage,
        button: {
          title: `Launch ${appName}`,
          action: {
            type: "launch_frame",
            name: appName,
            url: URL,
            splashImageUrl: splashImage,
            splashBackgroundColor: splashBgColor,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <Providers>{children}</Providers>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
