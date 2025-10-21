'use client'

import React from 'react'
import { createClient } from '@/utils/supabaseClients/client'
import { Sparkles } from 'lucide-react'
import { FaTwitch, FaDiscord, FaGoogle } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

export default function WaitlistLogin() {
  const handleOAuthLogin = async (provider: 'twitch' | 'discord' | 'google' | 'twitter') => {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=/waitlist`,
      },
    })

    if (error) {
      console.error('OAuth error:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 backdrop-blur-sm text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Welcome to w3Stream
            </div>
            <h1 className="text-3xl font-bold mb-2">Sign in to continue</h1>
            <p className="text-slate-400">Choose your preferred sign-in method</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            {/* Twitch */}
            <button
              onClick={() => handleOAuthLogin('twitch')}
              className="w-full flex items-center justify-center gap-3 bg-[#9146FF] hover:bg-[#7d3bdb] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaTwitch className="w-5 h-5" />
              <span>Continue with Twitch</span>
            </button>

            {/* Discord */}
            <button
              onClick={() => handleOAuthLogin('discord')}
              className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaDiscord className="w-5 h-5" />
              <span>Continue with Discord</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={() => handleOAuthLogin('twitter')}
              className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg border border-slate-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaXTwitter className="w-5 h-5" />
              <span>Continue with X</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-400">
            <p>
              By signing in, you agree to our{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
