 
import { Sparkles } from "lucide-react"
  import { openLoginModal } from "@/store"
import KeystrokeListener from "@/components/KeystrokeListener"
import SolanaCursorEffect from "@/components/SolanaCursorEffect"
 
export default function SplashPage() {
  return (
    <div className="min-h-screen absolute bg-transparent left-1/2 top-0 transform -translate-x-1/2 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="min-h-screen min-w-5xl mt-20">
        {/* Hero Section */}
        <main className="container mx-auto px-4 pb-16 md:pb-24">
          <div className="text-center space-y-2 max-w-4xl mx-auto">
            <div className="absolute  top-8  left-1/2 transform -translate-x-1/2">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 backdrop-blur-sm text-green-300 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4" />
              Coming Soon
            </div>
</div>
            {/* Main Heading */}

            {/* Subheading */}
            {/* <p className="text-md md:text-lg text-slate-400 max-w-2xl mx-auto mt-4 leading-relaxed text-balance">
              Join forward-thinking individuals who are ready to experience the next generation of digital media excellence. Be the first to know when we launch.
            </p> */}

            {/* Hero Visual */}
            <div className="relative mx-auto max-w-2xl py-6">
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-400/20 rounded-full animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gray-400/30 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-gray-400/40 rounded-full animate-pulse" style={{ animationDelay: '500ms' }} />
            </div>

            {/* Waitlist Form - Enhanced */}
            {/* <div className="max-w-2xl mx-auto">
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                <WaitlistForm />
              </div>
            </div> */}

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              {/* <Users className="w-4 h-4" />
              <span>Join 2,847+ people already on the waitlist</span> */}
            </div>
          </div>
 
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