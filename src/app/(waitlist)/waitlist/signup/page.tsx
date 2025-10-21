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
import { InfoIcon, CheckCircle2 } from "lucide-react"
import { submitWaitlistForm, type WaitlistFormData } from "@/actions/index"

const PLATFORMS = [
  "Twitch",
  "YouTube",
  "TikTok",
  "Instagram",
  "Twitter/X",
  "Discord",
  "Facebook Gaming",
  "Kick",
  "Other",
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

    // Validation
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.bio.trim()) newErrors.bio = "Please tell us about yourself"

    // If they're an influencer, require handle and platform
    if (formData.isInfluencer) {
      if (!formData.influencerHandle.trim()) {
        newErrors.influencerHandle = "Handle is required for influencers"
      }
      if (!formData.influencerPlatform) {
        newErrors.influencerPlatform = "Platform is required for influencers"
      }
    }

    // If they selected platforms, require at least one handle
    if (selectedPlatforms.length > 0) {
      const hasAtLeastOneHandle = selectedPlatforms.some((platform) => formData.socialHandles[platform]?.trim())
      if (!hasAtLeastOneHandle) {
        newErrors.socialHandles = "Please provide at least one social handle"
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true)

      const result = await submitWaitlistForm(formData as WaitlistFormData)

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
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center"  style={{zIndex: 9999999}}>
        <Card className="max-w-md w-full border-2">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Thank You!</h2>
              <p className="text-muted-foreground">
                We've received your application for private beta access. Check your email for confirmation and we'll be
                in touch soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <Card className="border-2">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold text-balance">Join Our Private Beta</CardTitle>
            <CardDescription className="text-base">
              Be among the first to experience our platform. Fill out the form below to request access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {/* Influencer Checkbox */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="influencer"
                    checked={formData.isInfluencer}
                    onCheckedChange={(checked) => setFormData({ ...formData, isInfluencer: checked as boolean })}
                  />
                  <Label
                    htmlFor="influencer"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I am a streamer/gamer/influencer/KOL
                  </Label>
                </div>

                {/* Conditional Influencer Fields */}
                {formData.isInfluencer && (
                  <div className="ml-6 space-y-4  rounded-lg border bg-muted/50 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="influencer-platform" className="text-sm font-medium">
                        Primary Platform <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.influencerPlatform}
                        onValueChange={(value) => setFormData({ ...formData, influencerPlatform: value })}
                      >
                        <SelectTrigger
                          id="influencer-platform"
                          className={errors.influencerPlatform ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Select your platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.influencerPlatform && (
                        <p className="text-sm text-destructive">{errors.influencerPlatform}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="influencer-handle" className="text-sm font-medium">
                        Handle/Username <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="influencer-handle"
                        value={formData.influencerHandle}
                        onChange={(e) => setFormData({ ...formData, influencerHandle: e.target.value })}
                        placeholder="@yourhandle"
                        className={errors.influencerHandle ? "border-destructive" : ""}
                      />
                      {errors.influencerHandle && <p className="text-sm text-destructive">{errors.influencerHandle}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Tell us a bit about yourself <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="What brings you here? What are you interested in?"
                  rows={4}
                  className={errors.bio ? "border-destructive" : ""}
                />
                {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
              </div>

              {/* Social Platforms (Optional) */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Social Media Handles <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select platforms and add your handles to help us connect with you
                  </p>
                </div>

                <div className="space-y-3">
                  {PLATFORMS.map((platform) => (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`platform-${platform}`}
                          checked={selectedPlatforms.includes(platform)}
                          onCheckedChange={() => handlePlatformToggle(platform)}
                        />
                        <Label
                          htmlFor={`platform-${platform}`}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {platform}
                        </Label>
                      </div>
                      {selectedPlatforms.includes(platform) && (
                        <Input
                          value={formData.socialHandles[platform] || ""}
                          onChange={(e) => handleSocialHandleChange(platform, e.target.value)}
                          placeholder={`Your ${platform} handle`}
                          className="ml-6"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {errors.socialHandles && <p className="text-sm text-destructive">{errors.socialHandles}</p>}
              </div>

              {/* Info Alert */}
              <Alert className="bg-primary/5 border-primary/20">
                <InfoIcon className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm text-foreground">
                  We'll use this information to contact you about private beta access. Your data will be kept
                  confidential.
                </AlertDescription>
              </Alert>

              {errors.submit && (
                <Alert className="bg-destructive/10 border-destructive/50">
                  <AlertDescription className="text-sm text-destructive">{errors.submit}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Request Beta Access"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
