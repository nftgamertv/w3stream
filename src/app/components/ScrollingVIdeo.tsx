"use client"

import Image from "next/image"

export default function ScrollingCinemaBanner() {
  return (
    <div className="relative h-[200px] w-full overflow-hidden bg-transparent pointer-events-none">
      <div className="absolute inset-0 flex animate-scroll-video">
        <video autoPlay loop muted playsInline className="h-full w-auto flex-shrink-0 opacity-10 blur-out-xs">
          <source src="/videos/carousel.webm" type="video/webm" />
        </video>
        <video autoPlay loop muted playsInline className="h-full w-auto flex-shrink-0 opacity-10 blur-out-xs">
          <source src="/videos/carousel.webm" type="video/webm" />
        </video>
        <video autoPlay loop muted playsInline className="h-full w-auto flex-shrink-0 opacity-10">
          <source src="/videos/carousel.webm" type="video/webm" />
        </video>
      </div>

      {/* Centered logo overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <video autoPlay loop muted playsInline className="h-full w-auto relative z-50 mb-12"  width={600}
          height={200}>
          <source src="/videos/w3SLogoAnimated.webm" type="video/webm" />
        </video>
         
       
      
      </div>
    </div>
  )
}
