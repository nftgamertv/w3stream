import { useEffect, useRef, useState } from 'react'

interface UseLazyVideoOptions {
  src: string
  type: string
  rootMargin?: string
  threshold?: number
  priority?: 'high' | 'low'
  delay?: number
}

/**
 * Custom hook for lazy loading videos with Intersection Observer
 * Optimizes performance by only loading videos when they're about to enter viewport
 *
 * @param options Configuration options for lazy loading behavior
 * @returns Tuple of [videoRef, isLoaded, isPlaying] for component integration
 */
export function useLazyVideo({
  src,
  type,
  rootMargin = '50px',
  threshold = 0.1,
  priority = 'high',
  delay = 0,
}: UseLazyVideoOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || isLoaded) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadVideo()
            observer.disconnect()
          }
        })
      },
      { rootMargin, threshold }
    )

    observer.observe(videoElement)

    return () => {
      observer.disconnect()
    }
  }, [isLoaded, rootMargin, threshold])

  const loadVideo = () => {
    const videoElement = videoRef.current
    if (!videoElement || isLoaded) return

    const doLoad = () => {
      const source = document.createElement('source')
      source.src = src
      source.type = type
      videoElement.appendChild(source)
      videoElement.load()
      setIsLoaded(true)

      videoElement.addEventListener('loadeddata', () => {
        videoElement.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Video autoplay prevented:', err)
          })
      }, { once: true })
    }

    // Use requestIdleCallback for low priority videos
    if (priority === 'low' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (delay > 0) {
          setTimeout(doLoad, delay)
        } else {
          doLoad()
        }
      }, { timeout: 2000 })
    } else if (delay > 0) {
      setTimeout(doLoad, delay)
    } else {
      doLoad()
    }
  }

  return [videoRef, isLoaded, isPlaying] as const
}
