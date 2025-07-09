import Link from "next/link";
import { Home } from "lucide-react";
import Image from "next/image";
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
  title: "Page Not Found | GIGAVIBE",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/gigavibe.png"
            alt="GIGAVIBE"
            width={80}
            height={80}
            className="rounded-lg shadow-lg"
          />
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium shadow-lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
