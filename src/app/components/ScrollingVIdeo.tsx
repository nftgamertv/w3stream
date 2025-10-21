"use client"

import { useEffect, useRef, useState } from "react"

export default function ScrollingCinemaBanner() {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoVideoRef = useRef<HTMLVideoElement>(null)
  const carouselVideoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [carouselVisible, setCarouselVisible] = useState(false)

  // Logo video (LCP element) loads immediately - no intersection observer
  useEffect(() => {
    const logoVideo = logoVideoRef.current
    if (!logoVideo) return

    // Attempt autoplay as soon as video metadata is loaded
    const handleCanPlay = () => {
      logoVideo.play().catch(err => {
        console.log('Logo video autoplay prevented:', err)
      })
    }

    logoVideo.addEventListener('canplay', handleCanPlay, { once: true })

    return () => {
      logoVideo.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  // Defer carousel videos - load only when component is in viewport
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !carouselVisible) {
            setCarouselVisible(true)
            // Delay carousel video loading to not compete with LCP
            if ('requestIdleCallback' in window) {
              requestIdleCallback(() => {
                loadCarouselVideos()
              }, { timeout: 3000 })
            } else {
              setTimeout(() => {
                loadCarouselVideos()
              }, 1000)
            }
          }
        })
      },
      {
        rootMargin: "200px",
        threshold: 0.1,
      }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [carouselVisible])

  const loadCarouselVideos = () => {
    carouselVideoRefs.current.forEach((video) => {
      if (!video) return

      // Load carousel videos lazily
      video.load()

      video.addEventListener('loadeddata', () => {
        video.play().catch(err => {
          console.log('Carousel video autoplay prevented:', err)
        })
      }, { once: true })
    })
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[200px] w-full overflow-hidden bg-transparent pointer-events-none"
      role="presentation"
      aria-hidden="true"
    >
      {/* Background carousel videos - DEFERRED */}
      <div className="absolute inset-0 flex animate-scroll-video">
        <video
          ref={(el) => (carouselVideoRefs.current[0] = el)}
          loop
          muted
          playsInline
          preload="none"
          className="h-full w-auto flex-shrink-0 opacity-10 blur-out-xs"
          style={{
            opacity: carouselVisible ? 0.1 : 0,
            transition: 'opacity 0.5s ease-in-out'
          }}
          aria-hidden="true"
          title="Background carousel video"
        >
          <source src="/videos/carousel.webm" type="video/webm" />
        </video>
        <video
          ref={(el) => (carouselVideoRefs.current[1] = el)}
          loop
          muted
          playsInline
          preload="none"
          className="h-full w-auto flex-shrink-0 opacity-10 blur-out-xs"
          style={{
            opacity: carouselVisible ? 0.1 : 0,
            transition: 'opacity 0.5s ease-in-out'
          }}
          aria-hidden="true"
          title="Background carousel video"
        >
          <source src="/videos/carousel.webm" type="video/webm" />
        </video>
        <video
          ref={(el) => (carouselVideoRefs.current[2] = el)}
          loop
          muted
          playsInline
          preload="none"
          className="h-full w-auto flex-shrink-0 opacity-10"
          style={{
            opacity: carouselVisible ? 0.1 : 0,
            transition: 'opacity 0.5s ease-in-out'
          }}
          aria-hidden="true"
          title="Background carousel video"
        >
          <source src="/videos/carousel.webm" type="video/webm" />
        </video>
      </div>

      {/* LCP ELEMENT: Logo video with HIGHEST priority */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <video
          ref={logoVideoRef}
          loop
          muted
          playsInline
          preload="metadata"
          fetchpriority="high"
          className="h-full w-auto relative z-50 mb-12"
          width={600}
          height={200}
          aria-label="w3stream animated logo"
          title="w3stream logo animation"
        >
          {/* Source in HTML for discoverability - NO dynamic loading for LCP */}
          <source src="/videos/w3SLogo.webm" type="video/webm" />
        </video>
      </div>
    </div>
  )
}
