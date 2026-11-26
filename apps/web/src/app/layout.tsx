import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PWARegister } from "@/components/PWARegister";

// Display serif for big titles (self-hosted: no network call at build time).
const fraunces = localFont({
  src: "./fonts/Fraunces-Variable.woff2",
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DayAct — Act on your day",
  description: "AI-powered productivity & wellbeing app",
  applicationName: "DayAct",
  appleWebApp: {
    capable: true,
    title: "DayAct",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#F1E7D8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} antialiased`}
        style={
          {
            "--font-sans": "var(--font-geist-sans)",
            "--font-mono": "var(--font-geist-mono)",
          } as React.CSSProperties
        }
      >
        <AmbientBackground />
        <PWARegister />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
