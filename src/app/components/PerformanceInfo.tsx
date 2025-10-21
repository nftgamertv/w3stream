"use client"

import { useEffect, useState } from "react"

interface SystemInfo {
  browser: string
  browserVersion: string
  os: string
  platform: string
  screenResolution: string
  viewportSize: string
  windowSize: string
  devicePixelRatio: number
  deviceMemory: string
  hardwareConcurrency: number
  connectionType: string
}

interface PerformanceStats {
  fps: number
  loadTime: number
  domContentLoaded: number
  memoryUsed: string
  memoryLimit: string
  paintTime: number
}

export default function PerformanceInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null)
  const [fps, setFps] = useState(0)

  useEffect(() => {
    // Get Browser and OS Info
    const getBrowserInfo = () => {
      const ua = navigator.userAgent
      let browser = "Unknown"
      let browserVersion = "Unknown"

      if (ua.indexOf("Firefox") > -1) {
        browser = "Firefox"
        browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || "Unknown"
      } else if (ua.indexOf("Chrome") > -1) {
        browser = "Chrome"
        browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || "Unknown"
      } else if (ua.indexOf("Safari") > -1) {
        browser = "Safari"
        browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || "Unknown"
      } else if (ua.indexOf("Edge") > -1) {
        browser = "Edge"
        browserVersion = ua.match(/Edge\/(\d+\.\d+)/)?.[1] || "Unknown"
      }

      return { browser, browserVersion }
    }

    const getOSInfo = () => {
      const ua = navigator.userAgent
      let os = "Unknown"

      if (ua.indexOf("Win") > -1) os = "Windows"
      else if (ua.indexOf("Mac") > -1) os = "macOS"
      else if (ua.indexOf("Linux") > -1) os = "Linux"
      else if (ua.indexOf("Android") > -1) os = "Android"
      else if (ua.indexOf("iOS") > -1) os = "iOS"

      return os
    }

    const { browser, browserVersion } = getBrowserInfo()
    const os = getOSInfo()

    const info: SystemInfo = {
      browser,
      browserVersion,
      os,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      windowSize: `${window.outerWidth}x${window.outerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      deviceMemory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : "Unknown",
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      connectionType: (navigator as any).connection?.effectiveType || "Unknown"
    }

    setSystemInfo(info)

    // Get Performance Stats
    const perf = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    const paintEntries = performance.getEntriesByType("paint")
    const firstPaint = paintEntries.find(entry => entry.name === "first-contentful-paint")

    const memory = (performance as any).memory
    const stats: PerformanceStats = {
      fps: 0, // Will be updated by FPS counter
      loadTime: perf ? Math.round(perf.loadEventEnd - perf.fetchStart) : 0,
      domContentLoaded: perf ? Math.round(perf.domContentLoadedEventEnd - perf.fetchStart) : 0,
      memoryUsed: memory ? `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB` : "Unknown",
      memoryLimit: memory ? `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB` : "Unknown",
      paintTime: firstPaint ? Math.round(firstPaint.startTime) : 0
    }

    setPerformanceStats(stats)

    // FPS Counter
    let lastTime = performance.now()
    let frames = 0
    let fpsUpdateTime = lastTime

    const countFPS = () => {
      const now = performance.now()
      frames++

      if (now >= fpsUpdateTime + 1000) {
        const currentFPS = Math.round((frames * 1000) / (now - fpsUpdateTime))
        setFps(currentFPS)
        frames = 0
        fpsUpdateTime = now
      }

      requestAnimationFrame(countFPS)
    }

    requestAnimationFrame(countFPS)
  }, [])

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      })

      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve
      })

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)

      // Stop the stream
      stream.getTracks().forEach(track => track.stop())

      // Download the screenshot
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `w3stream-screenshot-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
      })
    } catch (err) {
      console.error('Screenshot failed:', err)
      alert('Screenshot capture failed. Make sure to allow screen sharing.')
    }
  }

  if (!systemInfo || !performanceStats) {
    return (
      <div className="max-w-2xl mx-auto p-6 ">
        <p className="text-white text-center">Loading performance data...</p>
      </div>
    )
  }

  return (<>
 
    
 
      <div className=" ">
       <div className="px-3 rounded flex">
                   <p className="red-highlight">Browser: &nbsp;</p>
           <p className="red-highlight">{systemInfo.browser} {systemInfo.browserVersion}</p>
         </div>
          <div className="px-3 rounded flex">
            <p className="red-highlight">OS: &nbsp;</p>
           <p className="red-highlight">{systemInfo.os}</p>
          </div>
        </div>
 
    <div className="px-3 rounded flex">
            <p className="red-highlight">DOM: &nbsp;</p>
           <p className="red-highlight">{performanceStats.domContentLoaded}ms</p>
          </div>
     <div className="px-3 rounded flex">
            <p className="red-highlight">First Paint: &nbsp;</p>
           <p className="red-highlight">{performanceStats.paintTime}ms</p>
          </div>
  <div className="px-3 rounded flex">
            <p className="red-highlight">Mem. Used: &nbsp;</p>
           <p className="red-highlight">{performanceStats.memoryUsed}</p>
          </div>
     <div className="px-3 rounded flex">
            <p className="red-highlight">Mem. Limit: &nbsp;</p>
           <p className="red-highlight">{performanceStats.memoryLimit}</p>
          </div>
     

  
    
    </>
  )
}
