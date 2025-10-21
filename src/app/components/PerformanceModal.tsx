"use client"

import { useState, useEffect, useRef } from "react"
import PerformanceInfo from "./PerformanceInfo"

export default function PerformanceModal() {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn-brand max-w-md mt-12 relative mx-auto"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        See Performance Stats
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="absolute top-0 left-8"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="performance-modal-title"
          ref={modalRef}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button for accessibility */}
            <button
              ref={closeButtonRef}
              onClick={() => setIsOpen(false)}
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded"
              aria-label="Close performance stats modal"
            >
              Close
            </button>

            <PerformanceInfo />
          </div>
        </div>
      )}
    </>
  )
}
