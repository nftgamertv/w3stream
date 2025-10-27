"use client"

import { Card } from "@/components/ui/card"

interface CameraViewSwitcherProps {
  onViewChange: (view: "host" | 0 | 1 | 2 | 3) => void
  currentView: "host" | number | null
}

export function CameraViewSwitcher({ onViewChange, currentView }: CameraViewSwitcherProps) {
  const views = [
    { id: 0 as const, label: "Seat 1" },
    { id: 1 as const, label: "Seat 2" },
    { id: 2 as const, label: "Seat 3" },
    { id: 3 as const, label: "Seat 4" },
  ]

  return (
    <Card className="absolute bottom-4 right-4 p-2 bg-black/80 border-gray-700">
      <div className="flex flex-col gap-1 mb-2">
        <div className="text-white text-xs font-semibold text-center">Camera Views</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              w-16 h-16 rounded border-2 transition-all
              flex items-center justify-center text-xs font-semibold
              ${
                currentView === view.id
                  ? "bg-blue-600 border-blue-400 text-white"
                  : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
              }
            `}
          >
            {view.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => onViewChange("host")}
        className={`
          w-full mt-2 py-2 rounded border-2 transition-all
          text-xs font-semibold
          ${
            currentView === "host"
              ? "bg-green-600 border-green-400 text-white"
              : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
          }
        `}
      >
        Host View
      </button>
    </Card>
  )
}