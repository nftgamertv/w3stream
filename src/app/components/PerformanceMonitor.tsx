"use client"

import { useEffect } from 'react';

/**
 * Performance Monitor Component
 *
 * Tracks and logs Core Web Vitals and component loading performance.
 * Use in development to monitor the impact of code splitting and lazy loading.
 */

interface PerformanceMetrics {
  fcp?: number;  // First Contentful Paint
  lcp?: number;  // Largest Contentful Paint
  fid?: number;  // First Input Delay
  cls?: number;  // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number;  // Time to Interactive
}

function logMetric(name: string, value: number, unit = 'ms') {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${value.toFixed(2)}${unit}`);
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    const metrics: PerformanceMetrics = {};

    // Measure Core Web Vitals using the Performance API
    const measureWebVitals = () => {
      // First Contentful Paint (FCP)
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
        logMetric('First Contentful Paint (FCP)', fcpEntry.startTime);
      }

      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            if (lastEntry) {
              metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
              logMetric('Largest Contentful Paint (LCP)', metrics.lcp);
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          // Cumulative Layout Shift (CLS)
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries() as any[]) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            metrics.cls = clsValue;
            logMetric('Cumulative Layout Shift (CLS)', clsValue, '');
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const firstInput = entries[0] as any;
            if (firstInput) {
              metrics.fid = firstInput.processingStart - firstInput.startTime;
              logMetric('First Input Delay (FID)', metrics.fid);
            }
          });
          fidObserver.observe({ type: 'first-input', buffered: true });
        } catch (e) {
          // PerformanceObserver not supported
          console.warn('[Performance] PerformanceObserver not fully supported');
        }
      }

      // Time to First Byte (TTFB)
      const navigationTiming = performance.getEntriesByType('navigation')[0] as any;
      if (navigationTiming) {
        metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
        logMetric('Time to First Byte (TTFB)', metrics.ttfb);
      }
    };

    // Measure when page is fully loaded
    if (document.readyState === 'complete') {
      measureWebVitals();
    } else {
      window.addEventListener('load', measureWebVitals);
    }

    // Log resource loading times
    const logResourceTimings = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      // Group by resource type
      const resourcesByType: Record<string, number[]> = {};

      resources.forEach(resource => {
        const type = resource.initiatorType || 'other';
        if (!resourcesByType[type]) {
          resourcesByType[type] = [];
        }
        resourcesByType[type].push(resource.duration);
      });

      // Log statistics for each type
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance] Resource Loading Times:');
        Object.entries(resourcesByType).forEach(([type, durations]) => {
          const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
          const max = Math.max(...durations);
          console.log(`  ${type}: avg=${avg.toFixed(2)}ms, max=${max.toFixed(2)}ms, count=${durations.length}`);
        });
      }
    };

    // Log lazy-loaded chunks
    const logChunkLoading = () => {
      const scriptResources = performance.getEntriesByType('resource')
        .filter((resource: any) =>
          resource.initiatorType === 'script' &&
          (resource.name.includes('_next/static') || resource.name.includes('.js'))
        ) as PerformanceResourceTiming[];

      if (scriptResources.length > 0 && process.env.NODE_ENV === 'development') {
        console.log('[Performance] JavaScript Chunks:');
        scriptResources.forEach(resource => {
          const name = resource.name.split('/').pop() || resource.name;
          console.log(`  ${name}: ${resource.duration.toFixed(2)}ms`);
        });
      }
    };

    // Run after initial load
    setTimeout(() => {
      logResourceTimings();
      logChunkLoading();
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('load', measureWebVitals);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

/**
 * Usage:
 *
 * Add to your layout.tsx or page.tsx in development:
 *
 * ```tsx
 * {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
 * ```
 *
 * Or use conditionally:
 *
 * ```tsx
 * import dynamic from 'next/dynamic';
 *
 * const PerformanceMonitor = dynamic(
 *   () => import('./components/PerformanceMonitor').then(m => m.PerformanceMonitor),
 *   { ssr: false }
 * );
 *
 * export default function Layout() {
 *   return (
 *     <>
 *       {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
 *       // ... rest of layout
 *     </>
 *   );
 * }
 * ```
 */
