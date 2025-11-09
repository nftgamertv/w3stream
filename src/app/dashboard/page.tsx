"use client"

import { SidebarProvider, SidebarInset  } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/get-query-client'
import { generateRoomId } from "@/lib/livekit-config"
import { ReusableStudios } from "@/components/ReusableStudios"
import { StreamsRecordings } from "@/components/StreamsRocordings"
import { HorizontalCardSection } from "@/components/HorizontalCardSection"
import { Gamepad, Puzzle, Headphones, Rocket, Zap, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabaseClients/client"
import { userOptions } from "@/queries/users"
import CreateRoomModal   from "@/components/CreateRoomModal"  
export default function DashboardPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [name, setName] = useState("")
  const [roomId, setRoomId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(userOptions)
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()

      // Check if user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("user", user, userError)
      if (!user || userError) {
        router.push("/no-access")
        return
      }

      // Check if user ID is in w3s_testers table
      const { data: testerData, error: testerError } = await supabase
        .from("w3s_testers")
        .select("*")
        .eq("user_id", user.id)


      if (testerError || !testerData) {
        router.push("/no-access")
        return
      }

      // User is authorized
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Checking access...</p>
        </div>
      </div>
    )
  }
  const addOns = [
    {
      icon: Puzzle,
      title: "CHTBXX",
      description: "Twitch chat text-to-speech with unique character video lipsyn. In-app purchases may be required.",
      buttonText: "Learn More",
      buttonLink: "#",
      gradientFrom: "from-pink-500",
      gradientTo: "to-purple-500",
      imageUrl: "/images/chtbxx_logo_white.png",
      status: "testing",
        cost: "paid"
    },
    {
      icon: Headphones,
      title: "Hide My EnvVars",
      description: "A Vision AI that detects and blurs environment variables in your stream.",
      buttonText: "Explore",
      buttonLink: "#",
      gradientFrom: "from-green-500",
      gradientTo: "to-blue-500",
      imageUrl: "/images/hidemyenvvars.png",
         status: "concept",
           cost: "free"

    },
    {
      icon: Rocket,
      title: "Stream Boost",
      description: "Increase your stream's reach with AI generated promotional tools and analytics.",
      buttonText: "Activate",
      buttonLink: "#",
      gradientFrom: "from-orange-500",
      gradientTo: "to-red-500",
        imageUrl: "/images/streamboost.png",
       status: "concept",
         cost: "paid"

    },
    {
      icon: Zap,
      title: "Custom Overlays",
      description: "Design and implement unique visual overlays for your broadcasts.",
      buttonText: "Create",
      buttonLink: "#",
      gradientFrom: "from-yellow-500",
      gradientTo: "to-orange-500",

    },
  ]
  const games = [
    {
      icon: Gamepad,
      title: "TWNGO",
      description: "Classic Bingo! with an AI twist. Twitch Extension Required. In-app purchases may be required to play.",
      buttonText: "Play Now",
      buttonLink: "#",
      gradientFrom: "from-red-600",
      gradientTo: "to-purple-600",
      status: "in development" as const,
       imageUrl: "/images/twngo.png",
      cost: "paid"
    },
    {
      icon: Award,
      title: "D-Gen Art",
      description: "Think Mad Libbs meets AI ArtGen meets Video Lip Sync. Hilarity ensues.",
      buttonText: "Play Now",
      buttonLink: "#",
      gradientFrom: "from-blue-600",
      gradientTo: "to-cyan-600",
      status: "in development" as const,
        imageUrl: "/images/dgenart.png",
      cost: "Free"
    },
    {
      icon: Gamepad,
      title: "Cee-LO",
      description: "Come throw some dice on the corner of K&A in Philly! In-app purchases may be required to play.",
      buttonText: "Play Now",
      buttonLink: "#",
      gradientFrom: "from-green-600",
      gradientTo: "to-lime-600",
      status: "in development" as const,
              imageUrl: "/images/ceelo.png",
      cost: "paid"
    },
    {
      icon: Award,
      title: "Fortnite",
      description: "Build, battle, and create in a world of endless possibilities.",
      buttonText: "Play Now",
      buttonLink: "#",
      gradientFrom: "from-purple-600",
      gradientTo: "to-pink-600",
      status: "live" as const,
      cost: "Free"
    },
  ]

  const handleCreateRoom = () => {
    if (!name.trim()) {
      alert("Please enter your name")
      return
    }
    setIsCreating(true)
    const newRoomId = generateRoomId()
    // Redirect to prejoin with host role for room creator
    router.push(`/prejoin/${newRoomId}?role=host`)
  }

  const handleJoinRoom = () => {
    if (!name.trim()) {
      alert("Please enter your name")
      return
    }
    if (!roomId.trim()) {
      alert("Please enter a room ID")
      return
    }
    setIsJoining(true)
    // Redirect to prejoin for participants
    router.push(`/prejoin/${roomId.trim()}`)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      <SidebarProvider defaultOpen={true}>
        <div className="flex relative z-10 w-full">
          <AppSidebar />
          <SidebarInset className="w-full">
            <div className="p-8">
              <div className="space-y-8">
                
               <Navbar />
             
                <ReusableStudios />
      {/* @ts-ignore */}
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
