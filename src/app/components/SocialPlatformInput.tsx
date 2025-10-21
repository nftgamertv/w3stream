"use client"

import type React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, Youtube, Music2, Instagram, Twitter, MessageSquare, Facebook, Zap, Globe } from "lucide-react"

interface Platform {
  name: string
  icon: string
  color: string
  hoverColor: string
}

interface SocialPlatformInputProps {
  platform: Platform
  isSelected: boolean
  value: string
  onToggle: () => void
  onChange: (value: string) => void
}

const getIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    twitch: <MessageCircle className="h-5 w-5" />,
    youtube: <Youtube className="h-5 w-5" />,
    tiktok: <Music2 className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    discord: <MessageSquare className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    kick: <Zap className="h-5 w-5" />,
    other: <Globe className="h-5 w-5" />,
  }
  return iconMap[iconName] || <Globe className="h-5 w-5" />
}

export function SocialPlatformInput({ platform, isSelected, value, onToggle, onChange }: SocialPlatformInputProps) {
  return (
    <div
      className={`group rounded-lg border transition-all duration-200 ${
        isSelected
          ? "border-cyan-500/50 bg-slate-800/50 shadow-lg shadow-cyan-500/10"
          : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <Checkbox
          id={`platform-${platform.name}`}
          checked={isSelected}
          onCheckedChange={onToggle}
          className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
        />
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg ${platform.color} text-white transition-all ${platform.hoverColor}`}
        >
          {getIcon(platform.icon)}
        </div>
        <Label
          htmlFor={`platform-${platform.name}`}
          className="text-sm font-medium text-slate-200 cursor-pointer flex-1"
        >
          {platform.name}
        </Label>
      </div>

      {isSelected && (
        <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Your ${platform.name} handle`}
            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
          />
        </div>
      )}
    </div>
  )
}
