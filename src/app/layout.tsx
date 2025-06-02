/* eslint-disable mobx/missing-observer */
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalErrorHandler } from "@/components/global-error-handler";
import { SilentErrorBoundary } from "./error-boundary";
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
  title: "Wish Simulator | Irminsul.io",
};

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.debug = () => {};
}

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
        <GlobalErrorHandler />
        <SilentErrorBoundary>
          <SafeClientProvider>{children}</SafeClientProvider>
        </SilentErrorBoundary>
        <Analytics />
        <GoogleAnalytics gaId="G-MS78GXGNYZ" />
      </body>
    </html>
  );
}
