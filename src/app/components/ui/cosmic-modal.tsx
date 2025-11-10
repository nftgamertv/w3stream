"use client"
import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { X, Sparkles, Zap, Star } from "lucide-react"
import ShimmerButton from "./shimmer-button"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'agent-id'?: string }, HTMLElement>
    }
  }
}

export function CosmicModal() {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const cursorGlowRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setIsClient(true)
    // Wait for the portal container to exist in the DOM
    const checkContainer = () => {
      const container = document.getElementById('cosmicModal')
      if (container) {
        setPortalContainer(container)
      } else {
        // If not found, check again on next frame
        requestAnimationFrame(checkContainer)
      }
    }
    checkContainer()
  }, [])

  // Safety net: Force button to be visible when portal container mounts
  useEffect(() => {
    if (portalContainer && buttonRef.current && !isOpen) {
      // Ensure button is visible and properly styled after portal mount
      requestAnimationFrame(() => {
        if (buttonRef.current) {
          buttonRef.current.style.opacity = "1"
          buttonRef.current.style.transform = "none"
        }
      })
    }
  }, [portalContainer, isOpen])    
  // Aggressively ensure button is visible when modal is closed
  useEffect(() => {
    if (buttonRef.current && !isOpen) {
      // NUCLEAR OPTION: Kill everything and reset completely
      gsap.killTweensOf(buttonRef.current)

      // Clear ALL inline styles first
      buttonRef.current.style.cssText = ""

      // Force reset ALL transform properties explicitly
      gsap.set(buttonRef.current, {
        clearProps: "all"
      })

      // Now set the values we actually want
      gsap.set(buttonRef.current, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
      })

      // Small delay to ensure reset happens before starting animations
      const timeoutId = setTimeout(() => {
        if (!buttonRef.current) return

        const floatAnim = gsap.to(buttonRef.current, {
          y: -10,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        })

        const glowAnim = gsap.to(buttonRef.current, {
          boxShadow: "0 0 60px rgba(168, 85, 247, 0.8), 0 0 100px rgba(168, 85, 247, 0.4)",
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        })

        // Store refs for cleanup
        buttonRef.current.dataset.floatId = floatAnim.toString()
        buttonRef.current.dataset.glowId = glowAnim.toString()
      }, 50)

      return () => {
        clearTimeout(timeoutId)
        if (buttonRef.current) {
          gsap.killTweensOf(buttonRef.current)
        }
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorGlowRef.current && isOpen) {
        gsap.to(cursorGlowRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isOpen])

  const createParticles = () => {
    if (!particlesRef.current || !buttonRef.current) return

    const buttonRect = buttonRef.current.getBoundingClientRect()
    const centerX = buttonRect.left + buttonRect.width / 2
    const centerY = buttonRect.top + buttonRect.height / 2

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div")
      particle.className = "absolute w-2 h-2 rounded-full"

      const colors = ["bg-violet-500", "bg-cyan-500", "bg-fuchsia-500", "bg-blue-500", "bg-purple-500"]
      particle.classList.add(colors[Math.floor(Math.random() * colors.length)])

      particle.style.left = `${centerX}px`
      particle.style.top = `${centerY}px`
      particlesRef.current.appendChild(particle)

      const angle = (Math.PI * 2 * i) / 50
      const velocity = 100 + Math.random() * 200
      const tx = Math.cos(angle) * velocity
      const ty = Math.sin(angle) * velocity

      gsap.to(particle, {
        x: tx,
        y: ty,
        opacity: 0,
        scale: 0,
        duration: 1.5,
        ease: "power2.out",
        onComplete: () => particle.remove(),
      })
    }
  }

  const openModal = () => {
    if (isOpen) return

    if (!modalRef.current || !overlayRef.current || !buttonRef.current || !contentRef.current) return

    // Kill all button animations FIRST
    gsap.killTweensOf(buttonRef.current)

    setIsOpen(true)
    createParticles()

    const tl = gsap.timeline()

    tl.to(buttonRef.current, {
      scale: 0.5,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    })

    tl.to(
      overlayRef.current,
      {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.2",
    )

    tl.fromTo(
      modalRef.current,
      {
        scale: 0,
        rotationX: -90,
        rotationY: 180,
        opacity: 0,
      },
      {
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(1.4)",
        transformPerspective: 1000,
      },
      "-=0.2",
    )

    if (glowRef.current) {
      tl.fromTo(
        glowRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1.5,
          opacity: 0.6,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.6",
      )
    }

    const contentElements = contentRef.current.children
    gsap.set(contentElements, { y: 50, opacity: 0, rotationX: -45 })
    tl.to(
      contentElements,
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        transformPerspective: 800,
      },
      "-=0.4",
    )
  }

  const closeModal = () => {
    if (!modalRef.current || !overlayRef.current || !buttonRef.current) return

    if (contentRef.current) {
      gsap.killTweensOf(contentRef.current.children)
    }

    // Kill any existing button animations immediately
    gsap.killTweensOf(buttonRef.current)

    const tl = gsap.timeline({
      onComplete: () => {
        // Triple-layer nuclear cleanup
        if (buttonRef.current) {
          gsap.killTweensOf(buttonRef.current)
          buttonRef.current.style.cssText = ""
          gsap.set(buttonRef.current, { clearProps: "all" })

          // Force set correct values after clearing
          gsap.set(buttonRef.current, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            x: 0,
            y: 0,
          })
        }
        // Update state after clearing
        setIsOpen(false)
      },
    })

    tl.to(modalRef.current, {
      scale: 0.8,
      rotationY: 90,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    })

    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.3,
      },
      "-=0.3",
    )

    // Simpler button animation - less likely to leave artifacts
    tl.to(
      buttonRef.current,
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto", // GSAP will overwrite conflicting props
      },
      "-=0.2",
    )
  }

  return (
    <>
      <div ref={particlesRef} className="fixed inset-0 pointer-events-none z-[100]" />

      <div
        ref={cursorGlowRef}
        className={`fixed w-64 h-64 pointer-events-none z-[60] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
        }}
      />

      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[70] transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeModal}
      />

      <div className="fixed inset-0 flex items-center justify-center z-[80] pointer-events-none p-4">
        <div
          ref={glowRef}
          className="absolute w-full h-full max-w-2xl max-h-[600px] "
        />

        <div
          ref={modalRef}
          className={`relative w-full max-w-xl bg-gradient-to-br from-zinc-900/90 via-black/90 to-zinc-950/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none opacity-0"}`}
          style={{
            maxHeight: "600px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 opacity-50 blur-xl" />
          <div className="absolute inset-[2px] bg-gradient-to-br from-zinc-900 via-black to-zinc-950 rounded-3xl" />

          <div className="relative z-10 p-8">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-110 hover:rotate-90 group"
            >
              <X className="w-5 h-5 text-white group-hover:text-violet-400 transition-colors" />
            </button>

            <div ref={contentRef} className="space-y-6">
              {/* <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/50">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white text-balance">Absolutely Incredible Modal</h2>
              </div> */}

              {/* <p className="text-zinc-400 text-lg leading-relaxed">
                This modal features explosive particle effects, 3D transforms, magnetic cursor interactions, and
                buttery-smooth GSAP animations that'll make your jaw drop.
              </p> */}

              {/* <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-violet-400 mb-2 group-hover:animate-pulse" />
                  <h3 className="text-white font-semibold mb-1">Lightning Fast</h3>
                  <p className="text-zinc-500 text-sm">Optimized GSAP animations</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
                  <Star className="w-8 h-8 text-cyan-400 mb-2 group-hover:animate-spin" />
                  <h3 className="text-white font-semibold mb-1">3D Effects</h3>
                  <p className="text-zinc-500 text-sm">Stunning perspective transforms</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border border-fuchsia-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-fuchsia-400 mb-2 group-hover:animate-bounce" />
                  <h3 className="text-white font-semibold mb-1">Particle Bursts</h3>
                  <p className="text-zinc-500 text-sm">Dynamic particle system</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-purple-400 mb-2 group-hover:animate-pulse" />
                  <h3 className="text-white font-semibold mb-1">Smooth Easing</h3>
                  <p className="text-zinc-500 text-sm">Physics-based motion</p>
                </div>
              </div>*/}
              <elevenlabs-convai agent-id="agent_5501k1z0sy9sevpr2wq6n95ndy7b"></elevenlabs-convai>
              <Button
                onClick={closeModal}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 border-0 shadow-lg shadow-violet-500/50 hover:shadow-violet-500/70 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Close This Masterpiece
                  <Sparkles className="w-5 h-5" />
                </span>
              </Button>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-transparent blur-2xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/20 to-transparent blur-2xl" />
        </div>
      </div>
{portalContainer && createPortal(
        <ShimmerButton
          ref={buttonRef}
          onClick={openModal}
          id="b"
          disabled={isOpen}
          className={`text-lg font-bold text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 rounded-full shadow-lg border-2 border-white/20 hover:scale-110 hover:border-white/40 z-50 disabled:pointer-events-none ${
            isOpen ? "pointer-events-none" : "pointer-events-auto"
          }`}
          style={{
            boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)",
            // Force correct values when closed - GSAP can override these when animating
            ...(isOpen ? {} : {
              opacity: 1,
            }),
          }}
        />,
        portalContainer
      )}
    </>
  )
}
