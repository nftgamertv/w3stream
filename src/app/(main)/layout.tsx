import React from 'react'
import Link from 'next/link'
import { Sparkles } from "lucide-react"
// Uncomment after running 'npm install' and adding your Spline scene to public/spline/
  import { SelfHostedSplineScene } from '@/components/SplineScene'

export default function MainLayout({children}:{children:React.ReactNode}) {
  return (
    <div style={{minHeight: '100vh', position: 'relative', overflow: 'hidden', 
    backgroundImage: 'url(https://imagedelivery.net/dCSlCQNYRsUOWJPw5n2BPQ/w3streamBG/1920)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      {/* Self-hosted Spline scene - ultra-deferred for performance */}
      {/* Uncomment after exporting your Spline scene and placing in public/spline/ */}
     <SelfHostedSplineScene
        sceneUrl="/spline/scene.splinecode"
        className="absolute bottom-0 pointer-events-none"
      />    

      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-primary/20 backdrop-blur-sm text-green-300 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
          <Sparkles className="w-4 h-4" />
          Coming Soon
        </div>
      </div>

      {children}

      {/* Footer */}
      <footer className="absolute left-1/2 transform -translate-x-1/2 w-full bottom-0 border-t border-slate-700/50 py-8 mt-4 z-[100] pointer-events-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © 2025 w3Stream, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link 
                href="/privacy" 
                className="text-slate-400 hover:text-cyan-400 transition-all duration-200 px-3 py-2 rounded-md hover:bg-cyan-400/30 hover:underline cursor-pointer relative"
              >
                Privacy Policy
              </Link>
              <span className="text-slate-600">•</span>
              <Link 
                href="/tos" 
                className="text-slate-400 hover:text-cyan-400 transition-all duration-200 px-3 py-2 rounded-md hover:bg-cyan-400/30 hover:underline cursor-pointer relative"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <div id="portal"></div>
    </div>
  )
}
