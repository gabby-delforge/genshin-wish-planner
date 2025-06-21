/* eslint-disable mobx/missing-observer */
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import SafeClientProvider from "./safe-client-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    process.env.NODE_ENV === "development"
      ? "[DEV] Wish Simulator | Irminsul.io"
      : "Wish Simulator | Irminsul.io",
};

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.debug = () => {};
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SafeClientProvider>{children}</SafeClientProvider>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-MS78GXGNYZ" />
      </body>
    </html>
  );
}
