"use client"

import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Circle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
 

const meetings   = [    
  {
    title: "Jam Session",
    subtitle: "Live stream",
    status: "Ready",
    created: "Feb 28, 11:58 PM",
    scheduled: "—",
    meetingId: "1",
    type: "livestream",
  },
  {
    title: "The AI Show",
    subtitle: "Webinar",
    status: "Ready",
    created: "Jan 3, 02:34 AM",
    scheduled: "Testing... is this thing on? Check, check...",
    meetingId: "2",
    type: "webinar",
  },
  {
    title: "Crypto Chat",
    subtitle: "Recording",
    status: "Ready",
    created: "-",
    scheduled: "-",
    meetingId: "3",
    type: "recording",
  },
]

export function StreamsRecordings() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [recordings, setRecordings] = useState<any[]>([])
  const tabRef = useRef<HTMLDivElement>(null)

  // Load real recordings from storage
 

  const handleTabChange = (tab: "upcoming" | "past") => {
    setActiveTab(tab)

    if (tabRef.current) {
      const indicator = tabRef.current.querySelector(".tab-indicator") as HTMLElement
      const activeButton = tabRef.current.querySelector(`[data-tab="${tab}"]`) as HTMLElement

      if (indicator && activeButton) {
        gsap.to(indicator, {
          x: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Streams and recordings</h2>

      <div ref={tabRef} className="relative">
        <div className="flex space-x-8 border-b border-slate-700/50 relative">
          <button
            data-tab="upcoming"
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === "upcoming" ? "text-cyan-400" : "text-slate-400 hover:text-white"
            }`}
            onClick={() => handleTabChange("upcoming")}
          >
            Upcoming
          </button>
          <button
            data-tab="past"
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === "past" ? "text-cyan-400" : "text-slate-400 hover:text-white"
            }`}
            onClick={() => handleTabChange("past")}
          >
            Past
          </button>

          <div className="tab-indicator absolute bottom-0 h-0.5 bg-linear-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-300"></div>
        </div>
      </div>

      <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 text-slate-400 font-medium">Title</th>
              <th className="text-left p-4 text-slate-400 font-medium">Created</th>
              <th className="text-left p-4 text-slate-400 font-medium">Scheduled</th>
              <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recordings.length > 0 ? recordings.map((recording, index) => (
              <tr
                key={recording.meetingId || index}
                className="border-b border-slate-700/30 last:border-b-0 hover:bg-cyan-500/5 transition-colors cursor-pointer"
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Circle className="w-5 h-5 text-slate-400 fill-current" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{recording.title}</div>
                      <div className="text-slate-400 text-sm flex items-center space-x-2">
                        <span>{recording.subtitle}</span>
                        <span className="text-cyan-400">{recording.status}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-400">{recording.created}</td>
                <td className="p-4 text-slate-400">{recording.scheduled}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                
                      className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30 text-cyan-400 hover:from-cyan-500/20 hover:to-purple-500/20"
                      onClick={() => recording.meetingId && (window.location.href = `/studio/${recording.meetingId}`)}
                    >
                      Enter studio
                    </Button>
                    <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <div className="text-slate-400">
                    <Circle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg mb-2">No {activeTab} streams or recordings</p>
                    <p className="text-sm">Create a new stream or recording to get started</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
