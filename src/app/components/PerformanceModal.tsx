"use client"

import { useState } from "react"
import PerformanceInfo from "./PerformanceInfo"

export default function PerformanceModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn-brand max-w-md mt-12 relative mx-auto"
      >
        See Performance Stats
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className=" absolute top-0 left-8"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
 
            <PerformanceInfo />
          </div>
        </div>
      )}
    </>
  )
}
