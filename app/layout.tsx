import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

import "./globals.css";

import { NotificationProvider } from "@/context/NotificationContext";
import { getMaintenanceSettings } from "@/lib/maintenance";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const pathname =
    requestHeaders.get("x-prep2-pathname") ?? "/";

  /*
   * These routes must remain accessible while maintenance mode
   * is active.
   */
  const isMaintenancePage = pathname === "/maintenance";
  const isLoginPage = pathname === "/login";

  if (!isMaintenancePage && !isLoginPage) {
    const maintenance = await getMaintenanceSettings();

    if (maintenance.maintenanceMode) {
      const session = await getServerSession(authOptions);

      console.log("=== MAINTENANCE CHECK ===");
      console.log("Path:", pathname);
      console.log("Maintenance mode:", maintenance.maintenanceMode);
      console.log("Session user:", session?.user);

      let isAdmin = false;

      if (session?.user?.id) {
        try {
          console.log("Session user ID:", session.user.id);

          const userId = new ObjectId(session.user.id);

          const client = await clientPromise;
          const db = client.db(process.env.MONGODB_DB);

          console.log("MongoDB database:", process.env.MONGODB_DB);

          const user = await db.collection("users").findOne({
            _id: userId,
            isActive: true,
          });

          console.log("Database user:", user
            ? {
              id: user._id.toString(),
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            }
            : null
          );

          isAdmin = user?.role === "ADMIN";

          console.log("Is admin:", isAdmin);
        } catch (error) {
          console.error("ADMIN CHECK ERROR:", error);
          isAdmin = false;
        }
      } else {
        console.log("NO SESSION USER ID");
      }

      console.log("========================");

      if (!isAdmin) {
        redirect("/maintenance");
      }
    }
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}