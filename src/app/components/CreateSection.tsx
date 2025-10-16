"use client"

import type React from "react"

import { useRef, useState } from "react"
import { gsap } from "gsap"
import { Video, Circle, Headphones } from "lucide-react"
 
 

const createOptions = [
  {
    icon: Video,
    title: "Live stream",
    description: "Start streaming live to your audience",
    gradient: "from-cyan-500 to-blue-500",
    action: "live-stream",
  },
  {
    icon: Circle,
    title: "Recording",
    description: "Record content for later use",
    gradient: "from-purple-500 to-pink-500",
    action: "recording",
  },
  {
    icon: Headphones,
    title: "On-Air webinar",
    description: "Host interactive webinars",
    gradient: "from-emerald-500 to-cyan-500",
    action: "webinar",
  },
]

export function CreateSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      rotationY: 5,
      duration: 0.3,
      ease: "power2.out",
    })
  }

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      rotationY: 0,
      duration: 0.3,
      ease: "power2.out",
    })
  }

  const handleCreateAction = async (actionType: string) => {
    if (isCreating) return
    
    setIsCreating(true)
    
    try {
      alert(`Creating ${actionType}...`)
      
      // Map action types to API types
      const apiTypeMap: Record<string, string> = {
        'live-stream': 'livestream',
        'recording': 'meeting',
        'webinar': 'webinar',
      }

    } catch (error) {
      console.error(`Error creating ${actionType}:`, error)
      alert(`Failed to create ${actionType}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }       

  } 
       
    //   const apiType = apiTypeMap[actionType]
    //   if (!apiType) {
    //     throw new Error(`Unknown action type: ${actionType}`)
    //   }
      
    //   // Create meeting request
    //   const request: CreateMeetingRequest = {
    //     title: `${actionType === 'live-stream' ? 'Live Stream' : actionType === 'webinar' ? 'Webinar' : 'Recording'} - ${new Date().toLocaleString()}`,
    //     type: apiType,
    //     config: {
    //       liveStreamingConfig: actionType === 'live-stream' ? {
    //         maxDuration: 3600, // 1 hour
    //         canEndMeeting: true,
    //       } : undefined,
    //       permissions: {
    //         allowParticipantScreenshare: true,
    //         allowParticipantVideo: true,
    //         allowParticipantAudio: true,
    //       },
    //     },
    //   }
      
    //   console.log('Creating meeting with request:', request)
      
    //   const response = await realtimeKitAPI.createMeeting(request)
      
    //   if (response.success && response.data) {
    //     const { meeting, authToken } = response.data
    //     console.log('Meeting created successfully:', meeting)
        
    //     // Store meeting data for later use
    //     const meetingData = {
    //       id: meeting.id,
    //       title: meeting.title,
    //       type: meeting.type,
    //       authToken,
    //       createdAt: meeting.createdAt,
    //     }
        
    //     // Store in localStorage for now (later we'll use Redux/context)
    //     const existingMeetings = JSON.parse(localStorage.getItem('w3stream-meetings') || '[]')
    //     existingMeetings.push(meetingData)
    //     localStorage.setItem('w3stream-meetings', JSON.stringify(existingMeetings))
        
    //     // Redirect to working demo
    //     window.location.href = `/demo`
    //   } else {
    //     throw new Error(response.error || 'Failed to create meeting')
    //   }
    // } catch (error) {
    //   console.error(`Error creating ${actionType}:`, error)
    //   alert(`Failed to create ${actionType}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    // } finally {
    //   setIsCreating(false)
    // }
 
  return (
    <section ref={sectionRef} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Create</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900">
        {createOptions.map((option, index) => (
          <div
            key={option.title}
            className="relative group cursor-pointer"
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
            onClick={() => handleCreateAction(option.action)}
          >
            <div className="absolute inset-0 bg-linear-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl from-cyan-500/20 to-purple-500/20"></div>

            <div className={`relative bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xs border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div
                className={`w-12 h-12 bg-linear-to-r ${option.gradient} rounded-xl flex items-center justify-center mb-4`}
              >
                <option.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
              <p className="text-slate-400 text-sm">{option.description}</p>

              {isCreating ? (
                <div className="absolute top-4 right-4">
                  <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
