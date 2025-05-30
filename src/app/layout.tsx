import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SafeClientProvider from "./safe-client-provider";
import { SilentErrorBoundary } from "./error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Genshin Impact Wish Planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SilentErrorBoundary>
        <SafeClientProvider>{children}</SafeClientProvider>
        </SilentErrorBoundary>
        <Analytics />
        <GoogleAnalytics gaId="G-MS78GXGNYZ" />
      </body>
    </html>
  );
};
