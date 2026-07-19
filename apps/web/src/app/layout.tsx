import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CinematicBackground } from "@/components/CinematicBackground";
import { PWARegister } from "@/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DayAct — Act on your day",
  description: "AI-powered productivity & wellbeing app",
  applicationName: "DayAct",
  appleWebApp: {
    capable: true,
    title: "DayAct",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CinematicBackground />
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
