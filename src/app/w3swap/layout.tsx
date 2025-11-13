import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/react"
import Navbar from "@/components/w3swap/Navbar"
import Footer from "@/components/w3swap/Footer"

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "w3Swap",
  "description": "Secure, transparent token migration service for Solana blockchain projects. Enables projects to migrate tokens, reclaim LP ownership, and rebuild momentum with instant liquidity.",
  "provider": {
    "@type": "Organization",
    "name": "w3Swap",
    "url": "https://w3stream.io/w3swap"
  },
  "areaServed": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "serviceType": "Token Migration",
  "category": "Blockchain Service",
  "offers": {
    "@type": "Offer",
    "description": "Token migration solutions for Solana projects"
  }
}

export const metadata: Metadata = {
  title: "w3Swap - Token Migration Service",
  description: "Secure, transparent token migration solutions for Web3 projects. Migrate Solana tokens, reclaim LP ownership, and rebuild momentum with instant liquidity.",
  keywords: ["token migration", "Solana", "DeFi", "liquidity", "token swap", "SPL token", "Token-2022", "Meteora DLMM", "Web3"],
  openGraph: {
    title: "w3Swap - Token Migration Service",
    description: "Secure, transparent token migration solutions for Web3 projects. Migrate Solana tokens, reclaim LP ownership, and rebuild momentum.",
    type: "website",
    siteName: "w3Swap",
    images: [
      {
        url: "/images/w3swap-og.png",
        width: 1200,
        height: 630,
        alt: "w3Swap - Token Migration Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "w3Swap - Token Migration Service",
    description: "Secure, transparent token migration solutions for Web3 projects",
    images: ["/images/w3swap-og.png"],
  },
  alternates: {
    canonical: "/w3swap",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function W3SwapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-white focus:rounded-md focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black"
        >
          Skip to main content
        </a>
        <Navbar />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
        <Analytics />
      </div>
    </>
  )
}


