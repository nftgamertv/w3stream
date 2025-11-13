"use client"

import { Suspense, lazy } from "react"
import W3swapHero from "@/components/w3swap/W3swapHero"
import WhyMigrateSection from "@/components/w3swap/WhyMigrateSection"
import BenefitsSection from "@/components/w3swap/BenefitsSection"
import CTASection from "@/components/w3swap/CTASection"
import Breadcrumbs from "@/components/w3swap/Breadcrumbs"
import SectionSkeleton from "@/components/w3swap/SectionSkeleton"

// Lazy load heavy components for better performance
const DualPerspectiveTimeline = lazy(() => import("@/components/w3swap/DualPerspectiveTimeline"))

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

export default function W3SwapPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content">
        <Breadcrumbs />
        <W3swapHero />
        <Suspense fallback={<SectionSkeleton />}>
          <WhyMigrateSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <BenefitsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <DualPerspectiveTimeline />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <CTASection />
        </Suspense>
      </main>
    </>
  )
}

