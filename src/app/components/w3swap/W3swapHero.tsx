"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DotLottie } from "@lottiefiles/dotlottie-web"

export default function W3swapHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotLottieRef = useRef<DotLottie | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize DotLottie with the canvas
    const dotLottie = new DotLottie({
      canvas: canvasRef.current,
      src: "/animations/crypto animation.lottie",
      loop: true,
      autoplay: true,
    })

    dotLottieRef.current = dotLottie

    // Cleanup on unmount
    return () => {
      if (dotLottieRef.current) {
        dotLottieRef.current.destroy()
        dotLottieRef.current = null
      }
    }
  }, [])
  return (
    <section className="relative overflow-hidden py-12 md:py-16 px-4 bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

      {/* Floating orbs */}
      <div 
        className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" 
        style={{ willChange: "opacity", animation: "pulse 4s ease-in-out infinite", transform: "translateZ(0)" }} 
      />
      <div
        className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
        style={{ willChange: "opacity", animation: "pulse 4s ease-in-out infinite 1s", transform: "translateZ(0)" }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" 
        style={{ willChange: "opacity", animation: "pulse 4s ease-in-out infinite 0.5s", transform: "translateZ(0)" }} 
      />

      <div className="relative z-10 max-w-[90rem] mx-auto">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] xl:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight mb-6 animate-fade-in-up">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-300 whitespace-nowrap">
                Reclaim Control.
              </span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400 whitespace-nowrap">
                Capture Fees.
              </span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 whitespace-nowrap">
                Relaunch Your Token.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-6 max-w-none mx-auto lg:mx-0 font-light animate-fade-in-up animation-delay-100">
              w3Swap gives Solana communities the power to relaunch their tokens, reclaim LP ownership, and rebuild momentum.
              <span className="block mt-2 text-cyan-400 whitespace-nowrap">
                Migrate securely, recover liquidity, and bring your ecosystem back to life.
              </span>
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fade-in-up animation-delay-200">
              <Link href="/w3swap/contact">
                <Button className="btn-brand inline-flex items-center gap-2 group text-lg px-8 py-6 w-full sm:w-auto">
                  <Users className="w-5 h-5" />
                  Migrate Tokens
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/w3swap/contact">
                <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:border-purple-500/80 hover:bg-purple-500/10 inline-flex items-center gap-2 group text-lg px-8 py-6 w-full sm:w-auto">
                  <Settings className="w-5 h-5" />
                  Start Migration
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Visual Element */}
          <div className="relative w-full flex items-center justify-center" style={{ opacity: 1 }}>
            <div className="relative w-full aspect-square max-w-full">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ filter: "drop-shadow(0 0 20px rgba(6, 182, 212, 0.3))" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
