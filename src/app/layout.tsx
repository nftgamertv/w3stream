import type { Metadata } from "next";
import type React from "react";

import { headers } from "next/headers";
import { Suspense } from "react";

import { Geist, Geist_Mono } from "next/font/google";
import "@livekit/components-styles";
import "./globals.css";

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

const embedData = {
  site_name: "w3stream",
  author: "@w3stream",
  title: "Join the next-gen streaming (r)evolution",
  description: "w3Stream is a next-gen live streaming and collaboration platform where creators, communities, and agentic AI come together inside interactive 2D and 3D spaces. We empower creators and brands to build immersive experiences that go far beyond the traditional livestream",
  image_path: "/images/oembed.png", // 1200x630 in /public/images
  theme_color: "#0090ff",
  og_type: "website",
};

// Build absolute URLs so Discord/Twitter/Slack reliably pull the large card,
// including when testing behind ngrok or a proxy.
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const forwardedProto = h.get("x-forwarded-proto") ?? "";
  const isHttps =
    forwardedProto.includes("https") || !host.includes("localhost");
  const proto = isHttps ? "https" : "http";

  const base = new URL(`${proto}://${host}`);
  const imageAbs = new URL(embedData.image_path, base).toString();

  return {
    metadataBase: base,
    title: embedData.title,
    description: embedData.description,
    openGraph: {
      type: embedData.og_type as "website",
      siteName: embedData.site_name,
      title: embedData.title,
      description: embedData.description,
      url: base.toString(),
      images: [
        {
          url: imageAbs,
          width: 1200,
          height: 630,
          alt: embedData.title,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: embedData.author,
      creator: embedData.author,
      title: embedData.title,
      description: embedData.description,
      images: [imageAbs],
    },
    other: {
      "og:author": embedData.author,
    },
    alternates: {
      canonical: base.toString(),
    },
  };
}

// Viewport configuration (required for Next.js 15+)
export async function generateViewport() {
  return {
    themeColor: embedData.theme_color,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
