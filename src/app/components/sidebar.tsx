"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Home, Library, Navigation, Users, Gift, Settings, Activity, HardDrive } from "lucide-react"

const menuItems = [
  { icon: Home, label: "Home", active: true },

  { icon: Users, label: "Members" },
 
  { icon: Settings, label: "Settings" },
  { icon: Activity, label: "Status" },
]

export function Sidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current, { x: -300, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out" })
    }
  }, [])

  return (
    <div
      ref={sidebarRef}
      className="fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-r border-cyan-500/20 z-20"
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-linear-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">w3S</span>
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            w3Stream
          </span>
        </div>
 
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                item.active
                  ? "bg-linear-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
                  : "hover:bg-linear-to-r hover:from-cyan-500/10 hover:to-purple-500/10 hover:border hover:border-cyan-500/20"
              }`}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2 })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })
              }}
            >
              <item.icon
                className={`w-5 h-5 ${item.active ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"}`}
              />
              <span className={`${item.active ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-linear-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">Storage</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
              <div className="bg-linear-to-r from-cyan-500 to-purple-500 h-2 rounded-full w-[92%]"></div>
            </div>
            <div className="text-xs text-slate-400">387 of 400 hours</div>
            <button className="text-xs text-cyan-400 hover:text-cyan-300 mt-1">Manage</button>
          </div>
        </div>
      </div>
    </div>
  )
}
