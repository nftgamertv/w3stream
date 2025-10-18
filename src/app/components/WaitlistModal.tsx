"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { WaitlistForm } from "@/components/WaitlistForm"

export function WaitlistModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Join Waitlist
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-border bg-card p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-bold text-foreground">Join the Waitlist</DialogTitle>
                <p className="text-sm text-muted-foreground">Be among the first to experience next-gen streaming</p>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 py-6">
          <WaitlistForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
