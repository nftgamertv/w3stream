import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CreateSection } from "@/components/create-section"
import { ReusableStudios } from "@/components/reusable-studios"
import { StreamsRecordings } from "@/components/streams-recordings"
import { ThreeBackground } from "@/components/three-background"
import { HorizontalCardSection } from "@/components/horizontal-card-section"
import { Gamepad, Puzzle, Headphones, Rocket, Zap, Award } from "lucide-react"

export default function DashboardPage() {
  const addOns = [
    {
      icon: Puzzle,
      title: "AI Assistant",
      description: "Enhance your streams with AI-powered moderation and content generation.",
      buttonText: "Learn More",
      buttonLink: "#",
      gradientFrom: "from-pink-500",
      gradientTo: "to-purple-500",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
    {
      icon: Headphones,
      title: "Premium Audio",
      description: "Access high-fidelity audio codecs and advanced sound processing.",
      buttonText: "Explore",
      buttonLink: "#",
      gradientFrom: "from-green-500",
      gradientTo: "to-blue-500",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
    {
      icon: Rocket,
      title: "Stream Boost",
      description: "Increase your stream's reach with promotional tools and analytics.",
      buttonText: "Activate",
      buttonLink: "#",
      gradientFrom: "from-orange-500",
      gradientTo: "to-red-500",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
    {
      icon: Zap,
      title: "Custom Overlays",
      description: "Design and implement unique visual overlays for your broadcasts.",
      buttonText: "Create",
      buttonLink: "#",
      gradientFrom: "from-yellow-500",
      gradientTo: "to-orange-500",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
  ]

  const games = [
    {
      icon: Gamepad,
      title: "Cyberpunk 2077",
      description: "Dive into the dystopian future of Night City.",
      buttonText: "Play Now",
      buttonLink: "#",
      gradientFrom: "from-red-600",
      gradientTo: "to-purple-600",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
    {
      icon: Award,
      title: "Valorant",
      description: "Master tactical gunplay and agent abilities.",
      buttonText: "Play Now",
      buttonLink: "#",
      gradientFrom: "from-blue-600",
      gradientTo: "to-cyan-600",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
    {
      icon: Gamepad,
      title: "Apex Legends",
      description: "Compete in the ultimate battle royale experience.",
      buttonText: "Play Now",
      buttonLink: "#",
      gradientFrom: "from-green-600",
      gradientTo: "to-lime-600",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
    {
      icon: Award,
      title: "Fortnite",
      description: "Build, battle, and create in a world of endless possibilities.",
      buttonText: "Play Now",
      buttonLink: "#",
      gradientFrom: "from-purple-600",
      gradientTo: "to-pink-600",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Toggle between 3D streaming background or animated gradient */}
      <ThreeBackground />
      <SidebarProvider defaultOpen={true}>
        <div className="flex relative z-10 w-full">
          <AppSidebar />
          <SidebarInset className="w-full">
            <div className="p-8">
              <div className="space-y-8">
                <header className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                    <div>
                      <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Dashboard
                      </h1>
                      <p className="text-slate-400 mt-2">Next-generation streaming platform</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                      <button className="relative px-6 py-2 bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-full hover:from-cyan-500/20 hover:to-purple-500/20 transition-all duration-300">
                        My Account
                      </button>
                    </div>
                  </div>
                </header>
            
                <ReusableStudios />
                <StreamsRecordings />
                <HorizontalCardSection title="Add Ons" items={addOns} />
                <HorizontalCardSection title="Games" items={games} />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
