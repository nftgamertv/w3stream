import Link from "next/link"
import { CyclingText } from "@/components/CyclingText"
import { Sparkles } from "lucide-react"
 

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
    <div className="fixed inset-0 bg-transparent flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
 <ScrollingVideo />
      {/* Main content */}
      <div className="w-full">
        {/* Hero Section */}
        <main className="container mx-auto px-4 pb-16 md:pb-24">
          <div className="text-center space-y-2 max-w-4xl mx-auto">
            <div className="absolute  top-8  left-1/2 transform -translate-x-1/2">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 backdrop-blur-sm text-green-300 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4" />
              Coming Soon
            </div> </div>

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
                 <Link href="/waitlist" className="btn-brand max-w-md mt-12 mx-auto">
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
      </div>
   
       <KeystrokeListener />
    </div>
  )
}
