"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectModalProps {
  trigger?: React.ReactNode
  options: Array<{ value: string; label: string; description?: string }>
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function SelectModal({
  trigger,
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  className,
}: SelectModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Handle selection
  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue)
    onValueChange?.(optionValue)
    setIsOpen(false)
  }

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Focus trap
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const firstElement = focusableElements[0] as HTMLElement
      firstElement?.focus()
    }
  }, [isOpen])

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {trigger || (
          <>
            <span className="text-foreground">{selectedOption?.label || placeholder}</span>
            <svg className="ml-2 h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setIsOpen(false)}>
          {/* Backdrop with fade animation */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="select-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="relative z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="mx-4 rounded-xl border border-border bg-popover shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 id="select-modal-title" className="text-lg font-semibold text-popover-foreground">
                  {placeholder}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Options */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {options.map((option) => {
                  const isSelected = option.value === selectedValue
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "group relative flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                        "hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        isSelected && "bg-accent",
                      )}
                    >
                      {/* Check Icon */}
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {isSelected && <Check className="h-4 w-4 text-primary animate-in zoom-in-50 duration-200" />}
                      </div>

                      {/* Option Content */}
                      <div className="flex-1 space-y-1">
                        <div
                          className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-accent-foreground" : "text-popover-foreground",
                          )}
                        >
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
