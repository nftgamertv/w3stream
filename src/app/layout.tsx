import type { Metadata } from "next";
import type React from "react";

import { Geist, Geist_Mono } from "next/font/google";
import "@livekit/components-styles";
import "./globals.css";

import { Suspense } from "react";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import "./globals.css";
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

export const metadata: Metadata = {
  metadataBase: new URL('https://w3stream.com'),
  title: {
    default: 'w3stream - Next-Gen Streaming, Collaboration & AI Platform',
    template: '%s | w3stream'
  },
  description: 'Experience the future of streaming with w3stream. A next-generation platform combining live streaming, real-time collaboration, AI agents, and decentralized technology for creators and teams.',
  keywords: [
    'streaming platform',
    'live streaming',
    'collaboration tools',
    'AI agents',
    'decentralized platform',
    'web3 streaming',
    'video collaboration',
    'real-time communication',
    'creator platform',
    'next-gen streaming'
  ],
  authors: [{ name: 'w3stream' }],
  creator: 'w3stream',
  publisher: 'w3stream',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://w3stream.com',
    siteName: 'w3stream',
    title: 'w3stream - Next-Gen Streaming, Collaboration & AI Platform',
    description: 'Experience the future of streaming with w3stream. A next-generation platform combining live streaming, real-time collaboration, AI agents, and decentralized technology.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'w3stream - Next-Gen Streaming Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'w3stream - Next-Gen Streaming, Collaboration & AI Platform',
    description: 'Experience the future of streaming with w3stream. A next-generation platform combining live streaming, real-time collaboration, AI agents, and decentralized technology.',
    images: ['/twitter-image.png'],
    creator: '@w3stream',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://w3stream.com',
  },
};

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
