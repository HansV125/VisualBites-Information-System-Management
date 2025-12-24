import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Patrick_Hand, Space_Grotesk, Permanent_Marker, VT323 } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { ClickSmoke } from "@/components/click-smoke";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap", // Prevent FOIT
});

const patrickHand = Patrick_Hand({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VisualBites - Frozen Food Specialist",
  description: "Nikmati camilan gurih dan kenyal dari VisualBites!",
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    shortcut: "/favicon/favicon.ico",
  },
  // PWA metadata
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VisualBites",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${jetbrainsMono.variable} ${patrickHand.variable} ${permanentMarker.variable} ${spaceGrotesk.variable} ${vt323.variable} antialiased bg-noise flex flex-col lg:block h-screen overflow-hidden lg:overflow-visible`}
      >
        <Providers>
          <ClickSmoke />
          <Sidebar />
          <div className="lg:hidden shrink-0 z-40 bg-white">
            <Header showMenuButton />
          </div>
          <div className="flex-1 w-full relative min-h-0 overflow-hidden lg:overflow-visible lg:h-auto">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
