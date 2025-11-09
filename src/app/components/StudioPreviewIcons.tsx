"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Video, Mic, Users, Radio, Headphones, GroupIcon, Cuboid} from "lucide-react"
 import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
interface StudioPreviewIconsProps {
  studioType: "music" | "podcast" | "webinar"
  theme: string
  isActive?: boolean
}

const studioConfig = {
  music: {
    icon: Radio,
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    bgGradient: "from-cyan-500/20 via-blue-500/10 to-purple-500/20",
    pulseColor: "shadow-cyan-500/50",
    secondaryIcon: Headphones,
  },
  podcast: {
    icon: GroupIcon,
    gradient: "from-purple-400 via-pink-500 to-red-500",
    bgGradient: "from-purple-500/20 via-pink-500/10 to-red-500/20",
    pulseColor: "shadow-purple-500/50",
    secondaryIcon: Radio,
  },
  webinar: {
    icon: Cuboid,
    gradient: "from-emerald-400 via-cyan-500 to-blue-500",
    bgGradient: "from-emerald-500/20 via-cyan-500/10 to-blue-500/20",
    pulseColor: "shadow-emerald-500/50",
    secondaryIcon: Video,
  },
}

export function StudioPreviewIcons({ studioType, theme, isActive }: StudioPreviewIconsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mainIconRef = useRef<HTMLDivElement>(null)
  const secondaryIconRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLDivElement>(null)

  const config = studioConfig[studioType]
  const MainIcon = config.icon
  const SecondaryIcon = config.secondaryIcon

  useEffect(() => {
    if (mainIconRef.current && secondaryIconRef.current && pulseRef.current) {
      // Main icon floating animation
      gsap.to(mainIconRef.current, {
        y: -10,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      })

      // Secondary icon orbit animation
      gsap.to(secondaryIconRef.current, {
        rotation: 360,
        duration: 8,
        ease: "none",
        repeat: -1,
      })

      // Pulse animation when active
      if (isActive) {
        gsap.to(pulseRef.current, {
          scale: 1.2,
          opacity: 0,
          duration: 1.5,
          ease: "power2.out",
          repeat: -1,
        })
      }
    }
  }, [isActive])

  const handleMouseEnter = () => {
    if (mainIconRef.current) {
      gsap.to(mainIconRef.current, {
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out",
      })
    }
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        rotationY: 5,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }

  const handleMouseLeave = () => {
    if (mainIconRef.current) {
      gsap.to(mainIconRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })
    }
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        rotationY: 0,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative flex items-center justify-center overflow-hidden bg-slate-900"
 
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-linear-to-br ${config.bgGradient}`} />

      {/* Pulse effect for active studios */}
      {isActive && (
        <div
          ref={pulseRef}
          className={`absolute inset-0 bg-linear-to-r ${config.gradient} opacity-20 ${config.pulseColor} shadow-2xl`}
        />
      )}

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-70">
     <div
          className="w-full h-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "20px 20px",
          }}
        /> 
 
      </div>

      {/* Secondary orbiting icon */}
      {/* <div
        ref={secondaryIconRef}
        className="absolute w-16 h-16 flex items-center justify-center"
        style={{ transform: "translateX(60px)" }}
      > */}
        {/* <div className="w-8 h-8 bg-linear-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center shadow-lg">
          <SecondaryIcon className="w-4 h-4 text-slate-300" />
        </div> </div> 

      {/* Main icon */}
      <div ref={mainIconRef} className="relative z-10 flex items-center justify-center">
        <div
          className={`w-24 h-24 bg-linear-to-br ${config.gradient} rounded-2xl flex items-center justify-center shadow-2xl ${config.pulseColor} shadow-xl`}
        >
          <MainIcon className="w-12 h-12 text-white drop-shadow-lg" />
        </div>

        {/* Glow effect */}
        <div
          className={`absolute inset-0 w-24 h-24 bg-linear-to-br ${config.gradient} rounded-2xl blur-xl opacity-50 -z-10`}
        />
      </div>

      {/* Activity indicator */}
      {isActive && (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-medium">LIVE</span>
        </div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400/30 rounded-tl" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-purple-400/30 rounded-tr" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-purple-400/30 rounded-bl" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400/30 rounded-br" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
