import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PWARegister } from "@/components/PWARegister";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SITE_URL } from "@/lib/site";

// Display serif for big titles (self-hosted: no network call at build time).
const fraunces = localFont({
  src: "./fonts/Fraunces-Variable.woff2",
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "DayAct — Agis sur ta journée", template: "%s · DayAct" },
  description:
    "Appli gratuite de productivité et de bien-être : tâches, agenda, habitudes et assistant IA. S'installe sur ton téléphone.",
  applicationName: "DayAct",
  keywords: ["planning", "to-do", "agenda", "habitudes", "productivité", "bien-être", "assistant IA"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "DayAct",
    title: "DayAct — Agis sur ta journée",
    description: "Planifie ta journée, reste concentré et suis tes progrès. Gratuit, sur téléphone et ordinateur.",
  },
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
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
