"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type CyclingItem = {
  content: React.ReactNode
  className?: string
  backgroundColor?: string
  textColor?: string
}

interface CyclingTextProps {
  items: (string | CyclingItem)[]
  interval?: number
  className?: string
  transitionDuration?: number
}

export function CyclingText({ items, interval = 2500, className, transitionDuration = 300 }: CyclingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
        setIsVisible(true)
      }, transitionDuration)
    }, interval)

    return () => clearInterval(cycleInterval)
  }, [items.length, interval, transitionDuration])

  const currentItem = items[currentIndex]
  const content = typeof currentItem === "string" ? currentItem : currentItem.content
  const itemClassName = typeof currentItem === "string" ? "" : currentItem.className
  const backgroundColor = typeof currentItem === "string" ? undefined : currentItem.backgroundColor
  const textColor = typeof currentItem === "string" ? undefined : currentItem.textColor

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center transition-opacity duration-300 px-2 py-1 rounded",
        isVisible ? "opacity-100" : "opacity-0",
        className,
        itemClassName,
      )}
      style={{
        transitionDuration: `${transitionDuration}ms`,
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      {content}
    </span>
  )
}
