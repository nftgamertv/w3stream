"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle2 } from "lucide-react"

interface WaitlistFormProps {
  onSuccess?: () => void
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      role: formData.get("role"),
      contentType: formData.get("contentType"),
      streamingFrequency: formData.get("streamingFrequency"),
      audienceSize: formData.get("audienceSize"),
      primaryUseCase: formData.get("primaryUseCase"),
      mustHaveFeatures: formData.get("mustHaveFeatures"),
      currentPlatform: formData.get("currentPlatform"),
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="rounded-full bg-primary/20 p-3">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{"You're on the list!"}</h2>
          <p className="text-balance text-muted-foreground">
            Thank you for joining the w3Stream waitlist. {"We'll"} be in touch soon with exclusive early access details
            and updates on our progress.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">1. Basic Information</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Full Name *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Doe"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Work Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@company.com"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground">
                Company / Organization
              </Label>
              <Input
                id="company"
                name="company"
                placeholder="Acme Inc."
                className="border-border bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">
                Your Role *
              </Label>
              <Select name="role" required>
                <SelectTrigger id="role" className="border-border bg-input text-foreground">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content-creator">Content Creator</SelectItem>
                  <SelectItem value="streamer">Professional Streamer</SelectItem>
                  <SelectItem value="marketer">Marketing Professional</SelectItem>
                  <SelectItem value="educator">Educator / Trainer</SelectItem>
                  <SelectItem value="developer">Developer / Technical</SelectItem>
                  <SelectItem value="business-owner">Business Owner</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Profile */}
      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">2. Your Streaming Profile</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contentType" className="text-foreground">
                What type of content do you stream? *
              </Label>
              <Select name="contentType" required>
                <SelectTrigger id="contentType" className="border-border bg-input text-foreground">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webinars">Webinars & Workshops</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="education">Educational Content</SelectItem>
                  <SelectItem value="corporate">Corporate Events</SelectItem>
                  <SelectItem value="entertainment">Entertainment & Shows</SelectItem>
                  <SelectItem value="product-demos">Product Demos</SelectItem>
                  <SelectItem value="podcasts">Podcasts & Interviews</SelectItem>
                  <SelectItem value="mixed">Mixed Content</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">How often do you stream? *</Label>
              <RadioGroup name="streamingFrequency" required className="space-y-3">
                <div className="flex items-center space-x-3 rounded-lg border border-border bg-input px-4 py-3 transition-colors hover:border-primary/50">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="flex-1 cursor-pointer font-normal text-foreground">
                    Daily
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-border bg-input px-4 py-3 transition-colors hover:border-primary/50">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="flex-1 cursor-pointer font-normal text-foreground">
                    Several times a week
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-border bg-input px-4 py-3 transition-colors hover:border-primary/50">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer font-normal text-foreground">
                    A few times a month
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-border bg-input px-4 py-3 transition-colors hover:border-primary/50">
                  <RadioGroupItem value="occasionally" id="occasionally" />
                  <Label htmlFor="occasionally" className="flex-1 cursor-pointer font-normal text-foreground">
                    Occasionally
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-border bg-input px-4 py-3 transition-colors hover:border-primary/50">
                  <RadioGroupItem value="planning" id="planning" />
                  <Label htmlFor="planning" className="flex-1 cursor-pointer font-normal text-foreground">
                    Planning to start streaming
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audienceSize" className="text-foreground">
                What's your typical audience size? *
              </Label>
              <Select name="audienceSize" required>
                <SelectTrigger id="audienceSize" className="border-border bg-input text-foreground">
                  <SelectValue placeholder="Select audience size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50">0-50 viewers</SelectItem>
                  <SelectItem value="50-200">50-200 viewers</SelectItem>
                  <SelectItem value="200-1000">200-1,000 viewers</SelectItem>
                  <SelectItem value="1000-5000">1,000-5,000 viewers</SelectItem>
                  <SelectItem value="5000+">5,000+ viewers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Use Case & Needs */}
      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">3. Help Us Build for You</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primaryUseCase" className="text-foreground">
                What's your primary goal with live streaming? *
              </Label>
              <Textarea
                id="primaryUseCase"
                name="primaryUseCase"
                placeholder="e.g., Building community engagement, hosting virtual events, monetizing content, educating customers..."
                required
                rows={3}
                className="resize-none border-border bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mustHaveFeatures" className="text-foreground">
                What features are absolutely essential for you? *
              </Label>
              <Textarea
                id="mustHaveFeatures"
                name="mustHaveFeatures"
                placeholder="e.g., Multi-guest support, screen sharing, chat moderation, analytics, custom branding..."
                required
                rows={3}
                className="resize-none border-border bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPlatform" className="text-foreground">
                What platform(s) do you currently use for streaming?
              </Label>
              <Input
                id="currentPlatform"
                name="currentPlatform"
                placeholder="e.g., Zoom, YouTube Live, Twitch..."
                className="border-border bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isSubmitting ? "Joining Waitlist..." : "Join the Waitlist"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        By joining, you agree to receive updates about w3Stream. We respect your privacy and {"won't"} spam you.
      </p>
    </form>
  )
}
