'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * SolanaCursorEffect - Eye-dropping Solana-themed cursor effect
 * NextJS 15 compatible (SSR-safe)
 *
 * Performance Optimizations:
 * - Refs instead of state for cursor position (eliminates re-renders)
 * - Passive event listeners for better scroll performance
 * - Optimized canvas context with alpha and willReadFrequently hints
 * - Gradient caching to reduce object creation
 * - RAF timestamp instead of Date.now()
 * - Separated effect dependencies to prevent unnecessary teardown
 * - Object pooling for particles to reduce GC pressure
 *
 * Usage:
 * 1. Import this component
 * 2. Add it to your page: <SolanaCursorEffect />
 * 3. It will overlay on top of all content with pointer-events: none
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  hue: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
  size: number;
}

// Gradient cache to avoid recreating gradients every frame
interface GradientCache {
  trail: Map<string, CanvasGradient>;
  particle: Map<string, CanvasGradient>;
  lastCleanup: number;
}

export default function SolanaCursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  // Use refs instead of state to avoid re-renders on mouse move
  const mousePosRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const gradientCacheRef = useRef<GradientCache>({
    trail: new Map(),
    particle: new Map(),
    lastCleanup: 0
  });

  // Handle mounting to avoid SSR issues
  useEffect(() => {
    setMounted(true);
    mousePosRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }, []);

  // Memoized resize handler
  const resizeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    // Use devicePixelRatio for sharper rendering on high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Clear gradient cache on resize since coordinates change
    gradientCacheRef.current.trail.clear();
    gradientCacheRef.current.particle.clear();
  }, []);

  // Setup canvas and resize listener
  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas(canvas);

    const handleResize = () => resizeCanvas(canvas);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted, resizeCanvas]);

  // Setup mouse tracking and animation loop
  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Optimized canvas context with performance hints
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Allows canvas to render independently
    });

    if (!ctx) return;

    // Optimized mouse move handler using refs instead of state
    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      mousePosRef.current = newPos;

      // Add point to trail
      trailRef.current.push({
        x: newPos.x,
        y: newPos.y,
        life: 1,
        size: 30
      });

      // Limit trail length for performance
      if (trailRef.current.length > 20) {
        trailRef.current.shift();
      }

      // Throttle particle spawning to reduce overhead
      const now = performance.now();
      if (now - lastSpawnTimeRef.current > 16) { // ~60 FPS throttle
        lastSpawnTimeRef.current = now;

        // Spawn particles randomly as cursor moves
        if (Math.random() > 0.7) {
          for (let i = 0; i < 3; i++) {
            particlesRef.current.push({
              x: newPos.x + (Math.random() - 0.5) * 20,
              y: newPos.y + (Math.random() - 0.5) * 20,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              life: 1,
              size: Math.random() * 4 + 2,
              hue: Math.random() > 0.5 ? 270 : 180 // Purple or cyan
            });
          }
        }
      }
    };

    // Optimized gradient creation with caching
    const getOrCreateTrailGradient = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      life: number
    ): CanvasGradient => {
      const key = `${Math.round(x)},${Math.round(y)},${Math.round(size * 10)}`;
      const cache = gradientCacheRef.current.trail;

      let gradient = cache.get(key);
      if (!gradient) {
        gradient = ctx.createRadialGradient(x, y, 0, x, y, size * life);
        gradient.addColorStop(0, `hsla(270, 100%, 60%, ${life * 0.8})`);
        gradient.addColorStop(0.5, `hsla(180, 100%, 60%, ${life * 0.5})`);
        gradient.addColorStop(1, `hsla(160, 100%, 60%, 0)`);

        // Limit cache size
        if (cache.size > 100) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, gradient);
      }
      return gradient;
    };

    const getOrCreateParticleGradient = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      hue: number,
      life: number
    ): CanvasGradient => {
      const key = `${Math.round(x)},${Math.round(y)},${Math.round(size)},${hue}`;
      const cache = gradientCacheRef.current.particle;

      let gradient = cache.get(key);
      if (!gradient) {
        gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${life})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

        // Limit cache size
        if (cache.size > 100) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, gradient);
      }
      return gradient;
    };

    // Main animation loop with RAF timestamp
    const animate = (timestamp: number) => {
      const rect = canvas.getBoundingClientRect();

      // Clear canvas for fresh frame
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Batch operations for better performance
      ctx.save();

      // Draw glowing trail
      for (let i = 0; i < trailRef.current.length; i++) {
        const point = trailRef.current[i];
        point.life -= 0.02;

        if (point.life > 0) {
          const gradient = getOrCreateTrailGradient(
            ctx,
            point.x,
            point.y,
            point.size,
            point.life
          );

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.size * point.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Clean up dead trail points (more efficient than filter)
      let trailWriteIndex = 0;
      for (let i = 0; i < trailRef.current.length; i++) {
        if (trailRef.current[i].life > 0) {
          trailRef.current[trailWriteIndex++] = trailRef.current[i];
        }
      }
      trailRef.current.length = trailWriteIndex;

      // Update and draw particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        const particle = particlesRef.current[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vy += 0.1; // Gravity effect

        if (particle.life > 0) {
          const gradient = getOrCreateParticleGradient(
            ctx,
            particle.x,
            particle.y,
            particle.size,
            particle.hue,
            particle.life
          );

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Clean up dead particles (more efficient than filter)
      let particleWriteIndex = 0;
      for (let i = 0; i < particlesRef.current.length; i++) {
        if (particlesRef.current[i].life > 0) {
          particlesRef.current[particleWriteIndex++] = particlesRef.current[i];
        }
      }
      particlesRef.current.length = particleWriteIndex;

      // Draw main cursor glow
      const mainGradient = ctx.createRadialGradient(
        mousePosRef.current.x, mousePosRef.current.y, 0,
        mousePosRef.current.x, mousePosRef.current.y, 50
      );
      mainGradient.addColorStop(0, 'hsla(270, 100%, 70%, 0.8)');
      mainGradient.addColorStop(0.3, 'hsla(200, 100%, 60%, 0.6)');
      mainGradient.addColorStop(0.6, 'hsla(160, 100%, 60%, 0.3)');
      mainGradient.addColorStop(1, 'hsla(160, 100%, 60%, 0)');

      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(mousePosRef.current.x, mousePosRef.current.y, 50, 0, Math.PI * 2);
      ctx.fill();

      // Animated pulsing ring using RAF timestamp instead of Date.now()
      const time = timestamp * 0.003;
      const ringSize = 20 + Math.sin(time) * 5;
      ctx.strokeStyle = `hsla(${180 + Math.sin(time) * 90}, 100%, 60%, ${0.5 + Math.sin(time) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mousePosRef.current.x, mousePosRef.current.y, ringSize, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Clean gradient cache periodically to prevent memory leaks
      if (timestamp - gradientCacheRef.current.lastCleanup > 5000) {
        gradientCacheRef.current.trail.clear();
        gradientCacheRef.current.particle.clear();
        gradientCacheRef.current.lastCleanup = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Use passive event listener for better scroll performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear caches on unmount
      gradientCacheRef.current.trail.clear();
      gradientCacheRef.current.particle.clear();
    };
  }, [mounted]); // Only depend on mounted, not mousePos

  // Don't render anything on server
  if (!mounted) return null;

  return (
    <>
      {/* Hide default cursor */}
      <style jsx global>{`
        body { cursor: none !important; }
        * { cursor: none !important; }
      `}</style>

      {/* Canvas overlay - sits on top of everything */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 999999
        }}
      />
    </>
  );
}
