"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle, Loader2, Mail } from "lucide-react"
import { useToast } from "./ui/use-toast"

interface WaitlistFormProps {
  onSuccess?: () => void
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to join the waitlist.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      setIsSuccess(true)
      setEmail("")
      toast({
        title: "Welcome to the waitlist! 🎉",
        description: "Check your email for a confirmation message.",
      })
      onSuccess?.() // Call the callback if provided
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (<div className="relative bg-amber-200 h-screen w-screen" style={{ zIndex: 10 }}>
      <div className="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 p-6 bg-primary/5 rounded-xl border border-primary/20">
        <CheckCircle className="w-12 h-12 text-primary mx-auto" />
        <div>
          <h3 className="font-semibold text-lg">You're on the list!</h3>
          <p className="text-muted-foreground text-sm">
            We'll notify you as soon as we launch. Check your email for confirmation.
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsSuccess(false)} className="text-sm">
          Add another email
        </Button>
      </div>
  </div>  )
  }

  return (
    isClient && (
    <form onSubmit={handleSubmit} className="w-full space-y-2 relative" style={{ zIndex: 10 }}>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-12 text-base"
          disabled={isLoading}
        />
        <Button type="submit" size="lg" disabled={isLoading} className="h-12 w-full sm:w-auto bg-gradient-to-r cursor-pointer hover:text-black/80 hover:from-purple-400 hover:via-cyan-400 hover:to-green-400 from-purple-800 via-cyan-800 to-green-800 px-8 font-semibold">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        No spam, ever. Unsubscribe at any time.
      </p>
    </form>
  ))
}



 /* <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-12 text-base"
          disabled={isLoading}
        />
        <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-8 font-semibold">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">No spam, ever. Unsubscribe at any time.</p>
    </form> */