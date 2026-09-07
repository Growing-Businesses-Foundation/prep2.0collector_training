import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Collector Training | GBF",
    template: "%s | Collector Training",
  },
  description:
    "A secure data collection platform for managing collector training sessions, registering trained collectors, and monitoring training progress.",
  applicationName: "Collector Training",
  keywords: [
    "collector training",
    "data collection",
    "training management",
    "field operations",
    "GBF",
  ],
  authors: [
    {
      name: "Growing Businesses Foundation",
    },
  ],
  creator: "Growing Businesses Foundation",
  publisher: "Growing Businesses Foundation",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h - full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}