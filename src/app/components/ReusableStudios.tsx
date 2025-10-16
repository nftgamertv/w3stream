"use client"

import type React from "react"

import { useRef, Suspense } from "react"
import { gsap } from "gsap"
import { Plus, MoreHorizontal, Infinity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StudioPreviewIcons } from "@/components/StudioPreviewIcons"
import CreateRoomModal   from "@/components/CreateRoomModal"
const studios = [
  {
    name: "Jam Session",
    lastCreated: "Feb 28, 11:58 PM",
    viewers: 4,
    status: "View",
    upcoming: "-",
    type: "music" as const,
    theme: "neon",
  },
  {
    name: "The AI Show",
    lastCreated: "Jan 3, 02:34 AM",
    viewers: 0,
    status: "-",
    upcoming: "Testing... is this thing on? Check, check...",
    type: "podcast" as const,
    theme: "tech",
  },
  {
    name: "Crypto Chat",
    lastCreated: "-",
    viewers: 0,
    status: "-",
    upcoming: "-",
    type: "webinar" as const,
    theme: "corporate",
  },
]

export function ReusableStudios() {
  const tableRef = useRef<HTMLDivElement>(null)

  const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) => {
    gsap.to(e.currentTarget, {
      backgroundColor: "rgba(6, 182, 212, 0.05)",
      duration: 0.2,
    })
  }

  const handleRowLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    gsap.to(e.currentTarget, {
      backgroundColor: "transparent",
      duration: 0.2,
    })
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
    
         
     
         <CreateRoomModal />
      </div>

      {/* Icon Preview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {studios.map((studio, index) => (
          <div key={`preview-${studio.name}`} className="relative group cursor-pointer bg-slate-900 rounded-2xl overflow-hidden shadow-lg transition-transform transform hover:scale-105">
            <div className="absolute inset-0 bg-linear-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl from-cyan-500/20 to-purple-500/20"></div>

            <div className="relative bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xs border border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300">
              {/* Icon Preview */}
              <div className="h-48 relative overflow-hidden">
                <Suspense
                  fallback={
                    <div className="w-full h-full bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                    </div>
                  }
                >
                  <StudioPreviewIcons studioType={studio.type} theme={studio.theme} isActive={studio.viewers > 0} />
                </Suspense>
              </div>

              {/* Studio Info */}
              <div className="p-4 min-h-40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Infinity className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-semibold text-white">{studio.name}</h3>
                  </div>
                  {studio.viewers > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">{studio.viewers}</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-400 text-sm mb-3">
                  {studio.lastCreated !== "-" ? `Last used: ${studio.lastCreated}` : "Never used"}
                </p>

                {studio.upcoming !== "-" && (
                  <div className="bg-linear-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-2 mb-3">
                    <p className="text-purple-300 text-xs">{studio.upcoming}</p>
                  </div>
                )}

                <Button
                 
             
                  className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-full bg-linear-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30 border-b-0 text-cyan-400 hover:from-cyan-500/20 hover:to-purple-500/20"
                >
                  Enter Studio
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Traditional Table View */}
      {/* <div
        ref={tableRef}
        className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Detailed View</h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 text-slate-400 font-medium">Studio name</th>
              <th className="text-left p-4 text-slate-400 font-medium">Last created</th>
              <th className="text-left p-4 text-slate-400 font-medium">Viewers</th>
              <th className="text-left p-4 text-slate-400 font-medium">Upcoming</th>
              <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {studios.map((studio, index) => (
              <tr
                key={studio.name}
                className="border-b border-slate-700/30 last:border-b-0 cursor-pointer"
                onMouseEnter={handleRowHover}
                onMouseLeave={handleRowLeave}
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Infinity className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">{studio.name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-400">{studio.lastCreated}</td>
                <td className="p-4">
                  {studio.viewers > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400">{studio.viewers}</span>
                    </div>
                  )}
                  {studio.status !== "-" && <span className="text-cyan-400 text-sm">{studio.status}</span>}
                </td>
                <td className="p-4 text-slate-400 max-w-xs truncate">{studio.upcoming}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
             
                      className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30 text-cyan-400 hover:from-cyan-500/20 hover:to-purple-500/20"
                    >
                      Enter studio
                    </Button>
                    <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 border-t border-slate-700/50">
          <button className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">Load more</button>
        </div>
      </div> */}
    </section>
  )
}
