'use client'
import React from 'react'
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
export default function Success() {
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
              className="btn-brand w-full text-white font-semibold"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
  )
}
