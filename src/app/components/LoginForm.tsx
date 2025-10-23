'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabaseClients/client'
import { Button } from '@/components/ui/button'

type Provider = 'google' | 'facebook' | 'github' // Add the correct provider types here
import { gsap } from 'gsap'

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    gsap.to('.login', {opacity: 1, delay:0.5, duration: 0.5})   
  }, [])

  const handleLogin = async ({ provider }: { provider: Provider }) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false
        }
      })

      if (error) {
        console.error('OAuth error:', error)
      }
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{opacity:0}} className="login min-h-screen w-full flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
              <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-magenta-400 mb-2">
                Welcome Back
              </h2>
              <p className="text-cyan-100/60 text-sm">Sign in to continue your journey</p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <OAuthButton
                provider="Google"
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.26c0-.78-.07-1.53-.2-2.26H12v4.28h5.92c-.26 1.37-1.04 2.53-2.22 3.31v2.76h3.6c2.11-1.94 3.33-4.8 3.33-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.6-2.76c-1 .67-2.27 1.07-3.68 1.07-2.83 0-5.23-1.91-6.09-4.48H2.24v2.81C4.02 20.53 7.7 23 12 23z" fill="#34A853"/>        

                    <path d="M5.91 14.17c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.2H2.24C1.45 8.55 1 10.2 1 12s.45 3.45 1.24 4.8l3.67-2.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.61 0 3.06.55 4.2 1.64l3.15-3.15C17.45 2.09 15.03 1 12 1 7.7 1 4.02 3.47 2.24 7.2l3.67 2.81c.86-2.57 3.26-4.48 6.09-4.48z" fill="#EA4335"/>
                  </svg>    
                } 
                onClick={() => handleLogin({ provider: "google" })}
                isLoading={isLoading}
              />
 
            </div>

            {/* Divider with decorative elements */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cyan-500/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-cyan-400/60 bg-black/40">Secure OAuth Authentication</span>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-cyan-100/40">
              By continuing, you agree to our{" "}
              <button className="text-cyan-400/60 hover:text-cyan-400 transition-colors underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-cyan-400/60 hover:text-cyan-400 transition-colors underline">
                Privacy Policy
              </button>
            </p>
          </div>
      </motion.div>
    </div>
  )
}
interface OAuthButtonProps {
  provider: string
  icon: React.ReactNode
  onClick: () => Promise<void>
  isLoading: boolean
}

function OAuthButton({ provider, icon, onClick, isLoading }: OAuthButtonProps) {
  return (
    <motion.button
      className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 transition-colors duration-300 relative overflow-hidden"
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      <span>Continue with {provider}</span>
      {isLoading && (
        <motion.div 
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.button>
  )
}