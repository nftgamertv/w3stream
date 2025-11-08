"use client"

import W3swapHero from "@/components/w3swap/W3swapHero"
import DualPerspectiveTimeline from "@/components/w3swap/DualPerspectiveTimeline"
import BenefitsSection from "@/components/w3swap/BenefitsSection"
import CTASection from "@/components/w3swap/CTASection"

export default function W3SwapPage() {
  return (
    <main>
      <W3swapHero />
      <DualPerspectiveTimeline />
      <BenefitsSection />
      <CTASection />
    </main>
  )
}

