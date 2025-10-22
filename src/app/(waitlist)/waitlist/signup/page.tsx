"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, CheckCircle2, Sparkles } from "lucide-react"
import { submitWaitlistForm, type WaitlistFormData } from "@/actions/index"
import { SocialPlatformInput } from "@/components/SocialPlatformInput"

const PLATFORMS = [
  {
    name: "Twitch",
    icon: "twitch",
    color: "bg-[#9146FF]",
    hoverColor: "hover:bg-[#772CE8]",
  },
  {
    name: "YouTube",
    icon: "youtube",
    color: "bg-[#FF0000]",
    hoverColor: "hover:bg-[#CC0000]",
  },
  {
    name: "TikTok",
    icon: "tiktok",
    color: "bg-gradient-to-r from-[#00F2EA] to-[#FF0050]",
    hoverColor: "hover:opacity-90",
  },
  {
    name: "Instagram",
    icon: "instagram",
    color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    hoverColor: "hover:opacity-90",
  },
  {
    name: "Twitter/X",
    icon: "twitter",
    color: "bg-black",
    hoverColor: "hover:bg-gray-900",
  },
  {
    name: "Discord",
    icon: "discord",
    color: "bg-[#5865F2]",
    hoverColor: "hover:bg-[#4752C4]",
  },
  {
    name: "Facebook Gaming",
    icon: "facebook",
    color: "bg-[#0866FF]",
    hoverColor: "hover:bg-[#0654D4]",
  },
  {
    name: "Other",
    icon: "other",
    color: "bg-gradient-to-r from-cyan-500 to-blue-500",
    hoverColor: "hover:opacity-90",
  },
]

export default function BetaSignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    isInfluencer: false,
    influencerHandle: "",
    influencerPlatform: "",
    bio: "",
    socialHandles: {} as Record<string, string>,
  })

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.bio.trim()) newErrors.bio = "Please tell us about yourself"

    if (formData.isInfluencer) {
      if (!formData.influencerHandle.trim()) {
        newErrors.influencerHandle = "Handle is required for influencers"
      }
      if (!formData.influencerPlatform) {
        newErrors.influencerPlatform = "Platform is required for influencers"
      }
    }

    if (selectedPlatforms.length > 0) {
      const hasAtLeastOneHandle = selectedPlatforms.some((platform) => formData.socialHandles[platform]?.trim())
      if (!hasAtLeastOneHandle) {
        newErrors.socialHandles = "Please provide at least one social handle"
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true)
      const result = await submitWaitlistForm({
        ...formData,
      } as WaitlistFormData)
      setIsSubmitting(false)

      if (result.success) {
        setIsSuccess(true)
      } else {
        setErrors({ submit: result.error || "Something went wrong. Please try again." })
      }
    }
  }

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
  }

  const handleSocialHandleChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialHandles: {
        ...prev.socialHandles,
        [platform]: value,
      },
    }))
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <Card className="max-w-md w-full border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 relative z-10">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
                <CheckCircle2 className="h-20 w-20 text-cyan-400 relative z-10" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-balance bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
               Thank You!
              </h2>
              <p className="text-slate-300 leading-relaxed text-balance">
                We've received your application for private beta access. Check your email for confirmation and we'll be
                in touch soon!
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = "/")}
              className="btn-brand text-white font-semibold"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <Card className="border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
          <CardHeader className="space-y-3 text-center pb-8 border-b border-slate-800">
            <div className="flex justify-center mb-2">
              <Sparkles className="h-8 w-8 text-cyan-400" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Join the Private Beta
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg leading-relaxed max-w-xl mx-auto">
              Be among the first to experience our platform. Fill out the form below to request access.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-200">
                  Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
              </div>

              {/* Influencer Checkbox */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                  <Checkbox
                    id="influencer"
                    checked={formData.isInfluencer}
                    onCheckedChange={(checked) => setFormData({ ...formData, isInfluencer: checked as boolean })}
                    className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <Label htmlFor="influencer" className="text-sm font-medium text-slate-200 cursor-pointer">
                    I am a streamer/gamer/influencer/KOL
                  </Label>
                </div>


                {/* Conditional Influencer Fields */}
                {formData.isInfluencer && (
                  <div className="space-y-4 rounded-lg border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-6 backdrop-blur-sm">
                    <div className="space-y-2">
                      <Label htmlFor="influencer-platform" className="text-sm font-medium text-slate-200">
                        Primary Platform <span className="text-red-400">*</span>
                      </Label>
                      <Select
                        value={formData.influencerPlatform}
                        onValueChange={(value) => setFormData({ ...formData, influencerPlatform: value })}
                      >
                        <SelectTrigger
                          id="influencer-platform"
                          className={`bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500 focus:ring-cyan-500/20 ${
                            errors.influencerPlatform ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder="Select your platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {PLATFORMS.map((platform) => (
                            <SelectItem
                              key={platform.name}
                              value={platform.name}
                              className="text-white focus:bg-slate-700 focus:text-white"
                            >
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.influencerPlatform && <p className="text-sm text-red-400">{errors.influencerPlatform}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="influencer-handle" className="text-sm font-medium text-slate-200">
                        Handle/Username <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="influencer-handle"
                        value={formData.influencerHandle}
                        onChange={(e) => setFormData({ ...formData, influencerHandle: e.target.value })}
                        placeholder="@yourhandle"
                        className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 ${
                          errors.influencerHandle ? "border-red-500" : ""
                        }`}
                      />
                      {errors.influencerHandle && <p className="text-sm text-red-400">{errors.influencerHandle}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-slate-200">
                  Tell us a bit about yourself <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="What brings you here? What are you interested in?"
                  rows={4}
                  className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 resize-none ${
                    errors.bio ? "border-red-500" : ""
                  }`}
                />
                {errors.bio && <p className="text-sm text-red-400">{errors.bio}</p>}
              </div>

              {/* Social Platforms */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-200">
                    Social Media Handles <span className="text-slate-400">(Optional)</span>
                  </Label>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Select platforms and add your handles to help us connect with you
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((platform) => (
                    <SocialPlatformInput
                      key={platform.name}
                      platform={platform}
                      isSelected={selectedPlatforms.includes(platform.name)}
                      value={formData.socialHandles[platform.name] || ""}
                      onToggle={() => handlePlatformToggle(platform.name)}
                      onChange={(value) => handleSocialHandleChange(platform.name, value)}
                    />
                  ))}
                </div>

                {errors.socialHandles && <p className="text-sm text-red-400">{errors.socialHandles}</p>}
              </div>

              {/* reCAPTCHA */}
              {/* <div className="flex flex-col items-center space-y-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                  theme="dark"
                />
                {errors.recaptcha && <p className="text-sm text-red-400">{errors.recaptcha}</p>}
              </div> */}

              {/* Info Alert */}
              <Alert className="bg-cyan-500/10 border-cyan-500/30 backdrop-blur-sm">
                <InfoIcon className="h-4 w-4 text-cyan-400" />
                <AlertDescription className="text-sm text-slate-300">
                  We'll use this information to contact you about private beta access. Your data will be kept
                  confidential.
                </AlertDescription>
              </Alert>

              {errors.submit && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-sm text-red-400">{errors.submit}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold text-base shadow-lg shadow-cyan-500/20 transition-all hover:shadow-xl hover:shadow-cyan-500/30"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Request Beta Access"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}