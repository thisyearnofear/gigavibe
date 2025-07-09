import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";

export async function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#4b0082", // Indigo color
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  const appName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "GIGAVIBE";

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
        imageUrl:
          process.env.NEXT_PUBLIC_APP_HERO_IMAGE ||
          "/images/gigavibeclouds.png",
        button: {
          title: `Launch ${appName}`,
          action: {
            type: "launch_frame",
            name: appName,
            url: URL,
            splashImageUrl:
              process.env.NEXT_PUBLIC_SPLASH_IMAGE ||
              "/images/gigavibeclouds.png",
            splashBackgroundColor:
              process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#4b0082",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
