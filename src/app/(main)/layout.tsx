    import React from 'react'
    import SolanaCursorEffect from '@/components/SolanaCursorEffect'
    import { Sparkles, Video } from "lucide-react"
import VideoBackground from '@/components/VideoBackground'
    export default function MainLayout({children}:{children:React.ReactNode}) {
      return (
    <div  style={{minHeight: '100vh', position: 'relative', overflow: 'hidden'}}>
          <VideoBackground /> 
      <div className="absolute  top-8  left-1/2 transform -translate-x-1/2">
  
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-primary/20 backdrop-blur-sm text-green-300 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4" />
              Coming Soon
            </div> </div>
          <script type="module" src="https://unpkg.com/@splinetool/viewer@1.10.82/build/spline-viewer.js"></script>
          {/* @ts-ignore */}

<spline-viewer url="https://prod.spline.design/t0wbk9SR1W-64x63/scene.splinecode" style={{pointerEvents: 'none'}}></spline-viewer>

          {children}

          <SolanaCursorEffect />
                  {/* Footer */}
        <footer className="absolute left-1/2 transform -translate-x-1/2 w-full bottom-0 border-t border-slate-700/50 py-8 mt-4">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-slate-400">
              © 2025 w3Stream, Inc. All rights reserved.
              <span className="mx-2">•</span>
              <a href="#" className="hover:text-gray-400 transition-colors">
                Privacy Policy
              </a>
           
              <span className="mx-2">•</span>
              <a href="#" className="hover:text-gray-400 transition-colors">
                Terms of Service
              </a>
            </p>

          </div>
        </footer>
                  <div id="portal"></div>
 
        </div>
      )
    }
    