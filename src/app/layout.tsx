import type { Metadata } from "next";
import type React from "react";

import { Geist, Geist_Mono } from "next/font/google";
import "@livekit/components-styles";
import "./globals.css";

import { Suspense } from "react";
import ReactQueryProvider from "./providers/ReactQueryProvider";
 
import {
  LazyThreeBackground,
  LazyVideoBackground,
  LazyLoginModalWrapper,
} from "./components/LazyComponents";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <ReactQueryProvider>
            {/* Lazy-loaded background components - render after initial page load */}
            <LazyThreeBackground />
            <LazyVideoBackground />
            {children}
          </ReactQueryProvider>
        </Suspense>

        {/* Lazy-loaded modal wrapper - only loads when needed */}
        <LazyLoginModalWrapper />

      </body>
    </html>
  );
}
