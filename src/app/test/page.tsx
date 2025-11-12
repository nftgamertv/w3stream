'use client'

import React, { useEffect, useRef } from 'react'
import { MultiPageModal } from '../components/ui/multi-page-modal'

export default function Test() {
 
  return (
    <div style={{zIndex:99999, isolation:'isolate'}}>
      <LiquidMetalVoiceCanvas />
    </div>
  )
}

 

type LiquidMetalVoiceCanvasProps = {
  /** Optional: how "energetic" the motion is (1 = default). You can hook this up to your voice energy later. */
  energy?: number;
  /** Optional background color */
  background?: string;
};

const LiquidMetalVoiceCanvas: React.FC<LiquidMetalVoiceCanvasProps> = ({
  energy = 1,
  background = "#050515",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let resizeObserver: ResizeObserver | null = null;

    // Blob definition
    interface Blob {
      x: number;
      y: number;
      baseR: number;
      rPulse: number;
      angle: number;
      angleSpeed: number;
      orbitRadius: number;
      orbitSpeed: number;
      phaseOffset: number;
    }

    const blobs: Blob[] = [];

    const BLOB_COUNT = 6;

    // Init blobs with random-ish orbits
    const initBlobs = (w: number, h: number) => {
      blobs.length = 0;
      const minDim = Math.min(w, h);
      for (let i = 0; i < BLOB_COUNT; i++) {
        const baseR = minDim * (0.18 + Math.random() * 0.08);
        blobs.push({
          x: w / 2,
          y: h / 2,
          baseR,
          rPulse: baseR * 0.25,
          angle: Math.random() * Math.PI * 2,
          angleSpeed:
            (0.1 + Math.random() * 0.15) * (Math.random() < 0.5 ? -1 : 1),
          orbitRadius: minDim * (0.18 + Math.random() * 0.15),
          orbitSpeed:
            (0.0005 + Math.random() * 0.0008) *
            (Math.random() < 0.5 ? -1 : 1),
          phaseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    // Handle resize + DPR
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initBlobs(rect.width, rect.height);
    };

    resize();

    resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    // Animation
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Clear background
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset to 1x for drawing (we already scaled in resize)
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, w, h);

      // Make everything soft and glowing
      ctx.filter = "blur(35px)";
      ctx.globalCompositeOperation = "lighter";

      const timeSlow = time * 0.0005;
      const motionScale = 0.8 + energy * 0.7; // more energy = bigger wobble

      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];

        // Orbit around center
        b.angle += b.angleSpeed * dt;
        const orbitPhase = time * b.orbitSpeed;

        const orbitX = Math.cos(b.angle + orbitPhase) * b.orbitRadius;
        const orbitY = Math.sin(b.angle - orbitPhase * 0.7) * (b.orbitRadius * 0.6);

        const cx = w / 2 + orbitX;
        const cy = h / 2 + orbitY;

        // Radius pulsing
        const pulse =
          Math.sin(timeSlow * 2.0 + b.phaseOffset) * 0.5 +
          Math.cos(timeSlow * 1.3 + b.phaseOffset * 1.7) * 0.5;
        const r = b.baseR + b.rPulse * pulse * motionScale;

        // Slight color variation per blob
  // Slight color variation per blob
const tint = 0.4 + 0.6 * (i / BLOB_COUNT);
const metallicHighlight = `rgba(${220 + 20 * tint}, ${230 + 15 * tint}, 255, 0.95)`;
const midTone = `rgba(${120 + 60 * tint}, ${150 + 40 * tint}, ${255}, 0.7)`;
const deepTone = `rgba(${40 + 30 * tint}, ${60 + 40 * tint}, ${130 + 60 * tint}, 0.0)`; // ✅ fixed

const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
gradient.addColorStop(0.0, metallicHighlight);
gradient.addColorStop(0.35, midTone);
gradient.addColorStop(1.0, deepTone);


        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset blending so nothing else in the app is affected
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [background, energy]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        // Fallback min size if parent doesn't specify
        minHeight: "320px",
        borderRadius: "24px",
        background: "#050515",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
        }}
      />
      {/* Optional overlay for your logo / text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Put Voice AI logo / text here if you want */}
      </div>
    </div>
  );
};

 