import React from 'react'
import { Sparkles } from 'lucide-react'
export default function AIModalPage1() {
  return (
<div className="relative w-[min(90vw,26rem)] max-w-xl aspect-[2/3] overflow-hidden rounded-[32px] border border-cyan-300/40 bg-slate-950/90 shadow-[0_0_45px_rgba(34,211,238,0.75)]">
  {/* Glowing background effects */}
  <div className="pointer-events-none absolute inset-0">
    <span className="absolute -top-20 -left-16 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.9),transparent_60%)] mix-blend-screen blur-3xl opacity-80" />
    <span className="absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(244,114,182,0.9),transparent_60%)] mix-blend-screen blur-3xl opacity-80" />
    <span className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(129,140,248,0.9),transparent_60%)] mix-blend-screen blur-2xl opacity-80" />
    <div className="absolute inset-[-40%] animate-[spin_26s_linear_infinite] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(34,211,238,0.18)_0deg,rgba(129,140,248,0.24)_120deg,rgba(248,250,252,0)_200deg,rgba(34,211,238,0.18)_360deg)] opacity-70 mix-blend-soft-light" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-15%,rgba(248,250,252,0.22),transparent_55%)]" />
  </div>

  {/* Content */}
  <div className="relative flex h-full flex-col gap-4 p-6">
    {/* Top bar */}
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-cyan-100/85">
          Voice • Vision • Text
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-slate-900/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-100/90">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          Real-Time Link
        </span>
      </div>
    </div>

    {/* Title */}
    <div className="mt-1 space-y-2">
      <h2 className="text-xl font-semibold tracking-tight text-sky-50">
        Agent Session Console
      </h2>
      <p className="text-xs leading-relaxed text-slate-200/80">
        Route your game, your voice, and your AI co-host into a single
        <span className="mx-1 rounded-full bg-sky-500/20 px-2 py-[1px] text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-100">
          perfectly synced
        </span>
        control surface.
      </p>
    </div>

    {/* Scanlines */}
    <div className="mt-1 space-y-2">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
      <div className="h-px w-[72%] bg-gradient-to-r from-transparent via-sky-400/80 to-transparent" />
      <div className="h-px w-[54%] bg-gradient-to-r from-transparent via-indigo-400/80 to-transparent" />
    </div>

    {/* Liquid panel */}
 
   
      <div className="relative z-10 flex h-full flex-col  ">
        <video autoPlay loop muted className="h-full w-full ">
            <source src="/videos/AIVoiceOrb2.mp4" type="video/mp4" />          
        </video>    
       
        </div>  

    {/* Footer */}
    <div className="mt-2 flex items-center justify-between gap-3">
      <div className="flex flex-col text-[10px] text-slate-300/85">
        <span className="font-mono uppercase tracking-[0.16em] text-sky-200">
          Session Ready
        </span>
        <span className="mt-0.5 font-mono text-[10px] text-slate-400">
          Console will latch to your current room + AI graph.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button className="h-8 rounded-full border border-slate-500/50 bg-red-900/70 uppercase px-3 text-[11px] font-medium text-slate-200 hover:bg-slate-900 transition whitespace-nowrap">
          Exit
        </button>
        <button className="relative h-8 rounded-full bg-sky-500 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_8px_rgba(56,189,248,0.8)] hover:bg-sky-400 active:scale-[0.97] transition-transform">
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_0%_0%,rgba(248,250,252,0.45),transparent_60%)] opacity-80 mix-blend-screen" />
          <span className="relative flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles className="h-3.5 w-3.5" />
            <span>View Agents</span>
          </span>
        </button>
      </div>
    </div>
  </div>

  <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-sky-300/30 shadow-[0_0_10px_rgba(56,189,248,0.55)]" />
</div>

  )
}
