'use client';

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import React from "react";

type ShimmerButtonProps = React.ComponentProps<typeof Button> & {
  /** Optional accent color (hex/rgb/hsl). Defaults to the original color . */
  color?: string;
};

export default function ShimmerButton({
  color = "#7c3aed",
  ref,
  ...props
}: ShimmerButtonProps) {
  const accent = color;

  return (
    <>
      <Button
        ref={ref}
        {...props}
        variant="ghost"
        size="icon"
        aria-label="Shimmer Button"
        className="relative h-14 w-14 rounded-full overflow-hidden border shadow-[0_0_15px_rgba(180,100,255,0.45)] bg-transparent hover:bg-transparent active:scale-[0.98] transition-transform"
        style={{
          borderColor: accent,
        }}
      >
        {/* Base shimmering gradient */}
        <span
          className="absolute inset-0 -z-20"
          style={{
            background: `linear-gradient(
              120deg,
              ${accent} 0%,
              ${accent} 15%,
              ${accent} 35%,
              ${accent} 50%,
              ${accent} 65%,
              ${accent} 85%,
              ${accent} 100%
            )`,
            backgroundSize: "300% 300%",
            animation: "Flow 7s ease-in-out infinite",
            filter: "saturate(1.25) contrast(1.1)",
          }}
        />

        {/* Shimmer sweep */}
        <span
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.0) 35%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.0) 65%, transparent 100%)",
            transform: "translateX(-60%) rotate(10deg)",
            animation: "shimmerSweep 2.6s cubic-bezier(.36,.01,.3,1) infinite",
            mixBlendMode: "screen",
          }}
        />

        {/* Micro sparkles (lavender + navy specks) */}
        <span
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1px 1px at 10% 20%, rgba(225,190,255,0.85) 99%, transparent 100%)," +
              "radial-gradient(1px 1px at 30% 70%, rgba(190,140,255,0.9) 99%, transparent 100%)," +
              "radial-gradient(1px 1px at 65% 40%, rgba(255,255,255,0.9) 99%, transparent 100%)," +
              "radial-gradient(1.2px 1.2px at 80% 25%, rgba(20,20,90,0.75) 99%, transparent 100%)," +
              "radial-gradient(1.2px 1.2px at 45% 85%, rgba(20,20,90,0.65) 99%, transparent 100%)",
            animation: "twinkle 4s ease-in-out infinite",
            mixBlendMode: "plus-lighter",
          }}
        />

        {/* Subsurface swirl */}
        <span
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(210,150,255,0.25), rgba(130,70,255,0.08), rgba(50,0,120,0.15), rgba(210,150,255,0.25))",
            animation: "slowRoll 18s linear infinite",
            mixBlendMode: "overlay",
          }}
        />

        {/* Top gloss */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 35%, rgba(255,255,255,0.0) 60%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Animated Sparkles icon (accent aura) */}
        <span className="relative z-10 grid place-items-center">

            <span className="bg-gray-900 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full" />
          <Sparkles
            size={30}
            strokeWidth={2.25}
            className="h-6! w-6!"
            style={{
              color: accent,
              animation:
                "iconSpin 5s ease-in-out infinite, iconPulse 2.5s ease-in-out infinite, iconFlicker 1.4s steps(3) infinite",
              filter:
                "drop-shadow(0 0 8px rgba(210,160,255,0.6)) drop-shadow(0 0 18px rgba(120,40,255,0.45))",
              transformOrigin: "center center",
            }}
          />
        </span>
      </Button>

      <style jsx>{`
        @keyframes Flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes shimmerSweep {
          0% {
            transform: translateX(-65%) rotate(10deg);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          50% {
            transform: translateX(65%) rotate(10deg);
            opacity: 0;
          }
          100% {
            transform: translateX(65%) rotate(10deg);
            opacity: 0;
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.9;
            transform: translate3d(0, 0, 0);
          }
          25% {
            opacity: 0.75;
            transform: translate3d(0.5px, -0.5px, 0);
          }
          50% {
            opacity: 1;
            transform: translate3d(-0.5px, 0.5px, 0);
          }
          75% {
            opacity: 0.8;
            transform: translate3d(0.3px, -0.2px, 0);
          }
        }

        @keyframes slowRoll {
          0% {
            transform: rotate(0deg) scale(1.02);
          }
          50% {
            transform: rotate(180deg) scale(1.04);
          }
          100% {
            transform: rotate(360deg) scale(1.02);
          }
        }

        @keyframes iconSpin {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }

        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes iconFlicker {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }
      `}</style>
    </>
  );
}
