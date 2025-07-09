import type { Metadata } from "next";

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#4b0082", // Indigo color
  };
}

export const metadata: Metadata = {
  title: "Authentication Test | GIGAVIBE",
  description:
    "Test both SIWE (Ethereum) and SIWN (Farcaster) authentication methods",
};

export default function AuthTestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
