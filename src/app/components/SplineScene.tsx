"use client"

import { Suspense, lazy, useState, useEffect } from 'react'

// Lazy load Spline component to avoid blocking initial render
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  sceneUrl: string
  className?: string
  fallback?: React.ReactNode
}

export function SplineScene({
  sceneUrl,
  className = "",
  fallback = null
}: SplineSceneProps) {
  const [isClient, setIsClient] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Defer Spline loading until after critical content
    // This prevents blocking LCP and FCP
    const loadTimer = setTimeout(() => {
      // Use requestIdleCallback to load during idle time
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setShouldLoad(true), { timeout: 3000 })
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => setShouldLoad(true), 2000)
      }
    }, 1000)

    return () => clearTimeout(loadTimer)
  }, [])

  // Don't render anything until client-side and load is triggered
  if (!isClient || !shouldLoad) {
    return fallback ? <>{fallback}</> : null
  }

  return (
    <Suspense fallback={fallback || <div className="spline-loading" />}>
      <Spline
        scene={sceneUrl}
        className={className}
        style={{ pointerEvents: 'none' }}
      />
    </Suspense>
  )
}

// Optimized version for self-hosted scenes
export function SelfHostedSplineScene({
  sceneUrl,
  className = ""
}: SplineSceneProps) {
  const [isClient, setIsClient] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Even more aggressive deferral for self-hosted scenes
    // Load only after page is fully interactive
    const loadTimer = setTimeout(() => {
      if (document.readyState === 'complete') {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => setShouldLoad(true), { timeout: 5000 })
        } else {
          setTimeout(() => setShouldLoad(true), 3000)
        }
      } else {
        window.addEventListener('load', () => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => setShouldLoad(true), { timeout: 5000 })
          } else {
            setTimeout(() => setShouldLoad(true), 3000)
          }
        }, { once: true })
      }
    }, 500)

    return () => clearTimeout(loadTimer)
  }, [])

  if (!isClient || !shouldLoad) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <Spline
        scene={sceneUrl}
        className={className}
        style={{ pointerEvents: 'none' }}
      />
    </Suspense>
  )
}
