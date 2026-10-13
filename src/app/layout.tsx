import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrototypeProvider } from "@/lib/prototype-state";
import { SWRegister } from "@/components/sw-register";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Show Up — Find your people. Show up. Get better.",
  description:
    "A Lagos fitness community app: discover workouts and groups near you, commit to a session, check in, and track your progress.",
  applicationName: "Show Up",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Show Up",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f7f1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Deliberately no maximumScale: pinching to zoom must stay available
  // (WCAG 1.4.4). Input sizing below covers the focus-zoom it used to hide.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-ink-950 font-sans text-ink-100 antialiased">
        <PrototypeProvider>{children}</PrototypeProvider>
        <SWRegister />
      </body>
    </html>
  );
}
