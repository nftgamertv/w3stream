"use client"
import { useState } from "react"
import CreateRoomForm from "@/components/CreateRoomForm"
import { Plus } from "lucide-react"

type RoomType = "collaborative" | "presentation"

export default function CreateRoomModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [roomType, setRoomType] = useState<RoomType | null>(null)

  return (
    <>
          <button 
                 onClick={() => setIsOpen(true)}
          className="btn-brand uppercase min-w-12 h-8 rounded-full flex items-center justify-center ">
                 <Plus className="w-4 h-4 mx-1 text-cyan-400  " />
                 <span className="text-cyan-400 text-xs">Create</span>
               </button>
 
 

      {/* CSS-only animated modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsOpen(false)
            setRoomType(null)
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] rounded-2xl border border-[#00ffff]/20 shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  setRoomType(null)
                }}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-lg bg-[#0a0a0f]/50 border border-[#00ffff]/20 hover:border-[#00ffff]/40 text-gray-400 hover:text-white transition-all duration-200 flex items-center justify-center group"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Room Type Selection or Create Form */}
              {!roomType ? (
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#00aaff] flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#0a0a0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Choose Room Type</h2>
                      <p className="text-gray-400 text-sm mt-1">Select the type of room you want to create</p>
                    </div>
                  </div>

                  {/* Room Type Options */}
                  <div className="space-y-4">
                    <button
                      onClick={() => setRoomType("collaborative")}
                      className="w-full p-6 rounded-lg border-2 border-[#00ffff]/20 hover:border-[#00ffff]/40 bg-[#0a0a0f]/30 hover:bg-[#0a0a0f]/50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00ffff]/20 to-[#00aaff]/20 flex items-center justify-center flex-shrink-0 group-hover:from-[#00ffff]/30 group-hover:to-[#00aaff]/30 transition-all duration-200">
                          <svg className="w-6 h-6 text-[#00ffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00ffff] transition-colors duration-200">Collaborative Room</h3>
                          <p className="text-gray-400 text-sm">Interactive workspace for team collaboration, meetings, and real-time communication</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setRoomType("presentation")}
                      className="w-full p-6 rounded-lg border-2 border-[#00ffff]/20 hover:border-[#00ffff]/40 bg-[#0a0a0f]/30 hover:bg-[#0a0a0f]/50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-200">
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-200">Presentation Room</h3>
                          <p className="text-gray-400 text-sm">Focused environment for presentations, webinars, and one-to-many broadcasting</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <CreateRoomForm
                  roomType={roomType}
                  onSuccess={() => {
                    setIsOpen(false)
                    setRoomType(null)
                  }}
                  onBack={() => setRoomType(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
