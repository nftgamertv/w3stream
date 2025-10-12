    import React from 'react'
    import SolanaCursorEffect from '@/components/SolanaCursorEffect'
import { ThreeBackground } from '@/components/three-background'
    
    export default function MainLayout({children}:{children:React.ReactNode}) {
      return (<>
      <div className='min-h-screen flex flex-col items-center justify-center '>
   <script type="module" src="https://unpkg.com/@splinetool/viewer@1.10.77/build/spline-viewer.js"></script>
   {/* @ts-ignore */}
<spline-viewer loading-anim-type="spinner-small-dark" url="https://prod.spline.design/6cUAvh71RWmBlya2/scene.splinecode"></spline-viewer> </div>
  
     
            <ThreeBackground />
          {children}
          <div id="portal"></div>
             <SolanaCursorEffect />
       </>
      )
    }
    