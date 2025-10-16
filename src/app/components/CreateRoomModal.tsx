"use client"
import { useState } from "react"
import CreateRoomForm from "@/components/CreateRoomForm"
import { Plus } from "lucide-react"

export default function CreateRoomModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
          <button 
                 onClick={() => setIsOpen(true)}
          className="button  uppercase w-8 h-8 bg-linear-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-300">
                 <Plus className="w-4 h-4 mx-1 text-cyan-400  " />
                 <span className="text-cyan-400 text-xs">Create</span>
               </button>
 
 

      {/* CSS-only animated modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
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

              <CreateRoomForm onSuccess={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
