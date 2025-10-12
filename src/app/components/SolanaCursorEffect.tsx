'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * SolanaCursorEffect - Eye-dropping Solana-themed cursor effect
 * NextJS 15 compatible (SSR-safe)
 * 
 * Usage:
 * 1. Import this component
 * 2. Add it to your page: <SolanaCursorEffect />
 * 3. It will overlay on top of all content with pointer-events: none
 */

export default function SolanaCursorEffect() {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const particlesRef = useRef([]);
  const trailRef = useRef([]);
  const animationRef = useRef(null);

  // Handle mounting to avoid SSR issues
  useEffect(() => {
    setMounted(true);
    setMousePos({ 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to full viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse movement
    const handleMouseMove = (e) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setMousePos(newPos);
      
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
    };

    // Main animation loop
    const animate = () => {
      // Create fade trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glowing trail
      trailRef.current.forEach((point) => {
        point.life -= 0.02;
        
        if (point.life > 0) {
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, point.size * point.life
          );
          
          // Solana gradient: purple -> cyan
          gradient.addColorStop(0, `hsla(270, 100%, 60%, ${point.life * 0.8})`);
          gradient.addColorStop(0.5, `hsla(180, 100%, 60%, ${point.life * 0.5})`);
          gradient.addColorStop(1, `hsla(160, 100%, 60%, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.size * point.life, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Clean up dead trail points
      trailRef.current = trailRef.current.filter(p => p.life > 0);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vy += 0.1; // Gravity effect

        if (particle.life > 0) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
          );
          
          gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${particle.life})`);
          gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Clean up dead particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      // Draw main cursor glow
      const mainGradient = ctx.createRadialGradient(
        mousePos.x, mousePos.y, 0,
        mousePos.x, mousePos.y, 50
      );
      mainGradient.addColorStop(0, 'hsla(270, 100%, 70%, 0.8)');
      mainGradient.addColorStop(0.3, 'hsla(200, 100%, 60%, 0.6)');
      mainGradient.addColorStop(0.6, 'hsla(160, 100%, 60%, 0.3)');
      mainGradient.addColorStop(1, 'hsla(160, 100%, 60%, 0)');
      
      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 50, 0, Math.PI * 2);
      ctx.fill();

      // Animated pulsing ring
      const time = Date.now() * 0.003;
      const ringSize = 20 + Math.sin(time) * 5;
      ctx.strokeStyle = `hsla(${180 + Math.sin(time) * 90}, 100%, 60%, ${0.5 + Math.sin(time) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, ringSize, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, mousePos.x, mousePos.y]);

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
          mixBlendMode: 'screen',
          zIndex: 999999
        }}
      />
    </>
  );
}