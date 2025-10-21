import Link from "next/link"
import { CyclingText } from "@/components/CyclingText"

 

import KeystrokeListener from "@/components/KeystrokeListener"
 
 import ScrollingVideo from "@/components/ScrollingVIdeo";
 
export default function SplashPage() {
  const cyclingItems = [
    {
      content: "streaming",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
    },
    {
      content: "collaboration",
      backgroundColor: "#8b5cf6",
      textColor: "#ffffff",
    },
    {
      content: "AI agent",
      backgroundColor: "#ec4899",
      textColor: "#ffffff",
    },
       {
      content: "decentralized",
      backgroundColor: "cyan",
      textColor: "#1a1a1a",
    },
    
  ]
  return (
    <div className="fixed inset-0 bg-transparent flex flex-col items-center justify-center overflow-hidden z-10">
      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      {/* Main content */}
      <div className="w-full relative z-20">
      <ScrollingVideo />
        {/* Hero Section */}
        <main className="container mx-auto px-4 pb-16 md:pb-24">
          <div className="text-center space-y-2 max-w-4xl mx-auto">
      

            <div className="relative mx-auto max-w-2xl">
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-400/20 rounded-full animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gray-400/30 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-gray-400/40 rounded-full animate-pulse" style={{ animationDelay: '500ms' }} />
            </div>

            {/* Waitlist Form - Enhanced */}
           <div className="max-w-2xl mx-auto">
    
 <div className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                    <h2 className="text-xl md:text-xl font-bold text-balance">
          Be a part of the next-gen {" "}
          <CyclingText items={cyclingItems} interval={2500} className="font-bold min-w-[180px]" />{" "} revolution
        </h2>
                </div>  
                 <Link href="/waitlist" className="btn-brand max-w-md mt-12 relative mx-auto">
                  Join the Waitlist
                </Link>
           
            </div>  

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              {/* <Users className="w-4 h-4" />
              <span>Join 2,847+ people already on the waitlist</span> */}
            </div>
          </div>
 {/* <LoginModalTestButton/> */}
        </main>


      </div>
   
       <KeystrokeListener />
    </div>
  )
}
