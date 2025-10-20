    import React from 'react'
    import SolanaCursorEffect from '@/components/SolanaCursorEffect'
import { ThreeBackground } from '@/components/ThreeBackground'
    
    export default function MainLayout({children}:{children:React.ReactNode}) {
      return (
        <> 

          <script type="module" src="https://unpkg.com/@splinetool/viewer@1.10.82/build/spline-viewer.js"></script>
          {/* @ts-ignore */}
   
<spline-viewer url="https://prod.spline.design/t0wbk9SR1W-64x63/scene.splinecode"></spline-viewer>
         
          {children}
          <div id="portal"></div>
          <ThreeBackground />
          <SolanaCursorEffect />
        </>
      )
    }
    