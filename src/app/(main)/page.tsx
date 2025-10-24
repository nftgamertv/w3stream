import Link from "next/link"
import { Suspense } from "react"

// Lazy load heavy client-side components
// CyclingText is lightweight and used in hero, so load it eagerly
import { CyclingText } from "@/components/CyclingText"
import {
  ScrollingVideoFallback,
  PerformanceModalFallback,
  KeystrokeListenerFallback,
} from "@/components/LoadingFallbacks"
import {
  LazyScrollingVideo,
  LazyPerformanceModal,
  LazyKeystrokeListener,
  LazySolanaCursorEffect,
} from "@/components/LazyComponents"


export default function SplashPage() {
  const cyclingItems = [
    {
      content: "streaming",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
    },
    {
      content: "collaboration",
      backgroundColor: "#a855f7",
      textColor: "#ffffff",
    },
    {
      content: "AI agent",
      backgroundColor: "#ec4899",
      textColor: "#ffffff",
    },
    {
      content: "decentralized",
      backgroundColor: "#10b981",
      textColor: "#1a1a1a",
    },
  ]

  return (
    <div className="fixed inset-0 bg-transparent flex flex-col items-center justify-center overflow-hidden z-10">
      {/* Animated background effect - decorative only */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="w-full relative z-20">
        {/* Lazy-loaded scrolling video with suspense boundary */}
        <Suspense fallback={<ScrollingVideoFallback />}>
          <LazyScrollingVideo />
                   <LazySolanaCursorEffect />
        </Suspense>

        {/* Hero Section */}
        <main className="container mx-auto px-4 pb-16 md:pb-24" role="main">
          <div className="text-center space-y-2 max-w-4xl mx-auto">
            {/* Decorative floating elements */}
            <div className="relative mx-auto max-w-2xl" aria-hidden="true">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-400/20 rounded-full animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gray-400/30 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-gray-400/40 rounded-full animate-pulse" style={{ animationDelay: '500ms' }} />
            </div>

            {/* Hero Content */}
            <section className="max-w-2xl mx-auto" aria-labelledby="hero-heading">
              <h1 id="hero-heading" className="text-xl md:text-2xl font-bold text-balance text-white mb-6">
                Be a part of the next-gen{" "}
                <CyclingText items={cyclingItems} interval={2500} className="font-bold min-w-[180px]" />{" "}
                revolution
              </h1>
<div className="min-h-12">
              {/* Performance Stats Button - Lazy loaded with suspense */}
           <Link href="/waitlist" className="btn-brand flex justify-center mx-auto max-w-md mt-12 relative"> Join the Waitlist</Link>
</div>
              {/* Commented out waitlist - temporarily for performance testing */}
              {/* <Link href="/waitlist" className="btn-brand max-w-md mt-12 relative mx-auto">
                Join the Waitlist
              </Link> */}
            </section>

            {/* Social Proof */}
            <aside className="flex items-center justify-center gap-2 text-sm text-slate-400" aria-label="Social proof">
              {/* <Users className="w-4 h-4" aria-hidden="true" />
              <span>Join 2,847+ people already on the waitlist</span> */}
            </aside>
          </div>
          {/* <LoginModalTestButton/> */}
        </main>
      </div>

      {/* Lazy-loaded keystroke listener with suspense boundary */}
      <Suspense fallback={<KeystrokeListenerFallback />}>
        <LazyKeystrokeListener />
      </Suspense>
    </div>
  )
}
