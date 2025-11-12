"use client"

/**
 * Lazy-loaded component wrappers for client-side only rendering
 *
 * This file handles dynamic imports with ssr: false for heavy components.
 * Next.js 15+ requires client components to use ssr: false option.
 */

import dynamic from "next/dynamic"
import {
  ThreeBackgroundFallback,
  VideoBackgroundFallback,
  LoginModalFallback,
  ScrollingVideoFallback,
  PerformanceModalFallback,
  KeystrokeListenerFallback,
} from "./LoadingFallbacks"

// Layout-level lazy components
export const LazyThreeBackground = dynamic(
  () => import("./ThreeBackground").then((mod) => ({ default: mod.ThreeBackground })),
  {
    ssr: false,
    loading: () => <ThreeBackgroundFallback />,
  }
);

export const LazyVideoBackground = dynamic(
  () => import("./VideoBackground"),
  {
    ssr: false,
    loading: () => <VideoBackgroundFallback />,
  }
);

export const LazyLoginModalWrapper = dynamic(
  () => import("./LoginModalWrapper").then((mod) => ({ default: mod.LoginModalWrapper })),
  {
    ssr: false,
    loading: () => <LoginModalFallback />,
  }
);

// Page-level lazy components
export const LazyScrollingVideo = dynamic(
  () => import("./ScrollingVIdeo"),
  {
    ssr: false,
    loading: () => <ScrollingVideoFallback />,
  }
);

export const LazyPerformanceModal = dynamic(
  () => import("./PerformanceModal"),
  {
    ssr: false,
    loading: () => <PerformanceModalFallback />,
  }
);

export const LazyKeystrokeListener = dynamic(
  () => import("./KeystrokeListener"),
  {
    ssr: false,
    loading: () => <KeystrokeListenerFallback />,
  }
);

export const LazySolanaCursorEffect = dynamic(
  () => import("./SolanaCursorEffect"),
  {
    ssr: false,
    loading: () => null,
  }
);

 
